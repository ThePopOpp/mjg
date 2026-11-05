import { createHmac, timingSafeEqual } from "node:crypto";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { applyForgedEvent, parseForgedEvent } from "@/lib/forgedlife/apply";
import { isSwitchOn } from "@/lib/forgedlife/switches";

// Receives one signed ForgedLife event (both the live and the test endpoint).
//
//   X-Forged-Signature: sha256=<hex HMAC-SHA256 of the raw body, keyed with the shared secret>
//   X-Forged-Timestamp: unix seconds, rejected when more than 5 minutes off
//   X-Forged-Event-Id:  unique per event; a resend with the same id is acknowledged, not re-applied
//
// The event is stored before anything is applied, so a failure to apply never loses it —
// it shows as "failed" on /dashboard/forgedlife and can be replayed. We answer 2xx once
// it's stored (their retries are for delivery, not for our bugs).

export const FORGED_SOURCE = "forgedlife";
const MAX_SKEW_SECONDS = 300;

export type ReceiveMode = "live" | "test";

const SECRET_ENV: Record<ReceiveMode, string> = {
  live: "FORGEDLIFE_WEBHOOK_SECRET",
  test: "FORGEDLIFE_TEST_WEBHOOK_SECRET",
};

export function verifyForgedSignature(rawBody: string, header: string | null, secret: string): boolean {
  const presented = (header ?? "").trim().replace(/^sha256=/i, "").toLowerCase();
  if (!/^[0-9a-f]{64}$/.test(presented)) return false;
  const expected = createHmac("sha256", secret).update(rawBody, "utf8").digest("hex");
  return timingSafeEqual(Buffer.from(presented, "hex"), Buffer.from(expected, "hex"));
}

/** Accepts unix seconds, unix milliseconds, or an ISO string. */
export function timestampFresh(header: string | null, now = Date.now()): boolean {
  const raw = (header ?? "").trim();
  if (!raw) return false;
  let ms = /^\d+$/.test(raw) ? Number(raw) : Date.parse(raw);
  if (!Number.isFinite(ms)) return false;
  if (/^\d+$/.test(raw) && ms < 1e12) ms *= 1000;
  return Math.abs(now - ms) <= MAX_SKEW_SECONDS * 1000;
}

export async function receiveForgedEvent(request: Request, mode: ReceiveMode): Promise<{ status: number; body: Record<string, unknown> }> {
  const secret = process.env[SECRET_ENV[mode]]?.trim();
  if (!secret) return { status: 503, body: { error: "Not configured." } };

  const rawBody = await request.text();
  if (!verifyForgedSignature(rawBody, request.headers.get("x-forged-signature"), secret)) {
    return { status: 401, body: { error: "Bad signature." } };
  }
  if (!timestampFresh(request.headers.get("x-forged-timestamp"))) {
    return { status: 401, body: { error: "Stale or missing timestamp." } };
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return { status: 400, body: { error: "Body is not JSON." } };
  }
  const parsed = parseForgedEvent(payload, request.headers.get("x-forged-event-id"));
  if (!parsed.eventId) return { status: 400, body: { error: "Missing X-Forged-Event-Id." } };

  const db = createSupabaseAdminClient();
  const { data: stored, error } = await db
    .from("integration_events")
    .insert({ source: FORGED_SOURCE, mode, event_id: parsed.eventId, event_type: parsed.type, payload, status: "received" })
    .select("id")
    .single();
  if (error) {
    if (error.code === "23505") return { status: 200, body: { ok: true, duplicate: true } };
    console.error("[forgedlife] could not store event", error.message);
    return { status: 500, body: { error: "Could not store the event." } };
  }

  // Test endpoint, or the live switch is off: keep it, check its shape, change nothing.
  if (mode === "test" || !(await isSwitchOn("forgedlife.sync"))) {
    const warnings = parsed.problems;
    await db
      .from("integration_events")
      .update({ status: "recorded", error: warnings.length ? warnings.join("; ") : null, processed_at: new Date().toISOString() })
      .eq("id", stored.id);
    return { status: 200, body: { ok: true, recorded: true, applied: false, warnings } };
  }

  const outcome = await processStoredEvent(stored.id);
  return { status: 200, body: { ok: true, ...outcome } };
}

/** Applies one stored event (fresh, or replayed from the dashboard) and records the outcome. */
export async function processStoredEvent(id: string): Promise<{ applied: boolean; status: string; warnings: string[]; error?: string }> {
  const db = createSupabaseAdminClient();
  const { data: row } = await db.from("integration_events").select("id,mode,event_id,payload").eq("id", id).maybeSingle();
  if (!row) return { applied: false, status: "failed", warnings: [], error: "Event not found." };
  if (row.mode !== "live") return { applied: false, status: "recorded", warnings: [], error: "Test events are never applied." };

  const parsed = parseForgedEvent(row.payload, row.event_id);
  try {
    const result = await applyForgedEvent(parsed);
    const status = result.applied ? "applied" : "skipped";
    const note = [...parsed.problems, ...(result.note ? [result.note] : [])];
    await db
      .from("integration_events")
      .update({ status, error: note.length ? note.join("; ") : null, processed_at: new Date().toISOString() })
      .eq("id", id);
    return { applied: result.applied, status, warnings: parsed.problems };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("[forgedlife] apply failed", parsed.type, message);
    await db.from("integration_events").update({ status: "failed", error: message.slice(0, 1000), processed_at: new Date().toISOString() }).eq("id", id);
    return { applied: false, status: "failed", warnings: parsed.problems, error: message };
  }
}
