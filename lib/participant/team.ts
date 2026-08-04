import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { TeamParticipant } from "@/lib/facilitator/team";

const DONE = (v: string | null | undefined) => Boolean(v && v !== "not_sent" && v !== "not_started" && v !== "none");

export type ParticipantTeam = {
  self: TeamParticipant | null;
  teammates: TeamParticipant[];
  stats: { total: number; surveys: number; checkIns: number };
};

// A logged-in participant maps to their `participants` record by email, then to their
// team(s) via facilitator_team_members. They see teammate NAMES + completion status only
// (never anyone's individual results/scores).
export async function getParticipantTeam(email: string | null | undefined): Promise<ParticipantTeam> {
  const empty: ParticipantTeam = { self: null, teammates: [], stats: { total: 0, surveys: 0, checkIns: 0 } };
  const addr = (email ?? "").trim().toLowerCase();
  if (!addr) return empty;

  const supabase = createSupabaseAdminClient();

  // Find this participant's record(s) by email.
  const { data: mine } = await supabase.from("participants").select("id").ilike("email", addr);
  const myIds = (mine ?? []).map((r: any) => r.id as string);
  if (!myIds.length) return empty;

  // Teams this participant belongs to.
  const { data: myMemberships } = await supabase.from("facilitator_team_members").select("team_id").in("participant_id", myIds);
  const teamIds = Array.from(new Set((myMemberships ?? []).map((m: any) => m.team_id as string)));
  if (!teamIds.length) return empty;

  // All members of those teams.
  const { data: members } = await supabase.from("facilitator_team_members").select("participant_id").in("team_id", teamIds);
  const memberIds = Array.from(new Set((members ?? []).map((m: any) => m.participant_id as string)));
  if (!memberIds.length) return empty;

  const { data } = await supabase
    .from("participants")
    .select("id,first_name,last_name,email,phone,wave,check_in_status,survey_status,journey_status,inner_circle_status,created_at")
    .in("id", memberIds)
    .order("created_at", { ascending: false });

  const all = (data ?? []) as TeamParticipant[];
  const mySet = new Set(myIds);
  const self = all.find((p) => mySet.has(p.id)) ?? null;
  const teammates = all.filter((p) => !mySet.has(p.id));

  const stats = {
    total: all.length,
    surveys: all.filter((p) => DONE(p.survey_status)).length,
    checkIns: all.filter((p) => DONE(p.check_in_status)).length,
  };

  return { self, teammates, stats };
}
