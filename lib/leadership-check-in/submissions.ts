import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { ASSESSMENT_KEY } from "./leadership-check-in";

// Leadership Check-In results for the admin view. Deliberately never selects the
// optional reflections (kit §05: keep them out of reports and logs).

export type LeadershipSubmission = {
  id: string;
  name: string | null;
  email: string | null;
  profile_id: string | null;
  total_score: number | null;
  stage: string | null;
  lowest_layer: string | null;
  strongest_layer: string | null;
  layer_scores: { key: string; title: string; score: number; status: string }[] | null;
  created_at: string;
  pillar_scores: Record<string, number> | null;
  cohort: string | null;
  test: boolean;
  marketing_opt_in: boolean | null;
  emailed: boolean;
  source: string | null;
};

const SELECT = [
  "id,name,email,profile_id,total_score,stage,lowest_layer,strongest_layer,layer_scores,created_at",
  "pillar_scores:details->pillar_scores",
  "cohort:details->>cohort",
  "test:details->>test",
  "opt_in:details->consent->>marketing_opt_in",
  "emailed_at:details->>results_emailed_at",
  "utm_source:details->acquisition->first_touch->>utm_source",
  "referrer:details->acquisition->first_touch->>referrer",
].join(",");

export async function listLeadershipSubmissions(limit = 500): Promise<LeadershipSubmission[]> {
  const { data } = await createSupabaseAdminClient()
    .from("check_in_submissions")
    .select(SELECT)
    .eq("assessment", ASSESSMENT_KEY)
    .order("created_at", { ascending: false })
    .limit(limit);
  return ((data ?? []) as unknown as Record<string, unknown>[]).map((r) => {
    let source: string | null = (r.utm_source as string | null) ?? null;
    if (!source && typeof r.referrer === "string" && r.referrer) {
      try { source = new URL(r.referrer).hostname.replace(/^www\./, ""); } catch { source = null; }
    }
    return {
      id: r.id as string,
      name: (r.name as string | null) ?? null,
      email: (r.email as string | null) ?? null,
      profile_id: (r.profile_id as string | null) ?? null,
      total_score: (r.total_score as number | null) ?? null,
      stage: (r.stage as string | null) ?? null,
      lowest_layer: (r.lowest_layer as string | null) ?? null,
      strongest_layer: (r.strongest_layer as string | null) ?? null,
      layer_scores: (r.layer_scores as LeadershipSubmission["layer_scores"]) ?? null,
      created_at: r.created_at as string,
      pillar_scores: (r.pillar_scores as Record<string, number> | null) ?? null,
      cohort: (r.cohort as string | null) ?? null,
      test: r.test === "true",
      // Unknown (never reached the send step) is kept separate from "no".
      marketing_opt_in: r.opt_in === "true" ? true : r.opt_in === "false" ? false : null,
      emailed: Boolean(r.emailed_at),
      source,
    };
  });
}

/** Starts recorded by the first-party tracker (visitors who answered a first statement). */
export async function countLeadershipStarts(): Promise<number | null> {
  const { count, error } = await createSupabaseAdminClient()
    .from("analytics_events")
    .select("id", { count: "exact", head: true })
    .eq("event", "assessment_start")
    .eq("path", "/leadership-check-in");
  return error ? null : count ?? 0;
}
