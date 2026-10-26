import { NextResponse } from "next/server";
import { requireParticipantManager } from "@/lib/user-management/auth";
import { listCalls } from "@/lib/twilio/calls";

// Call log for the dashboard; shared with the Claude connector (lib/twilio/calls.ts).
export async function GET(request: Request) {
  try {
    await requireParticipantManager(request);
    const { searchParams } = new URL(request.url);
    const calls = await listCalls({
      limit: parseInt(searchParams.get("limit") ?? "50"),
      offset: parseInt(searchParams.get("offset") ?? "0"),
      direction: searchParams.get("direction"),
      voicemailOnly: searchParams.get("voicemail") === "true",
    });
    return NextResponse.json({ calls });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch calls.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
