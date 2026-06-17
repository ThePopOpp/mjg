import { NextResponse } from "next/server";
import { sendDueJourneyEmails } from "@/lib/email/templates";
import { requireUserManager } from "@/lib/user-management/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const actor = await requireUserManager(request, body.actionToken);
    const result = await sendDueJourneyEmails({ actorUserId: actor.id, limit: Number(body.limit ?? 10) });
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to send due journey emails.";
    const status = message.includes("permission") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
