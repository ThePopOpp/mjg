import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { getStewardConfigOrNull } from "@/lib/steward/config";

// Which model Steward uses, resolved at session start.
//
// Separate from /api/steward/agent because it is NOT about a member: there is
// no principal here, and nothing member-specific is returned. It answers one
// question — which model, from which provider — so a Super Admin can change it
// from the dashboard and have the next conversation use it, with no redeploy.
//
// Authenticated with the same service secret. A leak would let someone read
// which model we run, which is not sensitive, but the endpoint stays closed
// because an open endpoint on this app is a thing to maintain forever.

export const dynamic = "force-dynamic";

/** Used when the setting is unset or unreachable. Pinned, never eve's default. */
const FALLBACK = { provider: "openai", model: "gpt-4o-mini" } as const;

function secretMatches(provided: string | null): boolean {
  const expected = process.env.STEWARD_AGENT_SECRET;
  if (!expected || !provided) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function GET(request: Request) {
  if (!secretMatches(request.headers.get("x-steward-agent-secret"))) {
    return NextResponse.json({ error: "Not permitted." }, { status: 401 });
  }

  const [provider, model, instructionVersion] = await Promise.all([
    getStewardConfigOrNull("agent.model.provider").catch(() => null),
    getStewardConfigOrNull("agent.model.id").catch(() => null),
    getStewardConfigOrNull("agent.instruction_version").catch(() => null),
  ]);

  // An unset model falls back rather than failing the session: a member mid
  // conversation should not lose Steward because a setting was cleared. The
  // response says which happened, so the fallback is visible rather than
  // looking like a deliberate choice.
  const resolved = {
    provider: typeof provider === "string" && provider ? provider : FALLBACK.provider,
    model: typeof model === "string" && model ? model : FALLBACK.model,
    instructionVersion: typeof instructionVersion === "string" ? instructionVersion : null,
    usedFallback: !(typeof model === "string" && model),
  };

  return NextResponse.json(resolved);
}
