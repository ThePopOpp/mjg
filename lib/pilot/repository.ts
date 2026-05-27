import { buildJourneyEvents } from "@/lib/email/journey";
import { createDashboardNotification } from "@/lib/notifications/notify";
import { CHECK_IN_SECTIONS, PARTICIPANT_TYPES } from "@/lib/pilot/constants";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { CheckInScoreResult, CheckInScores } from "@/lib/scoring/check-in";

type Consent = {
  emailJourneyOptIn?: boolean;
  futureUpdatesOptIn?: boolean;
  anonymousFeedbackPermission?: boolean;
  storyInterviewPermission?: boolean;
  followUpPermission?: boolean;
};

type ContactInput = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  waveSource?: string;
  relationshipCategory?: string;
  participantType?: string;
  consent?: Consent;
};

export async function upsertParticipant(input: ContactInput) {
  const supabase = createSupabaseAdminClient();
  const normalizedEmail = input.email.trim().toLowerCase();

  const { data, error } = await supabase
    .from("participants")
    .upsert(
      {
        first_name: input.firstName.trim(),
        last_name: input.lastName.trim(),
        email: normalizedEmail,
        phone: input.phone?.trim() || null,
        wave: input.waveSource || null,
        source: input.waveSource || null,
        relationship_category: input.relationshipCategory || null,
        participant_type: input.participantType || PARTICIPANT_TYPES.GENERAL,
        email_journey_opt_in: Boolean(input.consent?.emailJourneyOptIn),
        future_updates_opt_in: Boolean(input.consent?.futureUpdatesOptIn),
        anonymous_feedback_permission: Boolean(input.consent?.anonymousFeedbackPermission),
        story_permission_granted: Boolean(input.consent?.storyInterviewPermission),
        follow_up_permission_granted: Boolean(input.consent?.followUpPermission),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "email" },
    )
    .select("id,email,first_name,last_name,participant_type")
    .single();

  if (error) throw error;

  await applyParticipantTags(data.id, tagsForParticipant(input));
  return data;
}

export async function saveCheckIn(input: {
  contact: ContactInput;
  scores: CheckInScores;
  result: CheckInScoreResult;
  reflections: Record<string, string>;
}) {
  const supabase = createSupabaseAdminClient();
  const participant = await upsertParticipant(input.contact);

  const { data: checkIn, error: resultError } = await supabase
    .from("check_in_results")
    .insert({
      participant_id: participant.id,
      total_score: input.result.totalScore,
      score_range_category: input.result.scoreRangeCategory,
      lowest_area_key: input.result.lowestAreaKey,
      lowest_area_label: input.result.lowestAreaLabel,
      section_scores: input.result.sectionScores,
      reflections: input.reflections,
      consent: input.contact.consent ?? {},
    })
    .select("id")
    .single();

  if (resultError) throw resultError;

  const answers = CHECK_IN_SECTIONS.flatMap((section) =>
    section.questions.map((question, index) => ({
      check_in_result_id: checkIn.id,
      participant_id: participant.id,
      section_key: section.key,
      section_label: section.title,
      question_index: index + 1,
      question,
      score: input.scores[section.key][index],
    })),
  );

  const { error: answersError } = await supabase.from("check_in_answers").insert(answers);
  if (answersError) throw answersError;

  await supabase
    .from("participants")
    .update({
      check_in_status: "completed",
      check_in_total_score: input.result.totalScore,
      lowest_scoring_area: input.result.lowestAreaLabel,
      score_range_category: input.result.scoreRangeCategory,
      journey_status: input.contact.consent?.emailJourneyOptIn ? "started" : "not_started",
      updated_at: new Date().toISOString(),
    })
    .eq("id", participant.id);

  await applyParticipantTags(participant.id, [
    "Check-In Completed",
    input.result.lowestAreaTag,
    ...(input.contact.consent?.emailJourneyOptIn ? ["7-Day Journey Started"] : []),
    ...(input.contact.consent?.storyInterviewPermission ? ["Story Permission Granted", "Interview Candidate"] : []),
  ]);

  if (input.contact.consent?.emailJourneyOptIn) {
    await supabase.from("email_journey_events").insert(buildJourneyEvents(participant.id));
  }

  await createDashboardNotification({
    type: "check_in_completed",
    title: "New Check-In completed",
    message: `${input.contact.firstName} ${input.contact.lastName} completed the Created for More Check-In.`,
    participantId: participant.id,
    metadata: { totalScore: input.result.totalScore, lowestArea: input.result.lowestAreaLabel },
  });

  return { participantId: participant.id, checkInResultId: checkIn.id };
}

export async function saveSurvey(input: {
  surveyType: "general" | "pastor_elder";
  name: string;
  email: string;
  answers: Record<string, unknown>;
}) {
  const supabase = createSupabaseAdminClient();
  const [firstName, ...lastParts] = input.name.trim().split(" ");
  const participant = await upsertParticipant({
    firstName: firstName || "Unknown",
    lastName: lastParts.join(" ") || "",
    email: input.email,
    participantType: input.surveyType === "pastor_elder" ? PARTICIPANT_TYPES.PASTOR_ELDER : PARTICIPANT_TYPES.GENERAL,
    consent: {
      anonymousFeedbackPermission: input.answers.anonymousUse === "Yes",
      followUpPermission: input.answers.followUp === "Yes" || input.answers.followUpConversation === "Yes",
      storyInterviewPermission: input.answers.storyInterview === "Yes",
    },
  });

  const { data: response, error } = await supabase
    .from("survey_responses")
    .insert({
      participant_id: participant.id,
      survey_type: input.surveyType,
      answers: input.answers,
      anonymous_feedback_permission: input.answers.anonymousUse === "Yes",
      story_interview_permission: input.answers.storyInterview === "Yes",
      follow_up_permission: input.answers.followUp === "Yes" || input.answers.followUpConversation === "Yes",
    })
    .select("id")
    .single();

  if (error) throw error;

  const answerRows = Object.entries(input.answers).map(([key, value]) => ({
    survey_response_id: response.id,
    participant_id: participant.id,
    question_key: key,
    answer: value,
  }));

  if (answerRows.length) {
    await supabase.from("survey_answers").insert(answerRows);
  }

  await supabase
    .from("participants")
    .update({
      survey_status: "completed",
      inner_circle_status:
        input.answers.innerCircle === "Yes" ? "invited" : undefined,
      updated_at: new Date().toISOString(),
    })
    .eq("id", participant.id);

  const tags = [
    "Survey Completed",
    ...(input.surveyType === "pastor_elder" ? ["Pastor/Elder Review", "Church Leader"] : []),
    ...(input.answers.storyInterview === "Yes" ? ["Story Permission Granted", "Interview Candidate"] : []),
    ...(input.answers.innerCircle === "Yes" ? ["Inner Circle Invited"] : []),
    ...(arrayIncludes(input.answers.futureResource, "Bible plan") || arrayIncludes(input.answers.topicsExpanded, "Faith at the center") ? ["Bible Plan Interest"] : []),
    ...(arrayIncludes(input.answers.futureResource, "Small-group study") || arrayIncludes(input.answers.churchSetting, "Small group") ? ["Small Group Interest"] : []),
    ...(arrayIncludes(input.answers.futureResource, "Workbook") ? ["Workbook Interest"] : []),
    ...(arrayIncludes(input.answers.futureResource, "Live workshop") ? ["Speaking Interest"] : []),
    ...(input.answers.churchUse === "Yes" || input.answers.churchUse === "Possibly" ? ["Church Pilot Interest"] : []),
  ];
  await applyParticipantTags(participant.id, tags);

  await createDashboardNotification({
    type: input.surveyType === "pastor_elder" ? "pastor_elder_survey_completed" : "general_survey_completed",
    title: input.surveyType === "pastor_elder" ? "Pastor/Elder survey completed" : "General survey completed",
    message: `${input.name} completed the ${input.surveyType === "pastor_elder" ? "Pastor/Elder" : "general"} pilot survey.`,
    participantId: participant.id,
  });

  return { participantId: participant.id, surveyResponseId: response.id };
}

export async function saveInnerCircle(input: {
  name: string;
  email: string;
  phone?: string;
  willing: boolean;
  futureFeedbackPermission: boolean;
  storyInterviewPermission: boolean;
  publicUseAcknowledgement: boolean;
}) {
  const [firstName, ...lastParts] = input.name.trim().split(" ");
  const participant = await upsertParticipant({
    firstName: firstName || "Unknown",
    lastName: lastParts.join(" ") || "",
    email: input.email,
    phone: input.phone,
    waveSource: "inner_circle",
    consent: {
      followUpPermission: input.futureFeedbackPermission,
      storyInterviewPermission: input.storyInterviewPermission,
    },
  });

  const supabase = createSupabaseAdminClient();
  await supabase.from("inner_circle_responses").insert({
    participant_id: participant.id,
    name: input.name,
    email: input.email,
    phone: input.phone || null,
    willing: input.willing,
    future_feedback_permission: input.futureFeedbackPermission,
    story_interview_permission: input.storyInterviewPermission,
    public_use_acknowledgement: input.publicUseAcknowledgement,
  });

  await supabase
    .from("participants")
    .update({
      inner_circle_status: input.willing ? "accepted" : "not_invited",
      updated_at: new Date().toISOString(),
    })
    .eq("id", participant.id);

  await applyParticipantTags(participant.id, [
    ...(input.willing ? ["Inner Circle Accepted"] : []),
    ...(input.storyInterviewPermission ? ["Story Permission Granted", "Interview Candidate"] : []),
  ]);

  await createDashboardNotification({
    type: "inner_circle_submitted",
    title: "Inner Circle form submitted",
    message: `${input.name} submitted the Inner Circle invitation form.`,
    participantId: participant.id,
  });

  return { participantId: participant.id };
}

async function applyParticipantTags(participantId: string, tagNames: string[]) {
  const uniqueTags = Array.from(new Set(tagNames.filter(Boolean)));
  if (!uniqueTags.length) return;

  const supabase = createSupabaseAdminClient();
  await supabase.from("tags").upsert(uniqueTags.map((name) => ({ name })), { onConflict: "name" });

  const { data: tags, error } = await supabase.from("tags").select("id,name").in("name", uniqueTags);
  if (error) throw error;

  await supabase.from("participant_tags").upsert(
    tags.map((tag) => ({
      participant_id: participantId,
      tag_id: tag.id,
    })),
    { onConflict: "participant_id,tag_id" },
  );
}

function tagsForParticipant(input: ContactInput) {
  return [
    "Created for More Pilot",
    waveTag(input.waveSource),
    input.participantType === PARTICIPANT_TYPES.PASTOR_ELDER ? "Pastor/Elder Review" : "",
    input.participantType === PARTICIPANT_TYPES.PASTOR_ELDER ? "Church Leader" : "",
    input.consent?.storyInterviewPermission ? "Story Permission Granted" : "",
    input.consent?.storyInterviewPermission ? "Interview Candidate" : "",
  ].filter(Boolean);
}

function waveTag(source?: string) {
  if (source === "wave_0") return "Wave 0";
  if (source === "wave_1") return "Wave 1";
  if (source === "wave_2") return "Wave 2";
  if (source === "wave_3") return "Wave 3";
  return "";
}

function arrayIncludes(value: unknown, item: string) {
  return Array.isArray(value) && value.includes(item);
}
