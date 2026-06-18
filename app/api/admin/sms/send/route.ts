import { NextResponse } from "next/server";
import { requireParticipantManager } from "@/lib/user-management/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { sendSms, getOrCreateConversation, buildMergeData } from "@/lib/twilio/sms";
import { renderSmsTemplate } from "@/lib/sms/templates";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const actor = await requireParticipantManager(request, body.actionToken);

    const to = String(body.to ?? "").trim();
    const rawBody = String(body.body ?? "").trim();
    const templateId: string | null = body.templateId ?? null;
    const recipientId: string | null = body.recipientId ?? null;
    const recipientType: "participant" | "profile" | "manual" = body.recipientType ?? "manual";

    if (!to) return NextResponse.json({ error: "Recipient phone number is required." }, { status: 400 });
    if (!rawBody && !templateId) return NextResponse.json({ error: "Message body or template is required." }, { status: 400 });

    const supabase = createSupabaseAdminClient();

    // Opt-in check
    if (recipientId && recipientType !== "manual") {
      const table = recipientType === "participant" ? "participants" : "profiles";
      const { data: recipient } = await supabase
        .from(table)
        .select("sms_opt_in")
        .eq("id", recipientId)
        .maybeSingle();
      if (recipient && recipient.sms_opt_in === false) {
        return NextResponse.json({ error: "This recipient has opted out of SMS messages.", skipped: true }, { status: 400 });
      }
    }

    let messageBody = rawBody;

    if (templateId) {
      const { data: template } = await supabase
        .from("sms_templates")
        .select("body")
        .eq("id", templateId)
        .single();

      if (!template) return NextResponse.json({ error: "Template not found." }, { status: 404 });

      let recipientData: Record<string, unknown> = {};
      if (recipientId && recipientType !== "manual") {
        const table = recipientType === "participant" ? "participants" : "profiles";
        const { data } = await supabase.from(table).select("*").eq("id", recipientId).maybeSingle();
        recipientData = data ?? {};
      }

      messageBody = renderSmsTemplate(template.body, buildMergeData(recipientData));
    }

    const conversationId = await getOrCreateConversation(to);

    const result = await sendSms({
      to,
      body: messageBody,
      conversationId,
      sentByProfileId: actor.id,
    });

    return NextResponse.json({ ok: true, sid: result.sid, status: result.status, conversationId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to send SMS.";
    const httpStatus = message.includes("required") || message.includes("permission") ? 403 : 500;
    return NextResponse.json({ error: message }, { status: httpStatus });
  }
}
