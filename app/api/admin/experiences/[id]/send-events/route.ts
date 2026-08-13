import { NextResponse } from "next/server";
import { requireExperienceManager } from "@/lib/user-management/auth";
import { rescheduleSendEvent } from "@/lib/experiences/repository";
import { sendExperienceEventNow } from "@/lib/experiences/scheduler";

// Per-email controls on the experience schedule: reschedule a not-yet-sent email
// (`scheduledAt`), or fire one immediately (`action: "send-now"`).
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const actor = await requireExperienceManager(request, body.actionToken);
    if (!body.eventId) return NextResponse.json({ error: "A scheduled email is required." }, { status: 400 });

    if (body.action === "send-now") {
      const result = await sendExperienceEventNow(String(body.eventId), actor.id);
      return NextResponse.json({ ok: true, ...result });
    }

    if (typeof body.scheduledAt === "string") {
      const result = await rescheduleSendEvent(id, String(body.eventId), body.scheduledAt);
      return NextResponse.json({ ok: true, ...result });
    }

    return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update the scheduled email.";
    const status = message.includes("permission") ? 403 : message.includes("not found") ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
