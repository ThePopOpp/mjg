import { getTwilioClient, TWILIO_PHONE_NUMBER } from "@/lib/twilio/client";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { renderSmsTemplate, extractSmsFields } from "@/lib/sms/templates";

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
  const message = await client.messages.create({
    from: TWILIO_PHONE_NUMBER,
    to,
    body,
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

export async function getOrCreateConversation(contactNumber: string, contactName?: string | null) {
  const supabase = createSupabaseAdminClient();

  const { data: existing } = await supabase
    .from("sms_conversations")
    .select("id")
    .eq("twilio_number", TWILIO_PHONE_NUMBER)
    .eq("contact_number", contactNumber)
    .maybeSingle();

  if (existing) return existing.id as string;

  const participant = await lookupParticipantByPhone(contactNumber);
  const profile = participant ? null : await lookupProfileByPhone(contactNumber);

  const { data: created, error } = await supabase
    .from("sms_conversations")
    .insert({
      twilio_number: TWILIO_PHONE_NUMBER,
      contact_number: contactNumber,
      contact_name: contactName ?? participant?.full_name ?? profile?.full_name ?? null,
      participant_id: participant?.id ?? null,
      profile_id: profile?.id ?? null,
    })
    .select("id")
    .single();

  if (error) throw new Error(`Failed to create conversation: ${error.message}`);
  return created.id as string;
}

async function lookupParticipantByPhone(phone: string) {
  const supabase = createSupabaseAdminClient();
  const normalized = phone.replace(/\D/g, "");
  const { data } = await supabase
    .from("participants")
    .select("id, first_name, last_name")
    .or(`phone.eq.${phone},phone.eq.+${normalized}`)
    .maybeSingle();
  if (!data) return null;
  return { id: data.id, full_name: `${data.first_name} ${data.last_name}`.trim() };
}

async function lookupProfileByPhone(phone: string) {
  const supabase = createSupabaseAdminClient();
  const normalized = phone.replace(/\D/g, "");
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name")
    .or(`phone.eq.${phone},phone.eq.+${normalized}`)
    .maybeSingle();
  return data ?? null;
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
