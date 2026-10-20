import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth/server";
import { getBlueprint } from "@/lib/steward/blueprint-service";
import { BLUEPRINT_PAGES, FREE_PAGES } from "@/lib/steward/blueprint";
import { DEFINITION_STATE_LABEL } from "@/lib/steward/state";

// What the member's own screen reads.
//
// Proposals are served from the CANONICAL RECORD, not from the chat transcript.
// The docset is explicit that approved wording comes from the participant
// record rather than the conversation, and the same applies to what is waiting
// on them: if the UI rendered approval cards by parsing the model's output, a
// model that hallucinated a proposal would produce a button that approves
// something no service ever recorded.
//
// So the agent proposes into the database, and this is what the screen draws.

export const dynamic = "force-dynamic";

const ALL_PAGES = [...BLUEPRINT_PAGES, FREE_PAGES[2]];

export async function GET() {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: "Sign in to continue." }, { status: 401 });

  const blueprint = await getBlueprint(profile.id);

  const pending = blueprint.sections.flatMap((section) =>
    section.fields
      .filter((field) => field.pending_proposal)
      .map((field) => {
        const page = ALL_PAGES.find((p) => p.slug === section.page_slug);
        return {
          proposalId: field.pending_proposal!.id,
          wording: field.pending_proposal!.value,
          page: section.page_slug,
          pageTitle: page?.title ?? section.page_slug,
          fieldLabel: field.label,
          // What is there now, so a replacement shows what it replaces rather
          // than arriving as a bare suggestion.
          currentWording: field.value,
        };
      }),
  );

  return NextResponse.json({
    edition: blueprint.edition,
    pending,
    pages: blueprint.sections.map((section) => ({
      slug: section.page_slug,
      number: section.page_number,
      title: ALL_PAGES.find((p) => p.slug === section.page_slug)?.title ?? section.page_slug,
      state: DEFINITION_STATE_LABEL[section.definition_state],
    })),
  });
}
