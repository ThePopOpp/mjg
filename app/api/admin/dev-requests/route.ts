import { NextResponse } from "next/server";
import { listDevRequests, updateDevRequestStatus, upsertDevRequest } from "@/lib/dev-requests/repository";
import { requireSuperAdmin } from "@/lib/user-management/auth";

function errorResponse(error: unknown, fallback: string) {
  const message = error instanceof Error ? error.message : fallback;
  const status = message.includes("Authentication required") ? 401 : message.toLowerCase().includes("permission") ? 403 : 500;
  return NextResponse.json({ error: message }, { status });
}

export async function GET(request: Request) {
  try {
    await requireSuperAdmin(request);
    const url = new URL(request.url);
    const status = (url.searchParams.get("status") ?? "active") as never;
    const requests = await listDevRequests({ status });
    return NextResponse.json({ ok: true, requests });
  } catch (error) {
    return errorResponse(error, "Failed to load dev requests.");
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const actor = await requireSuperAdmin(request, body.actionToken);
    const action = body.action ?? "upsert";

    if (action === "update_status") {
      const updated = await updateDevRequestStatus({ id: body.id, status: body.status, stewardBrief: body.stewardBrief });
      return NextResponse.json({ ok: true, request: updated });
    }

    const created = await upsertDevRequest({
      sourceType: body.sourceType,
      sourceId: body.sourceId,
      title: body.title,
      body: body.body,
      fileUrl: body.fileUrl,
      pageTarget: body.pageTarget,
      requestKind: body.requestKind,
      priority: body.priority,
      metadata: body.metadata,
      actorUserId: actor.id,
      actorEmail: actor.email,
    });
    return NextResponse.json({ ok: true, request: created });
  } catch (error) {
    return errorResponse(error, "Failed to queue dev request.");
  }
}
