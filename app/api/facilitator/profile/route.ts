import { NextResponse } from "next/server";
import { requireFacilitator } from "@/lib/user-management/auth";
import { isGroupAdmin, saveFacilitatorProfile } from "@/lib/facilitator-groups/repository";
import { groupError } from "@/lib/facilitator-groups/http";

// The facilitator's public profile (shown on their listings and /facilitators/<slug>).
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const actor = await requireFacilitator(request, body.actionToken);
    const owner = typeof body.profileId === "string" && body.profileId && isGroupAdmin(actor.role) ? body.profileId : actor.id;
    const profile = await saveFacilitatorProfile(owner, body.profile ?? {});
    return NextResponse.json({ profile });
  } catch (error) {
    return groupError(error, "Unable to save your profile.");
  }
}
