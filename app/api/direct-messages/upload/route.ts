import { NextResponse } from "next/server";
import { requireActiveProfile } from "@/lib/user-management/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

// Attachment upload for Direct Messages — open to any active profile (both
// sides of a conversation can attach). Mirrors /api/admin/uploads but with
// participant-friendly auth.
const ALLOWED_PREFIXES = ["image/", "video/", "audio/"];
const ALLOWED_EXACT = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"];
const MAX_BYTES = 50 * 1024 * 1024; // 50 MB
const BUCKET = "mjg-media";

function kind(type: string): "image" | "audio" | "video" | "file" {
  if (type.startsWith("image/")) return "image";
  if (type.startsWith("audio/")) return "audio";
  if (type.startsWith("video/")) return "video";
  return "file";
}

export async function POST(request: Request) {
  try {
    await requireActiveProfile(request);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unauthorized.";
    return NextResponse.json({ error: msg }, { status: /authentication/i.test(msg) ? 401 : 403 });
  }

  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "file is required." }, { status: 400 });
    if (file.size > MAX_BYTES) return NextResponse.json({ error: "File exceeds 50 MB." }, { status: 413 });

    const type = file.type || "application/octet-stream";
    const ok = ALLOWED_PREFIXES.some((p) => type.startsWith(p)) || ALLOWED_EXACT.includes(type);
    if (!ok) return NextResponse.json({ error: "Unsupported file type." }, { status: 415 });

    const ext = (file.name.split(".").pop() || "bin").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 8) || "bin";
    const path = `direct-messages/${new Date().toISOString().slice(0, 10)}/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.storage.from(BUCKET).upload(path, buffer, { contentType: type, upsert: false });
    if (error) throw new Error(error.message);

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return NextResponse.json({ ok: true, attachment: { type: kind(type), url: data.publicUrl, name: file.name, mimeType: type, size: file.size } });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Upload failed." }, { status: 500 });
  }
}
