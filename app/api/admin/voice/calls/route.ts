import { NextResponse } from "next/server";
import { requireParticipantManager } from "@/lib/user-management/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  try {
    await requireParticipantManager(request);
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "50"), 100);
    const offset = parseInt(searchParams.get("offset") ?? "0");
    const direction = searchParams.get("direction");
    const hasVoicemail = searchParams.get("voicemail") === "true";

    const supabase = createSupabaseAdminClient();
    let query = supabase
      .from("calls")
      .select(`
        id, twilio_call_sid, direction, from_number, to_number,
        status, duration_seconds, recording_url, recording_duration,
        transcription_text, voicemail_url, voicemail_transcription,
        notes, started_at, answered_at, ended_at, created_at,
        participant_id, profile_id, handled_by,
        participants(first_name, last_name, email),
        profiles(full_name, email),
        handled_by_profile:profiles!calls_handled_by_fkey(full_name)
      `)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (direction) query = query.eq("direction", direction);
    if (hasVoicemail) query = query.not("voicemail_url", "is", null);

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json({ calls: data ?? [] });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch calls.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
