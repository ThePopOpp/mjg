import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/user-management/auth";
import { assignChurchAdmin, removeChurchAdmin } from "@/lib/churches/repository";
import { groupError } from "@/lib/facilitator-groups/http";

// Assign ({ email } or { profileId }) or remove ({ profileId }) a church admin. Super Admin.
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const actor = await requireSuperAdmin(request, body.actionToken);
    return NextResponse.json(await assignChurchAdmin(actor, { churchId: id, email: body.email, profileId: body.profileId }));
  } catch (error) {
    return groupError(error, "Unable to assign the church admin.");
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const actor = await requireSuperAdmin(request, body.actionToken);
    return NextResponse.json(await removeChurchAdmin(actor, { churchId: id, profileId: String(body.profileId ?? "") }));
  } catch (error) {
    return groupError(error, "Unable to remove the church admin.");
  }
}
