// Availability engine — pure functions that turn weekly rules + date overrides +
// existing bookings into bookable slots. No DB access here so it stays testable.

import type { AvailabilityRule, Booking, BookingType, DateOverride, Slot } from "./types";

const MINUTE = 60_000;

// Minutes that must be ADDED to a UTC instant to get the wall-clock time in `tz`.
function tzOffsetMinutes(instant: Date, tz: string): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: tz, hour12: false,
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
  const p: Record<string, number> = {};
  for (const part of dtf.formatToParts(instant)) {
    if (part.type !== "literal") p[part.type] = Number(part.value);
  }
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour === 24 ? 0 : p.hour, p.minute, p.second);
  return Math.round((asUtc - instant.getTime()) / MINUTE);
}

// Convert a wall-clock time ("YYYY-MM-DD", minutes-of-day) in `tz` to a UTC Date.
// Two-pass so DST transitions resolve correctly.
export function zonedToUtc(dateStr: string, minutesOfDay: number, tz: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  const hh = Math.floor(minutesOfDay / 60);
  const mm = minutesOfDay % 60;
  const naiveUtc = Date.UTC(y, m - 1, d, hh, mm, 0);
  let offset = tzOffsetMinutes(new Date(naiveUtc), tz);
  let result = naiveUtc - offset * MINUTE;
  const offset2 = tzOffsetMinutes(new Date(result), tz);
  if (offset2 !== offset) { offset = offset2; result = naiveUtc - offset * MINUTE; }
  return new Date(result);
}

// The local calendar date (YYYY-MM-DD) for a UTC instant in `tz`.
export function utcToZonedDate(instant: Date, tz: string): string {
  const dtf = new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" });
  return dtf.format(instant); // en-CA → YYYY-MM-DD
}

// A UTC instant whose getUTCDay() equals the LOCAL weekday of `dateStr` in `tz`.
// (Noon avoids any DST edge flipping the calendar day.)
function zonedNoonForDow(dateStr: string, tz: string): number {
  const noon = zonedToUtc(dateStr, 12 * 60, tz);
  const local = utcToZonedDate(noon, tz);
  const [y, m, d] = local.split("-").map(Number);
  return Date.UTC(y, m - 1, d, 12); // a UTC instant whose getUTCDay matches the local weekday
}

function parseTime(t: string): number {
  const [h, m] = String(t).split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

function addDaysStr(dateStr: string, n: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + n);
  return dt.toISOString().slice(0, 10);
}

type Window = { start: number; end: number }; // minutes-of-day

export type ComputeSlotsInput = {
  type: Pick<BookingType, "duration_minutes" | "slot_interval_minutes" | "buffer_before_minutes" | "buffer_after_minutes" | "timezone" | "min_notice_hours" | "max_advance_days">;
  rules: AvailabilityRule[];
  overrides: DateOverride[];
  bookings: Pick<Booking, "start_at" | "end_at" | "status">[];
  fromDate: string; // YYYY-MM-DD (local in type tz)
  toDate: string;   // inclusive
  now?: Date;
};

export function computeSlots(input: ComputeSlotsInput): Slot[] {
  const { type, rules, overrides, bookings } = input;
  const tz = type.timezone || "America/Chicago";
  const now = input.now ?? new Date();
  const duration = Math.max(5, type.duration_minutes || 30);
  const step = Math.max(5, type.slot_interval_minutes || duration);
  const bufBefore = Math.max(0, type.buffer_before_minutes || 0);
  const bufAfter = Math.max(0, type.buffer_after_minutes || 0);

  const earliest = new Date(now.getTime() + (type.min_notice_hours || 0) * 60 * MINUTE);
  const latest = new Date(now.getTime() + (type.max_advance_days || 60) * 1440 * MINUTE);

  // Pre-expand existing (non-canceled) bookings to blocked UTC intervals incl. buffers.
  const blocked = bookings
    .filter((b) => b.status !== "canceled")
    .map((b) => {
      const s = new Date(b.start_at).getTime() - bufBefore * MINUTE;
      const e = new Date(b.end_at).getTime() + bufAfter * MINUTE;
      return { s, e };
    });

  const overrideByDate = new Map<string, DateOverride[]>();
  for (const o of overrides) {
    const arr = overrideByDate.get(o.override_date) ?? [];
    arr.push(o); overrideByDate.set(o.override_date, arr);
  }

  const slots: Slot[] = [];
  // Cap the scan to a sane horizon regardless of requested range.
  let cursor = input.fromDate;
  for (let i = 0; i < 120 && cursor <= input.toDate; i++, cursor = addDaysStr(cursor, 1)) {
    const date = cursor;
    const dow = new Date(zonedNoonForDow(date, tz)).getUTCDay();

    const dayOverrides = overrideByDate.get(date) ?? [];
    const blackout = dayOverrides.find((o) => !o.is_available && !o.start_time);
    if (blackout) continue;

    let windows: Window[] = rules
      .filter((r) => r.is_active && r.day_of_week === dow)
      .map((r) => ({ start: parseTime(r.start_time), end: parseTime(r.end_time) }));

    // Date-specific available overrides add their own windows.
    for (const o of dayOverrides) {
      if (o.is_available && o.start_time && o.end_time) {
        windows.push({ start: parseTime(o.start_time), end: parseTime(o.end_time) });
      }
    }
    // Partial blackout windows (is_available=false with a time range) subtract — handled by skipping overlaps below.
    const subtract = dayOverrides.filter((o) => !o.is_available && o.start_time && o.end_time)
      .map((o) => ({ start: parseTime(o.start_time!), end: parseTime(o.end_time!) }));

    windows = windows.sort((a, b) => a.start - b.start);

    for (const w of windows) {
      for (let m = w.start; m + duration <= w.end; m += step) {
        if (subtract.some((s) => m < s.end && m + duration > s.start)) continue;
        const startUtc = zonedToUtc(date, m, tz);
        const endUtc = new Date(startUtc.getTime() + duration * MINUTE);
        if (startUtc < earliest || startUtc > latest) continue;
        const sBlockStart = startUtc.getTime() - bufBefore * MINUTE;
        const sBlockEnd = endUtc.getTime() + bufAfter * MINUTE;
        if (blocked.some((b) => sBlockStart < b.e && sBlockEnd > b.s)) continue;
        slots.push({ start: startUtc.toISOString(), end: endUtc.toISOString() });
      }
    }
  }

  slots.sort((a, b) => a.start.localeCompare(b.start));
  return slots;
}

// Group flat slots by their local date (in tz) for rendering.
export function groupSlotsByDate(slots: Slot[], tz: string): { date: string; slots: Slot[] }[] {
  const map = new Map<string, Slot[]>();
  for (const s of slots) {
    const d = utcToZonedDate(new Date(s.start), tz);
    const arr = map.get(d) ?? [];
    arr.push(s); map.set(d, arr);
  }
  return Array.from(map.entries()).map(([date, slots]) => ({ date, slots }));
}
