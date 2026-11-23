import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { looksAutomated } from "@/lib/analytics/bots";
import { cleanPath, countryFrom, deviceFromUA, resolveTouch, visitorHash, type TouchPayload } from "@/lib/analytics/server";

// Public, unauthenticated pageview beacon from components/analytics/site-analytics.tsx.
// Always answers 204 so a failure is invisible to the page.

const EVENTS = new Set(["pageview"]);

export async function POST(request: Request) {
  const done = () => new NextResponse(null, { status: 204 });
  const ua = request.headers.get("user-agent") || "";
  if (looksAutomated(ua) || request.headers.get("sec-gpc") === "1") return done();

  // sendBeacon posts text/plain, so parse the raw body.
  const text = await request.text().catch(() => "");
  if (!text || text.length > 4000) return done();
  let body: { event?: unknown; path?: unknown; sid?: unknown; entry?: unknown; touch?: TouchPayload } | null = null;
  try {
    body = JSON.parse(text);
  } catch {
    return done();
  }

  const event = typeof body?.event === "string" && EVENTS.has(body.event) ? body.event : null;
  const path = cleanPath(body?.path);
  const sid = typeof body?.sid === "string" && /^[A-Za-z0-9_-]{8,64}$/.test(body.sid) ? body.sid : null;
  if (!event || !path || !sid) return done();

  const host = (request.headers.get("host") || "").split(":")[0].toLowerCase() || null;
  const touch = resolveTouch(body?.touch, host);

  try {
    const { error } = await createSupabaseAdminClient().from("analytics_events").insert({
      event,
      host,
      path,
      entry_path: touch.path,
      referrer_host: touch.referrerHost,
      channel: touch.channel,
      source: touch.source,
      utm_source: touch.utm_source,
      utm_medium: touch.utm_medium,
      utm_campaign: touch.utm_campaign,
      utm_content: touch.utm_content,
      utm_term: touch.utm_term,
      is_entry: body?.entry === true,
      visitor_hash: visitorHash(request),
      session_id: sid,
      device: deviceFromUA(ua),
      country: countryFrom(request),
    });
    if (error) console.error("[analytics] collect failed", error.message);
  } catch (error) {
    console.error("[analytics] collect failed", error);
  }
  return done();
}
