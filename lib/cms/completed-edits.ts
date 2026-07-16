// Completed Edits — the "reviewed" watermark behind the CMS tab's badge.
//
// The badge counts requests completed since the viewer last opened the tab, so the
// marker is per-user and lives under user_preferences.dashboard_preferences, the
// same place DM notification prefs live (see lib/direct-messages/preferences.ts).
// It's a timestamp rather than a read/unread list so it stays O(1) as history grows.

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { listCompletedNotes, type DashboardNote } from "@/lib/dashboard-notes/data";
import { listCompletedPageNotes, type PageNote } from "@/lib/cms/page-notes";

const PREF_KEY = "cms_completed_edits_reviewed_at";

export async function getCompletedReviewedAt(userId: string): Promise<string | null> {
  const sb = createSupabaseAdminClient();
  const { data } = await sb.from("user_preferences").select("dashboard_preferences").eq("user_id", userId).maybeSingle();
  const prefs = data?.dashboard_preferences as Record<string, unknown> | null;
  const value = prefs?.[PREF_KEY];
  return typeof value === "string" ? value : null;
}

export async function setCompletedReviewedAt(userId: string, when: string = new Date().toISOString()): Promise<string> {
  const sb = createSupabaseAdminClient();
  const { data: existing } = await sb.from("user_preferences").select("id, dashboard_preferences").eq("user_id", userId).maybeSingle();
  const merged = { ...((existing?.dashboard_preferences as Record<string, unknown>) ?? {}), [PREF_KEY]: when };
  if (existing?.id) {
    await sb.from("user_preferences").update({ dashboard_preferences: merged, updated_at: new Date().toISOString() }).eq("id", existing.id);
  } else {
    await sb.from("user_preferences").insert({ user_id: userId, dashboard_preferences: merged });
  }
  return when;
}

export type CompletedEdits = {
  frontend: PageNote[];
  dashboard: DashboardNote[];
  unreviewed: number;
  reviewedAt: string | null;
};

export async function loadCompletedEdits(userId: string): Promise<CompletedEdits> {
  const [frontend, dashboard, reviewedAt] = await Promise.all([
    listCompletedPageNotes(),
    listCompletedNotes(),
    getCompletedReviewedAt(userId),
  ]);

  // Never reviewed → everything completed counts as new.
  const isNew = (completedAt: string | null) =>
    Boolean(completedAt) && (!reviewedAt || (completedAt as string) > reviewedAt);

  const unreviewed =
    frontend.filter((n) => isNew(n.completed_at)).length + dashboard.filter((n) => isNew(n.completed_at)).length;

  return { frontend, dashboard, unreviewed, reviewedAt };
}
