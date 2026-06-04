import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireAdminManager } from "@/lib/user-management/auth";

const BUCKET = "media-assets";
const AUDIO_TYPES = new Set(["audio/webm", "audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg", "audio/mp4"]);
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export async function POST(request: Request) {
  try {
    await requireAdminManager();
    const formData = await request.formData();
    const file = formData.get("file");
    const intent = String(formData.get("intent") || "media");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Upload file is required." }, { status: 400 });
    }

    if (intent === "audio" && !AUDIO_TYPES.has(file.type)) {
      return NextResponse.json({ error: "Please upload a supported audio file." }, { status: 400 });
    }

    if (intent === "thumbnail" && !IMAGE_TYPES.has(file.type)) {
      return NextResponse.json({ error: "Please upload a supported image file." }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();
    await ensureBucket(supabase);

    const extension = extensionFromName(file.name, file.type);
    const folder = intent === "thumbnail" ? "thumbnails" : "audio";
    const path = `${folder}/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}${extension}`;
    const bytes = Buffer.from(await file.arrayBuffer());

    const { error } = await supabase.storage.from(BUCKET).upload(path, bytes, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });

    if (error) throw error;

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return NextResponse.json({
      ok: true,
      url: data.publicUrl,
      bucket: BUCKET,
      path,
      mimeType: file.type,
      fileSize: file.size,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed.";
    return NextResponse.json({ error: message }, { status: message.includes("permission") ? 403 : 500 });
  }
}

async function ensureBucket(supabase: ReturnType<typeof createSupabaseAdminClient>) {
  const { data } = await supabase.storage.getBucket(BUCKET);
  if (data) return;
  await supabase.storage.createBucket(BUCKET, {
    public: true,
    fileSizeLimit: 1024 * 1024 * 100,
    allowedMimeTypes: [...AUDIO_TYPES, ...IMAGE_TYPES],
  });
}

function extensionFromName(name: string, type: string) {
  const match = name.match(/\.[a-z0-9]+$/i);
  if (match) return match[0].toLowerCase();
  if (type === "audio/webm") return ".webm";
  if (type === "audio/wav") return ".wav";
  if (type === "audio/ogg") return ".ogg";
  if (type === "image/png") return ".png";
  if (type === "image/webp") return ".webp";
  if (type === "image/gif") return ".gif";
  return ".jpg";
}
