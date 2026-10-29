import { getPilotDashboardData, getPilotMetrics } from "@/lib/dashboard/pilot-data";
import { getCheckInSubmissionStats, listCheckInSubmissions } from "@/lib/check-in/submissions";
import { getEnergyAuditStats } from "@/lib/energy-audit/submissions";
import { getBookWaitlistStats } from "@/lib/book-waitlist/repository";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

// The Reports page's tables, shared by the dashboard (app/dashboard/reports) and
// the connector's reports_run.

export function getDistribution(values: string[]) {
  const counts = values.reduce<Record<string, number>>((acc, value) => {
    acc[value] = (acc[value] ?? 0) + 1;
    return acc;
  }, {});

  return Object.entries(counts)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getWaveRows(participants: any[], checkIns: any[], surveys: any[]) {
  const waveKeys = Array.from(new Set(participants.map((row) => row.wave ?? row.source).filter(Boolean))).sort();

  return waveKeys.map((wave) => {
    const waveParticipants = participants.filter((row) => row.wave === wave || row.source === wave);
    const participantIds = new Set(waveParticipants.map((row) => row.id));

    return {
      wave,
      participants: waveParticipants.length,
      optedIn: waveParticipants.filter((row) => row.email_journey_opt_in).length,
      checkIns: checkIns.filter((row) => participantIds.has(row.participant_id)).length,
      surveys: surveys.filter((row) => row.participant_id && participantIds.has(row.participant_id)).length,
      innerCircle: waveParticipants.filter((row) => row.inner_circle_status === "accepted").length,
    };
  });
}

export const REPORTS = ["funnel", "waves", "lowest_layers", "permissions", "tags", "energy_audit", "book_waitlist"] as const;
export type ReportName = (typeof REPORTS)[number];
export type ReportRange = { since?: string; until?: string };

const inRange = (range: ReportRange) => (row: { created_at?: string | null }) => {
  if (!range.since && !range.until) return true;
  const t = row.created_at ? new Date(row.created_at).getTime() : NaN;
  if (Number.isNaN(t)) return false;
  return (!range.since || t >= new Date(range.since).getTime()) && (!range.until || t <= new Date(range.until).getTime());
};

/** One Reports-page table, optionally limited to rows created in a date range. */
export async function runReport(report: ReportName, range: ReportRange = {}) {
  const ranged = Boolean(range.since || range.until);
  if (report === "energy_audit") return getEnergyAuditStats(range);
  if (report === "book_waitlist") {
    if (ranged) throw new Error("The book waitlist report covers all time; leave since/until out.");
    return getBookWaitlistStats();
  }

  const [data, submissions] = await Promise.all([getPilotDashboardData(), listCheckInSubmissions(1000)]);
  const keep = inRange(range);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const participants = (data.participants as any[]).filter(keep);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const surveys = (data.surveys as any[]).filter(keep);
  const checkIns = submissions.filter(keep);

  switch (report) {
    case "funnel": {
      const metrics = getPilotMetrics({ ...data, participants, surveys, checkIns });
      const checkInCount = ranged ? checkIns.length : (await getCheckInSubmissionStats()).count;
      return [
        { label: "Invited", value: metrics.invited },
        { label: "Opted in", value: metrics.optedIn },
        { label: "Check-In completed", value: checkInCount },
        { label: "Survey completed", value: metrics.surveyCompleted },
        { label: "Inner Circle accepted", value: metrics.innerCircle },
      ];
    }
    case "waves":
      return getWaveRows(participants, checkIns, surveys);
    case "lowest_layers":
      return getDistribution(checkIns.map((row) => row.lowest_layer).filter(Boolean) as string[]);
    case "permissions": {
      const metrics = getPilotMetrics({ ...data, participants, surveys, checkIns });
      return [
        { label: "Anonymous feedback permission", value: surveys.filter((row) => row.anonymous_feedback_permission).length },
        { label: "Quote/story/interview permission", value: surveys.filter((row) => row.story_interview_permission).length },
        { label: "Follow-up permission", value: metrics.followUpPermission },
        { label: "Pastor/Elder responses", value: metrics.pastorElderResponses },
      ];
    }
    case "tags":
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (data.tags as any[])
        .map((tag) => ({ name: tag.name, category: tag.category, count: tag.participant_tags?.length ?? 0 }))
        .sort((a, b) => b.count - a.count);
  }
}

/** Inner Circle responses (the Inner Circle page's table). */
export async function listInnerCircleResponses(limit = 100) {
  const db = createSupabaseAdminClient();
  const { data, error } = await db
    .from("inner_circle_responses")
    .select("id, name, email, phone, willing, future_feedback_permission, story_interview_permission, public_use_acknowledgement, participant_id, created_at")
    .order("created_at", { ascending: false })
    .limit(Math.min(Math.max(limit, 1), 500));
  if (error) throw new Error(error.message);
  return data ?? [];
}

/** Waves with their participant counts (the waves table plus the Reports wave rows). */
export async function listWaves() {
  const db = createSupabaseAdminClient();
  const [{ data: waves }, rows] = await Promise.all([
    db.from("waves").select("key, name, description, launch_date").order("key"),
    runReport("waves"),
  ]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const byKey = new Map((rows as any[]).map((r) => [r.wave, r]));
  const known = (waves ?? []).map((w) => ({ ...w, ...(byKey.get(w.key) ?? { participants: 0, optedIn: 0, checkIns: 0, surveys: 0, innerCircle: 0 }) }));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const unlisted = (rows as any[]).filter((r) => !(waves ?? []).some((w) => w.key === r.wave)).map((r) => ({ key: r.wave, name: null, ...r }));
  return [...known, ...unlisted];
}
