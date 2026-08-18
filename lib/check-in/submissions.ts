import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { NEXT_STEP_OPTIONS } from "@/lib/check-in/created-for-more";

export type CheckInSubmission = {
  id: string;
  name: string | null;
  email: string | null;
  total_score: number | null;
  stage: string | null;
  strongest_layer: string | null;
  lowest_layer: string | null;
  lowest_pillar: string | null;
  layer_scores: { key: string; title: string; subtitle: string; score: number; status: string }[] | null;
  chosen_pathway: string | null;
  chosen_pathways: string[] | null;
  participant_id: string | null;
  created_at: string;
};

const SELECT = "id,name,email,total_score,stage,strongest_layer,lowest_layer,lowest_pillar,layer_scores,chosen_pathway,chosen_pathways,participant_id,created_at";

const PATHWAY_LABEL = new Map(NEXT_STEP_OPTIONS.map((o) => [o.key, o.label]));
export function pathwayLabels(keys: string[] | null | undefined): string[] {
  return (keys ?? []).map((k) => PATHWAY_LABEL.get(k) ?? k);
}

/** All Created for More submissions (super-admin view). */
export async function listCheckInSubmissions(limit = 200): Promise<CheckInSubmission[]> {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("check_in_submissions")
    .select(SELECT)
    .eq("assessment", "created-for-more")
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as CheckInSubmission[];
}

/** Aggregate stats for the dashboard cards. */
export async function getCheckInSubmissionStats(): Promise<{ count: number; averageScore: number | null; last7: number }> {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("check_in_submissions")
    .select("total_score,created_at")
    .eq("assessment", "created-for-more")
    .limit(2000);
  const rows = data ?? [];
  const scores = rows.map((r) => r.total_score).filter((n): n is number => typeof n === "number");
  const averageScore = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const last7 = rows.filter((r) => new Date(r.created_at).getTime() >= weekAgo).length;
  return { count: rows.length, averageScore, last7 };
}

/** A single person's submissions, matched by email (participant / portal view). */
export async function getCheckInSubmissionsByEmail(email: string): Promise<CheckInSubmission[]> {
  const normalized = (email ?? "").trim().toLowerCase();
  if (!normalized) return [];
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("check_in_submissions")
    .select(SELECT)
    .eq("assessment", "created-for-more")
    .ilike("email", normalized)
    .order("created_at", { ascending: false })
    .limit(20);
  return (data ?? []) as CheckInSubmission[];
}

/** Submissions for a set of emails (facilitator's team members). */
export async function getCheckInSubmissionsForEmails(emails: string[]): Promise<CheckInSubmission[]> {
  const list = Array.from(new Set(emails.map((e) => (e ?? "").trim().toLowerCase()).filter(Boolean)));
  if (!list.length) return [];
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("check_in_submissions")
    .select(SELECT)
    .eq("assessment", "created-for-more")
    .in("email", list)
    .order("created_at", { ascending: false })
    .limit(200);
  return (data ?? []) as CheckInSubmission[];
}
