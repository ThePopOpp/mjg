import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { TeamParticipant } from "@/lib/facilitator/team";

export type ParticipantTeam = {
  self: TeamParticipant | null;
  teammates: TeamParticipant[];
  stats: { total: number; surveys: number; checkIns: number };
};

// A logged-in participant maps to their `participants` record by email, then to their
// team(s) via facilitator_team_members. They see teammate NAMES + completion status only
// (never anyone's individual results/scores). If they aren't on a team yet, the "group" is
// just themselves, so their own completions still show.
export async function getParticipantTeam(email: string | null | undefined): Promise<ParticipantTeam> {
  const empty: ParticipantTeam = { self: null, teammates: [], stats: { total: 0, surveys: 0, checkIns: 0 } };
  const addr = (email ?? "").trim().toLowerCase();
  if (!addr) return empty;

  const supabase = createSupabaseAdminClient();

  // Find this participant's record(s) by email.
  const { data: mine } = await supabase.from("participants").select("id").ilike("email", addr);
  const myIds = (mine ?? []).map((r: any) => r.id as string);
  if (!myIds.length) return empty;

  // Teams this participant belongs to → their teammates (if any).
  const { data: myMemberships } = await supabase.from("facilitator_team_members").select("team_id").in("participant_id", myIds);
  const teamIds = Array.from(new Set((myMemberships ?? []).map((m: any) => m.team_id as string)));
  let memberIds = [...myIds];
  if (teamIds.length) {
    const { data: members } = await supabase.from("facilitator_team_members").select("participant_id").in("team_id", teamIds);
    memberIds = Array.from(new Set([...myIds, ...(members ?? []).map((m: any) => m.participant_id as string)]));
  }

  const { data } = await supabase
    .from("participants")
    .select("id,first_name,last_name,email,phone,wave,check_in_status,survey_status,journey_status,inner_circle_status,created_at")
    .in("id", memberIds)
    .order("created_at", { ascending: false });

  const all = (data ?? []) as TeamParticipant[];
  const mySet = new Set(myIds);
  const self = all.find((p) => mySet.has(p.id)) ?? null;
  const teammates = all.filter((p) => !mySet.has(p.id));

  // Count real completions across the group (not just status flags), so the participant's
  // own submitted survey / Check-In always registers.
  const emails = Array.from(new Set(all.map((p) => (p.email ?? "").trim().toLowerCase()).filter(Boolean)));
  const [{ data: surveyRows }, { data: checkInRows }] = await Promise.all([
    supabase.from("survey_responses").select("participant_id").in("participant_id", memberIds),
    emails.length
      ? supabase.from("check_in_submissions").select("email").in("email", emails)
      : Promise.resolve({ data: [] as { email: string }[] }),
  ]);
  const surveyedIds = new Set((surveyRows ?? []).map((r: any) => r.participant_id).filter(Boolean));
  const checkedInEmails = new Set((checkInRows ?? []).map((r: any) => (r.email ?? "").trim().toLowerCase()).filter(Boolean));

  const stats = {
    total: all.length,
    surveys: all.filter((p) => surveyedIds.has(p.id)).length,
    checkIns: all.filter((p) => p.email && checkedInEmails.has(p.email.trim().toLowerCase())).length,
  };

  return { self, teammates, stats };
}
