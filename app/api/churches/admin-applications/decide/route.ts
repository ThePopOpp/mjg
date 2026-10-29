import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/user-management/auth";
import { decideChurchAdminApplication } from "@/lib/churches/applications";
import { groupError } from "@/lib/facilitator-groups/http";

// Approve/reject a church admin application: { id } from the dashboard or { token } from the
// emailed/texted link (single-use). Always requires a signed-in Super Admin.
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const actor = await requireSuperAdmin(request, body.actionToken);
    const result = await decideChurchAdminApplication(actor, {
      id: typeof body.id === "string" ? body.id : undefined,
      token: typeof body.token === "string" ? body.token : undefined,
      decision: body.decision,
      note: body.note,
    });
    return NextResponse.json(result);
  } catch (error) {
    return groupError(error, "Unable to decide the application.");
  }
}
