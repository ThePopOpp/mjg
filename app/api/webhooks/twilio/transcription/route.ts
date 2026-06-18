import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const callSid = String(formData.get("CallSid") ?? "");
    const transcriptionSid = String(formData.get("TranscriptionSid") ?? "");
    const transcriptionText = String(formData.get("TranscriptionText") ?? "");
    const transcriptionStatus = String(formData.get("TranscriptionStatus") ?? "");

    if (!callSid) return NextResponse.json({ ok: true });

    const supabase = createSupabaseAdminClient();

    const { data: call } = await supabase
      .from("calls")
      .select("id, answered_at")
      .eq("twilio_call_sid", callSid)
      .maybeSingle();

    if (!call) return NextResponse.json({ ok: true });

    if (call.answered_at) {
      await supabase.from("calls").update({
        transcription_sid: transcriptionSid,
        transcription_text: transcriptionText,
        updated_at: new Date().toISOString(),
      }).eq("id", call.id);
    } else {
      await supabase.from("calls").update({
        voicemail_transcription: transcriptionText,
        updated_at: new Date().toISOString(),
      }).eq("id", call.id);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Transcription webhook error:", error);
    return NextResponse.json({ ok: true });
  }
}
