import { createSupabaseAdminClient } from "@/lib/supabase/admin";

// Daily send caps for the connector: a total across every person, client and
// agent, over a rolling 24 hours, set by a Super Admin in Settings → Claude &
// Agents → Limits (mcp_settings). No cap set means no limit. Broadcasts are not
// counted here — they are high risk and their preview shows the recipient count.

export type CapGroup = "sms" | "email";

/** One-person sends, by cap. dm_send counts as email until it has its own cap. */
export const CAPPED_TOOLS: Record<CapGroup, readonly string[]> = {
  sms: ["sms_send"],
  email: ["send_email", "send_template_email", "dm_send"],
};

export function capGroupFor(tool: string): CapGroup | null {
  for (const [group, tools] of Object.entries(CAPPED_TOOLS) as [CapGroup, readonly string[]][]) {
    if (tools.includes(tool)) return group;
  }
  return null;
}

export type DailyCaps = { sms: number | null; email: number | null };

export async function getDailyCaps(): Promise<DailyCaps> {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase.from("mcp_settings").select("sms_daily_cap, email_daily_cap").eq("id", 1).maybeSingle();
  return { sms: data?.sms_daily_cap ?? null, email: data?.email_daily_cap ?? null };
}

/** Sends counted against each cap in the last 24 hours. */
export async function sentInLastDay(group: CapGroup): Promise<number> {
  const supabase = createSupabaseAdminClient();
  const { count, error } = await supabase
    .from("mcp_tool_calls")
    .select("id", { count: "exact", head: true })
    .in("tool", [...CAPPED_TOOLS[group]])
    .eq("status", "ok")
    .gt("created_at", new Date(Date.now() - 24 * 3600_000).toISOString());
  if (error) throw error;
  return count ?? 0;
}

/** Refusal text if this call would go over its daily cap, else null. */
export async function checkDailyCap(tool: string): Promise<string | null> {
  const group = capGroupFor(tool);
  if (!group) return null;
  const cap = (await getDailyCaps())[group];
  if (cap === null) return null;
  const sent = await sentInLastDay(group);
  if (sent < cap) return null;
  return `The daily ${group === "sms" ? "SMS" : "email"} limit for the connector (${cap} in 24 hours) has been reached. A Super Admin can change it in Settings → Claude & Agents → Limits.`;
}

export async function setDailyCaps(caps: DailyCaps, by: string) {
  const clean = (n: number | null) => (n === null || !Number.isFinite(n) ? null : Math.max(0, Math.floor(n)));
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("mcp_settings")
    .update({ sms_daily_cap: clean(caps.sms), email_daily_cap: clean(caps.email), updated_by: by, updated_at: new Date().toISOString() })
    .eq("id", 1);
  if (error) throw error;
}
