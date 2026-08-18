import { NextResponse } from "next/server";
import { requireFacilitator } from "@/lib/user-management/auth";
import { startChallengeForFacilitator } from "@/lib/facilitator/experiences";

// Facilitator "Start 6-Week Challenge" launcher: create the experience for their group,
// optionally invite participants, and optionally start the drip.
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const actor = await requireFacilitator(request, body.actionToken);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(body.startDate ?? ""))) {
      return NextResponse.json({ error: "A valid start date is required." }, { status: 400 });
    }
    const result = await startChallengeForFacilitator(actor.id, {
      attendees: Array.isArray(body.attendees) ? body.attendees : [],
      frequency: body.frequency === "biweekly" ? "biweekly" : "weekly",
      startDate: String(body.startDate),
      startTime: typeof body.startTime === "string" ? body.startTime : "09:00",
      sendInvitations: body.sendInvitations !== false,
      invitationSendAt: typeof body.invitationSendAt === "string" ? body.invitationSendAt : null,
      startChallenge: body.startChallenge !== false,
    });
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to start the challenge.";
    const status = message.includes("permission") || message.includes("required") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
