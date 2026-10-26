import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

// Opaque credentials for the MCP. Only SHA-256 hashes are stored, so a database
// leak can't be replayed. Prefixes make a leaked token easy to recognise (and
// to search for in logs or repos).

export const PREFIX = {
  access: "mjg_at_",
  refresh: "mjg_rt_",
  agent: "mjg_ag_",
  code: "mjg_ac_",
  client: "mjg_cl_",
} as const;

export const ACCESS_TTL_SECONDS = 60 * 60; // 1 hour
export const REFRESH_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days
export const CODE_TTL_SECONDS = 5 * 60;

export function newSecret(prefix: string): string {
  return prefix + randomBytes(32).toString("base64url");
}

export function hashSecret(secret: string): string {
  return createHash("sha256").update(secret).digest("hex");
}

/** Constant-time string comparison (equal-length hex/base64url strings). */
export function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

/** PKCE S256: base64url(sha256(verifier)) must equal the stored challenge. */
export function verifyPkce(verifier: string, challenge: string): boolean {
  if (!/^[A-Za-z0-9\-._~]{43,128}$/.test(verifier)) return false;
  const computed = createHash("sha256").update(verifier).digest("base64url");
  return safeEqual(computed, challenge);
}

export function secondsFromNow(seconds: number): string {
  return new Date(Date.now() + seconds * 1000).toISOString();
}
