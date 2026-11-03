import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { ROLES } from "@/lib/rbac/roles";
import { adminChurchIdsFor, getChurch, type Church, type ChurchActor, type ChurchPhoto } from "@/lib/churches/repository";
import { slugifyChurch } from "@/lib/churches/rules";

// The church profile a church admin edits (Church Profile in their dashboard) and the public
// /churches/<slug> page reads. Logo and photos are uploaded to mjg-media under
// churches/<church id>/ and only URLs from that folder are accepted, so a profile can't point
// at images hosted anywhere else.

export const CHURCH_MEDIA_BUCKET = "mjg-media";
export const MAX_CHURCH_PHOTOS = 12;

export type ChurchProfileInput = {
  name?: unknown;
  website?: unknown;
  email?: unknown;
  phone?: unknown;
  addressLine1?: unknown;
  addressLine2?: unknown;
  city?: unknown;
  state?: unknown;
  postalCode?: unknown;
  denomination?: unknown;
  description?: unknown;
  logoUrl?: unknown;
  photos?: unknown;
  /** The editor's own position (title) at this church. */
  title?: unknown;
};

const text = (v: unknown, max: number) => (typeof v === "string" && v.trim() ? v.trim().slice(0, max) : null);

/** Super Admins edit any church; a church admin edits the churches they actively administer. */
export async function canEditChurch(actor: ChurchActor, churchId: string) {
  if (actor.role === ROLES.SUPER_ADMIN) return true;
  return (await adminChurchIdsFor(actor.id)).includes(churchId);
}

/** The public URL folder every logo/photo for this church lives under (same client the upload route uses). */
export function churchMediaPrefix(churchId: string) {
  const url = createSupabaseAdminClient().storage.from(CHURCH_MEDIA_BUCKET).getPublicUrl(`churches/${churchId}/x`).data.publicUrl;
  return url.slice(0, -1);
}

function normalizeWebsite(v: unknown): string | null {
  const raw = text(v, 300);
  if (!raw) return null;
  const withScheme = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    const url = new URL(withScheme);
    if (!url.hostname.includes(".")) throw new Error();
    return url.toString().replace(/\/$/, "");
  } catch {
    throw new Error("That website doesn't look right. Try something like yourchurch.org.");
  }
}

function normalizeEmail(v: unknown): string | null {
  const raw = text(v, 200)?.toLowerCase() ?? null;
  if (raw && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw)) throw new Error("That email address doesn't look right.");
  return raw;
}

function ownMedia(churchId: string, v: unknown): string | null {
  const url = text(v, 600);
  if (!url) return null;
  if (!url.startsWith(churchMediaPrefix(churchId))) throw new Error("Upload images from the Church Profile page.");
  return url;
}

function normalizePhotos(churchId: string, v: unknown): ChurchPhoto[] {
  if (!Array.isArray(v)) throw new Error("Photos must be a list.");
  if (v.length > MAX_CHURCH_PHOTOS) throw new Error(`Add up to ${MAX_CHURCH_PHOTOS} photos.`);
  return v.map((p) => {
    const url = ownMedia(churchId, (p as { url?: unknown })?.url);
    if (!url) throw new Error("Each photo needs an image.");
    return { url, caption: text((p as { caption?: unknown })?.caption, 200) };
  });
}

export async function updateChurchProfile(actor: ChurchActor, churchId: string, input: ChurchProfileInput): Promise<Church> {
  if (!(await canEditChurch(actor, churchId))) throw new Error("You can only edit the church you administer.");
  const current = await getChurch(churchId);
  if (!current) throw new Error("Church not found.");

  const has = (k: keyof ChurchProfileInput) => Object.prototype.hasOwnProperty.call(input, k);
  const row: Record<string, unknown> = { updated_at: new Date().toISOString(), profile_updated_by: actor.id };
  const supabase = createSupabaseAdminClient();

  if (has("name")) {
    const name = text(input.name, 160);
    if (!name) throw new Error("Give the church a name.");
    row.name = name;
    if (name !== current.name) row.slug = await uniqueSlug(name, churchId);
  }
  if (has("website")) row.website = normalizeWebsite(input.website);
  if (has("email")) row.email = normalizeEmail(input.email);
  if (has("phone")) row.phone = text(input.phone, 40);
  if (has("addressLine1")) row.address_line1 = text(input.addressLine1, 200);
  if (has("addressLine2")) row.address_line2 = text(input.addressLine2, 200);
  if (has("city")) row.city = text(input.city, 100);
  if (has("state")) row.state = text(input.state, 2)?.toUpperCase() ?? null;
  if (has("postalCode")) row.postal_code = text(input.postalCode, 20);
  if (has("denomination")) row.denomination = text(input.denomination, 120);
  if (has("description")) row.description = text(input.description, 4000);
  if (has("logoUrl")) row.logo_url = ownMedia(churchId, input.logoUrl);
  if (has("photos")) row.photos = normalizePhotos(churchId, input.photos);

  const { error } = await supabase.from("churches").update(row).eq("id", churchId);
  if (error) throw error;

  if (has("title")) {
    await supabase
      .from("church_admins")
      .update({ title: text(input.title, 120), updated_at: new Date().toISOString() })
      .eq("church_id", churchId)
      .eq("profile_id", actor.id)
      .eq("status", "active");
  }
  return (await getChurch(churchId))!;
}

async function uniqueSlug(name: string, excludeId: string) {
  const supabase = createSupabaseAdminClient();
  const root = slugifyChurch(name);
  for (let i = 0; i < 50; i++) {
    const candidate = i === 0 ? root : `${root}-${i + 1}`;
    const { data } = await supabase.from("churches").select("id").eq("slug", candidate).neq("id", excludeId).maybeSingle();
    if (!data) return candidate;
  }
  return `${root}-${Date.now().toString(36)}`;
}

/** This admin's position (title) at the church. */
export async function myChurchTitle(profileId: string, churchId: string): Promise<string | null> {
  const { data } = await createSupabaseAdminClient()
    .from("church_admins")
    .select("title")
    .eq("church_id", churchId)
    .eq("profile_id", profileId)
    .eq("status", "active")
    .maybeSingle();
  return (data?.title as string | null) ?? null;
}

export type PublicChurchLeader = { name: string; title: string | null; photoUrl: string | null };

/** An active church by slug, with the admins who lead it. Null when missing, archived or deleted. */
export async function getPublicChurch(slug: string): Promise<(Church & { leaders: PublicChurchLeader[] }) | null> {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase.from("churches").select("id").eq("slug", slug).eq("status", "active").is("deleted_at", null).maybeSingle();
  if (!data) return null;
  const church = await getChurch(data.id);
  if (!church) return null;
  const { data: admins } = await supabase
    .from("church_admins")
    .select("title, profiles:profile_id(first_name,last_name,email,avatar_url)")
    .eq("church_id", church.id)
    .eq("status", "active")
    .order("assigned_at");
  return {
    ...church,
    // Names only — never fall back to the email address on a public page.
    leaders: (admins ?? []).map((a: any) => ({ name: [a.profiles?.first_name, a.profiles?.last_name].filter(Boolean).join(" ").trim() || "Church leader", title: a.title ?? null, photoUrl: a.profiles?.avatar_url ?? null })),
  };
}
