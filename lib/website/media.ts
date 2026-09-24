// Frontend Editor — media access (spec §20).
//
// The app already has a media library (media_assets, Media Studio). The editor
// CONNECTS to it rather than creating a second one, so an image uploaded in
// Media Studio is immediately pickable here and usage stays in one place.
//
// Steward may search and attach existing media and edit alt text. It may not
// invent assets — every attach goes through an id that must already exist.

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { logWebsiteAudit, listPages } from "./data";
import { extractImages } from "./blocks";

export type MediaItem = {
  id: string;
  title: string;
  assetType: string;
  url: string;
  altText: string;
  description: string | null;
  mimeType: string | null;
  width: number | null;
  height: number | null;
  status: string;
  updatedAt: string;
};

function toItem(row: Record<string, unknown>): MediaItem {
  const metadata = (row.metadata ?? {}) as Record<string, unknown>;
  return {
    id: String(row.id),
    title: String(row.title ?? ""),
    assetType: String(row.asset_type ?? "photo"),
    url: String(row.file_url ?? row.embed_url ?? ""),
    altText: String(metadata.altText ?? metadata.alt ?? ""),
    description: (row.description as string) ?? null,
    mimeType: (row.mime_type as string) ?? null,
    width: (row.width as number) ?? null,
    height: (row.height as number) ?? null,
    status: String(row.status ?? "draft"),
    updatedAt: String(row.updated_at ?? ""),
  };
}

export async function searchMedia(
  opts: { query?: string; assetType?: string; limit?: number } = {},
): Promise<MediaItem[]> {
  const sb = createSupabaseAdminClient();
  let query = sb
    .from("media_assets")
    .select("*")
    .neq("status", "deleted")
    .order("updated_at", { ascending: false })
    .limit(Math.min(120, opts.limit ?? 60));
  if (opts.assetType && opts.assetType !== "all") query = query.eq("asset_type", opts.assetType);
  const term = opts.query?.trim();
  if (term) query = query.or(`title.ilike.%${term}%,description.ilike.%${term}%`);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => toItem(r as Record<string, unknown>)).filter((m) => m.url);
}

export async function getMediaItem(id: string): Promise<MediaItem | null> {
  const sb = createSupabaseAdminClient();
  const { data, error } = await sb.from("media_assets").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? toItem(data as Record<string, unknown>) : null;
}

/** Alt text lives on the asset so every page that uses the image inherits it. */
export async function updateMediaAltText(
  id: string,
  altText: string,
  opts: { actorId?: string | null; actorType?: "user" | "steward" } = {},
): Promise<MediaItem> {
  const sb = createSupabaseAdminClient();
  const existing = await getMediaItem(id);
  if (!existing) throw new Error("That media item no longer exists.");

  const { data: row } = await sb.from("media_assets").select("metadata").eq("id", id).maybeSingle();
  const metadata = { ...(((row as { metadata?: Record<string, unknown> } | null)?.metadata) ?? {}), altText: String(altText ?? "").slice(0, 300) };

  const { data, error } = await sb
    .from("media_assets")
    .update({ metadata, updated_by: opts.actorId ?? null, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw new Error(error.message);

  await logWebsiteAudit({
    actorId: opts.actorId,
    actorType: opts.actorType ?? "user",
    action: "media.alt_updated",
    resourceType: "media",
    resourceId: id,
    summary: `Updated the image description for "${existing.title}".`,
  });
  return toItem(data as Record<string, unknown>);
}

export type MediaUsage = { pageId: string; title: string; slug: string; blockIds: string[] };

/** Which pages use a given image URL — shown before anyone replaces or removes it. */
export async function mediaUsage(url: string): Promise<MediaUsage[]> {
  const target = String(url ?? "").trim();
  if (!target) return [];
  const pages = await listPages({ includeDeleted: false });
  const usage: MediaUsage[] = [];
  for (const page of pages) {
    const blockIds = extractImages(page.draft_content)
      .filter((i) => i.url === target)
      .map((i) => i.blockId);
    if (blockIds.length) usage.push({ pageId: page.id, title: page.title, slug: page.slug, blockIds: Array.from(new Set(blockIds)) });
  }
  return usage;
}
