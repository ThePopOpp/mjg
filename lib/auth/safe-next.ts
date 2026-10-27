/**
 * A ?next= destination, accepted only as a same-origin path. A value starting "//" or
 * containing a backslash can address another host and would be an open redirect.
 */
export function safeNextPath(raw: string | null | undefined, fallback = "/dashboard"): string {
  if (!raw) return fallback;
  if (!raw.startsWith("/")) return fallback;
  if (raw.startsWith("//") || raw.includes("\\")) return fallback;
  return raw;
}
