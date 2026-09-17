import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { INTERPRETATIONS, SECTIONS } from "@/lib/energy-audit/energy-audit";
import type { EnergyAuditNextStep, EnergySource } from "@/lib/energy-audit/energy-audit";

export const ENERGY_AUDIT_ASSESSMENT = "energy-audit";

export type EnergyAuditSubmission = {
  id: string;
  name: string | null;
  email: string | null;
  total_score: number | null;
  /** Interpretation title, e.g. "Running Warm". */
  stage: string | null;
  strongest_layer: EnergySource | null;
  lowest_layer: EnergySource | null;
  layer_scores: { key: EnergySource; title: string; score: number; level: string }[] | null;
  details: { nextStep?: Partial<EnergyAuditNextStep>; reflections?: Record<string, string> } | null;
  created_at: string;
};

const SELECT = "id,name,email,total_score,stage,strongest_layer,lowest_layer,layer_scores,details,created_at";

/** Every Energy Audit, newest first (admin view). */
export async function listEnergyAudits(limit = 500): Promise<EnergyAuditSubmission[]> {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("check_in_submissions")
    .select(SELECT)
    .eq("assessment", ENERGY_AUDIT_ASSESSMENT)
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as EnergyAuditSubmission[];
}

/** One audit by id — for the PDF and detail views. */
export async function getEnergyAuditById(id: string): Promise<(EnergyAuditSubmission & { answers: Record<string, number> }) | null> {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("check_in_submissions")
    .select(`${SELECT},answers,participant_id`)
    .eq("assessment", ENERGY_AUDIT_ASSESSMENT)
    .eq("id", id)
    .maybeSingle();
  return (data as EnergyAuditSubmission & { answers: Record<string, number> }) ?? null;
}

/** Audits for a set of emails — a facilitator's team. */
export async function getEnergyAuditsForEmails(emails: string[]): Promise<EnergyAuditSubmission[]> {
  const list = Array.from(new Set(emails.map((e) => (e ?? "").trim().toLowerCase()).filter(Boolean)));
  if (!list.length) return [];
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("check_in_submissions")
    .select(SELECT)
    .eq("assessment", ENERGY_AUDIT_ASSESSMENT)
    .in("email", list)
    .order("created_at", { ascending: false })
    .limit(500);
  return (data ?? []) as EnergyAuditSubmission[];
}

export type EnergyAuditStats = {
  count: number;
  people: number;
  averageScore: number | null;
  last7: number;
  /** How many audits fall in each interpretation band. */
  byInterpretation: { label: string; count: number }[];
  /** How often each energy came out lowest — where the audience is most depleted. */
  byLowest: { key: EnergySource; label: string; count: number }[];
  /** Average score per energy source, out of 25. */
  averageBySource: { key: EnergySource; label: string; average: number }[];
};

/** Aggregates for the admin Energy Audit page and the Reports block. */
export async function getEnergyAuditStats(): Promise<EnergyAuditStats> {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("check_in_submissions")
    .select("email,total_score,stage,lowest_layer,layer_scores,created_at")
    .eq("assessment", ENERGY_AUDIT_ASSESSMENT)
    .limit(5000);
  const rows = data ?? [];
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

  const scores = rows.map((r) => r.total_score).filter((n): n is number => typeof n === "number");
  const averageScore = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;

  const interpretationCounts = new Map<string, number>();
  for (const r of rows) {
    const label = (r.stage as string) || "—";
    interpretationCounts.set(label, (interpretationCounts.get(label) ?? 0) + 1);
  }

  const lowestCounts = new Map<string, number>();
  for (const r of rows) {
    const key = r.lowest_layer as string | null;
    if (key) lowestCounts.set(key, (lowestCounts.get(key) ?? 0) + 1);
  }

  const sourceTotals = new Map<string, { sum: number; n: number }>();
  for (const r of rows) {
    for (const s of (r.layer_scores ?? []) as { key: string; score: number }[]) {
      const acc = sourceTotals.get(s.key) ?? { sum: 0, n: 0 };
      acc.sum += Number(s.score) || 0;
      acc.n += 1;
      sourceTotals.set(s.key, acc);
    }
  }

  return {
    count: rows.length,
    people: new Set(rows.map((r) => (r.email as string | null)?.toLowerCase()).filter(Boolean)).size,
    averageScore,
    last7: rows.filter((r) => new Date(r.created_at as string).getTime() >= weekAgo).length,
    // Ordered strongest band → weakest, matching the document's interpretation order.
    byInterpretation: INTERPRETATIONS.map((i) => ({ label: i.title, count: interpretationCounts.get(i.title) ?? 0 })),
    byLowest: SECTIONS.map((s) => ({ key: s.key, label: s.title, count: lowestCounts.get(s.key) ?? 0 })),
    averageBySource: SECTIONS.map((s) => {
      const acc = sourceTotals.get(s.key);
      return { key: s.key, label: s.title, average: acc && acc.n ? Math.round((acc.sum / acc.n) * 10) / 10 : 0 };
    }),
  };
}

/** A single person's Energy Audits, matched by email (participant / portal view). */
export async function getEnergyAuditsByEmail(email: string, limit = 10): Promise<EnergyAuditSubmission[]> {
  const normalized = (email ?? "").trim().toLowerCase();
  if (!normalized) return [];
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("check_in_submissions")
    .select(SELECT)
    .eq("assessment", ENERGY_AUDIT_ASSESSMENT)
    .ilike("email", normalized)
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as EnergyAuditSubmission[];
}
