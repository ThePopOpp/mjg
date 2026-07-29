import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type ExperiencePreview = {
  id: string;
  title: string;
  content: string | null;
  image_url: string | null;
  video_url: string | null;
  audio_url: string | null;
  document_url: string | null;
  frequency_label: string | null;
};

export type ExperiencePreviewInput = {
  title: string;
  content?: string | null;
  imageUrl?: string | null;
  videoUrl?: string | null;
  audioUrl?: string | null;
  documentUrl?: string | null;
  frequencyLabel?: string | null;
};

export async function createExperiencePreview(input: ExperiencePreviewInput, actorUserId?: string | null) {
  if (!input.title?.trim()) throw new Error("Preview title is required.");
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("experience_previews")
    .insert({
      title: input.title.trim(),
      content: input.content?.trim() || null,
      image_url: input.imageUrl || null,
      video_url: input.videoUrl || null,
      audio_url: input.audioUrl || null,
      document_url: input.documentUrl || null,
      frequency_label: input.frequencyLabel || null,
      created_by: actorUserId || null,
    })
    .select("id")
    .single();
  if (error) throw error;
  return { id: data.id as string };
}

export async function getExperiencePreview(id: string): Promise<ExperiencePreview | null> {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase.from("experience_previews").select("*").eq("id", id).maybeSingle();
  return (data as ExperiencePreview | null) ?? null;
}

/**
 * Add / edit / remove the preview attached to an experience.
 * - input === null  → unlink and delete the current preview.
 * - has current     → update it.
 * - no current      → create one and link it.
 */
export async function applyExperiencePreview(experienceId: string, input: ExperiencePreviewInput | null, actorUserId?: string | null) {
  const supabase = createSupabaseAdminClient();
  const { data: exp } = await supabase.from("experiences").select("preview_id").eq("id", experienceId).maybeSingle();
  const currentId: string | null = exp?.preview_id ?? null;

  if (input === null) {
    await supabase.from("experiences").update({ preview_id: null }).eq("id", experienceId);
    if (currentId) await supabase.from("experience_previews").delete().eq("id", currentId);
    return { previewId: null };
  }

  if (!input.title?.trim()) throw new Error("Preview title is required.");
  const fields = {
    title: input.title.trim(),
    content: input.content?.trim() || null,
    image_url: input.imageUrl || null,
    video_url: input.videoUrl || null,
    audio_url: input.audioUrl || null,
    document_url: input.documentUrl || null,
    frequency_label: input.frequencyLabel || null,
  };

  if (currentId) {
    await supabase.from("experience_previews").update({ ...fields, updated_at: new Date().toISOString() }).eq("id", currentId);
    return { previewId: currentId };
  }

  const { data, error } = await supabase.from("experience_previews").insert({ ...fields, created_by: actorUserId || null }).select("id").single();
  if (error) throw error;
  await supabase.from("experiences").update({ preview_id: data.id }).eq("id", experienceId);
  return { previewId: data.id as string };
}
