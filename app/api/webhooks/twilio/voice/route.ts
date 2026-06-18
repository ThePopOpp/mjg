import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { buildInboundCallTwiml, buildOutboundCallTwiml } from "@/lib/twilio/voice";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const callSid = String(formData.get("CallSid") ?? "");
    const from = String(formData.get("From") ?? "");
    const to = String(formData.get("To") ?? "");
    const direction = String(formData.get("Direction") ?? "inbound");

    // Outbound calls from the browser client: Direction=outbound-api, From=client:identity
    const isOutbound = direction === "outbound-api" || from.startsWith("client:");
    if (isOutbound) {
      const supabase = createSupabaseAdminClient();
      await supabase.from("calls").insert({
        twilio_call_sid: callSid,
        direction: "outbound",
        from_number: from,
        to_number: to,
        status: "initiated",
        started_at: new Date().toISOString(),
      });
      const twiml = buildOutboundCallTwiml(to);
      return new NextResponse(twiml, { headers: { "Content-Type": "text/xml" } });
    }

    // Inbound call from external caller
    const supabase = createSupabaseAdminClient();

    const { data: participant } = await supabase
      .from("participants")
      .select("id")
      .or(`phone.eq.${from},phone.eq.+${from.replace(/\D/g, "")}`)
      .maybeSingle();

    const { data: profile } = !participant
      ? await supabase
          .from("profiles")
          .select("id")
          .or(`phone.eq.${from},phone.eq.+${from.replace(/\D/g, "")}`)
          .maybeSingle()
      : { data: null };

    await supabase.from("calls").insert({
      twilio_call_sid: callSid,
      direction: "inbound",
      from_number: from,
      to_number: to,
      status: "ringing",
      participant_id: participant?.id ?? null,
      profile_id: profile?.id ?? null,
      started_at: new Date().toISOString(),
    });

    const twiml = buildInboundCallTwiml(from);
    return new NextResponse(twiml, { headers: { "Content-Type": "text/xml" } });
  } catch (error) {
    console.error("Voice webhook error:", error);
    const VoiceResponse = (await import("twilio")).default.twiml.VoiceResponse;
    const resp = new VoiceResponse();
    resp.say("We are experiencing technical difficulties. Please try again later.");
    return new NextResponse(resp.toString(), { headers: { "Content-Type": "text/xml" } });
  }
}
