import { NextResponse } from "next/server";
import { sendPasswordResetEmail } from "@/lib/auth/password-reset";

// Public self-service reset. Always returns ok so it never reveals whether an account
// exists for the given email. Delivery happens through the app's own Resend/SMTP.
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = typeof body.email === "string" ? body.email.trim() : "";
    if (email && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      // Fire the send; swallow any error (missing user, etc.) to avoid enumeration.
      await sendPasswordResetEmail(email).catch(() => undefined);
    }
    return NextResponse.json({ ok: true });
  } catch {
    // Never leak details from the public endpoint.
    return NextResponse.json({ ok: true });
  }
}
