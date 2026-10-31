import { LAYERS, TOTAL_STATEMENTS, scoreCheckIn } from "@/lib/check-in/created-for-more";
import { SECTIONS, answerKey, isComplete, isRating, scoreEnergyAudit } from "@/lib/energy-audit/energy-audit";
import { ENERGY_AUDIT_ASSESSMENT } from "@/lib/energy-audit/submissions";

// Every assessment whose results save to check_in_submissions and reach Steward.
//
// Adding an assessment (docs/assessments/adding-an-assessment.md):
//   1. add an entry here — how to clean its answers and which columns its score fills;
//   2. call useAssessmentAutosave() on its results screen (components/assessments).
// Results then save to the member's account the moment they're shown, signed-out
// visitors get the sign-in modal, and Steward's reader (lib/steward/assessments.ts)
// can see them by profile id.
//
// Server-only: scores are always recomputed from the answers, never taken from the client.

export type AssessmentDefinition = {
  /** check_in_submissions.assessment — also the URL segment of /api/assessments/[key]/save. */
  key: string;
  label: string;
  /** Public page that runs it. */
  path: string;
  /** Keep only known statements with a 1–5 rating; null unless complete enough to save. */
  cleanAnswers(raw: unknown): Record<string, number> | null;
  /** The check_in_submissions columns this result fills (scores, band, strongest/lowest). */
  columns(answers: Record<string, number>): Record<string, unknown>;
  /** Computed details merged into check_in_submissions.details. */
  details?(answers: Record<string, number>): Record<string, unknown>;
};

const asObject = (raw: unknown): Record<string, unknown> => (raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {});

const createdForMore: AssessmentDefinition = {
  key: "created-for-more",
  label: "Created for More Check-In",
  path: "/created-for-more-check-in",
  cleanAnswers(raw) {
    const source = asObject(raw);
    const answers: Record<string, number> = {};
    for (const layer of LAYERS) {
      layer.statements.forEach((_, i) => {
        const key = `${layer.key}:${i}`;
        const n = Number(source[key]);
        if (isRating(n)) answers[key] = n;
      });
    }
    return Object.keys(answers).length >= TOTAL_STATEMENTS ? answers : null;
  },
  columns(answers) {
    const score = scoreCheckIn(answers);
    return {
      layer_scores: score.layerScores,
      total_score: score.total,
      stage: score.stage,
      strongest_layer: score.strongestLayer,
      lowest_layer: score.lowestLayer,
      lowest_pillar: score.lowestPillar,
    };
  },
};

const energyAudit: AssessmentDefinition = {
  key: ENERGY_AUDIT_ASSESSMENT,
  label: "Energy Audit",
  path: "/stewardship-blueprint/energy-audit",
  cleanAnswers(raw) {
    const source = asObject(raw);
    const answers: Record<string, number> = {};
    for (const section of SECTIONS) {
      section.statements.forEach((_, i) => {
        const key = answerKey(section.key, i);
        const n = Number(source[key]);
        if (isRating(n)) answers[key] = n;
      });
    }
    return isComplete(answers) ? answers : null;
  },
  columns(answers) {
    const score = scoreEnergyAudit(answers);
    return {
      // The shared columns, reused for the four energy sources.
      layer_scores: score.sections.map((s) => ({ key: s.key, title: s.title, score: s.score, level: s.level })),
      total_score: score.total,
      stage: score.interpretation.title,
      strongest_layer: score.strongest,
      lowest_layer: score.lowest,
    };
  },
  details(answers) {
    const score = scoreEnergyAudit(answers);
    return { interpretationKey: score.interpretation.key, lowestTied: score.lowestTied };
  },
};

export const ASSESSMENTS: Record<string, AssessmentDefinition> = {
  [createdForMore.key]: createdForMore,
  [energyAudit.key]: energyAudit,
};

export function getAssessment(key: string): AssessmentDefinition | null {
  return Object.prototype.hasOwnProperty.call(ASSESSMENTS, key) ? ASSESSMENTS[key] : null;
}

/** Assessment keys Steward reads (lib/steward/assessments.ts). */
export const STEWARD_ASSESSMENTS = Object.keys(ASSESSMENTS);
