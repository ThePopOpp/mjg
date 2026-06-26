import { NextRequest, NextResponse } from "next/server";
import { requireParticipantManager } from "@/lib/user-management/auth";
import { loadBookingTypes, saveBookingType } from "@/lib/booking/data";

function errStatus(msg: string) {
  return /authentication/i.test(msg) ? 401 : /permission|required/i.test(msg) ? 403 : 500;
}

export async function GET(request: NextRequest) {
  try {
    await requireParticipantManager(request);
    return NextResponse.json({ bookingTypes: await loadBookingTypes() });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to load booking types";
    return NextResponse.json({ message: msg }, { status: errStatus(msg) });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    await requireParticipantManager(request, body?.actionToken);
    if (!String(body?.name || "").trim()) throw new Error("A name is required.");
    const bookingType = await saveBookingType(body);
    return NextResponse.json({ bookingType });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to save booking type";
    return NextResponse.json({ message: msg }, { status: errStatus(msg) });
  }
}
