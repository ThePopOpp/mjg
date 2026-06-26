import { NextRequest, NextResponse } from "next/server";
import { requireParticipantManager } from "@/lib/user-management/auth";
import { loadRegistrations } from "@/lib/booking/data";

function errStatus(msg: string) {
  return /authentication/i.test(msg) ? 401 : /permission|required/i.test(msg) ? 403 : 500;
}

export async function GET(request: NextRequest) {
  try {
    await requireParticipantManager(request);
    const eventId = request.nextUrl.searchParams.get("event_id") || undefined;
    return NextResponse.json({ registrations: await loadRegistrations({ eventId }) });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to load registrations";
    return NextResponse.json({ message: msg }, { status: errStatus(msg) });
  }
}
