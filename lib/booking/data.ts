import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type {
  AvailabilityRule, Booking, BookingManagerData, BookingStats, BookingType,
  DateOverride, EventItem, EventRegistration, IntakeQuestion,
} from "./types";

export function slugify(input: string): string {
  return (
    String(input || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "item"
  );
}

async function ensureUniqueSlug(table: "booking_types" | "events", base: string, ignoreId?: string): Promise<string> {
  const sb = createSupabaseAdminClient();
  const root = slugify(base);
  let candidate = root;
  for (let i = 0; i < 50; i++) {
    const { data } = await sb.from(table).select("id").eq("slug", candidate).maybeSingle();
    if (!data || data.id === ignoreId) return candidate;
    candidate = `${root}-${i + 2}`;
  }
  return `${root}-${Date.now().toString(36)}`;
}

function reference(): string {
  // Short human-friendly booking reference, e.g. MJG-4F9K2.
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 5; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return `MJG-${s}`;
}

const TYPE_COLUMNS = [
  "slug", "name", "description", "duration_minutes", "slot_interval_minutes",
  "buffer_before_minutes", "buffer_after_minutes", "location_type", "location_details",
  "color", "is_active", "is_public", "host_staff_id", "host_name", "timezone",
  "min_notice_hours", "max_advance_days", "price_cents", "currency", "questions", "confirmation_message",
] as const;

const EVENT_COLUMNS = [
  "slug", "title", "summary", "description", "status", "start_at", "end_at", "timezone",
  "location_type", "location_name", "location_address", "online_url", "cover_image_url",
  "capacity", "registration_required", "registration_closes_at", "price_cents", "currency",
  "host_staff_id", "host_name", "is_public", "custom_fields",
] as const;

function pick<T extends string>(payload: Record<string, unknown>, columns: readonly T[]): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  for (const key of columns) {
    if (key in payload && payload[key] !== undefined) row[key] = payload[key];
  }
  return row;
}

// ── Booking types ───────────────────────────────────────────────────────────────

export async function loadBookingTypes(): Promise<BookingType[]> {
  const sb = createSupabaseAdminClient();
  const { data, error } = await sb.from("booking_types").select("*").order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as BookingType[];
}

export async function loadPublicBookingTypes(): Promise<BookingType[]> {
  const sb = createSupabaseAdminClient();
  const { data, error } = await sb
    .from("booking_types")
    .select("*")
    .eq("is_active", true)
    .eq("is_public", true)
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as BookingType[];
}

export async function loadBookingTypeBySlug(slug: string, opts: { publicOnly?: boolean } = {}): Promise<BookingType | null> {
  const sb = createSupabaseAdminClient();
  let q = sb.from("booking_types").select("*").eq("slug", slug);
  if (opts.publicOnly) q = q.eq("is_active", true).eq("is_public", true);
  const { data, error } = await q.maybeSingle();
  if (error) throw new Error(error.message);
  return (data ?? null) as unknown as BookingType | null;
}

export async function saveBookingType(payload: Record<string, unknown>): Promise<BookingType> {
  const sb = createSupabaseAdminClient();
  const id = payload.id as string | undefined;
  const row = pick(payload, TYPE_COLUMNS);
  if (!Array.isArray(row.questions)) row.questions = [];
  row.slug = await ensureUniqueSlug("booking_types", String(payload.slug || payload.name || "meeting"), id);
  row.updated_at = new Date().toISOString();

  if (id) {
    const { error } = await sb.from("booking_types").update(row).eq("id", id);
    if (error) throw new Error(error.message);
    const t = await loadBookingTypeBySlug(String(row.slug));
    if (!t) throw new Error("Booking type not found after save.");
    return t;
  }
  const { data, error } = await sb.from("booking_types").insert(row).select("*").single();
  if (error) throw new Error(error.message);
  // Seed a sensible weekday 9–5 availability for brand-new types.
  await seedDefaultAvailability(data.id as string);
  return data as unknown as BookingType;
}

export async function deleteBookingType(id: string): Promise<void> {
  const sb = createSupabaseAdminClient();
  const { error } = await sb.from("booking_types").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

// ── Availability ──────────────────────────────────────────────────────────────

async function seedDefaultAvailability(bookingTypeId: string): Promise<void> {
  const sb = createSupabaseAdminClient();
  const rows = [1, 2, 3, 4, 5].map((dow) => ({
    booking_type_id: bookingTypeId, day_of_week: dow, start_time: "09:00", end_time: "17:00", is_active: true,
  }));
  await sb.from("booking_availability").insert(rows);
}

export async function loadAvailability(bookingTypeId: string): Promise<AvailabilityRule[]> {
  const sb = createSupabaseAdminClient();
  const { data, error } = await sb
    .from("booking_availability")
    .select("*")
    .eq("booking_type_id", bookingTypeId)
    .order("day_of_week", { ascending: true })
    .order("start_time", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as AvailabilityRule[];
}

export async function replaceAvailability(bookingTypeId: string, rules: Partial<AvailabilityRule>[]): Promise<AvailabilityRule[]> {
  const sb = createSupabaseAdminClient();
  await sb.from("booking_availability").delete().eq("booking_type_id", bookingTypeId);
  const clean = rules
    .filter((r) => r.start_time && r.end_time && String(r.start_time) < String(r.end_time))
    .map((r) => ({
      booking_type_id: bookingTypeId,
      day_of_week: Math.max(0, Math.min(6, Number(r.day_of_week) || 0)),
      start_time: String(r.start_time),
      end_time: String(r.end_time),
      is_active: r.is_active !== false,
    }));
  if (clean.length) {
    const { error } = await sb.from("booking_availability").insert(clean);
    if (error) throw new Error(error.message);
  }
  return loadAvailability(bookingTypeId);
}

export async function loadDateOverrides(bookingTypeId: string): Promise<DateOverride[]> {
  const sb = createSupabaseAdminClient();
  const { data, error } = await sb
    .from("booking_date_overrides")
    .select("*")
    .eq("booking_type_id", bookingTypeId)
    .gte("override_date", new Date().toISOString().slice(0, 10))
    .order("override_date", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as DateOverride[];
}

// ── Bookings ──────────────────────────────────────────────────────────────────

export async function loadBookings(opts: { upcomingOnly?: boolean; limit?: number } = {}): Promise<Booking[]> {
  const sb = createSupabaseAdminClient();
  let q = sb
    .from("bookings")
    .select("*, booking_type:booking_types(name, slug, color)")
    .order("start_at", { ascending: true })
    .limit(opts.limit ?? 500);
  if (opts.upcomingOnly) q = q.gte("end_at", new Date().toISOString());
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as Booking[];
}

export async function loadBookingsForType(bookingTypeId: string, fromIso: string, toIso: string): Promise<Booking[]> {
  const sb = createSupabaseAdminClient();
  const { data, error } = await sb
    .from("bookings")
    .select("start_at, end_at, status")
    .eq("booking_type_id", bookingTypeId)
    .neq("status", "canceled")
    .gte("end_at", fromIso)
    .lte("start_at", toIso);
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as Booking[];
}

export async function createBooking(input: {
  booking_type_id: string;
  host_staff_id: string | null;
  invitee_name: string;
  invitee_email?: string | null;
  invitee_phone?: string | null;
  start_at: string;
  end_at: string;
  timezone: string;
  location_type: string;
  location_details?: string | null;
  answers?: Record<string, unknown>;
  source?: string;
  status?: string;
}): Promise<Booking> {
  const sb = createSupabaseAdminClient();

  // Double-booking guard: reject if any active booking overlaps this slot for the type.
  const { data: clashes } = await sb
    .from("bookings")
    .select("id")
    .eq("booking_type_id", input.booking_type_id)
    .neq("status", "canceled")
    .lt("start_at", input.end_at)
    .gt("end_at", input.start_at);
  if (clashes && clashes.length) throw new Error("That time was just taken. Please pick another slot.");

  const row = {
    booking_type_id: input.booking_type_id,
    reference: reference(),
    host_staff_id: input.host_staff_id ?? null,
    invitee_name: input.invitee_name,
    invitee_email: input.invitee_email ?? null,
    invitee_phone: input.invitee_phone ?? null,
    start_at: input.start_at,
    end_at: input.end_at,
    timezone: input.timezone,
    status: input.status ?? "confirmed",
    location_type: input.location_type,
    location_details: input.location_details ?? null,
    answers: input.answers ?? {},
    source: input.source ?? "public",
  };
  const { data, error } = await sb.from("bookings").insert(row).select("*").single();
  if (error) throw new Error(error.message);
  return data as unknown as Booking;
}

export async function updateBooking(id: string, patch: Record<string, unknown>): Promise<void> {
  const sb = createSupabaseAdminClient();
  const allowed: Record<string, unknown> = {};
  for (const k of ["status", "internal_notes", "cancel_reason", "start_at", "end_at", "location_details", "invitee_name", "invitee_email", "invitee_phone"]) {
    if (k in patch && patch[k] !== undefined) allowed[k] = patch[k];
  }
  allowed.updated_at = new Date().toISOString();
  const { error } = await sb.from("bookings").update(allowed).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteBooking(id: string): Promise<void> {
  const sb = createSupabaseAdminClient();
  const { error } = await sb.from("bookings").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

// ── Events ────────────────────────────────────────────────────────────────────

export async function loadEvents(): Promise<EventItem[]> {
  const sb = createSupabaseAdminClient();
  const { data, error } = await sb.from("events").select("*").order("start_at", { ascending: true });
  if (error) throw new Error(error.message);
  const events = (data ?? []) as unknown as EventItem[];
  return decorateEventCounts(events);
}

export async function loadPublicEvents(): Promise<EventItem[]> {
  const sb = createSupabaseAdminClient();
  const { data, error } = await sb
    .from("events")
    .select("*")
    .eq("status", "published")
    .eq("is_public", true)
    .gte("start_at", new Date(Date.now() - 86400000).toISOString())
    .order("start_at", { ascending: true });
  if (error) throw new Error(error.message);
  return decorateEventCounts((data ?? []) as unknown as EventItem[]);
}

export async function loadEventBySlug(slug: string, opts: { publicOnly?: boolean } = {}): Promise<EventItem | null> {
  const sb = createSupabaseAdminClient();
  let q = sb.from("events").select("*").eq("slug", slug);
  if (opts.publicOnly) q = q.eq("status", "published").eq("is_public", true);
  const { data, error } = await q.maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  const [decorated] = await decorateEventCounts([data as unknown as EventItem]);
  return decorated;
}

async function decorateEventCounts(events: EventItem[]): Promise<EventItem[]> {
  if (!events.length) return events;
  const sb = createSupabaseAdminClient();
  const ids = events.map((e) => e.id);
  const { data } = await sb
    .from("event_registrations")
    .select("event_id, status, party_size")
    .in("event_id", ids)
    .neq("status", "canceled");
  const reg = new Map<string, number>();
  const wait = new Map<string, number>();
  for (const r of data ?? []) {
    const size = Number(r.party_size) || 1;
    if (r.status === "waitlisted") wait.set(r.event_id, (wait.get(r.event_id) ?? 0) + size);
    else reg.set(r.event_id, (reg.get(r.event_id) ?? 0) + size);
  }
  return events.map((e) => ({ ...e, registered_count: reg.get(e.id) ?? 0, waitlist_count: wait.get(e.id) ?? 0 }));
}

export async function saveEvent(payload: Record<string, unknown>): Promise<EventItem> {
  const sb = createSupabaseAdminClient();
  const id = payload.id as string | undefined;
  const row = pick(payload, EVENT_COLUMNS);
  if (!Array.isArray(row.custom_fields)) row.custom_fields = [];
  row.slug = await ensureUniqueSlug("events", String(payload.slug || payload.title || "event"), id);
  if (payload.status === "published") row.published_at = (payload.published_at as string) || new Date().toISOString();
  row.updated_at = new Date().toISOString();

  if (id) {
    const { error } = await sb.from("events").update(row).eq("id", id);
    if (error) throw new Error(error.message);
    const e = await loadEventBySlug(String(row.slug));
    if (!e) throw new Error("Event not found after save.");
    return e;
  }
  const { data, error } = await sb.from("events").insert(row).select("*").single();
  if (error) throw new Error(error.message);
  return data as unknown as EventItem;
}

export async function deleteEvent(id: string): Promise<void> {
  const sb = createSupabaseAdminClient();
  const { error } = await sb.from("events").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

// ── Registrations ──────────────────────────────────────────────────────────────

export async function loadRegistrations(opts: { eventId?: string; limit?: number } = {}): Promise<EventRegistration[]> {
  const sb = createSupabaseAdminClient();
  let q = sb
    .from("event_registrations")
    .select("*, event:events(title, slug)")
    .order("created_at", { ascending: false })
    .limit(opts.limit ?? 500);
  if (opts.eventId) q = q.eq("event_id", opts.eventId);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as EventRegistration[];
}

export async function createRegistration(input: {
  event_id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  party_size?: number;
  answers?: Record<string, unknown>;
  source?: string;
}): Promise<{ registration: EventRegistration; waitlisted: boolean }> {
  const sb = createSupabaseAdminClient();
  const { data: event, error: evErr } = await sb.from("events").select("*").eq("id", input.event_id).maybeSingle();
  if (evErr) throw new Error(evErr.message);
  if (!event) throw new Error("Event not found.");
  if (event.status !== "published") throw new Error("Registration is not open for this event.");
  if (event.registration_closes_at && new Date(event.registration_closes_at) < new Date()) {
    throw new Error("Registration for this event has closed.");
  }

  const size = Math.max(1, Number(input.party_size) || 1);
  let waitlisted = false;
  if (event.capacity != null) {
    const [decorated] = await decorateEventCounts([event as unknown as EventItem]);
    const taken = decorated.registered_count ?? 0;
    if (taken + size > event.capacity) waitlisted = true;
  }

  const row = {
    event_id: input.event_id,
    name: input.name,
    email: input.email ?? null,
    phone: input.phone ?? null,
    party_size: size,
    status: waitlisted ? "waitlisted" : "registered",
    answers: input.answers ?? {},
    source: input.source ?? "public",
  };
  const { data, error } = await sb.from("event_registrations").insert(row).select("*").single();
  if (error) throw new Error(error.message);
  return { registration: data as unknown as EventRegistration, waitlisted };
}

export async function updateRegistration(id: string, patch: Record<string, unknown>): Promise<void> {
  const sb = createSupabaseAdminClient();
  const allowed: Record<string, unknown> = {};
  for (const k of ["status", "notes", "party_size", "name", "email", "phone"]) {
    if (k in patch && patch[k] !== undefined) allowed[k] = patch[k];
  }
  allowed.updated_at = new Date().toISOString();
  const { error } = await sb.from("event_registrations").update(allowed).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteRegistration(id: string): Promise<void> {
  const sb = createSupabaseAdminClient();
  const { error } = await sb.from("event_registrations").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

// ── Dashboard aggregate ──────────────────────────────────────────────────────

export async function loadBookingManagerData(): Promise<BookingManagerData> {
  const [bookingTypes, bookings, events, registrations] = await Promise.all([
    loadBookingTypes(),
    loadBookings({ limit: 500 }),
    loadEvents(),
    loadRegistrations({ limit: 500 }),
  ]);

  const nowIso = new Date().toISOString();
  const stats: BookingStats = {
    activeTypes: bookingTypes.filter((t) => t.is_active).length,
    upcomingBookings: bookings.filter((b) => b.end_at >= nowIso && b.status !== "canceled").length,
    pendingBookings: bookings.filter((b) => b.status === "pending").length,
    publishedEvents: events.filter((e) => e.status === "published").length,
    totalRegistrations: registrations.filter((r) => r.status !== "canceled").reduce((s, r) => s + (r.party_size || 1), 0),
  };

  return { bookingTypes, bookings, events, registrations, stats };
}

export type StaffOption = { id: string; display_name: string };
export async function loadStaffOptions(): Promise<StaffOption[]> {
  const sb = createSupabaseAdminClient();
  const { data } = await sb
    .from("profiles")
    .select("id, display_name:full_name")
    .in("status", ["active", "invited"])
    .order("full_name");
  return (data ?? []) as unknown as StaffOption[];
}

export type { IntakeQuestion };
