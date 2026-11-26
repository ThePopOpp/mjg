// Annual Retreat Guide: the constants every part shares (page, API, emails, tests).
// Pure module: no database, no React. Source brief:
// docs/squeeze-page/MJG_Annual_Retreat_Jeremy_Handoff/Email_to_Jeremy.txt

export const SOURCE = "annual_retreat_guide";
export const LANDING_PATH = "/annual-retreat";
export const THANK_YOU_PATH = "/annual-retreat/thank-you";
export const GUIDE_PATH = "/annual-retreat/guide";
export const STEWARD_PATH = "/meet-steward";

/** The optional checkbox, word for word. Stored with every consent. */
export const MARKETING_CONSENT_TEXT =
  "Also send me a short series to help me use the guide and occasional Stewardship Blueprint reflections and resources. I can unsubscribe at any time.";

export const SENDER_NAME = "Michael J. Gauthier";

const DAY = 86_400_000;

/** Follow-ups 2–5, timed from the successful guide request. Email 1 (delivery) is sent by the request itself. */
export const FOLLOWUP_STEPS = [
  { key: "remember_release", offsetMs: 2 * DAY, day: 2 },
  { key: "discern_diagnose", offsetMs: 5 * DAY, day: 5 },
  { key: "design_live", offsetMs: 8 * DAY, day: 8 },
  { key: "steward_next_step", offsetMs: 12 * DAY, day: 12 },
] as const;

export type FollowupKey = (typeof FOLLOWUP_STEPS)[number]["key"];

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const ATTEMPT_RE = /^[A-Za-z0-9_-]{8,64}$/;

export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "https://michaeljgauthier.com").replace(/\/$/, "");
}

/** The stable download link. `via` separates email clicks from page clicks; never carries personal data. */
export function guideUrl(via?: "email" | "page", base = siteUrl()): string {
  return `${base}${GUIDE_PATH}${via ? `?via=${via}` : ""}`;
}

export function stewardUrl(base = siteUrl()): string {
  return `${base}${STEWARD_PATH}`;
}

/** Campaign links for Mike's three download-focused posts (utm values from his brief). */
export const SOCIAL_SOURCES = ["facebook", "instagram", "linkedin"] as const;
export const SOCIAL_CONTENT = ["retreat_01", "retreat_03", "retreat_06"] as const;
export const CAMPAIGN = "annual_retreat_2026";

export function trackedLink(source: string, content: string, campaign = CAMPAIGN, base = siteUrl()): string {
  const q = new URLSearchParams({ utm_source: source, utm_medium: "organic_social", utm_campaign: campaign, utm_content: content });
  return `${base}${LANDING_PATH}?${q.toString()}`;
}

export function allTrackedLinks(base = siteUrl()) {
  return SOCIAL_CONTENT.flatMap((content) => SOCIAL_SOURCES.map((source) => ({ source, content, url: trackedLink(source, content, CAMPAIGN, base) })));
}
