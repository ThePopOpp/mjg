import { NextResponse } from "next/server";
import { ATTEMPT_RE, EMAIL_RE } from "@/lib/annual-retreat/config";
import { handleGuideRequest, hashIp, recentRequestCount, retreatAccess } from "@/lib/annual-retreat/server";

// The /annual-retreat request form (components/annual-retreat/request-form.tsx).
//
// Email required, first name optional, marketing permission optional and
// separate. Collects nothing else: no reflections, prayer requests or money.
// Spam: a honeypot field, plus at most 5 requests per email and 20 per network
// per hour. Retries carry the same attemptId and never send twice.

export const dynamic = "force-dynamic";

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

function touch(t: unknown): Record<string, string> | null {
  if (!t || typeof t !== "object") return null;
  const src = t as Record<string, unknown>;
  const out = Object.fromEntries(
    ["path", "referrer", "at", "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"].filter((k) => typeof src[k] === "string").map((k) => [k, String(src[k]).slice(0, 300)]),
  );
  return Object.keys(out).length ? out : null;
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "Something went wrong sending the form. Please try again." }, { status: 400 });
  }

  // While in preview, only people who can see the page can use it.
  const access = await retreatAccess();
  if (!access.canView) return NextResponse.json({ ok: false, error: "This page isn't available yet." }, { status: 404 });

  // Honeypot filled: answer as if it worked, store and send nothing.
  if (str(body.website, 300)) return NextResponse.json({ ok: true, email: "sent" });

  const email = str(body.email, 200).toLowerCase();
  const firstName = str(body.firstName, 80) || null;
  const attemptId = str(body.attemptId, 64);
  const fields: Record<string, string> = {};
  if (!EMAIL_RE.test(email)) fields.email = "Please enter a valid email address.";
  if (firstName && /[<>{}]|https?:/i.test(firstName)) fields.firstName = "Please enter just your first name.";
  if (Object.keys(fields).length) return NextResponse.json({ ok: false, fields }, { status: 400 });
  if (!ATTEMPT_RE.test(attemptId)) return NextResponse.json({ ok: false, error: "Please reload the page and try again." }, { status: 400 });

  const ip = (request.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || request.headers.get("x-real-ip") || null;
  const recent = await recentRequestCount(email, hashIp(ip));
  if (recent.byEmail >= 5 || recent.byIp >= 20) {
    return NextResponse.json({ ok: false, error: "We've received several requests from you in the last hour. Please wait a little and try again." }, { status: 429 });
  }

  const attribution = (body.attribution ?? {}) as { first?: unknown; session?: unknown };
  try {
    const result = await handleGuideRequest({
      attemptId,
      email,
      firstName,
      marketingOptIn: body.marketingOptIn === true,
      pageUrl: str(body.pageUrl, 500) || null,
      firstTouch: touch(attribution.first),
      sessionTouch: touch(attribution.session),
      ip,
      userAgent: request.headers.get("user-agent"),
    });
    // The download works either way; the page explains a failed email calmly.
    return NextResponse.json({ ok: true, email: result.email === "sent" ? "sent" : "failed" });
  } catch (error) {
    console.error("[annual-retreat] request failed", error instanceof Error ? error.message : error);
    return NextResponse.json({ ok: false, error: "We couldn't complete your request just now. Please try again in a moment." }, { status: 500 });
  }
}
