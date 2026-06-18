import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getTwilioClient, TWILIO_PHONE_NUMBER } from "@/lib/twilio/client";
import {
  SMS_STOP_KEYWORDS,
  SMS_START_KEYWORDS,
  SMS_HELP_KEYWORDS,
  SMS_STOP_REPLY,
  SMS_START_REPLY,
  SMS_HELP_REPLY,
} from "@/lib/sms/constants";
import { getOrCreateConversation } from "@/lib/twilio/sms";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const from = String(formData.get("From") ?? "");
    const to = String(formData.get("To") ?? "");
    const body = String(formData.get("Body") ?? "").trim();
    const messageSid = String(formData.get("MessageSid") ?? "");
    const numMedia = parseInt(String(formData.get("NumMedia") ?? "0"), 10);

    const mediaUrls: string[] = [];
    for (let i = 0; i < numMedia; i++) {
      const url = formData.get(`MediaUrl${i}`);
      if (url) mediaUrls.push(String(url));
    }

    const upperBody = body.toUpperCase();
    const isStop = SMS_STOP_KEYWORDS.some((k) => upperBody === k);
    const isStart = SMS_START_KEYWORDS.some((k) => upperBody === k);
    const isHelp = SMS_HELP_KEYWORDS.some((k) => upperBody === k);

    const supabase = createSupabaseAdminClient();
    const now = new Date().toISOString();

    // Handle STOP keywords
    if (isStop) {
      await handleOptOut(supabase, from, now);
      return twimlReply(SMS_STOP_REPLY);
    }

    // Handle START keywords
    if (isStart) {
      await handleOptIn(supabase, from, now);
      return twimlReply(SMS_START_REPLY);
    }

    // Handle HELP keywords
    if (isHelp) {
      return twimlReply(SMS_HELP_REPLY);
    }

    // Regular inbound message — store in conversation
    const conversationId = await getOrCreateConversation(from);

    await supabase.from("sms_messages").insert({
      conversation_id: conversationId,
      direction: "inbound",
      body,
      status: "received",
      twilio_message_sid: messageSid,
      media_urls: mediaUrls,
      sent_at: now,
    });

    await supabase
      .from("sms_conversations")
      .update({
        last_message_at: now,
        last_message_preview: body.slice(0, 120),
        unread_count: supabase.rpc("increment_unread", { conv_id: conversationId }) as any,
        updated_at: now,
      })
      .eq("id", conversationId);

    // Increment unread count separately
    await supabase.rpc("increment_sms_unread", { conv_id: conversationId }).maybeSingle();

    return new NextResponse("<?xml version=\"1.0\" encoding=\"UTF-8\"?><Response></Response>", {
      headers: { "Content-Type": "text/xml" },
    });
  } catch (error) {
    console.error("SMS webhook error:", error);
    return new NextResponse("<?xml version=\"1.0\" encoding=\"UTF-8\"?><Response></Response>", {
      headers: { "Content-Type": "text/xml" },
    });
  }
}

async function handleOptOut(supabase: ReturnType<typeof createSupabaseAdminClient>, phone: string, now: string) {
  const { data: participant } = await supabase
    .from("participants")
    .select("id")
    .or(`phone.eq.${phone},phone.eq.+${phone.replace(/\D/g, "")}`)
    .maybeSingle();

  if (participant) {
    await supabase
      .from("participants")
      .update({ sms_opt_in: false, sms_opt_out_at: now })
      .eq("id", participant.id);
    await supabase.from("consent_events").insert({
      entity_type: "participant",
      entity_id: participant.id,
      channel: "sms",
      event_type: "opt_out",
      source: "keyword_stop",
    });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .or(`phone.eq.${phone},phone.eq.+${phone.replace(/\D/g, "")}`)
    .maybeSingle();

  if (profile) {
    await supabase
      .from("profiles")
      .update({ sms_opt_in: false, sms_opt_out_at: now })
      .eq("id", profile.id);
    await supabase.from("consent_events").insert({
      entity_type: "profile",
      entity_id: profile.id,
      channel: "sms",
      event_type: "opt_out",
      source: "keyword_stop",
    });
  }
}

async function handleOptIn(supabase: ReturnType<typeof createSupabaseAdminClient>, phone: string, now: string) {
  const { data: participant } = await supabase
    .from("participants")
    .select("id")
    .or(`phone.eq.${phone},phone.eq.+${phone.replace(/\D/g, "")}`)
    .maybeSingle();

  if (participant) {
    await supabase
      .from("participants")
      .update({ sms_opt_in: true, sms_opt_in_at: now, sms_opt_in_source: "keyword_start" })
      .eq("id", participant.id);
    await supabase.from("consent_events").insert({
      entity_type: "participant",
      entity_id: participant.id,
      channel: "sms",
      event_type: "opt_in",
      source: "keyword_start",
    });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .or(`phone.eq.${phone},phone.eq.+${phone.replace(/\D/g, "")}`)
    .maybeSingle();

  if (profile) {
    await supabase
      .from("profiles")
      .update({ sms_opt_in: true, sms_opt_in_at: now, sms_opt_in_source: "keyword_start" })
      .eq("id", profile.id);
    await supabase.from("consent_events").insert({
      entity_type: "profile",
      entity_id: profile.id,
      channel: "sms",
      event_type: "opt_in",
      source: "keyword_start",
    });
  }
}

function twimlReply(message: string) {
  return new NextResponse(
    `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${message}</Message></Response>`,
    { headers: { "Content-Type": "text/xml" } }
  );
}
