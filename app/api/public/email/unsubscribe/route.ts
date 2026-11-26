import { NextResponse } from "next/server";
import { verifyUnsubscribe } from "@/lib/email/unsubscribe-token";
import { unsubscribeFromRetreat } from "@/lib/annual-retreat/server";

// Signed unsubscribe for marketing series (lib/email/unsubscribe-token.ts).
//
// POST only: either the /email/unsubscribe confirmation page ({ t }) or an
// inbox's one-click request (RFC 8058: POST to the List-Unsubscribe URL with
// "List-Unsubscribe=One-Click"; the token is in the query string). A GET never
// unsubscribes anyone, so link scanners and prefetchers can't trigger it.

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const url = new URL(request.url);
  let token = url.searchParams.get("t");
  if (!token && (request.headers.get("content-type") ?? "").includes("application/json")) {
    const body = (await request.json().catch(() => ({}))) as { t?: unknown };
    token = typeof body.t === "string" ? body.t : null;
  }
  const parsed = verifyUnsubscribe(token);
  if (!parsed) return NextResponse.json({ ok: false, error: "This unsubscribe link isn't valid. Use the Email Preferences page instead." }, { status: 400 });

  const ip = (request.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || null;
  const via = url.searchParams.has("t") ? "one_click" : "confirmation_page";
  try {
    if (parsed.scope === "annual_retreat") await unsubscribeFromRetreat(parsed.email, { ip, userAgent: request.headers.get("user-agent"), via });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[unsubscribe] failed", error instanceof Error ? error.message : error);
    return NextResponse.json({ ok: false, error: "We couldn't process that just now. Please try again." }, { status: 500 });
  }
}
