import { NextResponse } from "next/server";
import { requireParticipantManager } from "@/lib/user-management/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { transcribeRecording } from "@/lib/openai/transcribe";

// On-demand transcription of a call recording (or voicemail) via OpenAI Whisper.
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const body = await request.json().catch(() => ({}));
    await requireParticipantManager(request, body.actionToken);
    const { id } = await params;
    const target = body.target === "voicemail" ? "voicemail" : "recording";

    const supabase = createSupabaseAdminClient();
    const { data: call } = await supabase
      .from("calls")
      .select("id, recording_url, voicemail_url")
      .eq("id", id)
      .maybeSingle();

    if (!call) return NextResponse.json({ error: "Call not found." }, { status: 404 });

    const url = target === "voicemail" ? call.voicemail_url : call.recording_url;
    if (!url) return NextResponse.json({ error: "No recording available to transcribe." }, { status: 400 });

    await supabase.from("calls").update({ transcription_status: "pending", updated_at: new Date().toISOString() }).eq("id", id);

    try {
      const text = await transcribeRecording(url);
      const field = target === "voicemail" ? "voicemail_transcription" : "transcription_text";
      await supabase
        .from("calls")
        .update({ [field]: text, transcription_status: "completed", updated_at: new Date().toISOString() })
        .eq("id", id);
      return NextResponse.json({ ok: true, text });
    } catch (err) {
      await supabase.from("calls").update({ transcription_status: "failed", updated_at: new Date().toISOString() }).eq("id", id);
      throw err;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to transcribe recording.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
