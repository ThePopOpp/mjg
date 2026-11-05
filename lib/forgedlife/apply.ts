import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { upsertParticipant } from "@/lib/pilot/repository";
import { isSwitchOn } from "@/lib/forgedlife/switches";

// Turns a ForgedLife event into rows in the forgedlife_* staging tables (and, for
// users, a participant contact). Nothing here grants access, creates an account or
// lists anything publicly — that happens only when a Super Admin approves on
// /dashboard/forgedlife (lib/forgedlife/admin.ts). Withdrawals and deletions are
// honoured immediately, including turning off texts.
//
// Parsing is lenient about the envelope — { id, type, occurred_at, data: {...} } with
// data either the record itself or { user | church | group } — and strict about values:
// anything malformed is dropped and reported as a warning on the event.

export const REQUEST_ITEMS = { steward: "Steward", created_for_more_checkin: "Created for More Check-In", energy_audit: "Energy Audit" } as const;
export type RequestItem = keyof typeof REQUEST_ITEMS;

type Json = Record<string, any>;
type Consent = { granted: boolean; at: string | null; version: string | null; text: string | null };

export type ForgedUser = {
  uid: string;
  email: string | null;
  emailVerified: boolean | null;
  emailIsRelay: boolean;
  name: string | null;
  phone: string | null;
  churchId: string | null;
  groupIds: string[];
  role: string | null;
  requested: RequestItem[];
  consent: Consent | null;
  smsConsent: Consent | null;
};

export type ForgedChurch = {
  id: string;
  name: string;
  city: string | null;
  state: string | null;
  timezone: string | null;
  logoUrl: string | null;
  admins: { uid: string | null; name: string | null; email: string | null; title: string | null }[];
  updatedAt: string | null;
};

export type ForgedGroup = {
  id: string;
  churchId: string | null;
  church: { id: string; name: string | null; city: string | null; state: string | null; timezone: string | null } | null;
  studyId: string | null;
  name: string;
  description: string | null;
  leader: { uid: string | null; name: string | null; email: string | null } | null;
  audience: string | null;
  meetingWeekday: number | null;
  meetingHour: number | null;
  timezone: string | null;
  startDate: string | null;
  lengthDays: number | null;
  memberCount: number | null;
  capacity: number | null;
  location: string | null;
  openToChurch: boolean | null;
  openToPublic: boolean;
  requiresApproval: boolean | null;
  status: string | null;
  updatedAt: string | null;
};

export type ParsedEvent = {
  eventId: string | null;
  type: string | null;
  occurredAt: string | null;
  user: ForgedUser | null;
  church: ForgedChurch | null;
  group: ForgedGroup | null;
  /** The id of the deleted record, for *.deleted events that carry only an id. */
  targetId: string | null;
  problems: string[];
};

const str = (v: unknown, max = 500) => (typeof v === "string" && v.trim() ? v.trim().slice(0, max) : null);
const bool = (v: unknown) => (typeof v === "boolean" ? v : null);
const int = (v: unknown, min: number, max: number) => {
  const n = typeof v === "number" ? v : typeof v === "string" && v.trim() ? Number(v) : NaN;
  return Number.isInteger(n) && n >= min && n <= max ? n : null;
};
const iso = (v: unknown) => {
  const s = str(v, 64);
  return s && Number.isFinite(Date.parse(s)) ? new Date(s).toISOString() : null;
};
const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const E164 = /^\+[1-9]\d{7,14}$/;

function parseConsent(v: unknown): Consent | null {
  if (!v || typeof v !== "object") return null;
  const c = v as Json;
  return {
    granted: c.granted === undefined ? true : c.granted === true,
    at: iso(c.at),
    version: c.version == null ? null : String(c.version).slice(0, 40),
    text: str(c.text, 4000),
  };
}

function parseUser(d: Json, problems: string[]): ForgedUser | null {
  const uid = str(d.uid ?? d.id, 128);
  if (!uid) {
    problems.push("user.uid missing");
    return null;
  }
  const emailRaw = str(d.email, 254)?.toLowerCase() ?? null;
  const email = emailRaw && EMAIL.test(emailRaw) ? emailRaw : null;
  if (emailRaw && !email) problems.push("user.email is not a valid address");
  const phoneRaw = str(d.phone, 20);
  const phone = phoneRaw && E164.test(phoneRaw) ? phoneRaw : null;
  if (phoneRaw && !phone) problems.push("user.phone is not E.164");
  const requestedRaw: unknown[] = Array.isArray(d.requested) ? d.requested : [];
  const requested = requestedRaw.filter((r): r is RequestItem => typeof r === "string" && r in REQUEST_ITEMS);
  const unknown = requestedRaw.filter((r) => !(typeof r === "string" && r in REQUEST_ITEMS));
  if (unknown.length) problems.push(`user.requested has unknown items: ${unknown.map(String).join(", ")}`);
  const smsConsent = parseConsent(d.sms_consent ?? d.smsConsent);
  if (phone && !smsConsent?.granted) problems.push("user.phone sent without sms_consent; ignored");
  return {
    uid,
    email,
    emailVerified: bool(d.email_verified),
    emailIsRelay: d.email_is_relay === true || Boolean(email?.endsWith("@privaterelay.appleid.com")),
    name: str(d.name ?? d.display_name ?? d.displayName, 120),
    phone: smsConsent?.granted ? phone : null,
    churchId: str(d.church_id, 128),
    groupIds: Array.isArray(d.group_ids) ? d.group_ids.map((g: unknown) => str(g, 128)).filter(Boolean) as string[] : [],
    role: str(d.role, 40),
    requested: [...new Set(requested)],
    consent: parseConsent(d.consent),
    smsConsent,
  };
}

function parseChurch(d: Json, problems: string[]): ForgedChurch | null {
  const id = str(d.id, 128);
  const name = str(d.name, 160);
  if (!id || !name) {
    problems.push("church.id and church.name are required");
    return null;
  }
  const admins = Array.isArray(d.admins)
    ? d.admins
        .filter((a: unknown) => a && typeof a === "object")
        .map((a: Json) => ({ uid: str(a.uid, 128), name: str(a.name, 120), email: str(a.email, 254)?.toLowerCase() ?? null, title: str(a.title, 120) }))
    : [];
  return {
    id,
    name,
    city: str(d.city, 120),
    state: str(d.state, 2)?.toUpperCase() ?? null,
    timezone: str(d.timezone, 64),
    logoUrl: (() => {
      const u = str(d.logo_url ?? d.logo, 2000);
      return u && /^https:\/\//.test(u) ? u : null; // data: URLs aren't kept
    })(),
    admins,
    updatedAt: iso(d.updated_at),
  };
}

function parseGroup(d: Json, problems: string[]): ForgedGroup | null {
  const id = str(d.id, 128);
  const name = str(d.name, 120);
  if (!id || !name) {
    problems.push("group.id and group.name are required");
    return null;
  }
  const c = d.church && typeof d.church === "object" ? (d.church as Json) : null;
  const leader = d.leader && typeof d.leader === "object" ? (d.leader as Json) : null;
  const churchId = str(d.church_id, 128) ?? str(c?.id, 128);
  if (!c) problems.push("group.church {id, name, city, state, timezone} missing");
  if (d.open_to_public === undefined) problems.push("group.open_to_public missing; treated as false");
  const start = iso(d.start_date);
  return {
    id,
    churchId,
    church: c && churchId ? { id: churchId, name: str(c.name, 160), city: str(c.city, 120), state: str(c.state, 2)?.toUpperCase() ?? null, timezone: str(c.timezone, 64) } : null,
    studyId: str(d.study_id ?? d.source_program_id, 128),
    name,
    description: str(d.description, 4000),
    leader: leader ? { uid: str(leader.uid, 128), name: str(leader.name, 120), email: str(leader.email, 254)?.toLowerCase() ?? null } : null,
    audience: str(d.audience, 20),
    meetingWeekday: int(d.meeting_weekday, 1, 7),
    meetingHour: int(d.meeting_hour, 0, 23),
    timezone: str(d.timezone, 64) ?? str(c?.timezone, 64),
    startDate: start ? start.slice(0, 10) : null,
    lengthDays: int(d.length_days, 1, 1000),
    memberCount: int(d.member_count, 0, 100000),
    capacity: int(d.capacity, 0, 100000),
    location: str(d.location, 200),
    // Their first mapping called openToChurch "public"; only an explicit open_to_public lists a group publicly.
    openToChurch: bool(d.open_to_church) ?? bool(d.public),
    openToPublic: d.open_to_public === true,
    requiresApproval: bool(d.requires_approval),
    status: str(d.status, 40),
    updatedAt: iso(d.updated_at),
  };
}

export function parseForgedEvent(payload: unknown, headerEventId: string | null): ParsedEvent {
  const body = (payload && typeof payload === "object" ? payload : {}) as Json;
  const problems: string[] = [];
  const type = str(body.type ?? body.event_type ?? body.event, 64);
  const eventId = str(headerEventId, 200) ?? str(body.id ?? body.event_id, 200);
  const data = (body.data && typeof body.data === "object" ? body.data : body) as Json;
  const kind = type?.split(".")[0] ?? "";
  const record = (data[kind] && typeof data[kind] === "object" ? data[kind] : data) as Json;

  const out: ParsedEvent = { eventId, type, occurredAt: iso(body.occurred_at ?? body.at), user: null, church: null, group: null, targetId: null, problems };
  if (!type) problems.push("event type missing");
  if (kind === "user") out.user = type === "user.deleted" || type === "user.consent_withdrawn" ? parseUserId(record, problems) : parseUser(record, problems);
  else if (kind === "church") type === "church.deleted" ? (out.targetId = str(record.id, 128)) : (out.church = parseChurch(record, problems));
  else if (kind === "group") type === "group.deleted" ? (out.targetId = str(record.id, 128)) : (out.group = parseGroup(record, problems));
  else if (type) problems.push(`unknown event type ${type}`);
  if ((type === "church.deleted" || type === "group.deleted") && !out.targetId) problems.push(`${type} without an id`);
  return out;
}

/** Withdrawal and deletion events may carry only the uid. */
function parseUserId(d: Json, problems: string[]): ForgedUser | null {
  const uid = str(d.uid ?? d.id, 128);
  if (!uid) {
    problems.push("user.uid missing");
    return null;
  }
  return { uid, email: null, emailVerified: null, emailIsRelay: false, name: null, phone: null, churchId: null, groupIds: [], role: null, requested: [], consent: null, smsConsent: null };
}

// ---- Applying ------------------------------------------------------------------

export async function applyForgedEvent(e: ParsedEvent): Promise<{ applied: boolean; note?: string }> {
  switch (e.type) {
    case "user.access_requested":
    case "user.updated":
    case "user.sms_consent_changed":
      return e.user ? upsertRequest(e.user, e.occurredAt) : { applied: false, note: "no user" };
    case "user.consent_withdrawn":
      return e.user ? endRequest(e.user.uid, "withdrawn") : { applied: false, note: "no user" };
    case "user.deleted":
      return e.user ? endRequest(e.user.uid, "deleted") : { applied: false, note: "no user" };
    case "church.upserted":
      return e.church ? upsertChurch(e.church) : { applied: false, note: "no church" };
    case "church.deleted":
      return e.targetId ? deleteChurch(e.targetId) : { applied: false, note: "no church id" };
    case "group.upserted":
      return e.group ? upsertGroup(e.group) : { applied: false, note: "no group" };
    case "group.deleted":
      return e.targetId ? deleteGroup(e.targetId) : { applied: false, note: "no group id" };
    default:
      return { applied: false, note: `ignored event type ${e.type ?? "(none)"}` };
  }
}

const now = () => new Date().toISOString();

async function upsertRequest(u: ForgedUser, occurredAt: string | null) {
  const db = createSupabaseAdminClient();
  if (u.consent && !u.consent.granted) return endRequest(u.uid, "withdrawn");

  const { data: existing } = await db.from("forgedlife_access_requests").select("*").eq("forged_uid", u.uid).maybeSingle();
  // Events can arrive out of order; an older one never overwrites a newer one.
  if (existing?.last_event_at && occurredAt && Date.parse(occurredAt) < Date.parse(existing.last_event_at)) {
    return { applied: false, note: "older than the stored state" };
  }

  const participantId = u.email ? await ensureParticipant(u) : null;
  const { data: profile } = u.email
    ? await db.from("profiles").select("id").ilike("email", u.email).maybeSingle()
    : { data: null };

  const reopened = !existing || existing.status === "withdrawn" || existing.status === "deleted";
  const row = {
    forged_uid: u.uid,
    email: u.email,
    email_is_relay: u.emailIsRelay,
    email_verified: u.emailVerified,
    name: u.name,
    phone: u.phone,
    requested: u.requested,
    role_in_forged: u.role,
    forged_church_id: u.churchId,
    consent: u.consent,
    sms_consent: u.smsConsent,
    status: reopened ? "pending" : existing.status,
    participant_id: participantId ?? existing?.participant_id ?? null,
    profile_id: profile?.id ?? existing?.profile_id ?? null,
    last_event_at: occurredAt ?? now(),
    updated_at: now(),
  };
  const { error } = await db.from("forgedlife_access_requests").upsert(row, { onConflict: "forged_uid" });
  if (error) throw error;

  await syncSms(row.participant_id, existing, u);
  return { applied: true };
}

/** Links to an existing contact by email, or creates one tagged with source "forgedlife". */
async function ensureParticipant(u: ForgedUser): Promise<string | null> {
  const db = createSupabaseAdminClient();
  const { data: found } = await db.from("participants").select("id").ilike("email", u.email!).maybeSingle();
  if (found) return found.id as string;
  const [firstName, ...rest] = (u.name ?? u.email!.split("@")[0]).split(/\s+/);
  const created = await upsertParticipant({
    firstName: firstName || "Friend",
    lastName: rest.join(" "),
    email: u.email!,
    waveSource: "forgedlife",
    consent: { futureUpdatesOptIn: true },
  });
  return created.id;
}

/**
 * Texts: a withdrawal is always applied. A new opt-in only counts once the
 * forgedlife.sms_opt_in switch is on (the Twilio campaign must list ForgedLife first).
 */
async function syncSms(participantId: string | null, before: Json | null, u: ForgedUser) {
  if (!participantId) return;
  const db = createSupabaseAdminClient();
  const had = Boolean(before?.sms_consent?.granted);
  const has = Boolean(u.smsConsent?.granted && u.phone);

  if (had && !has) return optOutSms(participantId);
  if (!has || !(await isSwitchOn("forgedlife.sms_opt_in"))) return;

  const { data: p } = await db.from("participants").select("phone,sms_opt_in").eq("id", participantId).maybeSingle();
  if (!p || (p.phone && p.phone !== u.phone) || p.sms_opt_in === true) return; // never overwrite a different number
  await db
    .from("participants")
    .update({ phone: u.phone, sms_opt_in: true, sms_opt_in_at: u.smsConsent?.at ?? now(), sms_opt_in_source: "forgedlife", sms_opt_out_at: null, updated_at: now() })
    .eq("id", participantId);
  await db.from("consent_events").insert({ entity_type: "participant", entity_id: participantId, channel: "sms", event_type: "opt_in", source: "forgedlife" });
}

async function optOutSms(participantId: string) {
  const db = createSupabaseAdminClient();
  const { data: p } = await db.from("participants").select("sms_opt_in,sms_opt_in_source").eq("id", participantId).maybeSingle();
  // Only an opt-in that came from ForgedLife is ForgedLife's to withdraw.
  if (!p || p.sms_opt_in !== true || p.sms_opt_in_source !== "forgedlife") return;
  await db.from("participants").update({ sms_opt_in: false, sms_opt_out_at: now(), updated_at: now() }).eq("id", participantId);
  await db.from("consent_events").insert({ entity_type: "participant", entity_id: participantId, channel: "sms", event_type: "opt_out", source: "forgedlife" });
}

async function endRequest(uid: string, status: "withdrawn" | "deleted") {
  const db = createSupabaseAdminClient();
  const { data: existing } = await db.from("forgedlife_access_requests").select("*").eq("forged_uid", uid).maybeSingle();
  if (!existing) return { applied: false, note: "no request on file for this uid" };

  if (existing.participant_id) {
    await optOutSms(existing.participant_id);
    // A contact that exists only because of ForgedLife goes to the trash; one MJG already had stays.
    await db
      .from("participants")
      .update({ deleted_at: now(), updated_at: now() })
      .eq("id", existing.participant_id)
      .eq("source", "forgedlife")
      .is("deleted_at", null);
  }

  const scrub = status === "deleted" ? { email: null, name: null } : {};
  const { error } = await db
    .from("forgedlife_access_requests")
    .update({ status, phone: null, sms_consent: null, ...scrub, last_event_at: now(), updated_at: now() })
    .eq("id", existing.id);
  if (error) throw error;
  return { applied: true };
}

async function upsertChurch(c: ForgedChurch) {
  const db = createSupabaseAdminClient();
  const { data: existing } = await db.from("forgedlife_churches").select("status,church_id,source_updated_at").eq("forged_id", c.id).maybeSingle();
  if (existing?.source_updated_at && c.updatedAt && Date.parse(c.updatedAt) < Date.parse(existing.source_updated_at)) {
    return { applied: false, note: "older than the stored state" };
  }
  const status = existing?.status === "deleted" ? (existing.church_id ? "linked" : "pending") : existing?.status ?? "pending";
  const { error } = await db.from("forgedlife_churches").upsert(
    { forged_id: c.id, name: c.name, city: c.city, state: c.state, timezone: c.timezone, logo_url: c.logoUrl, admins: c.admins, status, source_updated_at: c.updatedAt, updated_at: now() },
    { onConflict: "forged_id" },
  );
  if (error) throw error;
  return { applied: true };
}

async function deleteChurch(forgedId: string) {
  const db = createSupabaseAdminClient();
  // The MJG church (if linked) is MJG's record and stays; only the ForgedLife copy ends.
  const { error, count } = await db.from("forgedlife_churches").update({ status: "deleted", admins: [], updated_at: now() }, { count: "exact" }).eq("forged_id", forgedId);
  if (error) throw error;
  return count ? { applied: true } : { applied: false, note: "unknown church" };
}

async function upsertGroup(g: ForgedGroup) {
  const db = createSupabaseAdminClient();
  const { data: existing } = await db.from("forgedlife_groups").select("status,group_id,source_updated_at").eq("forged_id", g.id).maybeSingle();
  if (existing?.source_updated_at && g.updatedAt && Date.parse(g.updatedAt) < Date.parse(existing.source_updated_at)) {
    return { applied: false, note: "older than the stored state" };
  }
  // The church travels with every group; record it so it can be linked even if no admin consented.
  if (g.church?.name) {
    const { data: known } = await db.from("forgedlife_churches").select("id").eq("forged_id", g.church.id).maybeSingle();
    if (!known) {
      await db.from("forgedlife_churches").insert({ forged_id: g.church.id, name: g.church.name, city: g.church.city, state: g.church.state, timezone: g.church.timezone });
    }
  }
  const status = existing?.status === "deleted" ? (existing.group_id ? "imported" : "pending") : existing?.status ?? "pending";
  const { error } = await db.from("forgedlife_groups").upsert(
    {
      forged_id: g.id,
      forged_church_id: g.churchId,
      church: g.church,
      study_id: g.studyId,
      name: g.name,
      description: g.description,
      leader: g.leader,
      audience: g.audience,
      meeting_weekday: g.meetingWeekday,
      meeting_hour: g.meetingHour,
      timezone: g.timezone,
      start_date: g.startDate,
      length_days: g.lengthDays,
      member_count: g.memberCount,
      capacity: g.capacity,
      location: g.location,
      open_to_church: g.openToChurch,
      open_to_public: g.openToPublic,
      requires_approval: g.requiresApproval,
      source_status: g.status,
      status,
      source_updated_at: g.updatedAt,
      updated_at: now(),
    },
    { onConflict: "forged_id" },
  );
  if (error) throw error;

  // An imported group that ForgedLife no longer offers publicly comes off the public finder.
  if (existing?.group_id && (!g.openToPublic || g.status === "ended" || g.status === "closed")) {
    await db.from("facilitator_groups").update({ status: "closed", updated_at: now() }).eq("id", existing.group_id).eq("status", "published");
  }
  return { applied: true };
}

async function deleteGroup(forgedId: string) {
  const db = createSupabaseAdminClient();
  const { data: existing } = await db.from("forgedlife_groups").select("id,group_id").eq("forged_id", forgedId).maybeSingle();
  if (!existing) return { applied: false, note: "unknown group" };
  await db.from("forgedlife_groups").update({ status: "deleted", leader: null, updated_at: now() }).eq("id", existing.id);
  if (existing.group_id) {
    await db.from("facilitator_groups").update({ status: "closed", updated_at: now() }).eq("id", existing.group_id).eq("status", "published");
  }
  return { applied: true };
}
