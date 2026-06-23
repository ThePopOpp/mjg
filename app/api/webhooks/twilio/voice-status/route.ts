import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { fetchCallPrice } from "@/lib/twilio/client";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const callSid = String(formData.get("CallSid") ?? "");
    const callStatus = String(formData.get("CallStatus") ?? "");
    const duration = formData.get("CallDuration") ? parseInt(String(formData.get("CallDuration")), 10) : null;

    if (!callSid) return NextResponse.json({ ok: true });

    const supabase = createSupabaseAdminClient();
    const update: Record<string, unknown> = { status: callStatus, updated_at: new Date().toISOString() };
    if (duration !== null) update.duration_seconds = duration;
    const isTerminal = ["completed", "failed", "no-answer", "busy", "canceled"].includes(callStatus);
    if (isTerminal) {
      update.ended_at = new Date().toISOString();
      // Twilio populates price asynchronously; this often returns null right at
      // call end and gets backfilled later by the calls list endpoint.
      const priceInfo = await fetchCallPrice(callSid);
      if (priceInfo) {
        update.price = priceInfo.price;
        update.price_unit = priceInfo.priceUnit;
      }
    }
    if (callStatus === "in-progress") {
      update.answered_at = new Date().toISOString();
    }

    await supabase.from("calls").update(update).eq("twilio_call_sid", callSid);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Voice status webhook error:", error);
    return NextResponse.json({ ok: true });
  }
}
