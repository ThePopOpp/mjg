import { NextResponse } from "next/server";
import { registerSelfServeAccount } from "@/lib/user-management/self-registration";

// Public, unauthenticated endpoint. The role is validated against SELF_SERVE_ROLES inside
// registerSelfServeAccount — never trust `body.role` beyond passing it through that gate.

// Small in-memory throttle so the endpoint can't be used to mass-create accounts or to probe
// which emails are already registered. Per-instance only; a real limiter would live at the edge.
//
// Only *consequential* outcomes are counted — an account actually created, or an
// "already exists" answer (the email-enumeration signal). Plain validation errors (a short
// password, a mistyped email) are free, so someone fumbling the form is never locked out.
const attempts = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_PER_WINDOW = 5;

function isThrottled(key: string) {
  const entry = attempts.get(key);
  if (!entry || Date.now() > entry.resetAt) return false;
  return entry.count >= MAX_PER_WINDOW;
}

function countAttempt(key: string) {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || now > entry.resetAt) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return;
  }
  entry.count += 1;
}

export async function POST(request: Request) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";

    if (isThrottled(ip)) {
      return NextResponse.json(
        { error: "Too many sign-up attempts. Please try again in a few minutes." },
        { status: 429 },
      );
    }

    const body = await request.json().catch(() => ({}));
    const result = await registerSelfServeAccount({
      role: body.role,
      email: String(body.email ?? ""),
      password: String(body.password ?? ""),
      firstName: String(body.firstName ?? ""),
      lastName: String(body.lastName ?? ""),
      phone: typeof body.phone === "string" ? body.phone : undefined,
      groupName: typeof body.groupName === "string" ? body.groupName : undefined,
      churchOrOrg: typeof body.churchOrOrg === "string" ? body.churchOrOrg : undefined,
    });

    countAttempt(ip); // an account was created
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Registration failed.";
    // "Already exists" is the email-enumeration answer, so it costs a slot too.
    if (/already exists/i.test(message)) {
      const ip =
        request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        request.headers.get("x-real-ip") ||
        "unknown";
      countAttempt(ip);
    }
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
