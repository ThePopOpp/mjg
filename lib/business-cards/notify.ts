// Executes a card's lead-submit automations: owner email/SMS notifications and
// auto-reply email to the lead. Uses MJG's existing Resend + Twilio helpers.
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { sendSmtpEmail } from "@/lib/email/smtp";
import { sendSms } from "@/lib/twilio/sms";
import type { Automation } from "./types";

type LeadInput = {
  name?: string; email?: string; phone?: string; company?: string; message?: string;
};

type CardInfo = {
  id: string;
  slug: string;
  display_name: string | null;
  card_name: string;
  staff_user_id: string | null;
  automations: Automation[] | null;
};

function leadSummary(lead: LeadInput): string {
  return [
    lead.name && `Name: ${lead.name}`,
    lead.email && `Email: ${lead.email}`,
    lead.phone && `Phone: ${lead.phone}`,
    lead.company && `Company: ${lead.company}`,
    lead.message && `Message: ${lead.message}`,
  ].filter(Boolean).join("\n");
}

function textToHtml(text: string): string {
  const esc = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return `<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#1a1a1a;white-space:pre-wrap">${esc}</div>`;
}

export async function runLeadAutomations(card: CardInfo, lead: LeadInput): Promise<void> {
  const rules = (card.automations ?? []).filter((a) => a.enabled && a.trigger === "lead_submit");
  if (!rules.length) return;

  const cardLabel = card.display_name || card.card_name || "your card";

  // Owner contact lookup (for owner notifications).
  let ownerEmail: string | null = null;
  let ownerPhone: string | null = null;
  if (card.staff_user_id) {
    const { data } = await createSupabaseAdminClient()
      .from("profiles").select("email, phone").eq("id", card.staff_user_id).maybeSingle();
    ownerEmail = data?.email ?? null;
    ownerPhone = data?.phone ?? null;
  }

  for (const rule of rules) {
    try {
      if (rule.action === "notify_owner_email" && ownerEmail) {
        const body = `You received a new lead from your digital business card (${cardLabel}):\n\n${leadSummary(lead)}`;
        await sendSmtpEmail({
          to: ownerEmail,
          subject: `New lead from ${cardLabel}`,
          html: textToHtml(body),
          text: body,
          replyTo: lead.email || undefined,
        });
      } else if (rule.action === "notify_owner_sms" && ownerPhone) {
        await sendSms({
          to: ownerPhone,
          body: `New lead on ${cardLabel}: ${lead.name || lead.email || lead.phone || "someone"} — ${lead.message?.slice(0, 100) || "no message"}`,
        });
      } else if (rule.action === "autoreply_email" && lead.email) {
        const body = rule.message?.trim() || `Thanks for reaching out! I received your details and will follow up shortly.\n\n— ${cardLabel}`;
        await sendSmtpEmail({
          to: lead.email,
          subject: `Thanks for connecting with ${cardLabel}`,
          html: textToHtml(body),
          text: body,
          replyTo: ownerEmail || undefined,
        });
      }
    } catch {
      // Never fail lead capture because an automation failed.
    }
  }
}
