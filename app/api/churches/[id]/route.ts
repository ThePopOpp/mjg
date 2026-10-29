import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/user-management/auth";
import { softDeleteChurch, updateChurch } from "@/lib/churches/repository";
import { groupError } from "@/lib/facilitator-groups/http";

// Edit a church ({ church }: name/city/state/website/status). Super Admin.
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const actor = await requireSuperAdmin(request, body.actionToken);
    return NextResponse.json({ church: await updateChurch(actor, id, body.church ?? {}) });
  } catch (error) {
    return groupError(error, "Unable to update the church.");
  }
}

// Soft delete (restorable). Super Admin.
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const actor = await requireSuperAdmin(request);
    return NextResponse.json(await softDeleteChurch(actor, id));
  } catch (error) {
    return groupError(error, "Unable to delete the church.");
  }
}
