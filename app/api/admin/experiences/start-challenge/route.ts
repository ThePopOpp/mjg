import { NextResponse } from "next/server";
import { requireExperienceManager } from "@/lib/user-management/auth";
import { startChallengeForAdmin } from "@/lib/experiences/admin-start";

// Admin "Start New Challenge" launcher: create the experience for any challenge/series,
// invite recipients, optionally start the drip, and set facilitator visibility.
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const actor = await requireExperienceManager(request, body.actionToken);
    if (!body.experienceTypeId) {
      return NextResponse.json({ error: "Select a challenge to start." }, { status: 400 });
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(body.startDate ?? ""))) {
      return NextResponse.json({ error: "A valid start date is required." }, { status: 400 });
    }
    const result = await startChallengeForAdmin(actor.id, {
      experienceTypeId: String(body.experienceTypeId),
      name: typeof body.name === "string" ? body.name : undefined,
      attendees: Array.isArray(body.attendees) ? body.attendees : [],
      frequency: body.frequency === "biweekly" ? "biweekly" : "weekly",
      startDate: String(body.startDate),
      startTime: typeof body.startTime === "string" ? body.startTime : "09:00",
      facilitatorId: typeof body.facilitatorId === "string" ? body.facilitatorId : null,
      sendInvitations: body.sendInvitations !== false,
      invitationSendAt: typeof body.invitationSendAt === "string" ? body.invitationSendAt : null,
      startChallenge: body.startChallenge !== false,
      // Admins are NOT assumed to be the facilitator — this is an explicit opt-in.
      joinAsFacilitator: body.joinAsFacilitator === true,
      facilitatorEmailTrack: body.facilitatorEmailTrack === "participant" ? "participant" : "leader",
      visibility:
        body.visibility && typeof body.visibility === "object"
          ? { mode: body.visibility.mode === "all" ? "all" : body.visibility.mode === "select" ? "select" : "none", facilitatorIds: Array.isArray(body.visibility.facilitatorIds) ? body.visibility.facilitatorIds : [] }
          : undefined,
    });
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to start the challenge.";
    const status = message.includes("permission") || message.includes("required") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
