import { NextResponse } from "next/server";
import { requireParticipantManager } from "@/lib/user-management/auth";
import { transcribeCall } from "@/lib/twilio/calls";

// On-demand transcription of a call recording (or voicemail) via OpenAI Whisper.
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const body = await request.json().catch(() => ({}));
    await requireParticipantManager(request, body.actionToken);
    const { id } = await params;
    return NextResponse.json(await transcribeCall(id, body.target === "voicemail" ? "voicemail" : "recording"));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to transcribe recording.";
    const status = message === "Call not found." ? 404 : message.startsWith("No recording") ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
