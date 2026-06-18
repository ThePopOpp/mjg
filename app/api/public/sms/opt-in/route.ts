import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { SMS_OPT_IN_DISCLOSURE } from "@/lib/sms/constants";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const phone = String(body.phone ?? "").trim();
    const firstName = String(body.firstName ?? "").trim();

    if (!phone) return NextResponse.json({ error: "Phone number is required." }, { status: 400 });

    const supabase = createSupabaseAdminClient();
    const now = new Date().toISOString();
    const ip = request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? null;
    const ua = request.headers.get("user-agent") ?? null;

    const { data: participant } = await supabase
      .from("participants")
      .select("id, sms_opt_in")
      .or(`phone.eq.${phone},phone.eq.+${phone.replace(/\D/g, "")}`)
      .maybeSingle();

    if (participant) {
      await supabase
        .from("participants")
        .update({ sms_opt_in: true, sms_opt_in_at: now, sms_opt_in_source: "web_form" })
        .eq("id", participant.id);

      await supabase.from("consent_events").insert({
        entity_type: "participant",
        entity_id: participant.id,
        channel: "sms",
        event_type: "opt_in",
        source: "web_form",
        ip_address: ip,
        user_agent: ua,
      });
    } else {
      await supabase.from("participants").insert({
        first_name: firstName || "Unknown",
        last_name: "",
        email: `sms-${phone.replace(/\D/g, "")}@placeholder.invalid`,
        phone,
        sms_opt_in: true,
        sms_opt_in_at: now,
        sms_opt_in_source: "web_form",
        participant_type: "general_participant",
        source: "sms_opt_in_page",
      });
    }

    const profile = await supabase
      .from("profiles")
      .select("id")
      .or(`phone.eq.${phone},phone.eq.+${phone.replace(/\D/g, "")}`)
      .maybeSingle();

    if (profile.data) {
      await supabase
        .from("profiles")
        .update({ sms_opt_in: true, sms_opt_in_at: now, sms_opt_in_source: "web_form" })
        .eq("id", profile.data.id);

      await supabase.from("consent_events").insert({
        entity_type: "profile",
        entity_id: profile.data.id,
        channel: "sms",
        event_type: "opt_in",
        source: "web_form",
        ip_address: ip,
        user_agent: ua,
      });
    }

    return NextResponse.json({ ok: true, message: SMS_OPT_IN_DISCLOSURE });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to process opt-in.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
