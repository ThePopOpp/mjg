import { NextResponse } from "next/server";
import { requireActiveProfile } from "@/lib/user-management/auth";
import { updateChurchProfile } from "@/lib/churches/profile";
import { groupError } from "@/lib/facilitator-groups/http";

// Save a church's public profile. The church's own admins (and Super Admins) only —
// checked in updateChurchProfile against church_admins, not the caller's role alone.
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const actor = await requireActiveProfile(request, body.actionToken);
    const { actionToken: _token, ...input } = body ?? {};
    const church = await updateChurchProfile(actor, id, input);
    return NextResponse.json({ ok: true, church });
  } catch (error) {
    return groupError(error, "Unable to save the church profile.");
  }
}
