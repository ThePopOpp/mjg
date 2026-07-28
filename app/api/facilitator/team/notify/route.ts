import { NextResponse } from "next/server";
import { requireFacilitator } from "@/lib/user-management/auth";
import { participantOnFacilitatorTeam } from "@/lib/facilitator/team";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { sendSmtpEmail } from "@/lib/email/smtp";

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const actor = await requireFacilitator(request, body.actionToken);

    const participantId = String(body.participantId ?? "").trim();
    const subject = String(body.subject ?? "").trim();
    const message = String(body.message ?? "").trim();
    if (!participantId) return NextResponse.json({ error: "Participant is required." }, { status: 400 });
    if (!subject || !message) return NextResponse.json({ error: "Subject and message are required." }, { status: 400 });

    // Authorize: the participant must be on one of the actor's teams (admins bypass).
    const isAdmin = actor.role === "admin" || actor.role === "super_admin";
    if (!isAdmin && !(await participantOnFacilitatorTeam(actor.id, participantId))) {
      return NextResponse.json({ error: "That participant is not on your team." }, { status: 403 });
    }

    const supabase = createSupabaseAdminClient();
    const { data: participant, error } = await supabase
      .from("participants")
      .select("id,email,first_name,last_name")
      .eq("id", participantId)
      .maybeSingle();
    if (error) throw error;
    if (!participant?.email) return NextResponse.json({ error: "Participant has no email." }, { status: 400 });

    const html = `<div style="font-family:system-ui,sans-serif;font-size:15px;line-height:1.6;color:#1a1a1a">${escapeHtml(message).replace(/\n/g, "<br/>")}</div>`;
    const result = await sendSmtpEmail({ to: participant.email, subject, html, text: message });

    // Audit the send alongside the app's other email logs.
    await supabase.from("email_send_logs").insert({
      template_id: null,
      recipient_email: participant.email,
      recipient_name: `${participant.first_name ?? ""} ${participant.last_name ?? ""}`.trim() || null,
      recipient_type: "participant",
      participant_id: participant.id,
      subject,
      status: result.skipped ? "skipped" : "sent",
      provider: "smtp",
      provider_message_id: result.messageId ?? null,
      error_message: result.reason ?? null,
      merge_data: { source: "facilitator_notify" },
      sent_by: actor.id,
      sent_at: result.skipped ? null : new Date().toISOString(),
    });

    if (result.skipped) return NextResponse.json({ error: result.reason || "Email provider not configured." }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to notify participant.";
    const status = message.includes("permission") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
