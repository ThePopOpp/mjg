// Per-token limits on MCP tool calls. In memory: the app runs as one container
// on Coolify, so a per-process window is accurate. (If it ever scales out, move
// this to Postgres or Redis.) The point is a brake on a runaway loop, not billing.

const WINDOW_MS = 60_000;
const LIMITS = { all: 120, high: 15 } as const;

const hits = new Map<string, number[]>();

function take(key: string, limit: number): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= limit) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);
  return true;
}

/** False when this token has made too many calls in the last minute. */
export function allowCall(tokenId: string, risk: "read" | "write" | "high"): boolean {
  if (!take(`all:${tokenId}`, LIMITS.all)) return false;
  return risk !== "high" || take(`high:${tokenId}`, LIMITS.high);
}
