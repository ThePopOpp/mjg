import { createSupabaseAdminClient } from "@/lib/supabase/admin";

// "Readable by MCP" — per assessment, set by a Super Admin, default OFF
// (docs/mcp/MJG-MCP-EXPANSION-PLAN.md §10). Claude / ChatGPT can list and edit
// assessment definitions, but read people's RESULTS only where this is on.
//
// Two homes, matching where each assessment is configured:
//   built-in (code-defined) assessments → assessment_settings, keyed by slug;
//   builder forms (pilot_forms: the pilot check-in and surveys) → pilot_forms.mcp_readable.

export const BUILT_IN_ASSESSMENTS = [
  { key: "created-for-more", title: "Created for More Check-In", description: "The public 7-layer Stewardship Blueprint check-in (out of 140)." },
  { key: "energy-audit", title: "Energy Audit", description: "4 energies x 5 statements; where the person is running low." },
] as const;

export type BuiltInAssessmentKey = (typeof BUILT_IN_ASSESSMENTS)[number]["key"];

export function isBuiltInAssessment(key: string): key is BuiltInAssessmentKey {
  return BUILT_IN_ASSESSMENTS.some((a) => a.key === key);
}

export type McpGate = { ok: true } | { ok: false; message: string };

/** Pure: may an MCP client read this assessment's results? Anything but an explicit true is no. */
export function mcpResultsGate(assessment: { key: string; title?: string | null; mcpReadable?: boolean | null } | null | undefined): McpGate {
  if (!assessment) return { ok: false, message: "No such assessment." };
  if (assessment.mcpReadable === true) return { ok: true };
  const name = assessment.title ? `"${assessment.title}"` : `"${assessment.key}"`;
  return {
    ok: false,
    message: `Results for ${name} aren't readable by Claude/ChatGPT. A Super Admin can turn on "Readable by MCP" for it in the dashboard (the assessment's setup screen).`,
  };
}

/** Every assessment's toggle: built-ins by slug, builder forms by their slug. Missing = false. */
export async function getMcpReadableMap(): Promise<Map<string, boolean>> {
  const db = createSupabaseAdminClient();
  const map = new Map<string, boolean>();
  // Either query fails harmlessly before the migration is applied: everything reads as off.
  const [settings, forms] = await Promise.all([
    db.from("assessment_settings").select("assessment, mcp_readable"),
    db.from("pilot_forms").select("slug, mcp_readable"),
  ]);
  if (!forms.error) for (const r of forms.data ?? []) map.set(r.slug as string, r.mcp_readable === true);
  if (!settings.error) for (const r of settings.data ?? []) map.set(r.assessment as string, r.mcp_readable === true);
  return map;
}

export async function isMcpReadable(key: string): Promise<boolean> {
  return (await getMcpReadableMap()).get(key) === true;
}

/** Super Admin only (callers check). Built-ins upsert assessment_settings; forms update their row. */
export async function setMcpReadable(key: string, readable: boolean, actorId: string): Promise<{ assessment: string; mcpReadable: boolean }> {
  const db = createSupabaseAdminClient();
  const now = new Date().toISOString();
  if (isBuiltInAssessment(key)) {
    const { error } = await db
      .from("assessment_settings")
      .upsert({ assessment: key, mcp_readable: readable, updated_by: actorId, updated_at: now }, { onConflict: "assessment" });
    if (error) throw new Error(error.message);
  } else {
    const { data, error } = await db.from("pilot_forms").update({ mcp_readable: readable, updated_at: now }).eq("slug", key).select("id");
    if (error) throw new Error(error.message);
    if (!data?.length) throw new Error("Save this form once before changing who can read its results.");
  }
  return { assessment: key, mcpReadable: readable };
}
