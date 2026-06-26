import { NextRequest, NextResponse } from "next/server";
import { requireParticipantManager } from "@/lib/user-management/auth";
import { loadAvailability, loadDateOverrides, replaceAvailability } from "@/lib/booking/data";

function errStatus(msg: string) {
  return /authentication/i.test(msg) ? 401 : /permission|required/i.test(msg) ? 403 : 500;
}

export async function GET(request: NextRequest) {
  try {
    await requireParticipantManager(request);
    const typeId = request.nextUrl.searchParams.get("booking_type_id");
    if (!typeId) throw new Error("booking_type_id is required.");
    const [rules, overrides] = await Promise.all([loadAvailability(typeId), loadDateOverrides(typeId)]);
    return NextResponse.json({ rules, overrides });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to load availability";
    return NextResponse.json({ message: msg }, { status: errStatus(msg) });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    await requireParticipantManager(request, body?.actionToken);
    const typeId = String(body?.booking_type_id || "");
    if (!typeId) throw new Error("booking_type_id is required.");
    const rules = Array.isArray(body?.rules) ? body.rules : [];
    return NextResponse.json({ rules: await replaceAvailability(typeId, rules) });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to save availability";
    return NextResponse.json({ message: msg }, { status: errStatus(msg) });
  }
}
