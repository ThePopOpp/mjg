import { NextResponse } from "next/server";
import { requireAdminManager } from "@/lib/user-management/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { sendPasswordResetEmail } from "@/lib/auth/password-reset";

// Admin action: email a password-reset link to any user, via the app's own email.
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    await requireAdminManager(request, body.actionToken);

    let email = typeof body.email === "string" ? body.email.trim() : "";
    if (!email && body.userId) {
      const { data } = await createSupabaseAdminClient().from("profiles").select("email").eq("id", body.userId).maybeSingle();
      email = (data as any)?.email ?? "";
    }
    if (!email) return NextResponse.json({ error: "A user email is required." }, { status: 400 });

    const result = await sendPasswordResetEmail(email);
    if (!result.ok) return NextResponse.json({ error: result.reason ?? "Unable to send the reset." }, { status: 502 });
    return NextResponse.json({ ok: true, sentTo: result.sentTo });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to send the password reset.";
    const status = message.includes("permission") || message.includes("Authentication") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
