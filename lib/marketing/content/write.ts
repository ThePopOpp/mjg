// Marketing content — the write path. This is the API the dashboard, Shepherd
// and the MJG MCP call; nothing else writes website_content_entries.
//
// Every function here assumes the caller already passed requireSuperAdmin (or
// the MCP's equivalent). Writes go to the DRAFT; nothing reaches visitors until
// publish(), which versions the change, records a change set and an audit entry,
// and revalidates the affected pages.

import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { logWebsiteAudit } from "@/lib/website/data";
import { describeContentFields, type ValidationIssue } from "./kit";
import { applyPatch, resetFields, resolveSection, type Override } from "./merge";
import { getScope, SCOPES } from "./registry";

export type ContentSource = "manual" | "shepherd" | "mcp" | "restore";
export type Actor = { id: string | null; source: ContentSource };

export class ContentError extends Error {
  constructor(
    message: string,
    readonly issues: ValidationIssue[] = [],
    readonly code: "not_found" | "invalid" | "conflict" = "invalid",
  ) {
    super(message);
    this.name = "ContentError";
  }
}

type EntryRow = {
  id: string;
  scope: string;
  section_key: string;
  schema_version: number;
  published_override: Override;
  draft_override: Override | null;
  revision: number;
  published_version: number;
  updated_at: string;
  published_at: string | null;
};

const ENTRY_COLUMNS =
  "id, scope, section_key, schema_version, published_override, draft_override, revision, published_version, updated_at, published_at";

function section(scopeKey: string, sectionKey: string) {
  const scope = getScope(scopeKey);
  if (!scope) throw new ContentError(`Unknown content scope "${scopeKey}".`, [], "not_found");
  const def = scope.sections[sectionKey];
  if (!def) throw new ContentError(`"${scopeKey}" has no section "${sectionKey}".`, [], "not_found");
  return { scope, def };
}

async function getRow(scopeKey: string, sectionKey: string): Promise<EntryRow | null> {
  const { data, error } = await createSupabaseAdminClient()
    .from("website_content_entries")
    .select(ENTRY_COLUMNS)
    .eq("scope", scopeKey)
    .eq("section_key", sectionKey)
    .maybeSingle();
  if (error) throw error;
  return (data as EntryRow | null) ?? null;
}

function revalidateScope(scopeKey: string) {
  const scope = getScope(scopeKey);
  // A global (nav, footer, framework…) appears on every marketing page.
  if (scopeKey.startsWith("global:") || !scope?.path) revalidatePath("/", "layout");
  else revalidatePath(scope.path);
}

// ── Reading for editors ──────────────────────────────────────────────────────

export function listScopes() {
  return Object.values(SCOPES).map((s) => ({
    key: s.key,
    label: s.label,
    path: s.path ?? null,
    sections: Object.values(s.sections).map((d) => ({ key: d.key, label: d.label })),
  }));
}

/** Everything an editor needs to change a scope: fields, live and draft values, revisions. */
export async function describeScope(scopeKey: string) {
  const scope = getScope(scopeKey);
  if (!scope) throw new ContentError(`Unknown content scope "${scopeKey}".`, [], "not_found");
  const { data, error } = await createSupabaseAdminClient()
    .from("website_content_entries")
    .select(ENTRY_COLUMNS)
    .eq("scope", scopeKey);
  if (error) throw error;
  const rows = new Map(((data ?? []) as EntryRow[]).map((r) => [r.section_key, r]));

  return {
    key: scope.key,
    label: scope.label,
    path: scope.path ?? null,
    sections: Object.values(scope.sections).map((def) => {
      const row = rows.get(def.key);
      return {
        key: def.key,
        label: def.label,
        fields: describeContentFields(def.fields),
        live: resolveSection(def, row?.published_override, row?.schema_version).value,
        draft: row?.draft_override ? resolveSection(def, row.draft_override, row.schema_version).value : null,
        // Which fields differ from the code default, so an editor can see what an override is masking.
        overriddenFields: Object.keys(row?.draft_override ?? row?.published_override ?? {}),
        revision: row?.revision ?? 0,
        publishedVersion: row?.published_version ?? 0,
        hasDraft: Boolean(row?.draft_override),
      };
    }),
  };
}

// ── Drafts ───────────────────────────────────────────────────────────────────

async function writeDraft(
  scopeKey: string,
  sectionKey: string,
  nextDraft: Override,
  expectedRevision: number | undefined,
  actor: Actor,
  summary: string,
) {
  const { def } = section(scopeKey, sectionKey);
  const supabase = createSupabaseAdminClient();
  const row = await getRow(scopeKey, sectionKey);
  const currentRevision = row?.revision ?? 0;
  if (expectedRevision !== undefined && expectedRevision !== currentRevision) {
    throw new ContentError(
      `${def.label} was changed by someone else since you loaded it (revision ${currentRevision}, you had ${expectedRevision}). Reload and try again.`,
      [],
      "conflict",
    );
  }

  const values = {
    draft_override: nextDraft,
    schema_version: def.schemaVersion,
    revision: currentRevision + 1,
    updated_by: actor.id,
    updated_source: actor.source,
    updated_at: new Date().toISOString(),
  };

  if (row) {
    // The revision in the WHERE clause makes the check-and-write atomic.
    const { data, error } = await supabase
      .from("website_content_entries")
      .update(values)
      .eq("id", row.id)
      .eq("revision", currentRevision)
      .select("id");
    if (error) throw error;
    if (!data?.length) throw new ContentError(`${def.label} was changed at the same moment. Reload and try again.`, [], "conflict");
  } else {
    const { error } = await supabase
      .from("website_content_entries")
      .insert({ scope: scopeKey, section_key: sectionKey, published_override: {}, ...values });
    if (error) throw error;
  }

  await logWebsiteAudit({
    actorId: actor.id,
    actorType: actor.source === "shepherd" ? "shepherd" : "user",
    action: "content.draft",
    resourceType: "content_entry",
    summary,
    metadata: { scope: scopeKey, section: sectionKey, source: actor.source },
  });
  return { revision: currentRevision + 1 };
}

/** Change some fields of a section's draft. Strict: invalid input stores nothing. */
export async function saveDraft(input: {
  scope: string;
  section: string;
  patch: Override;
  expectedRevision?: number;
  actor: Actor;
}) {
  const { def } = section(input.scope, input.section);
  const row = await getRow(input.scope, input.section);
  const { override, issues } = applyPatch(def, row?.draft_override ?? row?.published_override ?? {}, input.patch);
  if (issues.length) throw new ContentError(`${def.label}: ${issues[0].message}`, issues);
  return writeDraft(
    input.scope,
    input.section,
    override,
    input.expectedRevision,
    input.actor,
    `Edited ${Object.keys(input.patch).join(", ")} in ${def.label}`,
  );
}

/** Return fields to their code defaults (in the draft). */
export async function resetToDefault(input: {
  scope: string;
  section: string;
  fields: string[];
  expectedRevision?: number;
  actor: Actor;
}) {
  const { def } = section(input.scope, input.section);
  const row = await getRow(input.scope, input.section);
  const next = resetFields(row?.draft_override ?? row?.published_override, input.fields);
  return writeDraft(input.scope, input.section, next, input.expectedRevision, input.actor, `Reset ${input.fields.join(", ")} in ${def.label}`);
}

export async function discardDraft(input: { scope: string; section: string; actor: Actor }) {
  const row = await getRow(input.scope, input.section);
  if (!row?.draft_override) return { discarded: false };
  const { error } = await createSupabaseAdminClient()
    .from("website_content_entries")
    .update({ draft_override: null, revision: row.revision + 1, updated_by: input.actor.id, updated_source: input.actor.source, updated_at: new Date().toISOString() })
    .eq("id", row.id);
  if (error) throw error;
  return { discarded: true };
}

// ── Publishing ───────────────────────────────────────────────────────────────

/** Publishes the draft of the given sections (or every drafted section of the scope). */
export async function publish(input: { scope: string; sections?: string[]; note?: string; actor: Actor }) {
  const scope = getScope(input.scope);
  if (!scope) throw new ContentError(`Unknown content scope "${input.scope}".`, [], "not_found");
  const supabase = createSupabaseAdminClient();

  let query = supabase.from("website_content_entries").select(ENTRY_COLUMNS).eq("scope", input.scope).not("draft_override", "is", null);
  if (input.sections?.length) query = query.in("section_key", input.sections);
  const { data, error } = await query;
  if (error) throw error;
  const rows = (data ?? []) as EntryRow[];
  if (!rows.length) return { published: [] as string[] };

  const now = new Date().toISOString();
  const published: string[] = [];
  for (const row of rows) {
    const def = scope.sections[row.section_key];
    if (!def) continue;
    const draft = row.draft_override ?? {};
    // Re-check on publish: a field could have become invalid since it was drafted (e.g. after a schema change).
    const { issues } = applyPatch(def, {}, draft);
    if (issues.length) throw new ContentError(`${def.label}: ${issues[0].message}`, issues);

    const version = row.published_version + 1;
    const { data: changeSet } = await supabase
      .from("website_change_sets")
      .insert({
        content_entry_id: row.id,
        requested_by: input.actor.id,
        source: input.actor.source === "shepherd" ? "shepherd" : input.actor.source === "mcp" ? "mcp" : "manual",
        risk: "low",
        summary: input.note ?? `Published ${def.label}`,
        before_state: row.published_override,
        after_state: draft,
        status: "published",
        approved_by: input.actor.id,
        approved_at: now,
        published_at: now,
      })
      .select("id")
      .single();

    const { error: updateError } = await supabase
      .from("website_content_entries")
      .update({
        published_override: draft,
        draft_override: null,
        published_version: version,
        revision: row.revision + 1,
        published_by: input.actor.id,
        published_at: now,
        updated_at: now,
      })
      .eq("id", row.id)
      .eq("revision", row.revision);
    if (updateError) throw updateError;

    await supabase.from("website_content_versions").insert({
      entry_id: row.id,
      version,
      schema_version: row.schema_version,
      override: draft,
      change_set_id: (changeSet as { id: string } | null)?.id ?? null,
      published_by: input.actor.id,
      note: input.note ?? null,
    });
    published.push(row.section_key);
  }

  await logWebsiteAudit({
    actorId: input.actor.id,
    actorType: input.actor.source === "shepherd" ? "shepherd" : "user",
    action: "content.publish",
    resourceType: "content_entry",
    summary: `Published ${published.join(", ")} on ${scope.label}`,
    metadata: { scope: input.scope, sections: published, note: input.note ?? null, source: input.actor.source },
  });
  revalidateScope(input.scope);
  return { published };
}

export async function listVersions(scopeKey: string, sectionKey: string) {
  const row = await getRow(scopeKey, sectionKey);
  if (!row) return [];
  const { data, error } = await createSupabaseAdminClient()
    .from("website_content_versions")
    .select("version, note, published_by, created_at, override")
    .eq("entry_id", row.id)
    .order("version", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

/** Puts an earlier published version back into the draft (publish it to make it live). */
export async function restoreVersion(input: { scope: string; section: string; version: number; actor: Actor }) {
  const { def } = section(input.scope, input.section);
  const row = await getRow(input.scope, input.section);
  if (!row) throw new ContentError(`${def.label} has no published versions.`, [], "not_found");
  const { data, error } = await createSupabaseAdminClient()
    .from("website_content_versions")
    .select("override")
    .eq("entry_id", row.id)
    .eq("version", input.version)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new ContentError(`${def.label} has no version ${input.version}.`, [], "not_found");
  return writeDraft(input.scope, input.section, data.override as Override, undefined, { ...input.actor, source: "restore" }, `Restored version ${input.version} of ${def.label}`);
}
