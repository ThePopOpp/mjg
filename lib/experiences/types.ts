export type ExperienceFrequency = "weekly" | "biweekly";
export type ExperienceStatus = "draft" | "scheduled" | "active" | "completed" | "cancelled";
export type SendEventStatus = "scheduled" | "sent" | "skipped" | "failed";

export const FREQUENCY_LABELS: Record<ExperienceFrequency, string> = {
  weekly: "Weekly",
  biweekly: "Bi-Weekly (2 weeks)",
};

export const FREQUENCY_INTERVAL_DAYS: Record<ExperienceFrequency, number> = {
  weekly: 7,
  biweekly: 14,
};

export type ExperienceType = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  default_frequency: ExperienceFrequency;
  default_duration_weeks: number;
  status: "active" | "archived";
  created_at: string;
  updated_at: string;
};

export type ExperienceTypeStep = {
  id: string;
  experience_type_id: string;
  step_number: number;
  label: string | null;
  email_template_id: string | null;
  subject_override: string | null;
};

export type ExperienceAttendee = {
  id: string;
  experience_id: string;
  participant_id: string | null;
  name: string | null;
  email: string;
  opted_out: boolean;
  created_at: string;
};

export type ExperienceSendEvent = {
  id: string;
  experience_id: string;
  attendee_id: string;
  step_number: number;
  template_id: string | null;
  subject: string | null;
  status: SendEventStatus;
  scheduled_at: string;
  sent_at: string | null;
  error_message: string | null;
};

export type Experience = {
  id: string;
  experience_type_id: string | null;
  name: string;
  facilitator_id: string | null;
  start_date: string;
  frequency: ExperienceFrequency;
  duration_weeks: number;
  status: ExperienceStatus;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

// Payload the create wizard submits.
export type AttendeeInput = { name?: string | null; email: string };
export type CreateExperienceInput = {
  experienceTypeId: string;
  name?: string;
  startDate: string; // yyyy-mm-dd
  frequency: ExperienceFrequency;
  durationWeeks: number;
  facilitatorId?: string | null;
  attendees: AttendeeInput[];
};
