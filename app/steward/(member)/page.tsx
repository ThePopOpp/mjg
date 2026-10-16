import { BLUEPRINT_PAGES, EXAMPLE_BLUEPRINT, FREE_PAGES } from "@/lib/steward/blueprint";
import { Conversation } from "@/components/steward/conversation";

export const dynamic = "force-dynamic";
export const metadata = { title: "Steward" };

// Steward is where a member lands.
//
// Owner decision: the conversation is the front door, with the Blueprint reached
// either by asking Steward or from the rail. The committed next step lives in
// the rail rather than above the transcript, so the first screen is the
// conversation itself — as the mock has it.

export default async function StewardLanding({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const context = [...BLUEPRINT_PAGES, ...FREE_PAGES].find((p) => p.slug === page);
  const nextStep = EXAMPLE_BLUEPRINT["starting-plan"]?.entries?.[0]?.value;

  return (
    <Conversation
      nextStep={nextStep}
      pageContext={context ? { title: context.title, href: `/steward/blueprint/${context.slug}` } : undefined}
    />
  );
}
