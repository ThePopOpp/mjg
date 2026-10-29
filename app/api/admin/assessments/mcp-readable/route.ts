import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/user-management/auth";
import { logUserActivity } from "@/lib/user-management/repository";
import { getMcpReadableMap, setMcpReadable } from "@/lib/assessments/mcp-access";

// The "Readable by MCP" switch on each assessment's setup screen. Super Admin only.

function errStatus(m: string) { return /authentication/i.test(m) ? 401 : /permission|required|super/i.test(m) ? 403 : 400; }

export async function GET(request: Request) {
  try {
    await requireSuperAdmin(request);
    const key = new URL(request.url).searchParams.get("assessment");
    const map = await getMcpReadableMap();
    return NextResponse.json(key ? { assessment: key, mcpReadable: map.get(key) === true } : { readable: Object.fromEntries(map) });
  } catch (error) {
    const m = error instanceof Error ? error.message : "Failed to load.";
    return NextResponse.json({ error: m }, { status: errStatus(m) });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const actor = await requireSuperAdmin(request, body?.actionToken);
    const key = typeof body?.assessment === "string" ? body.assessment.trim() : "";
    if (!key || typeof body?.readable !== "boolean") return NextResponse.json({ error: "assessment and readable are required." }, { status: 400 });
    const result = await setMcpReadable(key, body.readable, actor.id);
    await logUserActivity({ actorUserId: actor.id, action: "assessment_mcp_readable_set", entityType: "assessment", metadata: { assessment: key, readable: body.readable } }).catch(() => {});
    return NextResponse.json(result);
  } catch (error) {
    const m = error instanceof Error ? error.message : "Could not save.";
    return NextResponse.json({ error: m }, { status: errStatus(m) });
  }
}
