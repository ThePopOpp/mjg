export type ExperienceFrequency = "weekly" | "biweekly" | "custom";
export type OffsetUnit = "minute" | "hour" | "day" | "week" | "month";
export type ExperienceStatus = "draft" | "scheduled" | "active" | "completed" | "cancelled";
export type SendEventStatus = "scheduled" | "sent" | "skipped" | "failed";

export const FREQUENCY_LABELS: Record<ExperienceFrequency, string> = {
  weekly: "Weekly",
  biweekly: "Bi-Weekly (2 weeks)",
  custom: "Custom",
};

// Base interval (in the given unit) between consecutive steps for the preset cadences.
export const PRESET_CADENCE: Record<"weekly" | "biweekly", { value: number; unit: OffsetUnit }> = {
  weekly: { value: 1, unit: "week" },
  biweekly: { value: 2, unit: "week" },
};

export const OFFSET_UNIT_LABELS: Record<OffsetUnit, string> = {
  minute: "Minutes",
  hour: "Hours",
  day: "Days",
  week: "Weeks",
  month: "Months",
};

export const OFFSET_UNITS: OffsetUnit[] = ["minute", "hour", "day", "week", "month"];

export type ExperienceType = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  default_frequency: ExperienceFrequency;
  default_duration_weeks: number;
  category: string | null;
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

export type ExperienceStep = {
  id: string;
  experience_id: string;
  step_number: number;
  label: string | null;
  email_template_id: string | null;
  offset_value: number;
  offset_unit: OffsetUnit;
};

export type Experience = {
  id: string;
  experience_type_id: string | null;
  name: string;
  facilitator_id: string | null;
  start_date: string;
  start_time: string;
  frequency: ExperienceFrequency;
  custom_interval_value: number | null;
  custom_interval_unit: OffsetUnit | null;
  duration_weeks: number;
  status: ExperienceStatus;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

// One scheduled email on the admin calendar (one per experience × step).
export type EmailEvent = {
  id: string;
  experienceId: string;
  experienceName: string;
  stepNumber: number;
  templateName: string | null;
  scheduledAt: string;
  recipients: number;
};

// ── Wizard payload ─────────────────────────────────────────────────────────────
export type AttendeeInput = { name?: string | null; email: string };

// One row of the Selections repeater: a template + when it goes out (offset from start).
export type WizardStepInput = {
  emailTemplateId?: string | null;
  offsetValue: number;
  offsetUnit: OffsetUnit;
  label?: string | null;
};

export type CreateExperienceInput = {
  experienceTypeId?: string | null; // null for a custom "New Experience"
  name?: string;
  startDate: string; // yyyy-mm-dd
  startTime?: string; // HH:MM (24h)
  frequency: ExperienceFrequency;
  customIntervalValue?: number | null;
  customIntervalUnit?: OffsetUnit | null;
  durationWeeks: number; // number of steps
  facilitatorId?: string | null;
  previewId?: string | null;
  attendees: AttendeeInput[];
  steps: WizardStepInput[];
};
