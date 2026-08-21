import { createSupabaseAdminClient } from "@/lib/supabase/admin";

// Per-user "last seen" count for each dashboard section, stored under
// user_preferences.dashboard_preferences.section_seen. A section badge shows red when its
// current count is higher than what the user last saw (new since they last looked), else gold.

export async function getSectionSeen(userId: string): Promise<Record<string, number>> {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase.from("user_preferences").select("dashboard_preferences").eq("user_id", userId).maybeSingle();
  const seen = (data?.dashboard_preferences as { section_seen?: Record<string, number> } | null)?.section_seen;
  return seen && typeof seen === "object" ? seen : {};
}

export async function setSectionSeen(userId: string, section: string, count: number) {
  const supabase = createSupabaseAdminClient();
  const { data: existing } = await supabase.from("user_preferences").select("id, dashboard_preferences").eq("user_id", userId).maybeSingle();
  const prefs = (existing?.dashboard_preferences as Record<string, unknown>) ?? {};
  const seen = { ...((prefs.section_seen as Record<string, number>) ?? {}), [section]: count };
  const merged = { ...prefs, section_seen: seen };
  if (existing?.id) {
    await supabase.from("user_preferences").update({ dashboard_preferences: merged, updated_at: new Date().toISOString() }).eq("id", existing.id);
  } else {
    await supabase.from("user_preferences").insert({ user_id: userId, dashboard_preferences: merged });
  }
}
