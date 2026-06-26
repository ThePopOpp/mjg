import { NextRequest, NextResponse } from "next/server";
import { requireParticipantManager } from "@/lib/user-management/auth";
import { loadBookings } from "@/lib/booking/data";

function errStatus(msg: string) {
  return /authentication/i.test(msg) ? 401 : /permission|required/i.test(msg) ? 403 : 500;
}

export async function GET(request: NextRequest) {
  try {
    await requireParticipantManager(request);
    const upcomingOnly = request.nextUrl.searchParams.get("upcoming") === "1";
    return NextResponse.json({ bookings: await loadBookings({ upcomingOnly }) });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to load bookings";
    return NextResponse.json({ message: msg }, { status: errStatus(msg) });
  }
}
