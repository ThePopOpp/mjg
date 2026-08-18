import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type ParticipantSubmission = {
  id: string;
  kind: "survey" | "form";
  label: string;
  created_at: string;
};

const SURVEY_LABEL: Record<string, string> = {
  general: "Created for More — Final Feedback Survey",
  pastor_elder: "Pastor / Elder Review",
};

function humanize(v: string) {
  return v.replace(/[_-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// A participant's own completed surveys and forms (by their participant record + email).
// Check-In results are handled separately (getCheckInSubmissionsByEmail).
export async function getParticipantSubmissions(email: string | null | undefined): Promise<ParticipantSubmission[]> {
  const addr = (email ?? "").trim().toLowerCase();
  if (!addr) return [];
  const supabase = createSupabaseAdminClient();

  const { data: mine } = await supabase.from("participants").select("id").ilike("email", addr);
  const ids = (mine ?? []).map((r: any) => r.id as string);

  const [surveysRes, formsRes] = await Promise.all([
    ids.length
      ? supabase.from("survey_responses").select("id,survey_type,created_at").in("participant_id", ids).order("created_at", { ascending: false })
      : Promise.resolve({ data: [] as any[] }),
    supabase.from("form_submissions").select("id,form_type,created_at").ilike("email", addr).is("deleted_at", null).order("created_at", { ascending: false }),
  ]);

  const surveys: ParticipantSubmission[] = (surveysRes.data ?? []).map((r: any) => ({
    id: r.id,
    kind: "survey",
    label: SURVEY_LABEL[r.survey_type] ?? `${humanize(r.survey_type)} Survey`,
    created_at: r.created_at,
  }));
  const forms: ParticipantSubmission[] = (formsRes.data ?? []).map((r: any) => ({
    id: r.id,
    kind: "form",
    label: humanize(r.form_type),
    created_at: r.created_at,
  }));

  return [...surveys, ...forms].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}
