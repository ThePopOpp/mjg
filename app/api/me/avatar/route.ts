import { NextResponse } from "next/server";
import { requireActiveProfile } from "@/lib/user-management/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

// Self-service profile photo — open to any active profile (every account type can set
// their own avatar). Mirrors the direct-messages upload auth. Images only, 8 MB cap.
const MAX_BYTES = 8 * 1024 * 1024;
const BUCKET = "mjg-media";

export async function POST(request: Request) {
  let me;
  try {
    const token = request.headers.get("x-mjg-action-token") || undefined;
    me = await requireActiveProfile(request, token);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unauthorized.";
    return NextResponse.json({ error: msg }, { status: /authentication/i.test(msg) ? 401 : 403 });
  }

  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "file is required." }, { status: 400 });
    if (!file.type.startsWith("image/")) return NextResponse.json({ error: "Please choose an image." }, { status: 415 });
    if (file.size > MAX_BYTES) return NextResponse.json({ error: "Image exceeds 8 MB." }, { status: 413 });

    const ext = (file.name.split(".").pop() || "png").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 8) || "png";
    const path = `avatars/${me.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const supabase = createSupabaseAdminClient();
    const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, buffer, { contentType: file.type, upsert: false });
    if (upErr) throw new Error(upErr.message);

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    const url = data.publicUrl;
    const { error } = await supabase.from("profiles").update({ avatar_url: url, updated_at: new Date().toISOString() }).eq("id", me.id);
    if (error) throw error;

    return NextResponse.json({ ok: true, url });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Upload failed." }, { status: 500 });
  }
}

// Remove the profile photo (falls back to initials).
export async function DELETE(request: Request) {
  try {
    const token = request.headers.get("x-mjg-action-token") || undefined;
    const me = await requireActiveProfile(request, token);
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.from("profiles").update({ avatar_url: null, updated_at: new Date().toISOString() }).eq("id", me.id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unable to remove photo.";
    return NextResponse.json({ error: msg }, { status: /authentication/i.test(msg) ? 401 : 403 });
  }
}
