import { NextResponse } from "next/server";
import { requireParticipantManager } from "@/lib/user-management/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { sendSms, getOrCreateConversation, buildMergeData } from "@/lib/twilio/sms";
import { renderSmsTemplate } from "@/lib/sms/templates";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const actor = await requireParticipantManager(request, body.actionToken);

    const rawBody = String(body.body ?? "").trim();
    const templateId: string | null = body.templateId ?? null;
    const audience: "participants" | "profiles" | "manual" = body.audience ?? "participants";
    const recipientIds: string[] = body.recipientIds ?? [];
    const phoneNumbers: string[] = body.phoneNumbers ?? [];

    if (!rawBody && !templateId) {
      return NextResponse.json({ error: "Message body or template is required." }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();
    const broadcastId = crypto.randomUUID();
    const now = new Date().toISOString();

    let templateBody = rawBody;
    if (templateId) {
      const { data: template } = await supabase
        .from("sms_templates")
        .select("body")
        .eq("id", templateId)
        .single();
      if (!template) return NextResponse.json({ error: "Template not found." }, { status: 404 });
      templateBody = template.body;
    }

    // Build recipient list
    const recipients: Array<{ id: string | null; phone: string; name: string; data: Record<string, unknown>; type: "participant" | "profile" | "manual" }> = [];

    if (recipientIds.length > 0 && audience !== "manual") {
      const table = audience === "participants" ? "participants" : "profiles";
      const selectFields = audience === "participants"
        ? "id, first_name, last_name, email, phone, wave, source, participant_type, check_in_status, survey_status, sms_opt_in"
        : "id, full_name, email, phone, sms_opt_in";

      const { data: rows } = await supabase
        .from(table)
        .select(selectFields)
        .in("id", recipientIds)
        .eq("sms_opt_in", true) as { data: any[] | null };

      for (const row of rows ?? []) {
        if (!row.phone) continue;
        recipients.push({ id: row.id, phone: row.phone, name: row.full_name ?? `${row.first_name ?? ""} ${row.last_name ?? ""}`.trim(), data: row, type: audience as "participant" | "profile" });
      }
    } else if (phoneNumbers.length > 0) {
      for (const phone of phoneNumbers) {
        recipients.push({ id: null, phone, name: phone, data: {}, type: "manual" });
      }
    } else {
      // All opted-in participants/profiles
      const table = audience === "participants" ? "participants" : "profiles";
      const selectFields = audience === "participants"
        ? "id, first_name, last_name, email, phone, wave, source, participant_type, check_in_status, survey_status, sms_opt_in"
        : "id, full_name, email, phone, sms_opt_in";

      const { data: rows } = await supabase
        .from(table)
        .select(selectFields)
        .eq("sms_opt_in", true)
        .not("phone", "is", null) as { data: any[] | null };

      for (const row of rows ?? []) {
        if (!row.phone) continue;
        recipients.push({ id: row.id, phone: row.phone, name: row.full_name ?? `${row.first_name ?? ""} ${row.last_name ?? ""}`.trim(), data: row, type: audience as "participant" | "profile" });
      }
    }

    const results = { sent: 0, failed: 0, skipped: 0 };
    const logInserts: object[] = [];

    for (const recipient of recipients) {
      try {
        const renderedBody = renderSmsTemplate(templateBody, buildMergeData(recipient.data));
        const conversationId = await getOrCreateConversation(recipient.phone, recipient.name);
        const result = await sendSms({ to: recipient.phone, body: renderedBody, conversationId, sentByProfileId: actor.id });
        results.sent++;
        logInserts.push({
          broadcast_id: broadcastId,
          template_id: templateId,
          recipient_type: recipient.type,
          recipient_id: recipient.id,
          recipient_phone: recipient.phone,
          recipient_name: recipient.name,
          body_rendered: renderedBody,
          status: "sent",
          twilio_message_sid: result.sid,
          sent_by: actor.id,
          sent_at: now,
        });
      } catch (err) {
        results.failed++;
        logInserts.push({
          broadcast_id: broadcastId,
          template_id: templateId,
          recipient_type: recipient.type,
          recipient_id: recipient.id,
          recipient_phone: recipient.phone,
          recipient_name: recipient.name,
          body_rendered: templateBody,
          status: "failed",
          sent_by: actor.id,
          error_message: err instanceof Error ? err.message : "Unknown error",
        });
      }
    }

    if (logInserts.length > 0) {
      await supabase.from("sms_send_logs").insert(logInserts);
    }

    return NextResponse.json({ ok: true, broadcastId, ...results, total: recipients.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Broadcast failed.";
    const httpStatus = message.includes("required") || message.includes("permission") ? 403 : 500;
    return NextResponse.json({ error: message }, { status: httpStatus });
  }
}
