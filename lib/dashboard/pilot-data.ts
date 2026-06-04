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
      supabase
        .from("participants")
        .select("*, participant_tags(tags(id,name,category))")
        .order("created_at", { ascending: false })
        .limit(100),
      supabase.from("check_in_results").select("*, participants(first_name,last_name,email,wave,participant_type)").order("created_at", { ascending: false }).limit(50),
      supabase.from("survey_responses").select("*, participants(first_name,last_name,email,wave,source,participant_type)").order("created_at", { ascending: false }).limit(100),
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

export async function getParticipantDetail(id: string) {
  try {
    const supabase = createSupabaseAdminClient();
    const [participant, checkIns, surveys, emailEvents, tags, allTags, activity] = await Promise.all([
      supabase.from("participants").select("*").eq("id", id).maybeSingle(),
      supabase.from("check_in_results").select("*").eq("participant_id", id).order("created_at", { ascending: false }),
      supabase.from("survey_responses").select("*").eq("participant_id", id).order("created_at", { ascending: false }),
      supabase.from("email_journey_events").select("*").eq("participant_id", id).order("scheduled_at", { ascending: true }),
      supabase.from("participant_tags").select("tag_id,tags(id,name,category)").eq("participant_id", id),
      supabase.from("tags").select("id,name,category").order("category").order("name"),
      supabase.from("activity_logs").select("*").eq("participant_id", id).order("created_at", { ascending: false }).limit(50),
    ]);

    return {
      participant: participant.data,
      checkIns: checkIns.data ?? [],
      surveys: surveys.data ?? [],
      emailEvents: emailEvents.data ?? [],
      tags: tags.data ?? [],
      allTags: allTags.data ?? [],
      activity: activity.data ?? [],
      error: participant.error?.message ?? checkIns.error?.message ?? surveys.error?.message ?? emailEvents.error?.message ?? tags.error?.message ?? allTags.error?.message ?? activity.error?.message ?? null,
    };
  } catch (error) {
    return {
      participant: null,
      checkIns: [],
      surveys: [],
      emailEvents: [],
      tags: [],
      allTags: [],
      activity: [],
      error: error instanceof Error ? error.message : "Unable to load participant detail.",
    };
  }
}

export async function updateParticipant(input: {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  wave?: string;
  source?: string;
  relationshipCategory?: string;
  participantType: string;
  checkInStatus: string;
  journeyStatus: string;
  surveyStatus: string;
  innerCircleStatus: string;
  storyPermissionGranted: boolean;
  followUpPermissionGranted: boolean;
  notes?: string;
  actorId?: string;
}) {
  const supabase = createSupabaseAdminClient();
  const { data: participant, error } = await supabase
    .from("participants")
    .update({
      first_name: input.firstName,
      last_name: input.lastName,
      email: input.email.trim().toLowerCase(),
      phone: input.phone || null,
      wave: input.wave || null,
      source: input.source || null,
      relationship_category: input.relationshipCategory || null,
      participant_type: input.participantType,
      check_in_status: input.checkInStatus,
      journey_status: input.journeyStatus,
      survey_status: input.surveyStatus,
      inner_circle_status: input.innerCircleStatus,
      story_permission_granted: input.storyPermissionGranted,
      follow_up_permission_granted: input.followUpPermissionGranted,
      notes: input.notes || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.id)
    .select("*")
    .single();

  if (error) throw error;

  await supabase.from("activity_logs").insert({
    actor_id: null,
    participant_id: participant.id,
    action: "participant_edited",
    entity_type: "participants",
    entity_id: participant.id,
    metadata: { actorProfileId: input.actorId ?? null },
  });

  return participant;
}

export async function updateParticipantTags(input: {
  participantId: string;
  tagIds: string[];
  actorId?: string;
}) {
  const supabase = createSupabaseAdminClient();
  const uniqueTagIds = Array.from(new Set(input.tagIds.filter(Boolean)));

  const { error: deleteError } = await supabase
    .from("participant_tags")
    .delete()
    .eq("participant_id", input.participantId);

  if (deleteError) throw deleteError;

  if (uniqueTagIds.length) {
    const { error: insertError } = await supabase.from("participant_tags").insert(
      uniqueTagIds.map((tagId) => ({
        participant_id: input.participantId,
        tag_id: tagId,
      })),
    );

    if (insertError) throw insertError;
  }

  await supabase.from("activity_logs").insert({
    actor_id: null,
    participant_id: input.participantId,
    action: "participant_tags_updated",
    entity_type: "participant_tags",
    entity_id: input.participantId,
    metadata: { actorProfileId: input.actorId ?? null, tagIds: uniqueTagIds },
  });

  return { tagIds: uniqueTagIds };
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
