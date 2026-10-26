import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { fetchCallPrice } from "@/lib/twilio/client";
import { transcribeRecording } from "@/lib/openai/transcribe";

// Call logs (Twilio Voice): listing, one call, notes and on-demand transcription.
// Shared by the dashboard routes (app/api/admin/voice/calls/*) and the Claude
// connector (lib/tools/calls.ts). The webhooks that create these rows stay in
// app/api/webhooks/twilio/*.

const CALL_COLUMNS = `
  id, twilio_call_sid, direction, from_number, to_number,
  status, duration_seconds, recording_url, recording_duration,
  transcription_text, transcription_status, voicemail_url, voicemail_transcription,
  price, price_unit, notes, started_at, answered_at, ended_at, created_at,
  participant_id, profile_id, handled_by,
  participants(first_name, last_name, email),
  profiles!calls_profile_id_fkey(full_name, email),
  handled_by_profile:profiles!calls_handled_by_fkey(full_name)
`;

// Cap how many missing prices we backfill per request to keep the list fast.
const PRICE_BACKFILL_LIMIT = 10;

export async function listCalls(opts: { limit?: number; offset?: number; direction?: string | null; voicemailOnly?: boolean } = {}) {
  const limit = Math.min(Math.max(opts.limit ?? 50, 1), 100);
  const offset = Math.max(opts.offset ?? 0, 0);
  const supabase = createSupabaseAdminClient();
  let query = supabase.from("calls").select(CALL_COLUMNS).order("created_at", { ascending: false }).range(offset, offset + limit - 1);
  if (opts.direction) query = query.eq("direction", opts.direction);
  if (opts.voicemailOnly) query = query.not("voicemail_url", "is", null);
  const { data, error } = await query;
  if (error) throw error;
  const calls = (data ?? []) as Array<Record<string, any>>;
  await backfillMissingPrices(calls);
  return calls;
}

export async function getCall(id: string) {
  const { data, error } = await createSupabaseAdminClient().from("calls").select(CALL_COLUMNS).eq("id", id).maybeSingle();
  if (error) throw error;
  if (!data) throw new Error("Call not found.");
  return data;
}

export async function updateCall(id: string, patch: { notes?: string | null; status?: string }) {
  const allowed: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (patch.notes !== undefined) allowed.notes = patch.notes;
  if (patch.status) allowed.status = patch.status;
  const { error } = await createSupabaseAdminClient().from("calls").update(allowed).eq("id", id);
  if (error) throw error;
  return { ok: true };
}

/** Transcribes a call recording or voicemail (OpenAI) and stores the text. */
export async function transcribeCall(id: string, target: "recording" | "voicemail" = "recording") {
  const supabase = createSupabaseAdminClient();
  const { data: call } = await supabase.from("calls").select("id, recording_url, voicemail_url").eq("id", id).maybeSingle();
  if (!call) throw new Error("Call not found.");
  const url = target === "voicemail" ? call.voicemail_url : call.recording_url;
  if (!url) throw new Error("No recording available to transcribe.");

  await supabase.from("calls").update({ transcription_status: "pending", updated_at: new Date().toISOString() }).eq("id", id);
  try {
    const text = await transcribeRecording(url);
    const field = target === "voicemail" ? "voicemail_transcription" : "transcription_text";
    await supabase.from("calls").update({ [field]: text, transcription_status: "completed", updated_at: new Date().toISOString() }).eq("id", id);
    return { ok: true, text };
  } catch (err) {
    await supabase.from("calls").update({ transcription_status: "failed", updated_at: new Date().toISOString() }).eq("id", id);
    throw err;
  }
}

// Twilio only finalizes call price a short time after the call ends, so the
// status webhook frequently gets null. Backfill any ended calls still missing a
// price (and not too old) by fetching from Twilio, capped per request.
async function backfillMissingPrices(calls: Array<Record<string, any>>) {
  const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
  const pending = calls
    .filter((c) => c.twilio_call_sid && c.price == null && c.ended_at && new Date(c.ended_at).getTime() > dayAgo)
    .slice(0, PRICE_BACKFILL_LIMIT);
  if (!pending.length) return;
  const supabase = createSupabaseAdminClient();
  await Promise.all(
    pending.map(async (c) => {
      const info = await fetchCallPrice(c.twilio_call_sid);
      if (!info) return;
      c.price = info.price;
      c.price_unit = info.priceUnit;
      await supabase.from("calls").update({ price: info.price, price_unit: info.priceUnit, updated_at: new Date().toISOString() }).eq("id", c.id);
    }),
  );
}
