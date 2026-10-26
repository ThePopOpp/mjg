import { NextResponse } from "next/server";
import { requireParticipantManager } from "@/lib/user-management/auth";
import { sendSmsBroadcast } from "@/lib/sms/outbound";

// Text many people from the dashboard. Opted-in records only; typed-in numbers
// skip anyone who has opted out. Shared with the Claude connector
// (lib/sms/outbound.ts), which also requires a recorded opt-in for typed numbers.
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const actor = await requireParticipantManager(request, body.actionToken);

    const rawBody = String(body.body ?? "").trim();
    const templateId: string | null = body.templateId ?? null;
    if (!rawBody && !templateId) {
      return NextResponse.json({ error: "Message body or template is required." }, { status: 400 });
    }

    const result = await sendSmsBroadcast({
      audience: body.audience ?? "participants",
      recipientIds: body.recipientIds ?? [],
      phoneNumbers: body.phoneNumbers ?? [],
      body: rawBody,
      templateId,
      actorId: actor.id,
      strict: false,
    });
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Broadcast failed.";
    const httpStatus = message.includes("not found") ? 404 : message.includes("required") || message.includes("permission") ? 403 : 500;
    return NextResponse.json({ error: message }, { status: httpStatus });
  }
}
