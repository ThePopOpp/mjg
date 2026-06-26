import { NextRequest, NextResponse } from "next/server";
import { requireParticipantManager } from "@/lib/user-management/auth";
import { loadEvents, saveEvent } from "@/lib/booking/data";

function errStatus(msg: string) {
  return /authentication/i.test(msg) ? 401 : /permission|required/i.test(msg) ? 403 : 500;
}

export async function GET(request: NextRequest) {
  try {
    await requireParticipantManager(request);
    return NextResponse.json({ events: await loadEvents() });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to load events";
    return NextResponse.json({ message: msg }, { status: errStatus(msg) });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    await requireParticipantManager(request, body?.actionToken);
    if (!String(body?.title || "").trim()) throw new Error("A title is required.");
    if (!String(body?.start_at || "").trim()) throw new Error("A start date/time is required.");
    const event = await saveEvent(body);
    return NextResponse.json({ event });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to save event";
    return NextResponse.json({ message: msg }, { status: errStatus(msg) });
  }
}
