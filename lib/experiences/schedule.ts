import { FREQUENCY_INTERVAL_DAYS, type ExperienceFrequency } from "./types";

/**
 * Compute the send date for a given step of an experience.
 * Step 1 goes out on the start date; each later step is spaced by the cadence
 * interval (7 days weekly, 14 days bi-weekly).
 *
 * The start date is a calendar date (yyyy-mm-dd); we anchor sends at that local
 * date. We build the timestamp in UTC to keep the computation deterministic and
 * free of the host's timezone (the scheduler only compares scheduled_at <= now).
 */
export function computeStepDate(startDate: string, frequency: ExperienceFrequency, stepNumber: number): Date {
  const base = new Date(`${startDate}T09:00:00.000Z`); // 09:00 UTC on the start date
  const offsetDays = (stepNumber - 1) * FREQUENCY_INTERVAL_DAYS[frequency];
  base.setUTCDate(base.getUTCDate() + offsetDays);
  return base;
}

/**
 * Build the full schedule for an experience: one entry per step.
 * `steps` is 1..durationWeeks — the number of weekly/bi-weekly touchpoints.
 */
export function computeSchedule(
  startDate: string,
  frequency: ExperienceFrequency,
  stepCount: number,
): { stepNumber: number; scheduledAt: Date }[] {
  const schedule: { stepNumber: number; scheduledAt: Date }[] = [];
  for (let step = 1; step <= stepCount; step++) {
    schedule.push({ stepNumber: step, scheduledAt: computeStepDate(startDate, frequency, step) });
  }
  return schedule;
}
