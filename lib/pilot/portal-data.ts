import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type ParticipantCheckIn = {
  id: string;
  total_score: number;
  score_range_category: string | null;
  lowest_area_label: string | null;
  section_scores: Record<string, number> | null;
  created_at: string;
};

// A logged-in participant's past Check-In results, linked by their email (the
// same key the public submission flow uses to attach results to a participant).
export async function getParticipantCheckIns(email: string): Promise<ParticipantCheckIn[]> {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return [];
  const supabase = createSupabaseAdminClient();

  const { data: participants } = await supabase
    .from("participants")
    .select("id")
    .ilike("email", normalized);
  const ids = (participants ?? []).map((p) => p.id);
  if (!ids.length) return [];

  const { data, error } = await supabase
    .from("check_in_results")
    .select("id, total_score, score_range_category, lowest_area_label, section_scores, created_at")
    .in("participant_id", ids)
    .order("created_at", { ascending: false })
    .limit(20);
  if (error) return [];
  return (data ?? []) as ParticipantCheckIn[];
}
