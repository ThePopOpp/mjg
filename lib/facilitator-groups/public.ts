import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { geocode, type GeoPoint } from "@/lib/maps/geocode";
import { distanceMiles } from "@/lib/maps/geo";
import { reservationCounts } from "./repository";
import { timeOfDay, type PublicFacilitator, type PublicGroup } from "./shared";

// Public (Find a Group) reads. Published groups only, and the private address/coordinates
// never leave this file unless the facilitator chose to show the exact address.

export type GroupFilters = {
  day?: number | null;
  tod?: "morning" | "afternoon" | "evening" | null;
  format?: "in_person" | "online" | "hybrid" | null;
  audience?: string | null;
  open?: boolean;
  near?: string | null; // city / ZIP / address the visitor typed
  radius?: number; // miles
};

// Geocoding a search costs a request to the provider; cache by query for the process lifetime.
const searchCache = new Map<string, GeoPoint | null>();
async function geocodeSearch(q: string) {
  const key = q.trim().toLowerCase();
  if (searchCache.has(key)) return searchCache.get(key) ?? null;
  const hit = await geocode([key]);
  if (searchCache.size > 500) searchCache.clear();
  searchCache.set(key, hit);
  return hit;
}

function personName(p: any) {
  return [p?.first_name, p?.last_name].filter(Boolean).join(" ") || "MJG Facilitator";
}

async function facilitatorsById(ids: string[]): Promise<Map<string, PublicFacilitator>> {
  const out = new Map<string, PublicFacilitator>();
  if (!ids.length) return out;
  const supabase = createSupabaseAdminClient();
  const [{ data: profs }, { data: fps }] = await Promise.all([
    supabase.from("profiles").select("id,first_name,last_name,avatar_url").in("id", ids),
    supabase.from("facilitator_profiles").select("*").in("profile_id", ids),
  ]);
  const fpBy = new Map((fps ?? []).map((f: any) => [f.profile_id, f]));
  for (const p of profs ?? []) {
    const fp: any = fpBy.get(p.id);
    const visible = fp ? fp.is_public : true;
    out.set(p.id, {
      profileId: p.id,
      slug: visible ? fp?.slug ?? null : null,
      name: fp?.display_name || personName(p),
      photoUrl: (visible ? fp?.photo_url : null) || p.avatar_url || null,
      churchOrg: visible ? fp?.church_org ?? null : null,
      city: visible ? fp?.city ?? null : null,
      state: visible ? fp?.state ?? null : null,
      bio: visible ? fp?.bio ?? null : null,
    });
  }
  return out;
}

function toPublic(r: any, taken: number, facilitator: PublicFacilitator): PublicGroup {
  const exact = Boolean(r.show_exact_address) && r.format !== "online";
  const area = [r.city, r.state].filter(Boolean).join(", ");
  return {
    id: r.id,
    slug: r.slug,
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
    areaLabel: r.format === "online" ? "Online" : exact && r.venue_name ? `${r.venue_name} · ${area}` : area || "Location shared after you join",
    venueName: exact ? r.venue_name ?? null : null,
    addressLine: exact ? r.address_line ?? null : null,
    lat: exact ? r.lat ?? null : r.public_lat ?? null,
    lng: exact ? r.lng ?? null : r.public_lng ?? null,
    exact,
    capacity: r.capacity,
    spotsLeft: Math.max(0, r.capacity - taken),
    bookingMode: r.booking_mode,
    facilitator,
  };
}

const PUBLIC_COLUMNS =
  "id,slug,title,description,audience,language,photo_url,church_org,meeting_day,meeting_time,timezone,frequency,start_date,duration_weeks,format,venue_name,address_line,city,state,postal_code,lat,lng,public_lat,public_lng,show_exact_address,capacity,booking_mode,status,facilitator_id";

async function hydrate(rows: any[]): Promise<PublicGroup[]> {
  const [counts, facilitators] = await Promise.all([
    reservationCounts(rows.map((r) => r.id)),
    facilitatorsById(Array.from(new Set(rows.map((r) => r.facilitator_id)))),
  ]);
  return rows.map((r) => toPublic(r, counts.get(r.id)?.taken ?? 0, facilitators.get(r.facilitator_id) ?? { profileId: r.facilitator_id, slug: null, name: "MJG Facilitator", photoUrl: null, churchOrg: null, city: null, state: null, bio: null }));
}

export async function listPublicGroups(filters: GroupFilters = {}): Promise<{ groups: PublicGroup[]; center: GeoPoint | null; nearNotFound: boolean }> {
  const supabase = createSupabaseAdminClient();
  let q = supabase.from("facilitator_groups").select(PUBLIC_COLUMNS).eq("status", "published");
  if (filters.day != null && Number.isFinite(filters.day)) q = q.eq("meeting_day", filters.day);
  if (filters.format) q = q.eq("format", filters.format);
  if (filters.audience) q = q.eq("audience", filters.audience);
  const { data, error } = await q.order("start_date", { ascending: true, nullsFirst: false }).limit(500);
  if (error) throw error;

  let groups = await hydrate(data ?? []);
  if (filters.tod) groups = groups.filter((g) => timeOfDay(g.meetingTime) === filters.tod);
  if (filters.open) groups = groups.filter((g) => g.spotsLeft > 0);

  let center: GeoPoint | null = null;
  let nearNotFound = false;
  const near = filters.near?.trim();
  if (near) {
    center = await geocodeSearch(near);
    if (center) {
      const radius = filters.radius && filters.radius > 0 ? filters.radius : 25;
      const c = center;
      groups = groups
        .map((g) => ({ ...g, distanceMiles: g.lat != null && g.lng != null ? distanceMiles(c, { lat: g.lat, lng: g.lng }) : null }))
        // Online groups work from anywhere, so they stay in a location search (listed last).
        .filter((g) => g.format === "online" || (g.distanceMiles != null && g.distanceMiles <= radius))
        .sort((a, b) => (a.distanceMiles ?? 1e9) - (b.distanceMiles ?? 1e9));
    } else {
      // Couldn't place it on the map — fall back to a plain text match on the area.
      nearNotFound = true;
      const needle = near.toLowerCase();
      groups = groups.filter((g) => g.areaLabel.toLowerCase().includes(needle) || g.title.toLowerCase().includes(needle));
    }
  }
  return { groups, center, nearNotFound };
}

export async function getPublicGroup(slug: string): Promise<PublicGroup | null> {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase.from("facilitator_groups").select(PUBLIC_COLUMNS).eq("slug", slug).eq("status", "published").maybeSingle();
  if (!data) return null;
  return (await hydrate([data]))[0];
}

export async function getPublicFacilitator(slug: string): Promise<{ facilitator: PublicFacilitator; groups: PublicGroup[] } | null> {
  const supabase = createSupabaseAdminClient();
  const { data: fp } = await supabase.from("facilitator_profiles").select("profile_id,is_public").eq("slug", slug).maybeSingle();
  if (!fp || !fp.is_public) return null;
  const facilitator = (await facilitatorsById([fp.profile_id])).get(fp.profile_id);
  if (!facilitator) return null;
  const { data } = await supabase.from("facilitator_groups").select(PUBLIC_COLUMNS).eq("facilitator_id", fp.profile_id).eq("status", "published");
  return { facilitator, groups: await hydrate(data ?? []) };
}

/** The signed-in viewer's active reservation for a group, if any. */
export async function getViewerReservation(profileId: string, groupId: string) {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("facilitator_group_reservations")
    .select("id,status,party_size")
    .eq("group_id", groupId)
    .eq("profile_id", profileId)
    .in("status", ["pending", "confirmed", "waitlisted"])
    .maybeSingle();
  return data ? { id: data.id as string, status: data.status as string, partySize: data.party_size as number } : null;
}
