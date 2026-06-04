import { NextResponse } from "next/server";
import { sendSmtpEmail } from "@/lib/email/smtp";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireUserManager } from "@/lib/user-management/auth";

export async function POST(request: Request) {
  try {
    const actor = await requireUserManager();
    const formData = await request.formData();
    const subject = String(formData.get("subject") ?? "").trim();
    const html = String(formData.get("html") ?? "").trim();
    const text = String(formData.get("text") ?? "").trim();
    const recipients = parseEmails(String(formData.get("recipients") ?? ""));
    const cc = parseEmails(String(formData.get("cc") ?? ""));
    const bcc = parseEmails(String(formData.get("bcc") ?? ""));
    const attachments = await parseAttachments(formData.getAll("attachments"));

    if (!subject) return NextResponse.json({ error: "Subject is required." }, { status: 400 });
    if (!html && !text) return NextResponse.json({ error: "Email content is required." }, { status: 400 });
    if (!recipients.length) return NextResponse.json({ error: "At least one recipient is required." }, { status: 400 });

    const result = await sendSmtpEmail({
      to: recipients,
      cc,
      bcc,
      subject,
      html: html || textToHtml(text),
      text: text || stripHtml(html),
      attachments,
    });

    const supabase = createSupabaseAdminClient();
    const logRows = recipients.map((email) => ({
      template_id: null,
      recipient_email: email,
      recipient_name: null,
      recipient_type: "manual",
      subject,
      status: result.skipped ? "skipped" : "sent",
      provider: "smtp",
      provider_message_id: result.messageId ?? null,
      error_message: result.reason ?? null,
      merge_data: {
        cc,
        bcc,
        attachmentCount: attachments.length,
        attachmentNames: attachments.map((attachment) => attachment.filename),
        manualHtml: html || textToHtml(text),
        manualText: text || stripHtml(html),
      },
      sent_by: actor.id,
      sent_at: result.skipped ? null : new Date().toISOString(),
    }));
    await supabase.from("email_send_logs").insert(logRows);

    return NextResponse.json({ ok: true, sent: result.skipped ? 0 : recipients.length, skipped: result.skipped ? recipients.length : 0, messageId: result.messageId ?? null });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Manual email failed.";
    const status = message.includes("permission") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

function parseEmails(value: string) {
  return Array.from(
    new Set(
      value
        .split(/[,;\s]+/)
        .map((item) => item.trim().toLowerCase())
        .filter((item) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(item)),
    ),
  );
}

async function parseAttachments(items: FormDataEntryValue[]) {
  const attachments = [];
  for (const item of items) {
    if (!(item instanceof File) || !item.size) continue;
    if (item.size > 10 * 1024 * 1024) throw new Error("Each attachment must be 10MB or smaller.");
    attachments.push({
      filename: item.name,
      content: Buffer.from(await item.arrayBuffer()),
      contentType: item.type || undefined,
    });
  }
  return attachments;
}

function textToHtml(value: string) {
  return value
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, "<br>")}</p>`)
    .join("");
}

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
