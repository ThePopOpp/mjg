import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { CHALLENGE_VIDEOS_BY_ORDER, type ChallengeVideo } from "./videos";

// A video as stored in the DB, in the shape the UI already understands (ChallengeVideo) plus
// the row id + status for admin editing.
export type AdminChallengeVideo = ChallengeVideo & { id: string; status: string };

export type ChallengeVideoInput = {
  slug?: string;
  order?: number;
  badge?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  youtubeId?: string | null;
  driveId?: string | null;
  embedDirect?: boolean;
  videoUrl?: string | null;
  posterEyebrow?: string | null;
  posterTitle?: string | null;
  thumbnailUrl?: string | null;
  thumbnailDark?: string | null;
  durationLabel?: string | null;
  status?: string;
};

function rowToVideo(r: any): AdminChallengeVideo {
  return {
    id: r.id as string,
    slug: r.slug as string,
    order: Number(r.sort_order ?? 0),
    badge: r.badge ?? "",
    title: r.title ?? "",
    subtitle: r.subtitle ?? "",
    description: r.description ?? "",
    youtubeId: r.youtube_id ?? null,
    driveId: r.drive_id ?? null,
    embedDirect: r.embed_direct ?? undefined,
    videoUrl: r.video_url ?? null,
    posterEyebrow: r.poster_eyebrow ?? null,
    posterTitle: r.poster_title ?? null,
    thumbnailUrl: r.thumbnail_url ?? null,
    thumbnailDark: r.thumbnail_dark ?? null,
    durationLabel: r.duration_label ?? null,
    status: r.status ?? "published",
  };
}

// Map a camelCase input to DB columns (only keys that are present).
function inputToRow(input: ChallengeVideoInput): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  const set = (k: string, v: unknown) => { if (v !== undefined) row[k] = v; };
  set("slug", input.slug);
  set("sort_order", input.order);
  set("badge", input.badge);
  set("title", input.title);
  set("subtitle", input.subtitle);
  set("description", input.description);
  set("youtube_id", input.youtubeId);
  set("drive_id", input.driveId);
  set("embed_direct", input.embedDirect);
  set("video_url", input.videoUrl);
  set("poster_eyebrow", input.posterEyebrow);
  set("poster_title", input.posterTitle);
  set("thumbnail_url", input.thumbnailUrl);
  set("thumbnail_dark", input.thumbnailDark);
  set("duration_label", input.durationLabel);
  set("status", input.status);
  return row;
}

/** Public list — published only, ordered. Falls back to the code defaults if the table is
 *  empty or unavailable, so the public pages never go blank. */
export async function listChallengeVideos(): Promise<ChallengeVideo[]> {
  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("challenge_videos")
      .select("*")
      .eq("status", "published")
      .order("sort_order", { ascending: true });
    if (error || !data || data.length === 0) return CHALLENGE_VIDEOS_BY_ORDER;
    return data.map(rowToVideo);
  } catch {
    return CHALLENGE_VIDEOS_BY_ORDER;
  }
}

/** Public single video by slug (published only), with code fallback. */
export async function getChallengeVideoBySlug(slug: string): Promise<ChallengeVideo | undefined> {
  try {
    const supabase = createSupabaseAdminClient();
    const { data } = await supabase
      .from("challenge_videos")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();
    if (data) return rowToVideo(data);
  } catch {
    /* fall through to code default */
  }
  return CHALLENGE_VIDEOS_BY_ORDER.find((v) => v.slug === slug);
}

/** Admin list — every row (any status), ordered. Falls back to code defaults. */
export async function listChallengeVideosAdmin(): Promise<AdminChallengeVideo[]> {
  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase.from("challenge_videos").select("*").order("sort_order", { ascending: true });
    if (error || !data) throw error ?? new Error("no data");
    return data.map(rowToVideo);
  } catch {
    return CHALLENGE_VIDEOS_BY_ORDER.map((v) => ({ ...v, id: v.slug, status: "published" }));
  }
}

export async function createChallengeVideo(input: ChallengeVideoInput): Promise<AdminChallengeVideo> {
  const supabase = createSupabaseAdminClient();
  if (!input.slug?.trim()) throw new Error("A slug is required.");
  const { data, error } = await supabase.from("challenge_videos").insert(inputToRow(input)).select("*").single();
  if (error) throw new Error(error.message);
  return rowToVideo(data);
}

export async function updateChallengeVideo(id: string, input: ChallengeVideoInput): Promise<AdminChallengeVideo> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("challenge_videos")
    .update({ ...inputToRow(input), updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return rowToVideo(data);
}

export async function deleteChallengeVideo(id: string): Promise<void> {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("challenge_videos").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
