import { createSupabaseAdminClient } from "@/lib/supabase/admin";

/**
 * Email-automation status for a group (experience), rolled up per step.
 *
 * The experience detail page lists one row per recipient per step — 120 rows for a 20-step
 * group of six — which is the wrong altitude for "where is this group up to?". This collapses
 * to one row per email with the counts underneath.
 */

export type GroupOption = {
  id: string;
  name: string;
  status: string;
  startDate: string | null;
  typeName: string | null;
  attendees: number;
};

export type AutomationStep = {
  stepNumber: number;
  templateName: string | null;
  templateSlug: string | null;
  subject: string | null;
  /** Rolled up from the per-recipient events. */
  status: "sent" | "scheduled" | "failed" | "partial" | "none";
  date: string | null;
  total: number;
  sent: number;
  failed: number;
  errors: string[];
};

export type AutomationStatus = {
  group: GroupOption;
  steps: AutomationStep[];
  totals: { steps: number; sentSteps: number; recipients: number; failedEvents: number; overdue: number };
  lastSentAt: string | null;
  nextSendAt: string | null;
  nextStep: AutomationStep | null;
};

/**
 * Compare timestamps by their actual time value.
 *
 * Do NOT sort these lexicographically. They arrive as ISO strings from PostgREST but as Date
 * objects from a direct pg client, and sorting Dates with the default comparator orders them
 * by their string form ("Fri Sep 11…" before "Tue Sep 15…") — i.e. by weekday name, which
 * silently reports the wrong "last sent" and "next send".
 */
const timeOf = (v: unknown): number => (v ? new Date(v as string).getTime() : NaN);

function pick(values: unknown[], choose: (a: number, b: number) => number): string | null {
  const times = values.map(timeOf).filter((n) => Number.isFinite(n));
  if (!times.length) return null;
  // Wrap the comparator: reduce passes (acc, value, index, array), and handing those four
  // straight to Math.max/min yields NaN — which then throws on toISOString().
  const best = times.reduce((a, b) => choose(a, b));
  return Number.isFinite(best) ? new Date(best).toISOString() : null;
}
const latest = (values: unknown[]) => pick(values, (a, b) => Math.max(a, b));
const earliest = (values: unknown[]) => pick(values, (a, b) => Math.min(a, b));

/** Every group, newest first — the selector's options. */
export async function listGroups(): Promise<GroupOption[]> {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("experiences")
    .select("id, name, status, start_date, archived_at, experience_types(name), experience_attendees(id)")
    .order("created_at", { ascending: false })
    .limit(200);

  return (data ?? [])
    .filter((e: any) => !e.archived_at)
    .map((e: any) => ({
      id: e.id,
      name: e.name ?? "(unnamed group)",
      status: e.status ?? "draft",
      startDate: e.start_date ?? null,
      typeName: e.experience_types?.name ?? null,
      attendees: Array.isArray(e.experience_attendees) ? e.experience_attendees.length : 0,
    }));
}

export async function getAutomationStatus(experienceId: string): Promise<AutomationStatus | null> {
  const supabase = createSupabaseAdminClient();

  const { data: experience } = await supabase
    .from("experiences")
    .select("id, name, status, start_date, experience_types(name), experience_attendees(id)")
    .eq("id", experienceId)
    .maybeSingle();
  if (!experience) return null;

  const [{ data: steps }, { data: events }] = await Promise.all([
    supabase
      .from("experience_steps")
      .select("step_number, email_templates(name, slug, subject)")
      .eq("experience_id", experienceId)
      .order("step_number", { ascending: true }),
    supabase
      .from("experience_send_events")
      .select("step_number, status, scheduled_at, sent_at, error_message")
      .eq("experience_id", experienceId),
  ]);

  const byStep = new Map<number, any[]>();
  for (const e of events ?? []) {
    const list = byStep.get(e.step_number) ?? [];
    list.push(e);
    byStep.set(e.step_number, list);
  }

  const now = Date.now();
  let overdue = 0;

  const rows: AutomationStep[] = (steps ?? []).map((s: any) => {
    const group = byStep.get(s.step_number) ?? [];
    const sent = group.filter((e) => e.status === "sent").length;
    const failed = group.filter((e) => e.status !== "sent" && e.status !== "scheduled").length;
    const scheduled = group.filter((e) => e.status === "scheduled");

    // A step still marked scheduled whose time has passed means the sender isn't keeping up.
    overdue += scheduled.filter((e) => e.scheduled_at && new Date(e.scheduled_at).getTime() < now).length;

    const status: AutomationStep["status"] =
      !group.length ? "none"
      : failed && !sent ? "failed"
      : sent && sent < group.length ? "partial"
      : sent === group.length ? "sent"
      : "scheduled";

    const sentAt = latest(group.map((e) => e.sent_at));
    const schedAt = earliest(group.map((e) => e.scheduled_at));

    return {
      stepNumber: s.step_number,
      templateName: s.email_templates?.name ?? null,
      templateSlug: s.email_templates?.slug ?? null,
      subject: s.email_templates?.subject ?? null,
      status,
      date: sentAt ?? schedAt,
      total: group.length,
      sent,
      failed,
      errors: Array.from(new Set(group.map((e) => e.error_message).filter(Boolean))).slice(0, 3) as string[],
    };
  });

  const lastSentAt = latest((events ?? []).map((e) => e.sent_at));
  const nextSendAt = earliest(
    (events ?? []).filter((e) => e.status === "scheduled").map((e) => e.scheduled_at),
  );

  return {
    group: {
      id: experience.id,
      name: experience.name ?? "(unnamed group)",
      status: experience.status ?? "draft",
      startDate: experience.start_date ?? null,
      typeName: (experience as any).experience_types?.name ?? null,
      attendees: Array.isArray((experience as any).experience_attendees) ? (experience as any).experience_attendees.length : 0,
    },
    steps: rows,
    totals: {
      steps: rows.length,
      sentSteps: rows.filter((r) => r.status === "sent").length,
      recipients: Math.max(0, ...rows.map((r) => r.total)),
      failedEvents: rows.reduce((n, r) => n + r.failed, 0),
      overdue,
    },
    lastSentAt,
    nextSendAt,
    nextStep: rows.find((r) => r.status === "scheduled" || r.status === "partial") ?? null,
  };
}
