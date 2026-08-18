import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/user-management/auth";
import { setFacilitatorChallengeAccess } from "@/lib/facilitator/access";

// Super-Admin only: set which challenge types a facilitator can start/see.
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const actor = await requireSuperAdmin(request, body.actionToken);
    const facilitatorId = String(body.facilitatorId ?? "").trim();
    if (!facilitatorId) return NextResponse.json({ error: "A facilitator is required." }, { status: 400 });
    const typeIds = Array.isArray(body.typeIds) ? body.typeIds.filter((t: unknown) => typeof t === "string") : [];
    const result = await setFacilitatorChallengeAccess(facilitatorId, typeIds, actor.id);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update challenge access.";
    const status = message.includes("permission") || message.includes("Authentication") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
