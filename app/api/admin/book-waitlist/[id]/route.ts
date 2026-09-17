import { NextResponse } from "next/server";
import { requireParticipantManager } from "@/lib/user-management/auth";
import { updateBookWaitlistStatus, type WaitlistStatus } from "@/lib/book-waitlist/repository";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    await requireParticipantManager(request, body.actionToken);
    const result = await updateBookWaitlistStatus(id, body.status as WaitlistStatus);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update the request.";
    const status = /authentication|required|denied|permission/i.test(message) ? 401 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
