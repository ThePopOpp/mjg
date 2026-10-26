import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/user-management/auth";
import { decideApproval, getMcpOverview, revokeConnection, setMcpEnabled } from "@/lib/mcp/admin";
import { createAgentToken } from "@/lib/mcp/oauth";
import { AGENT_SCOPE_DOMAINS } from "@/lib/mcp/scopes";
import { resolveTask, setAgentPaused } from "@/lib/agents/tasks";

// Settings → Claude & Agents. Super Admin only.
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await requireSuperAdmin(request);
    return NextResponse.json(await getMcpOverview());
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed." }, { status: 403 });
  }
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Record<string, any>;
  let profile;
  try {
    profile = await requireSuperAdmin(request, body.actionToken);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Not allowed." }, { status: 403 });
  }

  try {
    switch (body.action) {
      case "set_enabled":
        await setMcpEnabled(Boolean(body.enabled), profile.id);
        return NextResponse.json({ ok: true });
      case "revoke":
        await revokeConnection(String(body.id));
        return NextResponse.json({ ok: true });
      case "create_agent_token": {
        const name = String(body.name ?? "").trim();
        const scopes = (Array.isArray(body.scopes) ? body.scopes : []).filter((s: unknown): s is string => {
          if (typeof s !== "string") return false;
          const [domain, level] = s.split(":");
          return AGENT_SCOPE_DOMAINS.some((d) => d.key === domain) && (level === "read" || level === "write");
        });
        if (!name) return NextResponse.json({ error: "Give the agent a name." }, { status: 400 });
        if (!scopes.length) return NextResponse.json({ error: "Choose at least one area." }, { status: 400 });
        // An agent acts on behalf of the Super Admin who issues it, within its scopes.
        const token = await createAgentToken({ name, profileId: profile.id, scopes: ["core:read", ...scopes], createdBy: profile.id, expiresInDays: Number(body.expiresInDays) || undefined });
        return NextResponse.json({ ok: true, ...token });
      }
      case "pause":
      case "resume":
        return NextResponse.json({ ok: true, agent: await setAgentPaused(String(body.id), body.action === "pause") });
      case "resolve_task": {
        const outcome = ["done", "failed", "requeue", "canceled"].includes(body.outcome) ? body.outcome : null;
        if (!outcome) return NextResponse.json({ error: "Unknown outcome." }, { status: 400 });
        return NextResponse.json(await resolveTask({ id: String(body.id), outcome, note: body.note }, { profileId: profile.id, via: "dashboard" }));
      }
      case "approve":
      case "reject": {
        const outcome = await decideApproval(String(body.id), body.action, profile.id);
        return NextResponse.json({ ok: true, result: outcome.result ?? null });
      }
      default:
        return NextResponse.json({ error: "Unknown action." }, { status: 400 });
    }
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed." }, { status: 400 });
  }
}
