import { NextResponse } from "next/server";
import { requireFacilitator } from "@/lib/user-management/auth";
import { assertCanManageExperience } from "@/lib/experiences/bulk";
import { getAutomationStatus } from "@/lib/experiences/automation";

/**
 * A facilitator's own group email schedule.
 *
 * Same two-stage authorisation as the bulk route: requireFacilitator opens the
 * door, assertCanManageExperience scopes a facilitator to groups they run so
 * they cannot read another facilitator's sequence by guessing an id.
 */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const actor = await requireFacilitator(request);
    await assertCanManageExperience(id, { id: actor.id, role: actor.role });

    const status = await getAutomationStatus(id);
    if (!status) return NextResponse.json({ error: "That group was not found." }, { status: 404 });

    return NextResponse.json({ steps: status.steps, nextSendAt: status.nextSendAt, totals: status.totals });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not load the schedule.";
    const status = /permission|only change/i.test(message) ? 403 : /not found/i.test(message) ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
