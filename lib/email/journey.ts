export const EMAIL_JOURNEY_STEPS = [
  { step: 0, key: "welcome", subject: "Welcome to the Created for More 7-Day Stewardship Pilot", delayDays: 0 },
  { step: 1, key: "day_1", subject: "Day 1 — What Kind of Life Are You Actually Building?", delayDays: 1 },
  { step: 2, key: "day_2", subject: "Day 2 — Faith at the Center", delayDays: 2 },
  { step: 3, key: "day_3", subject: "Day 3 — Purpose, Scoreboards, and Drift", delayDays: 3 },
  { step: 4, key: "day_4", subject: "Day 4 — Family and Relationships", delayDays: 4 },
  { step: 5, key: "day_5", subject: "Day 5 — Fitness, Energy, and Capacity", delayDays: 5 },
  { step: 6, key: "day_6", subject: "Day 6 — Fun, Joy, Money, and Meaningful Resources", delayDays: 6 },
  { step: 7, key: "day_7", subject: "Day 7 — One Faithful Next Step", delayDays: 7 },
  { step: 8, key: "final_survey", subject: "Would you share your feedback?", delayDays: 8 },
  { step: 9, key: "survey_reminder", subject: "A quick reminder about the Created for More survey", delayDays: 10 },
  { step: 10, key: "thank_you_share", subject: "Thank you for helping shape this", delayDays: 11 },
  { step: 11, key: "inner_circle", subject: "An invitation to keep helping shape The Stewardship Blueprint", delayDays: 12 },
  { step: 12, key: "behind_the_scenes", subject: "What I am learning behind the scenes", delayDays: 14 },
] as const;

export type EmailJourneyStep = (typeof EMAIL_JOURNEY_STEPS)[number];

export function buildJourneyEvents(participantId: string, startDate = new Date()) {
  return EMAIL_JOURNEY_STEPS.map((step) => {
    const scheduledAt = new Date(startDate);
    scheduledAt.setDate(startDate.getDate() + step.delayDays);

    return {
      participant_id: participantId,
      step_number: step.step,
      step_key: step.key,
      subject: step.subject,
      status: "scheduled",
      scheduled_at: scheduledAt.toISOString(),
      provider: "manual_or_pending",
    };
  });
}
