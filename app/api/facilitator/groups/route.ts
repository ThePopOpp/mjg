import { NextResponse } from "next/server";
import { requireFacilitator } from "@/lib/user-management/auth";
import { createGroup, isGroupAdmin, listGroupsForFacilitator } from "@/lib/facilitator-groups/repository";
import { groupError } from "@/lib/facilitator-groups/http";

export async function GET(request: Request) {
  try {
    const actor = await requireFacilitator(request);
    // Admins may load another facilitator's groups (?facilitator=<profile id>).
    const other = new URL(request.url).searchParams.get("facilitator");
    const owner = other && isGroupAdmin(actor.role) ? other : actor.id;
    return NextResponse.json({ groups: await listGroupsForFacilitator(owner) });
  } catch (error) {
    return groupError(error, "Unable to load groups.");
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const actor = await requireFacilitator(request, body.actionToken);
    const owner = typeof body.facilitatorId === "string" && body.facilitatorId && isGroupAdmin(actor.role) ? body.facilitatorId : actor.id;
    const group = await createGroup(owner, body.group ?? {}, actor.id);
    return NextResponse.json({ group });
  } catch (error) {
    return groupError(error, "Unable to create the group.");
  }
}
