import { NextResponse } from "next/server";
import { requireActiveProfile } from "@/lib/user-management/auth";
import { applyForChurchAdmin } from "@/lib/churches/applications";
import { groupError } from "@/lib/facilitator-groups/http";

// Apply to be a church admin. Any signed-in person; a Super Admin approves.
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const actor = await requireActiveProfile(request, body.actionToken);
    const app = await applyForChurchAdmin(actor, body.application ?? {});
    return NextResponse.json({ application: { id: app.id, status: app.status, churchName: app.churchName } });
  } catch (error) {
    return groupError(error, "Unable to send your application.");
  }
}
