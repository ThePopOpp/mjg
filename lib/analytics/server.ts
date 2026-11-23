import { createHash, createHmac } from "node:crypto";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { appUrl, publicSiteUrl } from "@/lib/public-site/static-pages";
import { classifyChannel, hostOf } from "@/lib/analytics/channels";

// Server side of the first-party tracker: request → row. No cookies and no raw
// IPs are stored; see supabase/migrations/202611210145_web_analytics.sql.

const MAX = 300;
const clip = (v: unknown, n = MAX): string | null => {
  if (typeof v !== "string") return null;
  const s = v.trim();
  return s ? s.slice(0, n) : null;
};

/** The session's entry context, as kept by the tracker in sessionStorage / localStorage. */
export type TouchPayload = {
  path?: unknown;
  referrer?: unknown;
  utm_source?: unknown;
  utm_medium?: unknown;
  utm_campaign?: unknown;
  utm_content?: unknown;
  utm_term?: unknown;
  at?: unknown;
};

export function siteHosts(requestHost?: string | null): string[] {
  const hosts = new Set<string>(["localhost", "127.0.0.1"]);
  for (const u of [publicSiteUrl(), appUrl()]) {
    const h = hostOf(u);
    if (h) hosts.add(h);
  }
  const base = hostOf(publicSiteUrl());
  if (base) ["my.", "steward."].forEach((p) => hosts.add(p + base));
  if (requestHost) hosts.add(requestHost.split(":")[0].toLowerCase().replace(/^www\./, ""));
  return [...hosts];
}

export function cleanPath(value: unknown): string | null {
  const s = clip(value, 500);
  if (!s || !s.startsWith("/")) return null;
  // Paths only: query strings can carry emails or tokens.
  return s.split(/[?#]/)[0].replace(/\/+$/, "") || "/";
}

export function resolveTouch(touch: TouchPayload | null | undefined, requestHost?: string | null) {
  const path = cleanPath(touch?.path) ?? "/";
  const referrerHost = hostOf(clip(touch?.referrer, 500));
  const utm = {
    utm_source: clip(touch?.utm_source, 120),
    utm_medium: clip(touch?.utm_medium, 120),
    utm_campaign: clip(touch?.utm_campaign, 160),
    utm_content: clip(touch?.utm_content, 160),
    utm_term: clip(touch?.utm_term, 160),
  };
  const hosts = siteHosts(requestHost);
  const { channel, source } = classifyChannel({
    referrerHost,
    siteHosts: hosts,
    landingPath: path,
    utmSource: utm.utm_source,
    utmMedium: utm.utm_medium,
  });
  const external = referrerHost && !hosts.includes(referrerHost) ? referrerHost : null;
  return { path, referrerHost: external, channel, source, ...utm };
}

function clientIp(request: Request): string {
  return (
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "0.0.0.0"
  );
}

/** Daily-rotating, salted hash: counts unique visitors per day without identifying anyone. */
export function visitorHash(request: Request): string {
  const secret = process.env.ANALYTICS_SALT || process.env.SUPABASE_SERVICE_ROLE_KEY || "mjg-analytics";
  const day = new Date().toLocaleDateString("en-CA", { timeZone: "America/Phoenix" });
  const salt = createHmac("sha256", secret).update(`analytics:${day}`).digest("hex");
  return createHash("sha256")
    .update(`${salt}|${clientIp(request)}|${request.headers.get("user-agent") ?? ""}`)
    .digest("hex")
    .slice(0, 32);
}

export function deviceFromUA(ua: string): string {
  const s = ua.toLowerCase();
  if (/ipad|tablet/.test(s)) return "tablet";
  if (/mobi|android|iphone/.test(s)) return "mobile";
  return "desktop";
}

export function countryFrom(request: Request): string | null {
  const c =
    request.headers.get("cf-ipcountry") ||
    request.headers.get("x-vercel-ip-country") ||
    request.headers.get("x-country-code") ||
    request.headers.get("x-geo-country");
  return c && /^[A-Za-z]{2}$/.test(c) && c.toUpperCase() !== "XX" ? c.toUpperCase() : null;
}

/**
 * Saves where a new account came from. Called from /api/auth/register with the
 * tracker's first-touch and current-session context. Never throws: a sign-up
 * must not fail because of analytics.
 */
export async function recordProfileAttribution(
  profileId: string,
  input: { first?: TouchPayload | null; session?: TouchPayload | null },
  requestHost?: string | null,
) {
  try {
    const first = input.first ? resolveTouch(input.first, requestHost) : null;
    const last = input.session ? resolveTouch(input.session, requestHost) : null;
    const firstAt = typeof input.first?.at === "string" && !Number.isNaN(Date.parse(input.first.at)) ? input.first.at : null;
    const pick = first ?? last;
    const { error } = await createSupabaseAdminClient().from("profile_attribution").upsert({
      profile_id: profileId,
      first_seen_at: firstAt,
      first_landing_path: pick?.path ?? null,
      first_referrer_host: pick?.referrerHost ?? null,
      first_channel: pick?.channel ?? "direct",
      first_source: pick?.source ?? null,
      first_utm_source: pick?.utm_source ?? null,
      first_utm_medium: pick?.utm_medium ?? null,
      first_utm_campaign: pick?.utm_campaign ?? null,
      last_landing_path: last?.path ?? null,
      last_channel: last?.channel ?? null,
      last_source: last?.source ?? null,
      last_utm_campaign: last?.utm_campaign ?? null,
    }, { onConflict: "profile_id", ignoreDuplicates: true });
    if (error) console.error("[analytics] attribution failed", error.message);
  } catch (error) {
    console.error("[analytics] attribution failed", error);
  }
}
