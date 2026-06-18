import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const phone = String(body.phone ?? "").trim();

    if (!phone) return NextResponse.json({ error: "Phone number is required." }, { status: 400 });

    const supabase = createSupabaseAdminClient();
    const now = new Date().toISOString();
    const ip = request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? null;
    const ua = request.headers.get("user-agent") ?? null;

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
        source: "web_form",
        ip_address: ip,
        user_agent: ua,
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
        source: "web_form",
        ip_address: ip,
        user_agent: ua,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to process opt-out.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
