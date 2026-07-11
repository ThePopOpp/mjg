import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type DmPrefs = { email: boolean; sms: boolean };

const DEFAULT_PREFS: DmPrefs = { email: true, sms: false };

// DM notification preferences live under user_preferences.dashboard_preferences.dm_notifications.
export async function getDmPrefs(userId: string): Promise<DmPrefs> {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase.from("user_preferences").select("dashboard_preferences").eq("user_id", userId).maybeSingle();
  const dm = (data?.dashboard_preferences as { dm_notifications?: Partial<DmPrefs> } | null)?.dm_notifications;
  return { email: dm?.email ?? DEFAULT_PREFS.email, sms: dm?.sms ?? DEFAULT_PREFS.sms };
}

export async function setDmPrefs(userId: string, prefs: DmPrefs): Promise<DmPrefs> {
  const supabase = createSupabaseAdminClient();
  const { data: existing } = await supabase.from("user_preferences").select("id, dashboard_preferences").eq("user_id", userId).maybeSingle();
  const merged = { ...((existing?.dashboard_preferences as Record<string, unknown>) ?? {}), dm_notifications: prefs };

  if (existing?.id) {
    await supabase.from("user_preferences").update({ dashboard_preferences: merged, updated_at: new Date().toISOString() }).eq("id", existing.id);
  } else {
    await supabase.from("user_preferences").insert({ user_id: userId, dashboard_preferences: merged });
  }
  return prefs;
}
