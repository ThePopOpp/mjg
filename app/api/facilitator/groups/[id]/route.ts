import { NextResponse } from "next/server";
import { requireFacilitator } from "@/lib/user-management/auth";
import { setGroupStatus, updateGroup } from "@/lib/facilitator-groups/repository";
import { groupError } from "@/lib/facilitator-groups/http";

// Edit a group's details ({ group }) and/or change its status ({ status }). Owner or admin.
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const actor = await requireFacilitator(request, body.actionToken);
    let group = body.group ? await updateGroup(actor, id, body.group) : null;
    if (body.status) {
      if (!["draft", "published", "closed", "archived"].includes(body.status)) throw new Error("Invalid status.");
      group = await setGroupStatus(actor, id, body.status);
    }
    if (!group) throw new Error("Nothing to update.");
    return NextResponse.json({ group });
  } catch (error) {
    return groupError(error, "Unable to update the group.");
  }
}
