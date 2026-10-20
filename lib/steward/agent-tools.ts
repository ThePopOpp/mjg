import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { BLUEPRINT_PAGES, FREE_PAGES } from "@/lib/steward/blueprint";
import { fieldsForSection } from "@/lib/steward/blueprint-fields";
import { DEFINITION_STATE_LABEL } from "@/lib/steward/state";
import { getBlueprint, proposeWording } from "@/lib/steward/blueprint-service";

// THE ONLY THINGS STEWARD CAN DO.
//
// This is the whole write surface of the member-facing agent. It is small on
// purpose, and the exclusions matter more than the inclusions:
//
//   Steward can READ a member's Blueprint and PROPOSE wording for one field.
//
//   Steward CANNOT approve its own proposal. There is no approve tool here, at
//   any price, because approval is the participant's act — the UI calls
//   approveWording directly from a member click. A model that could approve its
//   own wording would make the entire propose/approve contract decorative.
//
//   Steward CANNOT grant entitlement, change a plan, send a notification,
//   delete anything, or read another member's Blueprint. Not "is instructed not
//   to" — there is no function here that does it. §E05: important prohibitions
//   are enforced in code and permissions, and a model-based check is
//   supplementary, never the boundary.
//
// Every tool is scoped to one profile, resolved from the verified Supabase
// principal by the route that calls in here. No tool takes a profile id as an
// argument, so a confused or manipulated model cannot address someone else.

const ALL_PAGES = [...BLUEPRINT_PAGES, FREE_PAGES[2]];

/**
 * The three pages a Free member actually has.
 *
 * Every page exists as a row for every member — an unfinished page keeps its
 * purpose and framework visible, which the docset requires — but a Free
 * member's BLUEPRINT is three pages, not thirteen. Telling them otherwise
 * misrepresents what they have, and quietly promises the Full Build's contents
 * as something they already own.
 */
const FREE_SLUGS = new Set(FREE_PAGES.map((page) => page.slug));

export class StewardToolError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StewardToolError";
  }
}

/** Resolves the verified Supabase principal to a profile in this app. */
export async function profileForPrincipal(principalId: string): Promise<{ id: string; role: string } | null> {
  const db = createSupabaseAdminClient();
  const { data } = await db
    .from("profiles")
    .select("id, role, status, auth_user_id")
    .or(`auth_user_id.eq.${principalId},id.eq.${principalId}`)
    .maybeSingle();

  if (!data || data.status !== "active") return null;
  return { id: data.id as string, role: data.role as string };
}

// == Read =====================================================================

/**
 * The whole Blueprint at a glance: every page, its state, and whether anything
 * is written on it.
 *
 * Deliberately WITHOUT the wording. A member's actual words are the most
 * sensitive thing here, and an overview does not need them — Steward asks for a
 * page when it has a reason to. That keeps the default amount of private
 * content in the model's context as small as the task allows, which is the
 * "minimum permitted content" the §E02 invocation contract asks for.
 */
export async function blueprintOverview(profileId: string) {
  const blueprint = await getBlueprint(profileId);

  return {
    edition: blueprint.edition,
    pages: blueprint.sections.map((section) => {
      const page = ALL_PAGES.find((p) => p.slug === section.page_slug);
      const written = section.fields.filter((f) => f.value !== null).length;

      return {
        page: section.page_slug,
        number: section.page_number,
        title: page?.title ?? section.page_slug,
        purpose: page?.purpose ?? "",
        // False for a page this member does not have yet. Steward must not
        // present the Full Build's pages as part of a Free Blueprint.
        in_edition: blueprint.edition === "full" || FREE_SLUGS.has(section.page_slug),
        state: DEFINITION_STATE_LABEL[section.definition_state],
        fields_total: section.fields.length,
        fields_with_wording: written,
        // Surfaced so Steward can say "that one summarises the others" rather
        // than inviting the member to fill in a page that has no fields.
        summarises_other_pages: section.derived,
        needs_clarity: section.fields.filter((f) => f.needs_clarity).length,
      };
    }),
  };
}

/** One page, with its fields and whatever the member has approved so far. */
export async function blueprintPage(profileId: string, pageSlug: string) {
  const blueprint = await getBlueprint(profileId);
  const section = blueprint.sections.find((s) => s.page_slug === pageSlug);
  if (!section) throw new StewardToolError(`"${pageSlug}" is not a page on the Blueprint.`);

  const page = ALL_PAGES.find((p) => p.slug === pageSlug);
  const specs = fieldsForSection(pageSlug);

  return {
    page: pageSlug,
    title: page?.title ?? pageSlug,
    tagline: page?.tagline ?? null,
    purpose: page?.purpose ?? "",
    state: DEFINITION_STATE_LABEL[section.definition_state],
    summarises_other_pages: section.derived,
    fields: section.fields.map((field) => {
      const spec = specs.find((s) => s.field_key === field.field_key);
      return {
        field: field.field_key,
        label: field.label,
        // What the docset says this field is for. Lets Steward explain an empty
        // field without inventing a purpose for it.
        prompt: spec?.prompt ?? "",
        essential: field.essential,
        state: DEFINITION_STATE_LABEL[field.definition_state],
        approved_wording: field.value,
        needs_clarity: field.needs_clarity,
        // So Steward does not propose over a proposal the member has not
        // answered yet.
        awaiting_member_decision: field.pending_proposal
          ? { proposal_id: field.pending_proposal.id, wording: field.pending_proposal.value }
          : null,
      };
    }),
  };
}

// == Propose ==================================================================

/**
 * Proposes wording for one field. It is NOT on the Blueprint.
 *
 * The return value is written to be narrated honestly: `saved: false` and a
 * status of "awaiting_member_approval" are there so a model reaching for a
 * confident summary finds the true one closest to hand. Steward must never
 * report this as saved — the member has not seen it yet.
 */
export async function proposeBlueprintWording(
  profileId: string,
  args: { page: string; field: string; wording: string; needs_clarity?: boolean },
) {
  const specs = fieldsForSection(args.page);
  if (specs.length === 0) {
    throw new StewardToolError(
      `"${args.page}" has no fields to write to${
        args.page === "north-star" ? " — My North Star summarises the other pages." : "."
      }`,
    );
  }
  if (!specs.some((s) => s.field_key === args.field)) {
    throw new StewardToolError(
      `"${args.field}" is not a field on "${args.page}". Its fields are: ${specs.map((s) => s.field_key).join(", ")}.`,
    );
  }

  // Server-generated, so a retry from the model cannot create a second proposal
  // for the same wording, and the model never has to reason about idempotency.
  const idempotencyKey = `agent:${profileId}:${args.page}:${args.field}:${hash(args.wording)}`;

  const { receipt, versionId } = await proposeWording({
    profileId,
    pageSlug: args.page,
    fieldKey: args.field,
    value: args.wording,
    idempotencyKey,
    needsClarity: args.needs_clarity ?? false,
  });

  if (receipt.persistence_status !== "confirmed" || !versionId) {
    return {
      status: "failed" as const,
      saved: false,
      error: receipt.error ?? "The proposal could not be recorded.",
      // Said plainly so the model does not paper over it: a failed write is
      // reported as a failed write.
      tell_the_member: "Something went wrong recording that. It has not been written down.",
    };
  }

  return {
    status: "awaiting_member_approval" as const,
    saved: false,
    proposal_id: versionId,
    page: args.page,
    field: args.field,
    wording: args.wording,
    tell_the_member:
      "This is a proposal. It is not on their Blueprint until they approve these exact words, and they can change them.",
  };
}

/** Short, stable digest of the wording, for the idempotency key. */
function hash(value: string): string {
  let h = 0;
  for (let i = 0; i < value.length; i += 1) {
    h = (h << 5) - h + value.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h).toString(36);
}

// == Dispatch =================================================================

export const AGENT_TOOLS = {
  "blueprint.overview": (profileId: string) => blueprintOverview(profileId),
  "blueprint.page": (profileId: string, args: { page: string }) => blueprintPage(profileId, args.page),
  "blueprint.propose": (
    profileId: string,
    args: { page: string; field: string; wording: string; needs_clarity?: boolean },
  ) => proposeBlueprintWording(profileId, args),
} as const;

export type AgentToolName = keyof typeof AGENT_TOOLS;

export function isAgentTool(name: string): name is AgentToolName {
  return Object.prototype.hasOwnProperty.call(AGENT_TOOLS, name);
}
