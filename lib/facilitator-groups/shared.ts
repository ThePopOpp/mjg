// Types + labels for facilitator groups — no server imports, so client components can use it.

export const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;
export const AUDIENCES = { men: "Men", women: "Women", couples: "Couples", mixed: "Men & women", youth: "Young adults" } as const;
export const FORMATS = { in_person: "In person", online: "Online", hybrid: "In person + online" } as const;
export const TIMES_OF_DAY = { morning: "Morning", afternoon: "Afternoon", evening: "Evening" } as const;

export type Audience = keyof typeof AUDIENCES;
export type GroupFormat = keyof typeof FORMATS;
export type BookingMode = "auto" | "approval";
export type GroupStatus = "draft" | "published" | "closed" | "archived";
export type ReservationStatus = "pending" | "confirmed" | "waitlisted" | "declined" | "canceled";
export type FinderMode = "hidden" | "preview" | "open";

/** Everything the facilitator edits (dashboard). */
export type GroupInput = {
  title: string;
  description?: string | null;
  audience?: Audience;
  language?: string;
  photoUrl?: string | null;
  churchOrg?: string | null;
  meetingDay?: number | null;
  meetingTime?: string | null; // "18:30"
  timezone?: string;
  frequency?: "weekly" | "biweekly";
  startDate?: string | null; // "2027-01-12"
  durationWeeks?: number;
  format?: GroupFormat;
  venueName?: string | null;
  addressLine?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  showExactAddress?: boolean;
  capacity?: number;
  bookingMode?: BookingMode;
  experienceId?: string | null;
};

export type OwnerGroup = {
  id: string;
  slug: string;
  facilitatorId: string;
  teamId: string | null;
  experienceId: string | null;
  title: string;
  description: string | null;
  audience: Audience;
  language: string;
  photoUrl: string | null;
  churchOrg: string | null;
  meetingDay: number | null;
  meetingTime: string | null;
  timezone: string;
  frequency: "weekly" | "biweekly";
  startDate: string | null;
  durationWeeks: number;
  format: GroupFormat;
  venueName: string | null;
  addressLine: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  lat: number | null;
  lng: number | null;
  publicLat: number | null;
  publicLng: number | null;
  showExactAddress: boolean;
  capacity: number;
  bookingMode: BookingMode;
  status: GroupStatus;
  spotsTaken: number;
  pendingCount: number;
  waitlistCount: number;
  createdAt: string;
};

export type Reservation = {
  id: string;
  groupId: string;
  profileId: string | null;
  name: string | null;
  email: string | null;
  partySize: number;
  message: string | null;
  source: "request" | "facilitator" | "import";
  status: ReservationStatus;
  createdAt: string;
  decidedAt: string | null;
};

/** What the public pages get — never the private address/coordinates unless shown on purpose. */
export type PublicGroup = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  audience: Audience;
  language: string;
  photoUrl: string | null;
  churchOrg: string | null;
  meetingDay: number | null;
  meetingTime: string | null;
  timezone: string;
  frequency: "weekly" | "biweekly";
  startDate: string | null;
  durationWeeks: number;
  format: GroupFormat;
  areaLabel: string; // "Chandler, AZ" or the venue when exact
  venueName: string | null; // only when showExactAddress
  addressLine: string | null; // only when showExactAddress
  lat: number | null; // public point (fuzzed unless exact)
  lng: number | null;
  exact: boolean;
  capacity: number;
  spotsLeft: number;
  bookingMode: BookingMode;
  facilitator: PublicFacilitator;
  distanceMiles?: number | null;
};

export type PublicFacilitator = {
  profileId: string;
  slug: string | null;
  name: string;
  photoUrl: string | null;
  churchOrg: string | null;
  city: string | null;
  state: string | null;
  bio: string | null;
};

export type FacilitatorProfileInput = {
  displayName: string;
  bio?: string | null;
  photoUrl?: string | null;
  churchOrg?: string | null;
  city?: string | null;
  state?: string | null;
  isPublic?: boolean;
};

export function formatMeetingTime(t: string | null | undefined): string {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  if (!Number.isFinite(h)) return t;
  const suffix = h >= 12 ? "pm" : "am";
  const hour = h % 12 || 12;
  return m ? `${hour}:${String(m).padStart(2, "0")}${suffix}` : `${hour}${suffix}`;
}

const TZ_SHORT: Record<string, string> = {
  "America/Phoenix": "AZ time",
  "America/Los_Angeles": "Pacific",
  "America/Denver": "Mountain",
  "America/Chicago": "Central",
  "America/New_York": "Eastern",
};
export const TIMEZONES = Object.keys(TZ_SHORT);
export const tzLabel = (tz: string) => TZ_SHORT[tz] ?? tz;

/** "Tuesdays · 6:30pm AZ time" (or "every other Tuesday"). */
export function scheduleLabel(g: { meetingDay: number | null; meetingTime: string | null; timezone: string; frequency: string }) {
  const day = g.meetingDay != null ? DAYS[g.meetingDay] : null;
  const when = day ? (g.frequency === "biweekly" ? `Every other ${day}` : `${day}s`) : "Day TBD";
  const time = g.meetingTime ? ` · ${formatMeetingTime(g.meetingTime)} ${tzLabel(g.timezone)}` : "";
  return `${when}${time}`;
}

export function timeOfDay(t: string | null | undefined): keyof typeof TIMES_OF_DAY | null {
  if (!t) return null;
  const h = Number(t.split(":")[0]);
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}

export const STATUS_LABELS: Record<ReservationStatus, string> = {
  pending: "Awaiting approval",
  confirmed: "Confirmed",
  waitlisted: "Waitlisted",
  declined: "Declined",
  canceled: "Canceled",
};
