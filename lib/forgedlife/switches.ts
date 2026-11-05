import { createSupabaseAdminClient } from "@/lib/supabase/admin";

// The two ForgedLife switches live in feature_flags (migration 202611050140), both off.
// They're global on/off rows, so they're read directly rather than through lib/flags'
// per-person check.
export const FORGED_SWITCHES = {
  sync: "forgedlife.sync",
  smsOptIn: "forgedlife.sms_opt_in",
} as const;
export type ForgedSwitch = (typeof FORGED_SWITCHES)[keyof typeof FORGED_SWITCHES];

export async function isSwitchOn(key: ForgedSwitch): Promise<boolean> {
  const { data } = await createSupabaseAdminClient().from("feature_flags").select("enabled").eq("key", key).maybeSingle();
  return Boolean(data?.enabled);
}

export async function setSwitch(key: ForgedSwitch, enabled: boolean) {
  const { error } = await createSupabaseAdminClient().from("feature_flags").update({ enabled, updated_at: new Date().toISOString() }).eq("key", key);
  if (error) throw error;
}
