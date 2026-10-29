import { NextResponse } from "next/server";
import { requireFacilitator } from "@/lib/user-management/auth";
import { submitFacilitatorApplication } from "@/lib/churches/repository";
import { groupError } from "@/lib/facilitator-groups/http";

// A facilitator asks their church to approve them ({ churchId, message }).
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const actor = await requireFacilitator(request, body.actionToken);
    return NextResponse.json({ application: await submitFacilitatorApplication(actor, { churchId: String(body.churchId ?? ""), message: body.message }) });
  } catch (error) {
    return groupError(error, "Unable to send your application.");
  }
}
