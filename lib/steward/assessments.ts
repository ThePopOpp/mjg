import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  LAYERS,
  LAYER_STATUS,
  LOWEST_LAYER_GUIDANCE,
  MAX_SCORE,
  PILLAR_GUIDANCE,
  SCORE_BANDS,
} from "@/lib/check-in/created-for-more";
import {
  ENERGY_AUDIT_ASSESSMENT,
} from "@/lib/energy-audit/submissions";
import {
  INTERPRETATIONS,
  REFLECTION_QUESTIONS,
  SECTIONS,
  SECTION_MAX,
  TOTAL_MAX,
  answerKey,
  tankLevelFor,
  type EnergySource,
} from "@/lib/energy-audit/energy-audit";

// WHAT STEWARD KNOWS ABOUT A MEMBER'S CHECK-INS.
//
// Steward kept answering like a stranger: "I don't know where to start with my
// family" got a tour of what families generally need. That was not a prompt
// problem. It had nothing specific to say because it could see nothing specific
// — the member's Created for More Check-In and Energy Audit were in the database
// and no tool reached them.
//
// Two shapes, on purpose:
//
//   assessmentSnapshot — scores and bands only. Small enough to put in front of
//   the model on every turn, so it never has to choose to look.
//
//   assessmentDetail — how they rated each statement, what they chose as a next
//   step, and their own reflections. Fetched by a tool when the conversation
//   actually turns to it, keeping the member's private words out of context by
//   default (the "minimum permitted content" of §E02).
//
// Both carry the framework's own interpretation copy for the result — the same
// words the member saw on their results page. That is the teaching Steward is
// allowed to draw on: it comes from the assessment documents, not from the
// model's general idea of what a Christian life coach would say.
//
// MATCHED BY EMAIL, and that is a known weakness. Both Check-Ins are public and
// take any email address, so a result filed under a member's email may not have
// been taken by them. Everything here is labelled self-reported with its date,
// and the instructions tell Steward to hold it as a starting point ("does that
// still fit?") rather than a verdict on their life.

/** How many past results to report for a trend. */
const HISTORY = 5;

type Row = {
  id: string;
  assessment: string;
  total_score: number | null;
  stage: string | null;
  layer_scores: { key: string; score: number }[] | null;
  lowest_pillar: string | null;
  answers: Record<string, number> | null;
  details: Record<string, unknown> | null;
  created_at: string;
};

async function memberEmail(profileId: string): Promise<string | null> {
  const db = createSupabaseAdminClient();
  const { data } = await db.from("profiles").select("email").eq("id", profileId).maybeSingle();
  const email = (data?.email as string | null)?.trim().toLowerCase();
  return email || null;
}

async function memberRows(profileId: string): Promise<Row[]> {
  const email = await memberEmail(profileId);
  if (!email) return [];
  const db = createSupabaseAdminClient();
  const { data } = await db
    .from("check_in_submissions")
    .select("id,assessment,total_score,stage,layer_scores,lowest_pillar,answers,details,created_at")
    .in("assessment", ["created-for-more", ENERGY_AUDIT_ASSESSMENT])
    .ilike("email", email)
    .order("created_at", { ascending: false })
    .limit(HISTORY * 4);
  return (data ?? []) as Row[];
}

const day = (iso: string) => iso.slice(0, 10);

function daysAgo(iso: string): number {
  return Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000));
}

// == Created for More Check-In ===============================================

function layerResults(row: Row) {
  const scores = new Map((row.layer_scores ?? []).map((l) => [l.key, Number(l.score) || 0]));
  return LAYERS.map((layer) => {
    const score = scores.get(layer.key) ?? 0;
    const status = LAYER_STATUS.find((s) => score >= s.min && score <= s.max) ?? LAYER_STATUS[LAYER_STATUS.length - 1];
    return { key: layer.key, layer: `${layer.title} — ${layer.subtitle}`, score, out_of: 20, status: status.status };
  });
}

function checkInSnapshot(row: Row) {
  const layers = layerResults(row);
  const low = Math.min(...layers.map((l) => l.score));
  const high = Math.max(...layers.map((l) => l.score));
  return {
    taken: day(row.created_at),
    days_ago: daysAgo(row.created_at),
    total: row.total_score,
    out_of: MAX_SCORE,
    stage: row.stage,
    layers,
    // Ties are reported as ties — choosing one would invent a focus they did not have.
    lowest: layers.filter((l) => l.score === low).map((l) => l.layer),
    strongest: layers.filter((l) => l.score === high).map((l) => l.layer),
    lowest_pillar: row.lowest_pillar,
  };
}

function checkInDetail(row: Row) {
  const snapshot = checkInSnapshot(row);
  const answers = row.answers ?? {};
  const band = SCORE_BANDS.find((b) => b.stage === row.stage);
  const lowKeys = snapshot.layers.filter((l) => snapshot.lowest.includes(l.layer)).map((l) => l.key);

  return {
    ...snapshot,
    stage_meaning: band?.meaning ?? null,
    stage_next_step: band?.nextStep ?? null,
    layers: LAYERS.map((layer, i) => ({
      ...snapshot.layers[i],
      core_question: layer.coreQuestion,
      status_meaning: LAYER_STATUS.find((s) => s.status === snapshot.layers[i].status)?.meaning ?? null,
      statements: layer.statements.map((statement, j) => ({
        statement: statement.text,
        pillar: statement.pillar ?? null,
        rating: answers[`${layer.key}:${j}`] ?? null,
      })),
    })),
    // The assessment's own guidance for where they came out lowest.
    guidance_for_lowest: lowKeys.map((key) => ({
      layer: LAYERS.find((l) => l.key === key)?.title ?? key,
      ...LOWEST_LAYER_GUIDANCE[key],
    })),
    guidance_for_lowest_pillar: row.lowest_pillar ? PILLAR_GUIDANCE[row.lowest_pillar] ?? null : null,
  };
}

// == Energy Audit =============================================================

function energySources(row: Row) {
  const scores = new Map((row.layer_scores ?? []).map((l) => [l.key, Number(l.score) || 0]));
  return SECTIONS.map((section) => {
    const score = scores.get(section.key) ?? 0;
    return { key: section.key, energy: section.title, score, out_of: SECTION_MAX, level: tankLevelFor(score).label };
  });
}

function energySnapshot(row: Row) {
  const sources = energySources(row);
  const low = Math.min(...sources.map((s) => s.score));
  const nextStep = (row.details?.nextStep ?? null) as { lowestEnergySource?: EnergySource } | null;
  return {
    taken: day(row.created_at),
    days_ago: daysAgo(row.created_at),
    total: row.total_score,
    out_of: TOTAL_MAX,
    result: row.stage,
    sources,
    lowest: sources.filter((s) => s.score === low).map((s) => s.energy),
    // What THEY chose to focus on, which can differ from the lowest score.
    chosen_focus: nextStep?.lowestEnergySource
      ? SECTIONS.find((s) => s.key === nextStep.lowestEnergySource)?.title ?? null
      : null,
  };
}

function energyDetail(row: Row) {
  const snapshot = energySnapshot(row);
  const answers = row.answers ?? {};
  const interpretation = INTERPRETATIONS.find((i) => i.title === row.stage);
  const nextStep = (row.details?.nextStep ?? {}) as Record<string, string | undefined>;
  const reflections = (row.details?.reflections ?? {}) as Record<string, string>;
  const lowKeys = snapshot.sources.filter((s) => snapshot.lowest.includes(s.energy)).map((s) => s.key);

  return {
    ...snapshot,
    result_meaning: interpretation?.meaning ?? null,
    result_reflection_question: interpretation?.reflection ?? null,
    sources: SECTIONS.map((section, i) => ({
      ...snapshot.sources[i],
      core_question: section.coreQuestion,
      statements: section.statements.map((statement, j) => ({
        statement,
        rating: answers[answerKey(section.key, j)] ?? null,
      })),
    })),
    what_refills_the_lowest: lowKeys.map((key) => ({
      energy: SECTIONS.find((s) => s.key === key)!.title,
      refills: SECTIONS.find((s) => s.key === key)!.refills,
    })),
    // Their own words. Only present when they wrote something.
    their_next_step: Object.values(nextStep).some(Boolean)
      ? {
          renewal_focus: nextStep.renewalFocus ?? null,
          next_action: nextStep.nextAction ?? null,
          conversation_with: nextStep.conversationPerson ?? null,
          renewal_rhythm: nextStep.renewalRhythm ?? null,
        }
      : null,
    // Stored by question index; paired with the question so the answer means something.
    their_reflections: Object.keys(reflections).length
      ? Object.entries(reflections).map(([i, answer]) => ({ question: REFLECTION_QUESTIONS[Number(i)] ?? null, answer }))
      : null,
  };
}

// == Public shapes ============================================================

function trend(rows: Row[]) {
  return rows.slice(0, HISTORY).map((r) => ({ taken: day(r.created_at), total: r.total_score, result: r.stage }));
}

/** Scores and bands only — for the per-turn context. */
export async function assessmentSnapshot(profileId: string) {
  const rows = await memberRows(profileId);
  const checkIns = rows.filter((r) => r.assessment === "created-for-more");
  const audits = rows.filter((r) => r.assessment === ENERGY_AUDIT_ASSESSMENT);
  return {
    check_in: checkIns[0] ? { ...checkInSnapshot(checkIns[0]), times_taken: checkIns.length } : null,
    energy_audit: audits[0] ? { ...energySnapshot(audits[0]), times_taken: audits.length } : null,
  };
}

/** Everything about their latest results, plus how they have moved. */
export async function assessmentDetail(profileId: string) {
  const rows = await memberRows(profileId);
  const checkIns = rows.filter((r) => r.assessment === "created-for-more");
  const audits = rows.filter((r) => r.assessment === ENERGY_AUDIT_ASSESSMENT);
  return {
    self_reported: true,
    check_in: checkIns[0]
      ? { ...checkInDetail(checkIns[0]), history: checkIns.length > 1 ? trend(checkIns) : null }
      : null,
    energy_audit: audits[0]
      ? { ...energyDetail(audits[0]), history: audits.length > 1 ? trend(audits) : null }
      : null,
    not_taken: [
      ...(checkIns.length ? [] : ["Created for More Check-In (/created-for-more-check-in)"]),
      ...(audits.length ? [] : ["Energy Audit (/stewardship-blueprint/energy-audit)"]),
    ],
  };
}
