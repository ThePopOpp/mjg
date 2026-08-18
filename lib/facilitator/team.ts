import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { upsertParticipant } from "@/lib/pilot/repository";
import { getCheckInSubmissionsForEmails } from "@/lib/check-in/submissions";

export type TeamParticipant = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  wave: string | null;
  check_in_status: string | null;
  survey_status: string | null;
  journey_status: string | null;
  inner_circle_status: string | null;
  created_at: string;
};

export type Touchpoint = {
  id: string;
  scheduled_at: string;
  step_number: number;
  status: string;
  attendee_email: string | null;
  attendee_name: string | null;
  experience_name: string | null;
};

export type TeamStats = {
  total: number;
  surveys: number;
  journey: number;
  checkIns: number;
};

const DONE = (v: string | null | undefined) => Boolean(v && v !== "not_sent" && v !== "not_started" && v !== "none");

export async function getFacilitatorTeam(profileId: string): Promise<{
  participants: TeamParticipant[];
  touchpoints: Touchpoint[];
  stats: TeamStats;
}> {
  const supabase = createSupabaseAdminClient();

  // Teams led by this facilitator → member participant ids (deduped across teams).
  const { data: teams } = await supabase.from("facilitator_teams").select("id").eq("facilitator_id", profileId);
  const teamIds = (teams ?? []).map((t: any) => t.id);

  let participants: TeamParticipant[] = [];
  if (teamIds.length) {
    const { data: members } = await supabase
      .from("facilitator_team_members")
      .select("participant_id")
      .in("team_id", teamIds);
    const participantIds = Array.from(new Set((members ?? []).map((m: any) => m.participant_id)));
    if (participantIds.length) {
      const { data } = await supabase
        .from("participants")
        .select("id,first_name,last_name,email,phone,wave,check_in_status,survey_status,journey_status,inner_circle_status,created_at")
        .in("id", participantIds)
        .order("created_at", { ascending: false });
      participants = (data ?? []) as TeamParticipant[];
    }
  }

  // Upcoming touchpoints — scheduled experience emails for experiences this facilitator leads.
  let touchpoints: Touchpoint[] = [];
  const { data: experiences } = await supabase.from("experiences").select("id,name").eq("facilitator_id", profileId);
  const expIds = (experiences ?? []).map((e: any) => e.id);
  const expName = new Map<string, string>((experiences ?? []).map((e: any) => [e.id, e.name]));
  if (expIds.length) {
    const { data: events } = await supabase
      .from("experience_send_events")
      .select("id,experience_id,scheduled_at,step_number,status, experience_attendees(email,name)")
      .in("experience_id", expIds)
      .eq("status", "scheduled")
      .order("scheduled_at", { ascending: true })
      .limit(500);
    touchpoints = (events ?? []).map((e: any) => ({
      id: e.id,
      scheduled_at: e.scheduled_at,
      step_number: e.step_number,
      status: e.status,
      attendee_email: e.experience_attendees?.email ?? null,
      attendee_name: e.experience_attendees?.name ?? null,
      experience_name: expName.get(e.experience_id) ?? null,
    }));
  }

  // Count Created for More Check-Ins from team members (matched by email), in addition
  // to any legacy check_in_status flag.
  const teamEmails = participants.map((p) => p.email).filter((e): e is string => Boolean(e));
  const subs = teamEmails.length ? await getCheckInSubmissionsForEmails(teamEmails) : [];
  const submittedEmails = new Set(subs.map((s) => (s.email ?? "").toLowerCase()));

  const stats: TeamStats = {
    total: participants.length,
    surveys: participants.filter((p) => DONE(p.survey_status)).length,
    journey: participants.filter((p) => DONE(p.journey_status)).length,
    checkIns: participants.filter((p) => DONE(p.check_in_status) || (p.email && submittedEmails.has(p.email.toLowerCase()))).length,
  };

  return { participants, touchpoints, stats };
}

/** Ensure the facilitator has an ad-hoc "My Team" (experience_id null) and return its id. */
export async function ensureDefaultTeam(profileId: string): Promise<string> {
  const supabase = createSupabaseAdminClient();
  const { data: existing } = await supabase
    .from("facilitator_teams")
    .select("id")
    .eq("facilitator_id", profileId)
    .is("experience_id", null)
    .maybeSingle();
  if (existing) return existing.id;
  const { data: team, error } = await supabase
    .from("facilitator_teams")
    .insert({ name: "My Team", facilitator_id: profileId, created_by: profileId })
    .select("id")
    .single();
  if (error) throw error;
  return team.id;
}

export async function addTeamParticipant(
  profileId: string,
  input: { name?: string; email: string; phone?: string },
) {
  const trimmed = (input.name ?? "").trim();
  const parts = trimmed.split(/\s+/).filter(Boolean);
  const participant = await upsertParticipant({
    firstName: parts[0] || input.email,
    lastName: parts.slice(1).join(" "),
    email: input.email,
    phone: input.phone,
    participantType: "general_participant",
  });

  const supabase = createSupabaseAdminClient();
  const teamId = await ensureDefaultTeam(profileId);
  await supabase
    .from("facilitator_team_members")
    .upsert({ team_id: teamId, participant_id: participant.id }, { onConflict: "team_id,participant_id" });
  return participant;
}

/** Team participant ids across all teams this facilitator leads. */
async function teamParticipantIds(profileId: string): Promise<string[]> {
  const supabase = createSupabaseAdminClient();
  const { data: teams } = await supabase.from("facilitator_teams").select("id").eq("facilitator_id", profileId);
  const teamIds = (teams ?? []).map((t: any) => t.id);
  if (!teamIds.length) return [];
  const { data: members } = await supabase.from("facilitator_team_members").select("participant_id").in("team_id", teamIds);
  return Array.from(new Set((members ?? []).map((m: any) => m.participant_id)));
}

/** Team-scoped check-in results, survey responses, and form-submission history. */
export async function getTeamResults(profileId: string) {
  const supabase = createSupabaseAdminClient();
  const ids = await teamParticipantIds(profileId);
  if (!ids.length) return { checkIns: [], surveys: [], submissions: [] };

  const [checkIns, surveys, submissions] = await Promise.all([
    supabase
      .from("check_in_results")
      .select("*, participants(first_name,last_name,email,wave,participant_type)")
      .in("participant_id", ids)
      .order("created_at", { ascending: false })
      .limit(200),
    supabase
      .from("survey_responses")
      .select("*, participants(first_name,last_name,email,wave,source,participant_type)")
      .in("participant_id", ids)
      .order("created_at", { ascending: false })
      .limit(200),
    supabase
      .from("form_submissions")
      .select("id,form_type,email,participant_id,status,created_at, participants(first_name,last_name)")
      .in("participant_id", ids)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(200),
  ]);

  return {
    checkIns: checkIns.data ?? [],
    surveys: surveys.data ?? [],
    submissions: submissions.data ?? [],
  };
}

/** Is this participant on one of the facilitator's teams? (authorization for notify) */
export async function participantOnFacilitatorTeam(profileId: string, participantId: string): Promise<boolean> {
  const supabase = createSupabaseAdminClient();
  const { data: teams } = await supabase.from("facilitator_teams").select("id").eq("facilitator_id", profileId);
  const teamIds = (teams ?? []).map((t: any) => t.id);
  if (!teamIds.length) return false;
  const { data } = await supabase
    .from("facilitator_team_members")
    .select("id")
    .in("team_id", teamIds)
    .eq("participant_id", participantId)
    .maybeSingle();
  return Boolean(data);
}
