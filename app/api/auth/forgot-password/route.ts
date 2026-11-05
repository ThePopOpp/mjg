import { NextResponse } from "next/server";
import { sendPasswordResetEmail } from "@/lib/auth/password-reset";

// Public self-service reset. Always returns ok so it never reveals whether an account
// exists for the given email. Delivery happens through the app's own Resend/SMTP.
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = typeof body.email === "string" ? body.email.trim() : "";
    if (email && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      // The caller always gets ok (no account enumeration), but a failed send is logged so
      // "I never got the reset email" can be traced in the server logs.
      const result = await sendPasswordResetEmail(email).catch((e: unknown) => ({ ok: false, reason: e instanceof Error ? e.message : String(e) }));
      if (!result.ok) console.error("[auth] password reset email not sent", { domain: email.split("@")[1], reason: result.reason });
    }
    return NextResponse.json({ ok: true });
  } catch {
    // Never leak details from the public endpoint.
    return NextResponse.json({ ok: true });
  }
}
