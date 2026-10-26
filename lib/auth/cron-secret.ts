import { createHash, timingSafeEqual } from "node:crypto";

// Shared-secret checks for unattended callers (Coolify scheduled tasks, agent
// heartbeats). Constant-time, so response timing can't leak the secret; both
// sides are hashed first so differing lengths don't short-circuit either.

export function presentedSecret(request: Request, body?: { secret?: unknown }): string {
  return (
    request.headers.get("x-cron-secret") ||
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim() ||
    (typeof body?.secret === "string" ? body.secret : "")
  );
}

/** True when `presented` equals the secret in env var `envName` (false if either is empty). */
export function cronSecretMatches(presented: string | null | undefined, envName = "EXPERIENCE_CRON_SECRET"): boolean {
  const secret = process.env[envName];
  if (!secret || !presented) return false;
  const a = createHash("sha256").update(presented).digest();
  const b = createHash("sha256").update(secret).digest();
  return timingSafeEqual(a, b);
}
