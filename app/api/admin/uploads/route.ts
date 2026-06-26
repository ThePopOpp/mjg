import { NextResponse } from "next/server";
import { requireParticipantManager } from "@/lib/user-management/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const ALLOWED_PREFIXES = ["image/", "video/", "audio/"];
const ALLOWED_EXACT = ["application/pdf"];
const MAX_BYTES = 50 * 1024 * 1024; // 50 MB
const BUCKET = "mjg-media";

export async function POST(request: Request) {
  try {
    await requireParticipantManager(request); // reads x-mjg-action-token header
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unauthorized.";
    return NextResponse.json({ error: msg }, { status: /authentication/i.test(msg) ? 401 : 403 });
  }

  try {
    const form = await request.formData();
    const file = form.get("file");
    const folder = String(form.get("folder") ?? "uploads").replace(/[^a-z0-9/_-]/gi, "").slice(0, 60) || "uploads";
    if (!(file instanceof File)) return NextResponse.json({ error: "file is required." }, { status: 400 });
    if (file.size > MAX_BYTES) return NextResponse.json({ error: "File exceeds 50 MB." }, { status: 413 });

    const type = file.type || "application/octet-stream";
    const ok = ALLOWED_PREFIXES.some((p) => type.startsWith(p)) || ALLOWED_EXACT.includes(type);
    if (!ok) return NextResponse.json({ error: "Unsupported file type." }, { status: 415 });

    const ext = (file.name.split(".").pop() || "bin").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 8) || "bin";
    const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.storage.from(BUCKET).upload(path, buffer, { contentType: type, upsert: false });
    if (error) throw new Error(error.message);

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return NextResponse.json({ url: data.publicUrl, path, name: file.name, type, size: file.size });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Upload failed." }, { status: 500 });
  }
}
