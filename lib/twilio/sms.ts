import { getTwilioClient, TWILIO_MESSAGING_SERVICE_SID, TWILIO_PHONE_NUMBER } from "@/lib/twilio/client";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { renderSmsTemplate, extractSmsFields } from "@/lib/sms/templates";
import { phoneKey, resolveSmsContact, toE164 } from "@/lib/sms/contacts";

export interface SendSmsOptions {
  to: string;
  body: string;
  conversationId?: string;
  sentByProfileId?: string;
}

export interface SendSmsResult {
  sid: string;
  status: string;
}

export async function sendSms({ to, body, conversationId, sentByProfileId }: SendSmsOptions): Promise<SendSmsResult> {
  const client = getTwilioClient();

  // Prefer the Messaging Service that carries the approved A2P 10DLC campaign; fall back to
  // the bare number only when no service is configured. See TWILIO_MESSAGING_SERVICE_SID.
  const sender = TWILIO_MESSAGING_SERVICE_SID
    ? { messagingServiceSid: TWILIO_MESSAGING_SERVICE_SID }
    : { from: TWILIO_PHONE_NUMBER };

  // Ask Twilio to report delivery outcomes back to us. Without this the status webhook never
  // fires, so a carrier rejection (30034, opt-out, unreachable) leaves the message sitting at
  // "queued" in the dashboard and looks like it was sent.
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/\/$/, "");
  const statusCallback = appUrl ? `${appUrl}/api/webhooks/twilio/sms-status` : undefined;

  const message = await client.messages.create({
    ...sender,
    to,
    body,
    ...(statusCallback ? { statusCallback } : {}),
  });

  if (conversationId) {
    const supabase = createSupabaseAdminClient();
    await supabase.from("sms_messages").insert({
      conversation_id: conversationId,
      direction: "outbound",
      body,
      status: message.status,
      twilio_message_sid: message.sid,
      sent_by: sentByProfileId ?? null,
      sent_at: new Date().toISOString(),
    });
    await supabase
      .from("sms_conversations")
      .update({
        last_message_at: new Date().toISOString(),
        last_message_preview: body.slice(0, 120),
        updated_at: new Date().toISOString(),
      })
      .eq("id", conversationId);
  }

  return { sid: message.sid, status: message.status };
}

/**
 * Find the thread for a number, or start one.
 *
 * Matching is on the last ten digits rather than the literal string: Twilio delivers E.164
 * ("+14803527598") while a hand-typed send may be "4803527598", and keying on the raw text
 * split the same person into separate threads. New rows always store E.164.
 */
export async function getOrCreateConversation(contactNumber: string, contactName?: string | null) {
  const supabase = createSupabaseAdminClient();
  const e164 = toE164(contactNumber) || contactNumber;
  const key = phoneKey(contactNumber);

  const { data: candidates } = await supabase
    .from("sms_conversations")
    .select("id, contact_number")
    .eq("twilio_number", TWILIO_PHONE_NUMBER)
    .order("created_at", { ascending: true });

  const existing = (candidates ?? []).find((c) => phoneKey(c.contact_number) === key);
  if (existing) return existing.id as string;

  const contact = await resolveSmsContact(e164);

  const { data: created, error } = await supabase
    .from("sms_conversations")
    .insert({
      twilio_number: TWILIO_PHONE_NUMBER,
      contact_number: e164,
      contact_name: contactName ?? contact?.name ?? null,
      participant_id: contact?.kind === "participant" ? contact.id : null,
      profile_id: contact?.kind === "profile" ? contact.id : null,
    })
    .select("id")
    .single();

  if (error) throw new Error(`Failed to create conversation: ${error.message}`);
  return created.id as string;
}

export function buildMergeData(recipient: Record<string, unknown>): Record<string, string> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://michaeljgauthier.com";
  return {
    first_name: String(recipient.first_name ?? ""),
    last_name: String(recipient.last_name ?? ""),
    full_name: String(recipient.full_name ?? `${recipient.first_name ?? ""} ${recipient.last_name ?? ""}`.trim()),
    email: String(recipient.email ?? ""),
    phone: String(recipient.phone ?? ""),
    wave: String(recipient.wave ?? ""),
    source: String(recipient.source ?? ""),
    participant_type: String(recipient.participant_type ?? ""),
    check_in_status: String(recipient.check_in_status ?? ""),
    survey_status: String(recipient.survey_status ?? ""),
    sms_opt_out_url: `${siteUrl}/sms/opt-out`,
    site_url: siteUrl,
  };
}

export { renderSmsTemplate, extractSmsFields };
