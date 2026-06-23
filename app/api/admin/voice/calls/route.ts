import { NextResponse } from "next/server";
import { requireParticipantManager } from "@/lib/user-management/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { fetchCallPrice } from "@/lib/twilio/client";

// Cap how many missing prices we backfill per request to keep the list fast.
const PRICE_BACKFILL_LIMIT = 10;

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
        transcription_text, transcription_status, voicemail_url, voicemail_transcription,
        price, price_unit, notes, started_at, answered_at, ended_at, created_at,
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

    const calls = data ?? [];
    await backfillMissingPrices(supabase, calls);

    return NextResponse.json({ calls });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch calls.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Twilio only finalizes call price a short time after the call ends, so the
// status webhook frequently gets null. Backfill any ended calls still missing a
// price (and not too old) by fetching from Twilio, capped per request.
async function backfillMissingPrices(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  calls: Array<Record<string, any>>,
) {
  const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
  const pending = calls
    .filter(
      (c) =>
        c.twilio_call_sid &&
        c.price == null &&
        c.ended_at &&
        new Date(c.ended_at).getTime() > dayAgo,
    )
    .slice(0, PRICE_BACKFILL_LIMIT);

  if (pending.length === 0) return;

  await Promise.all(
    pending.map(async (c) => {
      const info = await fetchCallPrice(c.twilio_call_sid);
      if (!info) return;
      c.price = info.price;
      c.price_unit = info.priceUnit;
      await supabase
        .from("calls")
        .update({ price: info.price, price_unit: info.priceUnit, updated_at: new Date().toISOString() })
        .eq("id", c.id);
    }),
  );
}
