import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { EMAIL_JOURNEY_STEPS } from "@/lib/email/journey";
import { eventKeyForJourneyStep } from "@/lib/email/constants";

// The 7-day pilot email journey: its steps, which template each step sends, and
// each participant's scheduled email (email_journey_events). Turning a step's
// automation on/off stays with set_email_automation; sending due emails with
// run_due_journey_emails. This changes one participant's one email.

type MappingRow = { event_key: string; enabled: boolean; template_id: string | null; email_templates?: { name?: string | null; subject?: string | null; status?: string | null } | null };

async function mappings(): Promise<Map<string, MappingRow>> {
  const db = createSupabaseAdminClient();
  const { data, error } = await db
    .from("email_template_mappings")
    .select("event_key, enabled, template_id, email_templates(name, subject, status)")
    .like("event_key", "email_journey_%");
  if (error) throw new Error(error.message);
  return new Map(((data ?? []) as unknown as MappingRow[]).map((m) => [m.event_key, m]));
}

function stepView(step: (typeof EMAIL_JOURNEY_STEPS)[number], m: MappingRow | undefined) {
  const template = Array.isArray(m?.email_templates) ? m?.email_templates[0] : m?.email_templates;
  return {
    step: step.step, key: step.key, subject: step.subject, delayDays: step.delayDays, eventKey: eventKeyForJourneyStep(step.key),
    automation: m ? { enabled: m.enabled, templateId: m.template_id, template: template?.name ?? null, templateStatus: template?.status ?? null } : null,
  };
}

/** Every step with its template mapping and how many emails are scheduled/sent/skipped/failed. */
export async function listJourney() {
  const db = createSupabaseAdminClient();
  const [map, { data, error }] = await Promise.all([mappings(), db.from("email_journey_events").select("step_number, status").limit(50000)]);
  if (error) throw new Error(error.message);
  const counts = new Map<number, Record<string, number>>();
  for (const r of data ?? []) {
    const c = counts.get(r.step_number as number) ?? {};
    c[r.status as string] = (c[r.status as string] ?? 0) + 1;
    counts.set(r.step_number as number, c);
  }
  return EMAIL_JOURNEY_STEPS.map((s) => ({ ...stepView(s, map.get(eventKeyForJourneyStep(s.key))), emails: counts.get(s.step) ?? {} }));
}

/** One step and each participant's email for it. */
export async function getJourneyStep(step: number, opts: { status?: string; limit?: number } = {}) {
  const def = EMAIL_JOURNEY_STEPS.find((s) => s.step === step);
  if (!def) throw new Error(`No journey step ${step} (0–${EMAIL_JOURNEY_STEPS.length - 1}).`);
  const db = createSupabaseAdminClient();
  let q = db
    .from("email_journey_events")
    .select("id, status, subject, scheduled_at, sent_at, last_attempt_at, error_message, participants(id, first_name, last_name, email)")
    .eq("step_number", step)
    .order("scheduled_at", { ascending: true })
    .limit(Math.min(Math.max(opts.limit ?? 100, 1), 500));
  if (opts.status) q = q.eq("status", opts.status);
  const [map, { data, error }] = await Promise.all([mappings(), q]);
  if (error) throw new Error(error.message);
  return {
    ...stepView(def, map.get(eventKeyForJourneyStep(def.key))),
    emails: (data ?? []).map((e) => {
      const p = (Array.isArray(e.participants) ? e.participants[0] : e.participants) as { id: string; first_name: string | null; last_name: string | null; email: string | null } | null;
      return {
        id: e.id, status: e.status, subject: e.subject, scheduledAt: e.scheduled_at, sentAt: e.sent_at, lastAttemptAt: e.last_attempt_at, error: e.error_message,
        participant: p ? { id: p.id, name: [p.first_name, p.last_name].filter(Boolean).join(" ") || null, email: p.email } : null,
      };
    }),
  };
}

/** Reschedule, skip, or re-queue one participant's journey email. Sent emails can't be changed. */
export async function updateJourneyEvent(id: string, changes: { scheduledAt?: string; status?: "scheduled" | "skipped" }) {
  const db = createSupabaseAdminClient();
  const { data: current, error: readError } = await db.from("email_journey_events").select("id, status").eq("id", id).maybeSingle();
  if (readError) throw new Error(readError.message);
  if (!current) throw new Error("No such journey email.");
  if (current.status === "sent") throw new Error("That email was already sent.");
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (changes.scheduledAt) {
    const at = new Date(changes.scheduledAt);
    if (Number.isNaN(at.getTime())) throw new Error("scheduled_at must be an ISO date-time.");
    patch.scheduled_at = at.toISOString();
  }
  if (changes.status) {
    patch.status = changes.status;
    if (changes.status === "scheduled") patch.error_message = null;
  }
  if (Object.keys(patch).length === 1) throw new Error("Nothing to change: give scheduled_at and/or status.");
  const { data, error } = await db.from("email_journey_events").update(patch).eq("id", id).select("id, step_number, status, scheduled_at").single();
  if (error) throw new Error(error.message);
  return data;
}
