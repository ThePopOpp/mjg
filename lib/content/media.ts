import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type MediaAssetInput = {
  id?: string;
  title: string;
  slug?: string;
  assetType: "audio" | "video" | "photo" | "gallery";
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
