import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const callSid = String(formData.get("CallSid") ?? "");
    const recordingSid = String(formData.get("RecordingSid") ?? "");
    const recordingUrl = String(formData.get("RecordingUrl") ?? "");
    const recordingDuration = formData.get("RecordingDuration")
      ? parseInt(String(formData.get("RecordingDuration")), 10)
      : null;
    const recordingStatus = String(formData.get("RecordingStatus") ?? "");

    if (!callSid || !recordingSid) return NextResponse.json({ ok: true });

    const supabase = createSupabaseAdminClient();

    const { data: call } = await supabase
      .from("calls")
      .select("id, voicemail_sid")
      .eq("twilio_call_sid", callSid)
      .maybeSingle();

    if (!call) return NextResponse.json({ ok: true });

    // Check if this is a voicemail recording (call was not answered)
    const { data: callData } = await supabase
      .from("calls")
      .select("status, answered_at")
      .eq("id", call.id)
      .maybeSingle();

    const isVoicemail = !callData?.answered_at;

    if (isVoicemail) {
      await supabase.from("calls").update({
        voicemail_sid: recordingSid,
        voicemail_url: `${recordingUrl}.mp3`,
        updated_at: new Date().toISOString(),
      }).eq("id", call.id);
    } else {
      await supabase.from("calls").update({
        recording_sid: recordingSid,
        recording_url: `${recordingUrl}.mp3`,
        recording_duration: recordingDuration,
        updated_at: new Date().toISOString(),
      }).eq("id", call.id);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Recording webhook error:", error);
    return NextResponse.json({ ok: true });
  }
}
