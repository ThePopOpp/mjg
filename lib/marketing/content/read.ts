// Marketing content — the read path the public pages use.
//
// One indexed query per scope through the service-role client (RLS is
// super-admin only). Caching is at the route level, like lib/website/public.ts:
// pages are static with a revalidate window, and publishing calls
// revalidatePath() for the scope's page. Content here is never withdrawn — it
// only ever falls back to its code default — so a stale read is harmless.
//
// Draft mode (enabled from the dashboard) shows unpublished overrides, so an
// edit can be previewed on the real page before it goes live.

import { draftMode } from "next/headers";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { ScopeDef, ScopeValues } from "./kit";
import { resolveSection, type Override } from "./merge";

type EntryRow = {
  section_key: string;
  schema_version: number;
  published_override: Override | null;
  draft_override: Override | null;
};

async function readEntries(scopeKey: string): Promise<EntryRow[]> {
  try {
    const { data, error } = await createSupabaseAdminClient()
      .from("website_content_entries")
      .select("section_key, schema_version, published_override, draft_override")
      .eq("scope", scopeKey);
    if (error) throw error;
    return (data ?? []) as EntryRow[];
  } catch (error) {
    // Defaults always render; a database problem must never blank the site.
    console.error(`[marketing-content] could not read ${scopeKey}; using defaults.`, error);
    return [];
  }
}

async function isDraft(): Promise<boolean> {
  try {
    return (await draftMode()).isEnabled;
  } catch {
    // Outside a request (build-time generation of a static page).
    return false;
  }
}

/** The resolved content of every section in a scope. */
export async function getScopeContent<D extends ScopeDef>(scope: D): Promise<ScopeValues<D>> {
  const [rows, draft] = await Promise.all([readEntries(scope.key), isDraft()]);
  const bySection = new Map(rows.map((r) => [r.section_key, r]));

  const out: Record<string, unknown> = {};
  for (const [key, section] of Object.entries(scope.sections)) {
    const row = bySection.get(key);
    const override = row ? (draft && row.draft_override ? row.draft_override : row.published_override) : null;
    const { value, issues } = resolveSection(section, override, row?.schema_version ?? section.schemaVersion);
    if (issues.length) {
      console.warn(`[marketing-content] ${scope.key}/${key}: invalid override fields fell back to defaults`, issues);
    }
    out[key] = value;
  }
  return out as ScopeValues<D>;
}
