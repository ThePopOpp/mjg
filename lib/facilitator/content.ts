import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { listChallengeVideos } from "@/lib/six-week-challenge/repository";
import { getOrderedAudioForTarget, LISTEN_TARGET } from "@/lib/content/media";

export type MediaItem = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  file_url: string | null;
  embed_url: string | null;
  duration_seconds: number | null;
  thumbnail_url: string | null;
};

function toMediaItem(row: any): MediaItem {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    description: row.description ?? null,
    file_url: row.file_url ?? null,
    embed_url: row.embed_url ?? null,
    duration_seconds: row.duration_seconds ?? null,
    thumbnail_url: row.metadata?.thumbnail_url ?? null,
  };
}

/** Audiobook chapters: the audio ticked for the Listen page in Media Studio, in the
 * chapter order arranged there (same source as /listen). */
export async function getAudiobookTracks(): Promise<MediaItem[]> {
  return (await getOrderedAudioForTarget(LISTEN_TARGET, 100)).map(toMediaItem);
}

/** Published media assets of a given type, newest first. (No dedicated getters exist for
 * document/video, so this mirrors the audio getters in lib/content/media.ts.) */
export async function getPublishedMedia(assetType: "audio" | "document" | "video", limit = 60): Promise<MediaItem[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("media_assets")
    .select("*")
    .eq("asset_type", assetType)
    .eq("status", "published")
    .is("deleted_at", null)
    .order("updated_at", { ascending: false })
    .limit(limit);
  if (error) return [];
  return (data ?? []).map(toMediaItem);
}

export type NewsPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featured_image_url: string | null;
  category: string | null;
  publish_at: string | null;
  created_at: string;
};

/** Published blog posts (respecting publish_at), newest first. */
export async function getPublishedNews(limit = 30): Promise<NewsPost[]> {
  const supabase = createSupabaseAdminClient();
  const nowIso = new Date().toISOString();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("id,title,slug,excerpt,featured_image_url,publish_at,created_at, category:blog_post_categories(name)")
    .eq("status", "published")
    .or(`publish_at.is.null,publish_at.lte.${nowIso}`)
    .order("publish_at", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) return [];
  return (data ?? []).map((p: any) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    excerpt: p.excerpt ?? null,
    featured_image_url: p.featured_image_url ?? null,
    category: p.category?.name ?? null,
    publish_at: p.publish_at ?? null,
    created_at: p.created_at,
  }));
}

/** A 6-Week Challenge video, trimmed to what a library card needs. */
export type LibraryVideo = {
  slug: string;
  badge: string;
  title: string;
  subtitle: string;
  thumbnailUrl: string | null;
  thumbnailDark: string | null;
  durationLabel: string | null;
  available: boolean;
};

/** The 6-Week Challenge videos (challenge_videos, edited in Media Studio) for Resources → Video. */
export async function getChallengeLibraryVideos(): Promise<LibraryVideo[]> {
  const videos = await listChallengeVideos();
  return videos.map((v) => ({
    slug: v.slug,
    badge: v.badge,
    title: v.title,
    subtitle: v.subtitle,
    thumbnailUrl: v.thumbnailUrl,
    thumbnailDark: v.thumbnailDark ?? null,
    durationLabel: v.durationLabel,
    // Media Studio's availability chip wins; otherwise a video with a source is watchable.
    available: v.availability === "coming_soon" ? false : v.availability === "available" || Boolean(v.youtubeId || v.driveId || v.videoUrl),
  }));
}
