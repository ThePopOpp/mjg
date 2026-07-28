import { NextResponse } from "next/server";
import { requireActiveProfile } from "@/lib/user-management/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

// Narrow self-service profile update. Deliberately NOT the admin upsertProfile —
// only whitelisted personal fields; never role, status, or email.
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const me = await requireActiveProfile(request, body.actionToken);

    const firstName = String(body.firstName ?? "").trim();
    const lastName = String(body.lastName ?? "").trim();
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";
    if (!firstName) return NextResponse.json({ error: "First name is required." }, { status: 400 });

    const supabase = createSupabaseAdminClient();
    const { error } = await supabase
      .from("profiles")
      .update({
        first_name: firstName,
        last_name: lastName,
        full_name: `${firstName} ${lastName}`.trim(),
        phone: phone || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", me.id);
    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update profile.";
    const status = message.includes("required") && message.includes("profile") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
