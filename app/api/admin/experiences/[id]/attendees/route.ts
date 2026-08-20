import { NextResponse } from "next/server";
import { requireExperienceManager } from "@/lib/user-management/auth";
import { addAttendeeToExperience } from "@/lib/experiences/add-attendee";

// Add a participant to an experience that's already running (mid-challenge).
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const actor = await requireExperienceManager(request, body.actionToken);
    const result = await addAttendeeToExperience(
      id,
      { name: typeof body.name === "string" ? body.name : undefined, email: String(body.email ?? ""), sendInvitation: body.sendInvitation === true },
      actor.id,
    );
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to add participant.";
    const status = message.includes("permission") ? 403 : message.includes("not found") ? 404 : message.includes("valid email") ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
