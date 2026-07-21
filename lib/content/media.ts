import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type MediaAssetInput = {
  id?: string;
  title: string;
  slug?: string;
  assetType: "audio" | "video" | "photo" | "gallery" | "document";
  sourceType?: "upload" | "external_url" | "recording" | "embed";
  fileUrl?: string;
  embedUrl?: string;
  storageBucket?: string;
  storagePath?: string;
  mimeType?: string;
  fileSize?: number;
  durationSeconds?: number;
  description?: string;
  status?: "draft" | "published" | "hidden" | "archived" | "deleted";
  visibility?: "private" | "public" | "assigned";
  metadata?: Record<string, unknown>;
  actorUserId?: string;
};

export async function getMediaStudioData() {
  const supabase = createSupabaseAdminClient();
  const [assets, collections, targets] = await Promise.all([
    supabase.from("media_assets").select("*").neq("status", "deleted").order("updated_at", { ascending: false }).limit(150),
    supabase.from("media_collections").select("*").neq("status", "deleted").order("updated_at", { ascending: false }).limit(80),
    supabase.from("media_publish_targets").select("*").eq("enabled", true).limit(200),
  ]);

  return {
    assets: assets.data ?? [],
    collections: collections.data ?? [],
    targets: targets.data ?? [],
    error: assets.error?.message ?? collections.error?.message ?? targets.error?.message ?? null,
  };
}

export type ShareableAdmin = { id: string; name: string; email: string };

/** Active Super Admins that a resource can be shared with / notify. */
export async function getShareableSuperAdmins(): Promise<ShareableAdmin[]> {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, email")
    .eq("role", "super_admin")
    .eq("status", "active")
    .order("first_name", { ascending: true });

  return (data ?? []).map((p) => ({
    id: p.id as string,
    name: [p.first_name, p.last_name].filter(Boolean).join(" ").trim() || (p.email as string),
    email: p.email as string,
  }));
}

export async function getPublishedAudioForTarget(target: string, limit = 6) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("media_assets")
    .select("*")
    .eq("asset_type", "audio")
    .eq("status", "published")
    .not("file_url", "is", null)
    .order("updated_at", { ascending: false })
    .limit(100);

  if (error) return [];

  return (data ?? [])
    .filter((asset) => {
      const targets = Array.isArray(asset.metadata?.display_targets) ? asset.metadata.display_targets : [];
      return targets.includes(target);
    })
    .slice(0, limit);
}

export const LISTEN_TARGET = "frontend_listen";

/** Sort key for a track on the Listen page. Assets with no explicit order sort after
 *  the ordered ones instead of vanishing or jumping around. */
export function audioSortOrder(asset: { metadata?: Record<string, any> | null }) {
  const raw = asset.metadata?.sort_order;
  const value = typeof raw === "number" ? raw : typeof raw === "string" ? Number(raw) : NaN;
  return Number.isFinite(value) ? value : Number.MAX_SAFE_INTEGER;
}

/**
 * Audio for a display target in deliberate chapter order.
 *
 * A sibling of getPublishedAudioForTarget() rather than an extension of it — the
 * homepage and Resources page rely on that one's newest-first ordering, and an
 * audiobook needs the opposite: the order a Super Admin arranged in Media Studio.
 * Ordering lives in metadata.sort_order (jsonb, so no migration); ties and unordered
 * tracks fall back to created_at ascending, which is stable across reloads.
 */
export async function getOrderedAudioForTarget(target: string, limit = 100) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("media_assets")
    .select("*")
    .eq("asset_type", "audio")
    .eq("status", "published")
    .not("file_url", "is", null)
    .order("created_at", { ascending: true })
    .limit(300);

  if (error) return [];

  return (data ?? [])
    .filter((asset) => {
      const targets = Array.isArray(asset.metadata?.display_targets) ? asset.metadata.display_targets : [];
      return targets.includes(target);
    })
    .sort((a, b) => audioSortOrder(a) - audioSortOrder(b))
    .slice(0, limit);
}

/** Audio assets flagged for a target regardless of status — the Media Studio
 *  ordering panel needs to show drafts too, or a track disappears while you're
 *  arranging it. */
export async function getAudioForTargetIncludingDrafts(target: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("media_assets")
    .select("*")
    .eq("asset_type", "audio")
    .neq("status", "deleted")
    .order("created_at", { ascending: true })
    .limit(300);

  if (error) return [];

  return (data ?? [])
    .filter((asset) => {
      const targets = Array.isArray(asset.metadata?.display_targets) ? asset.metadata.display_targets : [];
      return targets.includes(target);
    })
    .sort((a, b) => audioSortOrder(a) - audioSortOrder(b));
}

/** Persist a new Listen-page running order. Writes sort_order for EVERY id given so
 *  the sequence stays dense and stable, and merges into existing metadata so sibling
 *  keys (display_targets, thumbnail_url) survive. */
export async function saveAudioSortOrder(orderedIds: string[], actorUserId?: string) {
  const supabase = createSupabaseAdminClient();
  if (!orderedIds.length) return { updated: 0 };

  const { data, error } = await supabase.from("media_assets").select("id, metadata").in("id", orderedIds);
  if (error) throw error;

  const existing = new Map((data ?? []).map((row) => [row.id as string, row.metadata]));
  let updated = 0;

  for (const [index, id] of orderedIds.entries()) {
    if (!existing.has(id)) continue;
    const metadata = { ...(existing.get(id) ?? {}), sort_order: index };
    const { error: updateError } = await supabase
      .from("media_assets")
      .update({ metadata, updated_by: actorUserId ?? null, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (updateError) throw updateError;
    updated += 1;
  }

  return { updated };
}

export async function saveMediaAsset(input: MediaAssetInput) {
  const supabase = createSupabaseAdminClient();
  const slug = slugify(input.slug || input.title);
  const payload = {
    title: input.title.trim(),
    slug,
    asset_type: input.assetType,
    source_type: input.sourceType || "external_url",
    file_url: input.fileUrl?.trim() || null,
    embed_url: input.embedUrl?.trim() || null,
    storage_bucket: input.storageBucket?.trim() || null,
    storage_path: input.storagePath?.trim() || null,
    mime_type: input.mimeType?.trim() || null,
    file_size: input.fileSize ?? null,
    duration_seconds: input.durationSeconds ?? null,
    description: input.description?.trim() || null,
    status: input.status || "draft",
    visibility: input.visibility || "private",
    metadata: input.metadata || {},
    updated_by: input.actorUserId ?? null,
    updated_at: new Date().toISOString(),
  };

  const query = input.id
    ? supabase.from("media_assets").update(payload).eq("id", input.id)
    : supabase.from("media_assets").insert({ ...payload, created_by: input.actorUserId ?? null });

  const { data, error } = await query.select("*").single();
  if (error) throw error;
  return data;
}

export async function updateMediaAssetStatus(input: { id: string; status: string; actorUserId?: string }) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("media_assets")
    .update({ status: input.status, updated_by: input.actorUserId ?? null, updated_at: new Date().toISOString() })
    .eq("id", input.id)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
