import { PRESET_CADENCE, type ExperienceFrequency, type OffsetUnit } from "./types";

const MS: Record<Exclude<OffsetUnit, "month">, number> = {
  minute: 60_000,
  hour: 3_600_000,
  day: 86_400_000,
  week: 604_800_000,
};

/** The experience anchor time = start date + start time, interpreted as UTC. */
export function startAnchor(startDate: string, startTime = "09:00"): Date {
  const time = /^\d{2}:\d{2}(:\d{2})?$/.test(startTime) ? startTime : "09:00";
  const hms = time.length === 5 ? `${time}:00` : time;
  return new Date(`${startDate}T${hms}.000Z`);
}

/** Add an offset (value + unit) to a base date. Months are calendar months; others are fixed. */
export function addOffset(base: Date, value: number, unit: OffsetUnit): Date {
  const d = new Date(base);
  if (unit === "month") {
    d.setUTCMonth(d.getUTCMonth() + value);
    return d;
  }
  return new Date(d.getTime() + value * MS[unit]);
}

/** Scheduled send time for a step given its offset from the experience start. */
export function computeStepDate(
  startDate: string,
  startTime: string,
  offsetValue: number,
  offsetUnit: OffsetUnit,
): Date {
  return addOffset(startAnchor(startDate, startTime), offsetValue, offsetUnit);
}

/**
 * Default per-step offsets for a cadence, used to pre-fill the Selections repeater.
 * Step 1 is always offset 0 (goes out at the start); each later step adds one interval.
 */
export function defaultStepOffsets(
  frequency: ExperienceFrequency,
  stepCount: number,
  custom?: { value: number; unit: OffsetUnit } | null,
): { offsetValue: number; offsetUnit: OffsetUnit }[] {
  const interval =
    frequency === "custom" && custom
      ? custom
      : PRESET_CADENCE[frequency === "biweekly" ? "biweekly" : "weekly"];
  return Array.from({ length: Math.max(0, stepCount) }, (_, i) => ({
    offsetValue: i * interval.value,
    offsetUnit: interval.unit,
  }));
}
