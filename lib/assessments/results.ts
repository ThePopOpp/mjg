import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { ENERGY_AUDIT_ASSESSMENT } from "@/lib/energy-audit/submissions";
import { getFormBySlug } from "@/lib/pilot/forms-data";
import { surveyTypeForSlug } from "@/lib/pilot/form-types";
import { pathwayLabels } from "@/lib/check-in/submissions";

// Assessment results for the MCP connector, by assessment key (a built-in slug
// or a pilot form slug). Callers must pass mcpResultsGate first. Scores, bands
// and answers only: a person's own written reflections are never returned —
// the dashboard keeps those private to the person too.

export type ResultFilter = { limit?: number; since?: string; until?: string; email?: string };

type Source =
  | { kind: "submission"; assessment: string }
  | { kind: "pilot_check_in" }
  | { kind: "survey"; surveyType: string };

const SUBMISSION_LIST = "id,name,email,total_score,stage,strongest_layer,lowest_layer,lowest_pillar,layer_scores,chosen_pathways,created_at";

async function sourceFor(key: string): Promise<Source> {
  if (key === "created-for-more" || key === ENERGY_AUDIT_ASSESSMENT) return { kind: "submission", assessment: key };
  if (key === "check-in") return { kind: "pilot_check_in" };
  const form = await getFormBySlug(key);
  if (form?.kind === "survey" || key === "general" || key === "pastor-elder") return { kind: "survey", surveyType: surveyTypeForSlug(key) };
  throw new Error(`Unknown assessment "${key}".`);
}

const cap = (n?: number) => Math.min(Math.max(Number(n) || 50, 1), 200);

function personOf(p: unknown): { name: string | null; email: string | null } {
  const row = (Array.isArray(p) ? p[0] : p) as { first_name?: string | null; last_name?: string | null; email?: string | null } | null;
  if (!row) return { name: null, email: null };
  return { name: [row.first_name, row.last_name].filter(Boolean).join(" ") || null, email: row.email ?? null };
}

export async function listAssessmentResults(key: string, f: ResultFilter = {}) {
  const db = createSupabaseAdminClient();
  const src = await sourceFor(key);
  if (src.kind === "submission") {
    let q = db.from("check_in_submissions").select(SUBMISSION_LIST).eq("assessment", src.assessment).order("created_at", { ascending: false }).limit(cap(f.limit));
    if (f.since) q = q.gte("created_at", f.since);
    if (f.until) q = q.lte("created_at", f.until);
    if (f.email) q = q.ilike("email", f.email.trim());
    const { data, error } = await q;
    if (error) throw new Error(error.message);
    return (data ?? []).map((r) => ({
      id: r.id, name: r.name, email: r.email, score: r.total_score, band: r.stage,
      strongest: r.strongest_layer, lowest: r.lowest_layer, lowestPillar: r.lowest_pillar,
      ...(src.assessment === "created-for-more" ? { nextSteps: pathwayLabels(r.chosen_pathways as string[] | null) } : {}),
      createdAt: r.created_at,
    }));
  }
  if (src.kind === "pilot_check_in") {
    let q = db.from("check_in_results").select("id,total_score,score_range_category,lowest_area_label,created_at,participants(first_name,last_name,email)").order("created_at", { ascending: false }).limit(cap(f.limit));
    if (f.since) q = q.gte("created_at", f.since);
    if (f.until) q = q.lte("created_at", f.until);
    const { data, error } = await q;
    if (error) throw new Error(error.message);
    return (data ?? [])
      .map((r) => ({ id: r.id, ...personOf(r.participants), score: r.total_score, band: r.score_range_category, lowest: r.lowest_area_label, createdAt: r.created_at }))
      .filter((r) => !f.email || r.email?.toLowerCase() === f.email.trim().toLowerCase());
  }
  let q = db.from("survey_responses").select("id,created_at,anonymous_feedback_permission,story_interview_permission,follow_up_permission,participants(first_name,last_name,email)").eq("survey_type", src.surveyType).order("created_at", { ascending: false }).limit(cap(f.limit));
  if (f.since) q = q.gte("created_at", f.since);
  if (f.until) q = q.lte("created_at", f.until);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data ?? [])
    .map((r) => ({
      id: r.id, ...personOf(r.participants), createdAt: r.created_at,
      permissions: { anonymousFeedback: r.anonymous_feedback_permission, storyInterview: r.story_interview_permission, followUp: r.follow_up_permission },
    }))
    .filter((r) => !f.email || r.email?.toLowerCase() === f.email.trim().toLowerCase());
}

export async function getAssessmentResult(key: string, id: string) {
  const db = createSupabaseAdminClient();
  const src = await sourceFor(key);
  if (src.kind === "submission") {
    const { data, error } = await db.from("check_in_submissions").select(`${SUBMISSION_LIST},answers,details`).eq("assessment", src.assessment).eq("id", id).maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) throw new Error("No such result for this assessment.");
    const details = (data.details ?? {}) as { nextStep?: unknown };
    return {
      id: data.id, name: data.name, email: data.email, score: data.total_score, band: data.stage,
      strongest: data.strongest_layer, lowest: data.lowest_layer, lowestPillar: data.lowest_pillar,
      layerScores: data.layer_scores, answers: data.answers,
      ...(src.assessment === "created-for-more" ? { nextSteps: pathwayLabels(data.chosen_pathways as string[] | null) } : { nextStep: details.nextStep ?? null }),
      createdAt: data.created_at,
    };
  }
  if (src.kind === "pilot_check_in") {
    const { data, error } = await db.from("check_in_results").select("id,total_score,score_range_category,lowest_area_key,lowest_area_label,section_scores,created_at,participants(first_name,last_name,email)").eq("id", id).maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) throw new Error("No such result for this assessment.");
    return { id: data.id, ...personOf(data.participants), score: data.total_score, band: data.score_range_category, lowest: data.lowest_area_label, sectionScores: data.section_scores, createdAt: data.created_at };
  }
  const { data, error } = await db.from("survey_responses").select("id,answers,created_at,anonymous_feedback_permission,story_interview_permission,follow_up_permission,participants(first_name,last_name,email)").eq("survey_type", src.surveyType).eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("No such response for this survey.");
  return {
    id: data.id, ...personOf(data.participants), answers: data.answers, createdAt: data.created_at,
    permissions: { anonymousFeedback: data.anonymous_feedback_permission, storyInterview: data.story_interview_permission, followUp: data.follow_up_permission },
  };
}
