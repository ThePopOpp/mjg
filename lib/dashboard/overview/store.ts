import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { AppRole } from "@/lib/rbac/roles";
import { defaultLayoutFor, sanitizeLayout, type OverviewLayout } from "./layout";

// Saved per account in user_preferences.dashboard_preferences.overview, next to
// section_seen and notify_frequency (both preserved on every write).
//
// Layouts are cleaned against the person's REAL role, not a "View as" role, so
// previewing another role never deletes cards from their own dashboard.

export async function getOverviewLayout(userId: string, realRole: AppRole): Promise<{ layout: OverviewLayout; saved: boolean }> {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase.from("user_preferences").select("dashboard_preferences").eq("user_id", userId).maybeSingle();
  const stored = (data?.dashboard_preferences as { overview?: unknown } | null)?.overview;
  if (!stored) return { layout: defaultLayoutFor(realRole), saved: false };
  return { layout: sanitizeLayout(stored, realRole), saved: true };
}

export async function saveOverviewLayout(userId: string, realRole: AppRole, raw: unknown): Promise<OverviewLayout> {
  const layout = sanitizeLayout(raw, realRole);
  const supabase = createSupabaseAdminClient();
  const { data: existing } = await supabase.from("user_preferences").select("id, dashboard_preferences").eq("user_id", userId).maybeSingle();
  const merged = { ...((existing?.dashboard_preferences as Record<string, unknown>) ?? {}), overview: layout };
  const { error } = existing?.id
    ? await supabase.from("user_preferences").update({ dashboard_preferences: merged, updated_at: new Date().toISOString() }).eq("id", existing.id)
    : await supabase.from("user_preferences").insert({ user_id: userId, dashboard_preferences: merged });
  if (error) throw new Error(error.message);
  return layout;
}
