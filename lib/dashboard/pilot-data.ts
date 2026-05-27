import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function getPilotDashboardData() {
  try {
    const supabase = createSupabaseAdminClient();
    const [
      participants,
      checkIns,
      surveys,
      emailEvents,
      tags,
      notifications,
      innerCircle,
    ] = await Promise.all([
      supabase.from("participants").select("*").order("created_at", { ascending: false }).limit(50),
      supabase.from("check_in_results").select("*, participants(first_name,last_name,email,wave,participant_type)").order("created_at", { ascending: false }).limit(50),
      supabase.from("survey_responses").select("*, participants(first_name,last_name,email,participant_type)").order("created_at", { ascending: false }).limit(50),
      supabase.from("email_journey_events").select("*, participants(first_name,last_name,email)").order("scheduled_at", { ascending: true }).limit(80),
      supabase.from("tags").select("id,name,category,participant_tags(participant_id)").order("name"),
      supabase.from("notifications").select("*, participants(first_name,last_name,email)").order("created_at", { ascending: false }).limit(20),
      supabase.from("inner_circle_responses").select("*, participants(first_name,last_name,email)").order("created_at", { ascending: false }).limit(30),
    ]);

    return {
      participants: participants.data ?? [],
      checkIns: checkIns.data ?? [],
      surveys: surveys.data ?? [],
      emailEvents: emailEvents.data ?? [],
      tags: tags.data ?? [],
      notifications: notifications.data ?? [],
      innerCircle: innerCircle.data ?? [],
      error: participants.error?.message ?? checkIns.error?.message ?? surveys.error?.message ?? null,
    };
  } catch (error) {
    return {
      participants: [],
      checkIns: [],
      surveys: [],
      emailEvents: [],
      tags: [],
      notifications: [],
      innerCircle: [],
      error: error instanceof Error ? error.message : "Unable to load pilot data.",
    };
  }
}

export function getPilotMetrics(data: Awaited<ReturnType<typeof getPilotDashboardData>>) {
  const participants = data.participants;
  const checkIns = data.checkIns;
  const surveys = data.surveys;
  const totalScore = checkIns.reduce((sum: number, row: any) => sum + Number(row.total_score ?? 0), 0);

  return {
    invited: participants.filter((row: any) => row.wave).length,
    optedIn: participants.filter((row: any) => row.email_journey_opt_in).length,
    checkInCompleted: checkIns.length,
    averageScore: checkIns.length ? Math.round(totalScore / checkIns.length) : 0,
    journeyStarted: participants.filter((row: any) => row.journey_status === "started").length,
    surveyCompleted: surveys.length,
    innerCircle: participants.filter((row: any) => row.inner_circle_status === "accepted").length,
    followUpPermission: participants.filter((row: any) => row.follow_up_permission_granted).length,
    pastorElderResponses: surveys.filter((row: any) => row.survey_type === "pastor_elder").length,
  };
}
