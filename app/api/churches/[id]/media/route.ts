import { NextResponse } from "next/server";
import { requireActiveProfile } from "@/lib/user-management/auth";
import { CHURCH_MEDIA_BUCKET, canEditChurch } from "@/lib/churches/profile";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

// Upload a church logo or photo. Returns its public URL; the Church Profile editor saves it
// with the rest of the profile. Images only, 8 MB cap, stored under churches/<church id>/.
const MAX_BYTES = 8 * 1024 * 1024;

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let me;
  try {
    me = await requireActiveProfile(request, request.headers.get("x-mjg-action-token") || undefined);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unauthorized.";
    return NextResponse.json({ error: msg }, { status: /authentication/i.test(msg) ? 401 : 403 });
  }
  if (!(await canEditChurch(me, id))) {
    return NextResponse.json({ error: "You can only add images to the church you administer." }, { status: 403 });
  }

  try {
    const form = await request.formData();
    const file = form.get("file");
    const kind = form.get("kind") === "logo" ? "logo" : "photo";
    if (!(file instanceof File)) return NextResponse.json({ error: "Choose an image." }, { status: 400 });
    if (!/^image\/(png|jpe?g|webp|gif|avif)$/.test(file.type)) return NextResponse.json({ error: "Use a PNG, JPG, WebP, GIF or AVIF image." }, { status: 415 });
    if (file.size > MAX_BYTES) return NextResponse.json({ error: "Images can be up to 8 MB." }, { status: 413 });

    const ext = (file.name.split(".").pop() || "png").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 8) || "png";
    const path = `churches/${id}/${kind}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.storage
      .from(CHURCH_MEDIA_BUCKET)
      .upload(path, Buffer.from(await file.arrayBuffer()), { contentType: file.type, upsert: false });
    if (error) throw new Error(error.message);
    return NextResponse.json({ ok: true, url: supabase.storage.from(CHURCH_MEDIA_BUCKET).getPublicUrl(path).data.publicUrl });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Upload failed." }, { status: 500 });
  }
}
