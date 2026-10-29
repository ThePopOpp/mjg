import { NextResponse } from "next/server";
import { requireActiveProfile } from "@/lib/user-management/auth";
import { decideFacilitatorApplication } from "@/lib/churches/repository";
import { groupError } from "@/lib/facilitator-groups/http";

// Approve/reject a facilitator application ({ decision, note }). That church's admin or a Super Admin.
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const actor = await requireActiveProfile(request, body.actionToken);
    return NextResponse.json({ application: await decideFacilitatorApplication(actor, id, body.decision, body.note) });
  } catch (error) {
    return groupError(error, "Unable to decide the application.");
  }
}
