import { NextResponse } from "next/server";
import { requireParticipantManager } from "@/lib/user-management/auth";
import { SmsConsentError, sendOneSms } from "@/lib/sms/outbound";

// Send one text from the dashboard. The logic (consent check, template merge,
// thread, Twilio) is shared with the Claude connector in lib/sms/outbound.ts.
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const actor = await requireParticipantManager(request, body.actionToken);

    const to = String(body.to ?? "").trim();
    const rawBody = String(body.body ?? "").trim();
    const templateId: string | null = body.templateId ?? null;
    if (!to) return NextResponse.json({ error: "Recipient phone number is required." }, { status: 400 });
    if (!rawBody && !templateId) return NextResponse.json({ error: "Message body or template is required." }, { status: 400 });

    const result = await sendOneSms({
      to,
      body: rawBody,
      templateId,
      recipientId: body.recipientId ?? null,
      recipientType: body.recipientType ?? "manual",
      actorId: actor.id,
      // Staff text people they know: block opt-outs, don't require a recorded opt-in.
      strict: false,
    });
    return NextResponse.json({ ok: true, sid: result.sid, status: result.status, conversationId: result.conversationId });
  } catch (error) {
    if (error instanceof SmsConsentError) return NextResponse.json({ error: error.message, skipped: true }, { status: 400 });
    const message = error instanceof Error ? error.message : "Failed to send SMS.";
    const httpStatus = message.includes("not found") ? 404 : message.includes("required") || message.includes("permission") ? 403 : 500;
    return NextResponse.json({ error: message }, { status: httpStatus });
  }
}
