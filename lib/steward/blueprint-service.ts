import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { BLUEPRINT_PAGES, FREE_PAGES } from "@/lib/steward/blueprint";
import { SECTION_FIELDS, fieldsForSection, sectionSpec } from "@/lib/steward/blueprint-fields";
import {
  STATE_RULE_VERSION,
  evaluateDerivedSectionState,
  evaluateFieldState,
  evaluateSectionState,
  type DefinitionState,
  type FieldInput,
} from "@/lib/steward/state";

// The Blueprint service — the ONLY thing that writes a Blueprint.
//
// This is the application half of "the model proposes; the application writes;
// the model narrates a receipt it was handed". Every agent tool calls in here;
// nothing in the agent touches the database. That separation is what makes the
// safety properties structural rather than a matter of the model behaving.
//
// Three rules the whole file is built around:
//
//   1. NOTHING IS SAVED UNTIL A RECEIPT SAYS SO. Every mutation opens a receipt
//      first and settles it after. A caller that cannot find a confirmed
//      receipt must report "I don't know", never "saved" — which is why
//      `unknown` is a real persistence status and not an error case.
//
//   2. APPROVAL IS A PARTICIPANT ACTION. `proposeWording` can only ever create
//      an unapproved version. There is no argument, anywhere, that lets a
//      proposal arrive pre-approved.
//
//   3. STATE IS DERIVED, NEVER SET. No function here takes a definition_state.
//      It is recomputed from wording by the evaluator after every change, so it
//      cannot drift from the content it is supposed to describe.
//
// It runs under the service role deliberately: RLS on these tables is a
// read-only safety net for the member, and writes go through the checks here.

type Supabase = ReturnType<typeof createSupabaseAdminClient>;

export class StewardBlueprintError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StewardBlueprintError";
  }
}

/**
 * Every page a Blueprint has, Free's third page included.
 *
 * My Starting Plan is numbered 3 in lib/steward/blueprint.ts because it is the
 * THIRD PAGE OF THE FREE BLUEPRINT. It is not page 3 of the thirteen — that is
 * What I Stand On — so storing its own number would put two pages at 3 and make
 * the ordering ambiguous. It is stored after the thirteen; the Free view
 * renumbers it for display.
 */
const ALL_PAGES = [
  ...BLUEPRINT_PAGES,
  { ...FREE_PAGES[2], number: BLUEPRINT_PAGES.length + 1 },
];

// == Receipts =================================================================

export type Receipt = {
  id: string;
  operation: string;
  persistence_status: "pending" | "confirmed" | "failed" | "unknown";
  target_table: string | null;
  target_id: string | null;
  error: string | null;
};

/**
 * Opens a receipt before the work, so a crash mid-write leaves evidence that
 * something was attempted rather than silence.
 *
 * The idempotency key is the caller's: a retried proposal with the same key
 * returns the original receipt instead of writing twice.
 */
async function openReceipt(
  db: Supabase,
  profileId: string,
  operation: string,
  idempotencyKey: string,
  detail: Record<string, unknown> = {},
): Promise<{ receipt: Receipt; alreadyDone: boolean }> {
  const { data: existing } = await db
    .from("steward_write_receipts")
    .select("id, operation, persistence_status, target_table, target_id, error")
    .eq("idempotency_key", idempotencyKey)
    .maybeSingle();

  if (existing) return { receipt: existing as Receipt, alreadyDone: true };

  const { data, error } = await db
    .from("steward_write_receipts")
    .insert({
      profile_id: profileId,
      operation,
      idempotency_key: idempotencyKey,
      persistence_status: "pending",
      detail,
    })
    .select("id, operation, persistence_status, target_table, target_id, error")
    .single();

  if (error) throw new StewardBlueprintError(`Could not open a write receipt: ${error.message}`);
  return { receipt: data as Receipt, alreadyDone: false };
}

async function settleReceipt(
  db: Supabase,
  receiptId: string,
  status: "confirmed" | "failed" | "unknown",
  patch: { target_table?: string; target_id?: string; error?: string } = {},
): Promise<Receipt> {
  const { data, error } = await db
    .from("steward_write_receipts")
    .update({ persistence_status: status, settled_at: new Date().toISOString(), ...patch })
    .eq("id", receiptId)
    .select("id, operation, persistence_status, target_table, target_id, error")
    .single();

  // A receipt we cannot settle is exactly the 'unknown' case: the work may have
  // happened. Surfacing that honestly beats reporting either outcome.
  if (error) throw new StewardBlueprintError(`Could not settle receipt ${receiptId}: ${error.message}`);
  return data as Receipt;
}

async function audit(
  db: Supabase,
  entry: {
    profileId: string;
    actorType: "participant" | "steward" | "system" | "super_admin";
    actorId?: string | null;
    action: string;
    targetTable?: string;
    targetId?: string;
    detail?: Record<string, unknown>;
  },
) {
  await db.from("steward_audit_logs").insert({
    profile_id: entry.profileId,
    actor_type: entry.actorType,
    actor_id: entry.actorId ?? null,
    action: entry.action,
    target_table: entry.targetTable ?? null,
    target_id: entry.targetId ?? null,
    detail: entry.detail ?? {},
  });
}

// == Bootstrap ================================================================

/**
 * Creates a member's Blueprint if they do not have one, with every page and
 * every field present and empty.
 *
 * Pages are created for ALL thirteen even on the free edition. The docset is
 * explicit that an unfinished page keeps its purpose and framework visible
 * rather than being hidden, and what a member may SEE is an entitlement
 * question answered at read time — not a reason to leave rows missing.
 */
export async function ensureBlueprint(profileId: string): Promise<string> {
  const db = createSupabaseAdminClient();

  const { data: existing } = await db
    .from("steward_blueprints")
    .select("id")
    .eq("profile_id", profileId)
    .maybeSingle();

  if (existing) return existing.id as string;

  const { data: created, error } = await db
    .from("steward_blueprints")
    .insert({ profile_id: profileId })
    .select("id")
    .single();

  if (error) throw new StewardBlueprintError(`Could not create a Blueprint: ${error.message}`);
  const blueprintId = created.id as string;

  const sectionRows = ALL_PAGES.map((page) => ({
    blueprint_id: blueprintId,
    page_slug: page.slug,
    page_number: page.number,
    state_rule_version: STATE_RULE_VERSION,
  }));

  const { data: sections, error: sectionError } = await db
    .from("steward_sections")
    .insert(sectionRows)
    .select("id, page_slug");

  if (sectionError) throw new StewardBlueprintError(`Could not create sections: ${sectionError.message}`);

  const fieldRows = (sections ?? []).flatMap((section) =>
    fieldsForSection(section.page_slug as string).map((spec, index) => ({
      section_id: section.id as string,
      field_key: spec.field_key,
      label: spec.label,
      essential: spec.essential,
      sort_order: index,
    })),
  );

  if (fieldRows.length > 0) {
    const { error: fieldError } = await db.from("steward_fields").insert(fieldRows);
    if (fieldError) throw new StewardBlueprintError(`Could not create fields: ${fieldError.message}`);
  }

  await audit(db, {
    profileId,
    actorType: "system",
    action: "blueprint.created",
    targetTable: "steward_blueprints",
    targetId: blueprintId,
    detail: { sections: sectionRows.length, fields: fieldRows.length },
  });

  return blueprintId;
}

// == Read =====================================================================

export type BlueprintFieldView = {
  id: string;
  field_key: string;
  label: string;
  essential: boolean;
  definition_state: DefinitionState;
  /** The wording in force, if any. */
  value: string | null;
  needs_clarity: boolean;
  /** An unapproved proposal waiting on the member. */
  pending_proposal: { id: string; value: string } | null;
};

export type BlueprintSectionView = {
  id: string;
  page_slug: string;
  page_number: number;
  definition_state: DefinitionState;
  derived: boolean;
  fields: BlueprintFieldView[];
};

export async function getBlueprint(profileId: string): Promise<{
  id: string;
  edition: "free" | "full";
  sections: BlueprintSectionView[];
}> {
  const db = createSupabaseAdminClient();
  const blueprintId = await ensureBlueprint(profileId);

  const { data: blueprint } = await db
    .from("steward_blueprints")
    .select("id, edition")
    .eq("id", blueprintId)
    .single();

  const { data: sections } = await db
    .from("steward_sections")
    .select("id, page_slug, page_number, definition_state")
    .eq("blueprint_id", blueprintId)
    .order("page_number");

  const sectionIds = (sections ?? []).map((s) => s.id as string);

  const { data: fields } = sectionIds.length
    ? await db
        .from("steward_fields")
        .select("id, section_id, field_key, label, essential, definition_state, sort_order")
        .in("section_id", sectionIds)
        .order("sort_order")
    : { data: [] };

  const fieldIds = (fields ?? []).map((f) => f.id as string);

  const { data: versions } = fieldIds.length
    ? await db
        .from("steward_field_versions")
        .select("id, field_id, content_state, value, needs_clarity, superseded_at, created_at")
        .in("field_id", fieldIds)
        .order("created_at", { ascending: false })
    : { data: [] };

  const versionsByField = new Map<string, typeof versions>();
  for (const v of versions ?? []) {
    const list = versionsByField.get(v.field_id as string) ?? [];
    list.push(v);
    versionsByField.set(v.field_id as string, list as typeof versions);
  }

  const sectionViews: BlueprintSectionView[] = (sections ?? []).map((section) => {
    const own = (fields ?? []).filter((f) => f.section_id === section.id);

    const fieldViews: BlueprintFieldView[] = own.map((field) => {
      const list = versionsByField.get(field.id as string) ?? [];
      const approved = list.find(
        (v) => v.content_state === "participant_approved" && !v.superseded_at && String(v.value).trim().length > 0,
      );
      const proposal = list.find((v) => v.content_state === "proposed" && !v.superseded_at);

      return {
        id: field.id as string,
        field_key: field.field_key as string,
        label: field.label as string,
        essential: field.essential as boolean,
        definition_state: field.definition_state as DefinitionState,
        value: approved ? (approved.value as string) : null,
        needs_clarity: approved ? Boolean(approved.needs_clarity) : false,
        pending_proposal: proposal ? { id: proposal.id as string, value: proposal.value as string } : null,
      };
    });

    return {
      id: section.id as string,
      page_slug: section.page_slug as string,
      page_number: section.page_number as number,
      definition_state: section.definition_state as DefinitionState,
      derived: Boolean(sectionSpec(section.page_slug as string)?.derivedFrom?.length),
      fields: fieldViews,
    };
  });

  return {
    id: blueprintId,
    edition: (blueprint?.edition as "free" | "full") ?? "free",
    sections: sectionViews,
  };
}

// == State recomputation ======================================================

/** Rebuilds the evaluator's input for one section straight from the database. */
async function readFieldInputs(db: Supabase, sectionId: string): Promise<{ fieldId: string; input: FieldInput }[]> {
  const { data: fields } = await db
    .from("steward_fields")
    .select("id, field_key, essential")
    .eq("section_id", sectionId);

  const ids = (fields ?? []).map((f) => f.id as string);
  const { data: versions } = ids.length
    ? await db
        .from("steward_field_versions")
        .select("field_id, content_state, value, needs_clarity, superseded_at")
        .in("field_id", ids)
    : { data: [] };

  return (fields ?? []).map((field) => ({
    fieldId: field.id as string,
    input: {
      field_key: field.field_key as string,
      essential: field.essential as boolean,
      versions: (versions ?? [])
        .filter((v) => v.field_id === field.id)
        .map((v) => ({
          content_state: v.content_state as FieldInput["versions"][number]["content_state"],
          value: v.value as string,
          needs_clarity: Boolean(v.needs_clarity),
          superseded_at: v.superseded_at as string | null,
        })),
    },
  }));
}

/**
 * Recomputes definition state for a section and its fields, then for any
 * derived page that summarises it.
 *
 * Called after every wording change. State is never written by a caller — it
 * is always the output of the evaluator over the current wording, which is what
 * stops the displayed state and the actual content from disagreeing.
 */
export async function recomputeSectionState(blueprintId: string, sectionId: string): Promise<DefinitionState> {
  const db = createSupabaseAdminClient();

  const inputs = await readFieldInputs(db, sectionId);
  const sectionState = evaluateSectionState(inputs.map((i) => i.input));
  const now = new Date().toISOString();

  for (const { fieldId, input } of inputs) {
    await db
      .from("steward_fields")
      .update({ definition_state: evaluateFieldState(input), updated_at: now })
      .eq("id", fieldId);
  }

  await db
    .from("steward_sections")
    .update({
      definition_state: sectionState,
      state_evaluated_at: now,
      state_rule_version: STATE_RULE_VERSION,
      updated_at: now,
    })
    .eq("id", sectionId);

  await recomputeDerivedSections(db, blueprintId);
  return sectionState;
}

/** My North Star and anything else that summarises rather than holds content. */
async function recomputeDerivedSections(db: Supabase, blueprintId: string) {
  const derived = SECTION_FIELDS.filter((s) => s.derivedFrom?.length);
  if (derived.length === 0) return;

  const { data: all } = await db
    .from("steward_sections")
    .select("id, page_slug, definition_state")
    .eq("blueprint_id", blueprintId);

  const stateBySlug = new Map<string, DefinitionState>(
    (all ?? []).map((s) => [s.page_slug as string, s.definition_state as DefinitionState]),
  );

  for (const spec of derived) {
    const row = (all ?? []).find((s) => s.page_slug === spec.slug);
    if (!row) continue;

    const sources = (spec.derivedFrom ?? [])
      .map((slug) => stateBySlug.get(slug))
      .filter((s): s is DefinitionState => Boolean(s));

    await db
      .from("steward_sections")
      .update({
        definition_state: evaluateDerivedSectionState(sources),
        state_evaluated_at: new Date().toISOString(),
        state_rule_version: STATE_RULE_VERSION,
      })
      .eq("id", row.id as string);
  }
}

// == Propose and approve ======================================================

async function findField(db: Supabase, blueprintId: string, pageSlug: string, fieldKey: string) {
  const { data: section } = await db
    .from("steward_sections")
    .select("id")
    .eq("blueprint_id", blueprintId)
    .eq("page_slug", pageSlug)
    .maybeSingle();

  if (!section) throw new StewardBlueprintError(`"${pageSlug}" is not a page on this Blueprint.`);

  const { data: field } = await db
    .from("steward_fields")
    .select("id, label")
    .eq("section_id", section.id as string)
    .eq("field_key", fieldKey)
    .maybeSingle();

  if (!field) throw new StewardBlueprintError(`"${fieldKey}" is not a field on "${pageSlug}".`);
  return { sectionId: section.id as string, fieldId: field.id as string, label: field.label as string };
}

/**
 * Steward proposes wording. It is NOT on the Blueprint yet.
 *
 * There is deliberately no way to express "propose and approve" in one call.
 * Approval is a separate participant action, and keeping it a separate function
 * is what makes that structural rather than a convention a future caller could
 * quietly break.
 */
export async function proposeWording(args: {
  profileId: string;
  pageSlug: string;
  fieldKey: string;
  value: string;
  idempotencyKey: string;
  needsClarity?: boolean;
  clarityNote?: string;
}): Promise<{ receipt: Receipt; versionId: string | null }> {
  const db = createSupabaseAdminClient();
  const blueprintId = await ensureBlueprint(args.profileId);

  const { receipt, alreadyDone } = await openReceipt(db, args.profileId, "blueprint.propose", args.idempotencyKey, {
    page: args.pageSlug,
    field: args.fieldKey,
  });
  if (alreadyDone) return { receipt, versionId: receipt.target_id };

  try {
    if (args.value.trim().length === 0) {
      throw new StewardBlueprintError("A proposal needs wording. Empty text is not a proposal.");
    }

    const { fieldId } = await findField(db, blueprintId, args.pageSlug, args.fieldKey);

    const { data: version, error } = await db
      .from("steward_field_versions")
      .insert({
        field_id: fieldId,
        content_state: "proposed",
        value: args.value,
        needs_clarity: args.needsClarity ?? false,
        clarity_note: args.clarityNote ?? null,
        proposed_by: "steward",
      })
      .select("id")
      .single();

    if (error) throw new StewardBlueprintError(error.message);

    const settled = await settleReceipt(db, receipt.id, "confirmed", {
      target_table: "steward_field_versions",
      target_id: version.id as string,
    });

    await audit(db, {
      profileId: args.profileId,
      actorType: "steward",
      action: "wording.proposed",
      targetTable: "steward_field_versions",
      targetId: version.id as string,
      detail: { page: args.pageSlug, field: args.fieldKey },
    });

    return { receipt: settled, versionId: version.id as string };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    const settled = await settleReceipt(db, receipt.id, "failed", { error: message });
    return { receipt: settled, versionId: null };
  }
}

/**
 * The participant approves specific wording. This is the only path onto a
 * Blueprint.
 *
 * Supersedes whatever was approved before rather than editing it, so the words
 * someone actually agreed to stay readable afterwards.
 */
export async function approveWording(args: {
  profileId: string;
  versionId: string;
  idempotencyKey: string;
}): Promise<{ receipt: Receipt; sectionState: DefinitionState | null }> {
  const db = createSupabaseAdminClient();
  const blueprintId = await ensureBlueprint(args.profileId);

  const { receipt, alreadyDone } = await openReceipt(db, args.profileId, "blueprint.approve", args.idempotencyKey, {
    version: args.versionId,
  });
  if (alreadyDone) return { receipt, sectionState: null };

  try {
    // Ownership BEFORE anything else: a guessed version id from someone else's
    // Blueprint must not reveal that it exists.
    const { data: version } = await db
      .from("steward_field_versions")
      .select("id, field_id, content_state, superseded_at")
      .eq("id", args.versionId)
      .maybeSingle();

    const notYours = new StewardBlueprintError("That proposal is not on your Blueprint.");
    if (!version) throw notYours;

    const { data: field } = await db
      .from("steward_fields")
      .select("id, section_id")
      .eq("id", version.field_id as string)
      .maybeSingle();
    if (!field) throw notYours;

    const { data: section } = await db
      .from("steward_sections")
      .select("id, blueprint_id, page_slug")
      .eq("id", field.section_id as string)
      .maybeSingle();
    if (!section || section.blueprint_id !== blueprintId) throw notYours;
    if (version.superseded_at) throw new StewardBlueprintError("That wording has already been replaced.");

    const now = new Date().toISOString();

    // Retire the wording currently in force. The partial unique index in the
    // migration enforces this too; doing it here keeps the error a sentence
    // rather than a constraint violation.
    await db
      .from("steward_field_versions")
      .update({ content_state: "superseded", superseded_at: now })
      .eq("field_id", version.field_id as string)
      .eq("content_state", "participant_approved")
      .is("superseded_at", null);

    const { error } = await db
      .from("steward_field_versions")
      .update({ content_state: "participant_approved", approved_at: now, approved_by: args.profileId })
      .eq("id", args.versionId);

    if (error) throw new StewardBlueprintError(error.message);

    const sectionState = await recomputeSectionState(blueprintId, section.id as string);

    const settled = await settleReceipt(db, receipt.id, "confirmed", {
      target_table: "steward_field_versions",
      target_id: args.versionId,
    });

    await audit(db, {
      profileId: args.profileId,
      actorType: "participant",
      actorId: args.profileId,
      action: "wording.approved",
      targetTable: "steward_field_versions",
      targetId: args.versionId,
      detail: { page: section.page_slug, section_state: sectionState },
    });

    return { receipt: settled, sectionState };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    const settled = await settleReceipt(db, receipt.id, "failed", { error: message });
    return { receipt: settled, sectionState: null };
  }
}

/** Declining a proposal. Recorded, because "not now" is information too. */
export async function declineWording(args: {
  profileId: string;
  versionId: string;
  idempotencyKey: string;
}): Promise<Receipt> {
  const db = createSupabaseAdminClient();
  const { receipt, alreadyDone } = await openReceipt(db, args.profileId, "blueprint.decline", args.idempotencyKey, {
    version: args.versionId,
  });
  if (alreadyDone) return receipt;

  try {
    const { error } = await db
      .from("steward_field_versions")
      .update({ content_state: "superseded", superseded_at: new Date().toISOString() })
      .eq("id", args.versionId)
      .eq("content_state", "proposed");

    if (error) throw new StewardBlueprintError(error.message);

    await audit(db, {
      profileId: args.profileId,
      actorType: "participant",
      actorId: args.profileId,
      action: "wording.declined",
      targetTable: "steward_field_versions",
      targetId: args.versionId,
    });

    return await settleReceipt(db, receipt.id, "confirmed", {
      target_table: "steward_field_versions",
      target_id: args.versionId,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return await settleReceipt(db, receipt.id, "failed", { error: message });
  }
}
