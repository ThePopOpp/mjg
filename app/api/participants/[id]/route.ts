import { NextResponse } from "next/server";
import { updateParticipant, updateParticipantTags } from "@/lib/dashboard/pilot-data";
import { requireParticipantManager } from "@/lib/user-management/auth";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const actor = await requireParticipantManager();
    const { id } = await params;
    const body = await request.json();

    const participant = await updateParticipant({
      id,
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      phone: body.phone,
      wave: body.wave,
      source: body.source,
      relationshipCategory: body.relationshipCategory,
      participantType: body.participantType,
      checkInStatus: body.checkInStatus,
      journeyStatus: body.journeyStatus,
      surveyStatus: body.surveyStatus,
      innerCircleStatus: body.innerCircleStatus,
      storyPermissionGranted: Boolean(body.storyPermissionGranted),
      followUpPermissionGranted: Boolean(body.followUpPermissionGranted),
      notes: body.notes,
      actorId: actor.id,
    });

    return NextResponse.json({ ok: true, participant });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Participant update failed.";
    const status = message.includes("required") || message.includes("permission") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const actor = await requireParticipantManager();
    const { id } = await params;
    const body = await request.json();

    const result = await updateParticipantTags({
      participantId: id,
      tagIds: Array.isArray(body.tagIds) ? body.tagIds : [],
      actorId: actor.id,
    });

    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Participant tag update failed.";
    const status = message.includes("required") || message.includes("permission") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
