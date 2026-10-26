import { NextResponse } from "next/server";
import { requireParticipantManager } from "@/lib/user-management/auth";
import { updateCall } from "@/lib/twilio/calls";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const body = await request.json();
    await requireParticipantManager(request, body.actionToken);
    const { id } = await params;
    return NextResponse.json(await updateCall(id, { notes: body.notes, status: body.status }));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update call.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
