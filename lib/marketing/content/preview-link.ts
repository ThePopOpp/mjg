import { createHmac, timingSafeEqual } from "node:crypto";

// Preview links for unpublished marketing content. A link opens the real page
// with drafts shown (Next draft mode) for whoever holds it, for one hour — so a
// draft made from Claude can be checked on any device before it's published.
// Signed, so only links the app issued work, and only for site paths.

const TTL_MS = 60 * 60 * 1000;

function secret(): string {
  const value = process.env.MCP_OAUTH_SECRET || process.env.SUPABASE_JWT_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!value) throw new Error("Preview signing secret is not configured.");
  return value;
}

function sign(path: string, exp: number) {
  return createHmac("sha256", secret()).update(`content-preview\n${path}\n${exp}`).digest("base64url");
}

export function isSitePath(path: string): boolean {
  return path.startsWith("/") && !path.startsWith("//") && !path.includes("\\") && !/^\/(api|dashboard)(\/|$)/.test(path);
}

/** A relative preview URL for `path` (prefix it with the site origin). */
export function contentPreviewUrl(path: string): { url: string; expiresAt: string } {
  if (!isSitePath(path)) throw new Error(`Not a previewable page path: ${path}`);
  const exp = Date.now() + TTL_MS;
  const qs = new URLSearchParams({ path, exp: String(exp), sig: sign(path, exp) });
  return { url: `/api/site-content/preview?${qs}`, expiresAt: new Date(exp).toISOString() };
}

export function verifyContentPreview(path: string, exp: number, sig: string): boolean {
  if (!isSitePath(path) || !Number.isFinite(exp) || exp < Date.now()) return false;
  const expected = Buffer.from(sign(path, exp));
  const given = Buffer.from(sig);
  return expected.length === given.length && timingSafeEqual(expected, given);
}
