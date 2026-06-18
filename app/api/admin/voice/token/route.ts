import { NextResponse } from "next/server";
import { requireParticipantManager } from "@/lib/user-management/auth";
import { generateVoiceAccessToken } from "@/lib/twilio/voice";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const actor = await requireParticipantManager(request, body.actionToken);
    const identity = "mjg-agent";
    const token = generateVoiceAccessToken(actor.id, identity);
    return NextResponse.json({ token, identity });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to generate voice token.";
    const httpStatus = message.includes("required") || message.includes("permission") ? 403 : 500;
    return NextResponse.json({ error: message }, { status: httpStatus });
  }
}
