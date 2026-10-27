import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { ROLES } from "@/lib/rbac/roles";
import { geocode } from "@/lib/maps/geocode";
import { fuzzPoint } from "@/lib/maps/geo";
import type {
  FacilitatorProfileInput,
  FinderMode,
  GroupInput,
  GroupStatus,
  OwnerGroup,
  Reservation,
} from "./shared";

// Facilitator groups — server-side reads/writes for the dashboard (owner + admin). Public
// reads live in ./public.ts; spot-taking in ./reservations.ts. Service-role client, so every
// caller passes an already-authenticated actor and we check ownership here.

type Admin = ReturnType<typeof createSupabaseAdminClient>;
export type Actor = { id: string; role: string };

export const isGroupAdmin = (role: string) => role === ROLES.SUPER_ADMIN || role === ROLES.ADMIN;

export function slugify(s: string) {
  return s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "group";
}

async function uniqueSlug(supabase: Admin, table: "facilitator_groups" | "facilitator_profiles", base: string, excludeKey?: { col: string; val: string }) {
  const root = slugify(base);
  for (let i = 0; i < 50; i++) {
    const candidate = i === 0 ? root : `${root}-${i + 1}`;
    let q = supabase.from(table).select("slug").eq("slug", candidate);
    if (excludeKey) q = q.neq(excludeKey.col, excludeKey.val);
    const { data } = await q.maybeSingle();
    if (!data) return candidate;
  }
  return `${root}-${Date.now().toString(36)}`;
}

function rowToGroup(r: any, counts?: { taken: number; pending: number; waitlist: number }): OwnerGroup {
  return {
    id: r.id,
    slug: r.slug,
    facilitatorId: r.facilitator_id,
    teamId: r.team_id ?? null,
    experienceId: r.experience_id ?? null,
    title: r.title,
    description: r.description ?? null,
    audience: r.audience,
    language: r.language ?? "English",
    photoUrl: r.photo_url ?? null,
    churchOrg: r.church_org ?? null,
    meetingDay: r.meeting_day ?? null,
    meetingTime: r.meeting_time ? String(r.meeting_time).slice(0, 5) : null,
    timezone: r.timezone,
    frequency: r.frequency,
    startDate: r.start_date ?? null,
    durationWeeks: r.duration_weeks,
    format: r.format,
    venueName: r.venue_name ?? null,
    addressLine: r.address_line ?? null,
    city: r.city ?? null,
    state: r.state ?? null,
    postalCode: r.postal_code ?? null,
    lat: r.lat ?? null,
    lng: r.lng ?? null,
    publicLat: r.public_lat ?? null,
    publicLng: r.public_lng ?? null,
    showExactAddress: Boolean(r.show_exact_address),
    capacity: r.capacity,
    bookingMode: r.booking_mode,
    status: r.status,
    spotsTaken: counts?.taken ?? 0,
    pendingCount: counts?.pending ?? 0,
    waitlistCount: counts?.waitlist ?? 0,
    createdAt: r.created_at,
  };
}

export function rowToReservation(r: any): Reservation {
  return {
    id: r.id,
    groupId: r.group_id,
    profileId: r.profile_id ?? null,
    name: r.name ?? null,
    email: r.email ?? null,
    partySize: r.party_size,
    message: r.message ?? null,
    source: r.source,
    status: r.status,
    createdAt: r.created_at,
    decidedAt: r.decided_at ?? null,
  };
}

/** Confirmed spots / pending / waitlisted per group. */
export async function reservationCounts(groupIds: string[]) {
  const counts = new Map<string, { taken: number; pending: number; waitlist: number }>();
  groupIds.forEach((id) => counts.set(id, { taken: 0, pending: 0, waitlist: 0 }));
  if (!groupIds.length) return counts;
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("facilitator_group_reservations")
    .select("group_id,status,party_size")
    .in("group_id", groupIds)
    .in("status", ["confirmed", "pending", "waitlisted"]);
  for (const r of data ?? []) {
    const c = counts.get(r.group_id);
    if (!c) continue;
    if (r.status === "confirmed") c.taken += r.party_size;
    else if (r.status === "pending") c.pending += 1;
    else c.waitlist += 1;
  }
  return counts;
}

export async function listGroupsForFacilitator(profileId: string): Promise<OwnerGroup[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("facilitator_groups")
    .select("*")
    .eq("facilitator_id", profileId)
    .neq("status", "archived")
    .order("created_at", { ascending: true });
  if (error) throw error;
  const counts = await reservationCounts((data ?? []).map((g) => g.id));
  return (data ?? []).map((g) => rowToGroup(g, counts.get(g.id)));
}

export async function getGroup(id: string): Promise<OwnerGroup | null> {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase.from("facilitator_groups").select("*").eq("id", id).maybeSingle();
  if (!data) return null;
  const counts = await reservationCounts([data.id]);
  return rowToGroup(data, counts.get(data.id));
}

/** Load a group the actor may manage (its facilitator, or an admin) — throws otherwise. */
export async function getManagedGroup(actor: Actor, groupId: string): Promise<OwnerGroup> {
  const group = await getGroup(groupId);
  if (!group) throw new Error("Group not found.");
  if (group.facilitatorId !== actor.id && !isGroupAdmin(actor.role)) throw new Error("You don't have permission to manage this group.");
  return group;
}

function clampInt(v: unknown, min: number, max: number, fallback: number) {
  const n = Math.round(Number(v));
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
}
const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : null);

/** Map the editable input to DB columns (only keys that were sent). */
function inputToRow(input: Partial<GroupInput>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  const has = (k: keyof GroupInput) => Object.prototype.hasOwnProperty.call(input, k);
  if (has("title")) row.title = String(input.title ?? "").trim().slice(0, 120);
  if (has("description")) row.description = str(input.description)?.slice(0, 4000) ?? null;
  if (has("audience")) row.audience = input.audience;
  if (has("language")) row.language = str(input.language) ?? "English";
  if (has("photoUrl")) row.photo_url = str(input.photoUrl);
  if (has("churchOrg")) row.church_org = str(input.churchOrg);
  if (has("meetingDay")) row.meeting_day = input.meetingDay == null || (input.meetingDay as unknown) === "" ? null : clampInt(input.meetingDay, 0, 6, 0);
  if (has("meetingTime")) row.meeting_time = /^\d{1,2}:\d{2}$/.test(String(input.meetingTime ?? "")) ? input.meetingTime : null;
  if (has("timezone")) row.timezone = str(input.timezone) ?? "America/Phoenix";
  if (has("frequency")) row.frequency = input.frequency === "biweekly" ? "biweekly" : "weekly";
  if (has("startDate")) row.start_date = /^\d{4}-\d{2}-\d{2}$/.test(String(input.startDate ?? "")) ? input.startDate : null;
  if (has("durationWeeks")) row.duration_weeks = clampInt(input.durationWeeks, 1, 52, 6);
  if (has("format")) row.format = input.format;
  if (has("venueName")) row.venue_name = str(input.venueName);
  if (has("addressLine")) row.address_line = str(input.addressLine);
  if (has("city")) row.city = str(input.city);
  if (has("state")) row.state = str(input.state)?.toUpperCase().slice(0, 2) ?? null;
  if (has("postalCode")) row.postal_code = str(input.postalCode);
  if (has("showExactAddress")) row.show_exact_address = Boolean(input.showExactAddress);
  if (has("capacity")) row.capacity = clampInt(input.capacity, 1, 200, 10);
  if (has("bookingMode")) row.booking_mode = input.bookingMode === "auto" ? "auto" : "approval";
  if (has("experienceId")) row.experience_id = str(input.experienceId);
  return row;
}

const ADDRESS_KEYS = ["address_line", "city", "state", "postal_code"] as const;

/** Geocode the (private) address and derive the public point. Online-only groups get no pin. */
async function withLocation(row: Record<string, unknown>, merged: Record<string, any>, groupId: string) {
  if (merged.format === "online") {
    Object.assign(row, { lat: null, lng: null, public_lat: null, public_lng: null });
    return;
  }
  const hit = await geocode([merged.address_line, merged.city, merged.state, merged.postal_code]);
  // An address that won't resolve still gets a city-level pin when possible.
  const point = hit ?? (merged.address_line ? await geocode([merged.city, merged.state, merged.postal_code]) : null);
  if (!point) {
    Object.assign(row, { lat: null, lng: null, public_lat: null, public_lng: null });
    return;
  }
  const pub = fuzzPoint(point.lat, point.lng, groupId);
  Object.assign(row, { lat: point.lat, lng: point.lng, public_lat: pub.lat, public_lng: pub.lng });
}

export async function createGroup(facilitatorId: string, input: GroupInput, actorId: string): Promise<OwnerGroup> {
  const supabase = createSupabaseAdminClient();
  const title = String(input.title ?? "").trim();
  if (!title) throw new Error("Give your group a name.");

  // Every group has its own team, so confirmed members land on the facilitator's team.
  const { data: team, error: teamErr } = await supabase
    .from("facilitator_teams")
    .insert({ name: title, facilitator_id: facilitatorId, created_by: actorId, description: "Find a Group listing" })
    .select("id")
    .single();
  if (teamErr) throw teamErr;

  const id = crypto.randomUUID();
  const row: Record<string, unknown> = {
    id,
    facilitator_id: facilitatorId,
    team_id: team.id,
    slug: await uniqueSlug(supabase, "facilitator_groups", title),
    created_by: actorId,
    ...inputToRow(input),
  };
  await withLocation(row, { format: "in_person", ...row }, id);
  const { data, error } = await supabase.from("facilitator_groups").insert(row).select("*").single();
  if (error) throw error;
  return rowToGroup(data);
}

export async function updateGroup(actor: Actor, groupId: string, input: Partial<GroupInput>): Promise<OwnerGroup> {
  const current = await getManagedGroup(actor, groupId);
  const supabase = createSupabaseAdminClient();
  const row = inputToRow(input);
  if ("title" in row && !row.title) throw new Error("Give your group a name.");
  if (row.capacity != null && Number(row.capacity) < current.spotsTaken) {
    throw new Error(`${current.spotsTaken} spots are already confirmed — capacity can't go below that.`);
  }

  const before: Record<string, unknown> = {
    format: current.format, address_line: current.addressLine, city: current.city, state: current.state, postal_code: current.postalCode,
  };
  const merged = { ...before, ...row };
  const moved = row.format !== undefined && row.format !== current.format
    || ADDRESS_KEYS.some((k) => k in row && (row[k] ?? null) !== (before[k] ?? null))
    || (current.lat == null && merged.format !== "online");
  if (moved) await withLocation(row, merged, groupId);

  row.updated_at = new Date().toISOString();
  const { error } = await supabase.from("facilitator_groups").update(row).eq("id", groupId);
  if (error) throw error;
  if (typeof row.title === "string" && current.teamId) {
    await supabase.from("facilitator_teams").update({ name: row.title, updated_at: row.updated_at }).eq("id", current.teamId);
  }
  return (await getGroup(groupId))!;
}

/** What's still missing before a group can be published (empty = ready). */
export function publishProblems(g: OwnerGroup): string[] {
  const out: string[] = [];
  if (!g.title.trim()) out.push("a name");
  if (g.meetingDay == null) out.push("a meeting day");
  if (!g.meetingTime) out.push("a meeting time");
  if (g.format !== "online" && !g.city) out.push("a city");
  if (g.format !== "online" && g.lat == null) out.push("a location we can find on the map (check the address or city)");
  return out;
}

export async function setGroupStatus(actor: Actor, groupId: string, status: GroupStatus): Promise<OwnerGroup> {
  const group = await getManagedGroup(actor, groupId);
  if (status === "published") {
    const problems = publishProblems(group);
    if (problems.length) throw new Error(`Before publishing, add ${problems.join(", ")}.`);
  }
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("facilitator_groups").update({ status, updated_at: new Date().toISOString() }).eq("id", groupId);
  if (error) throw error;
  return (await getGroup(groupId))!;
}

export async function listReservations(actor: Actor, groupId: string): Promise<Reservation[]> {
  await getManagedGroup(actor, groupId);
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("facilitator_group_reservations")
    .select("*")
    .eq("group_id", groupId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(rowToReservation);
}

/** Every group (admin overview), with facilitator names. */
export async function listAllGroups() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("facilitator_groups")
    .select("*, profiles:facilitator_id(first_name,last_name,email)")
    .neq("status", "archived")
    .order("created_at", { ascending: false });
  if (error) throw error;
  const counts = await reservationCounts((data ?? []).map((g) => g.id));
  return (data ?? []).map((g: any) => ({
    ...rowToGroup(g, counts.get(g.id)),
    facilitatorName: [g.profiles?.first_name, g.profiles?.last_name].filter(Boolean).join(" ") || g.profiles?.email || "—",
    facilitatorEmail: g.profiles?.email ?? null,
  }));
}

// ── Facilitator public profile ───────────────────────────────────────────────────

export async function getFacilitatorProfile(profileId: string) {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase.from("facilitator_profiles").select("*").eq("profile_id", profileId).maybeSingle();
  return data
    ? {
        slug: data.slug as string,
        displayName: data.display_name as string,
        bio: data.bio as string | null,
        photoUrl: data.photo_url as string | null,
        churchOrg: data.church_org as string | null,
        city: data.city as string | null,
        state: data.state as string | null,
        isPublic: Boolean(data.is_public),
      }
    : null;
}

export async function saveFacilitatorProfile(profileId: string, input: FacilitatorProfileInput) {
  const supabase = createSupabaseAdminClient();
  const displayName = String(input.displayName ?? "").trim().slice(0, 80);
  if (!displayName) throw new Error("A display name is required.");
  const existing = await getFacilitatorProfile(profileId);
  const row = {
    profile_id: profileId,
    slug: existing?.slug ?? (await uniqueSlug(supabase, "facilitator_profiles", displayName)),
    display_name: displayName,
    bio: str(input.bio)?.slice(0, 2000) ?? null,
    photo_url: str(input.photoUrl),
    church_org: str(input.churchOrg),
    city: str(input.city),
    state: str(input.state)?.toUpperCase().slice(0, 2) ?? null,
    is_public: input.isPublic ?? existing?.isPublic ?? true,
    updated_at: new Date().toISOString(),
  };
  const { error } = await supabase.from("facilitator_profiles").upsert(row, { onConflict: "profile_id" });
  if (error) throw error;
  return getFacilitatorProfile(profileId);
}

// ── Launch gate ──────────────────────────────────────────────────────────────────

/**
 * "2027-01-05" → "January 5". The year is added only when the month and day
 * alone would be ambiguous: a past year, or more than eleven months ahead.
 */
export function formatOpensOn(opensOn: string): string {
  const [y, m, d] = opensOn.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  const now = new Date();
  const ahead = (date.getTime() - now.getTime()) / 86_400_000;
  const withYear = y < now.getUTCFullYear() || ahead > 335;
  return date.toLocaleDateString("en-US", { month: "long", day: "numeric", ...(withYear ? { year: "numeric" } : {}), timeZone: "UTC" });
}

export async function getFinderSettings(): Promise<{ mode: FinderMode; opensOn: string | null; opensLabel: string | null }> {
  try {
    const supabase = createSupabaseAdminClient();
    const { data } = await supabase.from("group_finder_settings").select("mode,opens_on,opens_label").eq("id", 1).maybeSingle();
    const opensOn = (data?.opens_on as string | null) ?? null;
    return {
      mode: (data?.mode as FinderMode) ?? "hidden",
      opensOn,
      // The label is what visitors read; it comes from the date. The old free-text
      // label is only a fallback for a row saved before the date existed.
      opensLabel: opensOn ? formatOpensOn(opensOn) : (data?.opens_label as string | null) ?? null,
    };
  } catch {
    return { mode: "hidden", opensOn: null, opensLabel: null };
  }
}

export async function setFinderSettings(actorId: string, mode: FinderMode, opensOn: string | null) {
  if (!["hidden", "preview", "open"].includes(mode)) throw new Error("Invalid mode.");
  const date = str(opensOn);
  if (date && (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(`${date}T00:00:00Z`)))) {
    throw new Error("Pick the date requests open.");
  }
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("group_finder_settings")
    .upsert({ id: 1, mode, opens_on: date, opens_label: null, updated_by: actorId, updated_at: new Date().toISOString() });
  if (error) throw error;
  return getFinderSettings();
}
