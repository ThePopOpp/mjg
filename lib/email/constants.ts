export const DEFAULT_EMAIL_FIELDS = [
  "first_name",
  "last_name",
  "full_name",
  "email",
  "phone",
  "role",
  "status",
  "wave",
  "source",
  "participant_type",
  "check_in_status",
  "survey_status",
  "inner_circle_status",
  "invite_url",
  "checkin_link",
  "survey_link",
  "inner_circle_link",
  "forward_link",
  "preferences_url",
  "unsubscribe_url",
  "site_url",
] as const;

export const EMAIL_EVENT_KEYS = [
  { key: "user_invitation", label: "User invitation", description: "Dashboard account invitation email." },
  { key: "check_in_completed", label: "Check-In completed", description: "Sent after the Created for More Check-In is completed." },
  { key: "survey_general_invite", label: "General survey invite", description: "Final survey invitation for general participants." },
  { key: "survey_pastor_elder_invite", label: "Pastor/Elder survey invite", description: "Final survey invitation for pastor, elder, and church leader reviewers." },
  { key: "inner_circle_invite", label: "Inner Circle invite", description: "Invitation to continue with the Stewardship Blueprint Inner Circle." },
  { key: "email_journey_welcome", label: "Journey welcome", description: "Email 0: Welcome and next steps." },
  { key: "email_journey_day_1", label: "Journey Day 1", description: "Day 1: What kind of life are you actually building?" },
  { key: "email_journey_day_2", label: "Journey Day 2", description: "Day 2: Faith at the center." },
  { key: "email_journey_day_3", label: "Journey Day 3", description: "Day 3: Purpose, scoreboards, and drift." },
  { key: "email_journey_day_4", label: "Journey Day 4", description: "Day 4: Family and relationships." },
  { key: "email_journey_day_5", label: "Journey Day 5", description: "Day 5: Fitness, energy, and capacity." },
  { key: "email_journey_day_6", label: "Journey Day 6", description: "Day 6: Fun, joy, money, and meaningful resources." },
  { key: "email_journey_day_7", label: "Journey Day 7", description: "Day 7: One faithful next step." },
  { key: "email_journey_final_survey", label: "Journey final survey", description: "Email 8: Final survey invitation." },
  { key: "email_journey_survey_reminder", label: "Journey survey reminder", description: "Email 9: Survey reminder." },
  { key: "email_journey_thank_you_share", label: "Journey thank-you/share", description: "Email 10: Thank-you and share request." },
  { key: "email_journey_inner_circle", label: "Journey Inner Circle", description: "Email 11: Inner Circle invitation." },
  { key: "email_journey_behind_the_scenes", label: "Journey behind the scenes", description: "Email 12: Behind-the-scenes follow-up." },
] as const;

export type EmailEventKey = (typeof EMAIL_EVENT_KEYS)[number]["key"];

export function eventKeyForJourneyStep(stepKey: string) {
  return `email_journey_${stepKey}` as EmailEventKey;
}
