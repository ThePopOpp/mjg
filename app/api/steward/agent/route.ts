import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { AGENT_TOOLS, StewardToolError, isAgentTool, profileForPrincipal } from "@/lib/steward/agent-tools";

// The agent's door into this application.
//
// Steward runs in its own container and cannot reach the database. Every tool
// it has comes through here, which means there is exactly ONE implementation of
// the Blueprint rules — this app's services — and the agent is a conversational
// layer with no privileges of its own.
//
// TWO CREDENTIALS, AND WHY BOTH ARE NEEDED
// ----------------------------------------
//   1. A shared secret proves the caller is our agent container. Without it
//      this endpoint would be an open proxy to every member's Blueprint.
//   2. A principal id says WHICH member, and the agent only has one because it
//      verified that member's Supabase token itself.
//
// The secret alone would let anyone holding it act as any member, so it is
// treated as a service credential: never in the client bundle, never logged,
// and compared in constant time. If it is ever exposed, rotate it on both
// resources — the member's own session is unaffected.
//
// Unset means closed. No default, no development bypass: a missing secret
// returns 503 rather than quietly accepting everything, because the failure
// mode of the alternative is silent and total.

export const dynamic = "force-dynamic";

function secretMatches(provided: string | null): boolean {
  const expected = process.env.STEWARD_AGENT_SECRET;
  if (!expected || !provided) return false;

  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  // timingSafeEqual throws on a length mismatch, which would itself leak the
  // length. Compare lengths first and keep the comparison constant-time.
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  if (!process.env.STEWARD_AGENT_SECRET) {
    return NextResponse.json(
      { ok: false, error: "Steward tools are not configured." },
      { status: 503 },
    );
  }

  if (!secretMatches(request.headers.get("x-steward-agent-secret"))) {
    return NextResponse.json({ ok: false, error: "Not permitted." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const tool = typeof body?.tool === "string" ? body.tool : null;
  const principalId = typeof body?.principalId === "string" ? body.principalId : null;
  const args = (body?.args ?? {}) as Record<string, unknown>;

  if (!tool || !principalId) {
    return NextResponse.json({ ok: false, error: "tool and principalId are required." }, { status: 400 });
  }
  if (!isAgentTool(tool)) {
    return NextResponse.json({ ok: false, error: `"${tool}" is not a Steward tool.` }, { status: 400 });
  }

  // The principal is a Supabase auth user. A member whose profile is missing or
  // inactive gets nothing — including no hint about which it was.
  const profile = await profileForPrincipal(principalId);
  if (!profile) {
    return NextResponse.json({ ok: false, error: "No active member for that session." }, { status: 403 });
  }

  try {
    // Every tool is called with the profile resolved HERE, never one supplied
    // by the caller. A confused or manipulated model cannot address anyone else.
    const run = AGENT_TOOLS[tool] as (profileId: string, args: unknown) => Promise<unknown>;
    const result = await run(profile.id, args);
    return NextResponse.json({ ok: true, result });
  } catch (e) {
    // A tool error is a message FOR the model — it is how Steward learns it
    // asked for a field that does not exist. Anything else is ours to keep.
    if (e instanceof StewardToolError) {
      return NextResponse.json({ ok: false, error: e.message }, { status: 400 });
    }
    console.error("[steward/agent] tool failed", tool, e);
    return NextResponse.json({ ok: false, error: "That did not work." }, { status: 500 });
  }
}
