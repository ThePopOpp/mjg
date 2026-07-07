import { CHECK_IN_SECTIONS, SCORE_RANGE_LABELS, type CheckInSectionKey } from "@/lib/pilot/constants";
import type { CheckInDefinition } from "@/lib/pilot/form-types";

export type CheckInScores = Record<CheckInSectionKey, number[]>;

export type CheckInScoreDefResult = {
  sectionScores: Record<string, number>;
  totalScore: number;
  maxScore: number;
  lowestAreaKey: string;
  lowestAreaLabel: string;
  lowestAreaTag: string;
  scoreRangeCategory: string;
};

// Definition-driven scorer (generalizes over any sections/scale). Score ranges
// are expressed as a percentage of the max possible so they hold as the number
// of questions changes.
export function scoreCheckInDef(def: CheckInDefinition, scores: Record<string, number[]>): CheckInScoreDefResult {
  const scaleMax = def.scaleMax || 5;
  const sectionScores: Record<string, number> = {};
  for (const section of def.sections) {
    const values = scores[section.key];
    if (!Array.isArray(values) || values.length !== section.questions.length) throw new Error(`Missing scores for ${section.title}.`);
    for (const v of values) {
      if (!Number.isInteger(v) || v < 1 || v > scaleMax) throw new Error(`Invalid score for ${section.title}. Scores must be whole numbers from 1 to ${scaleMax}.`);
    }
    sectionScores[section.key] = values.reduce((sum, v) => sum + v, 0);
  }
  const totalScore = Object.values(sectionScores).reduce((s, v) => s + v, 0);
  const maxScore = def.sections.reduce((s, sec) => s + sec.questions.length * scaleMax, 0) || 1;
  const lowest = def.sections.reduce((lo, s) => (sectionScores[s.key] < sectionScores[lo.key] ? s : lo));
  const pct = (totalScore / maxScore) * 100;
  const range = [...def.ranges].sort((a, b) => b.minPct - a.minPct).find((r) => pct >= r.minPct) ?? def.ranges[def.ranges.length - 1];
  return { sectionScores, totalScore, maxScore, lowestAreaKey: lowest.key, lowestAreaLabel: lowest.title, lowestAreaTag: lowest.lowestTag, scoreRangeCategory: range?.label ?? "" };
}

export type CheckInScoreResult = {
  sectionScores: Record<CheckInSectionKey, number>;
  totalScore: number;
  lowestAreaKey: CheckInSectionKey;
  lowestAreaLabel: string;
  lowestAreaTag: string;
  scoreRangeCategory: string;
};

export function scoreCheckIn(scores: CheckInScores): CheckInScoreResult {
  const sectionScores = {} as Record<CheckInSectionKey, number>;

  for (const section of CHECK_IN_SECTIONS) {
    const values = scores[section.key];
    if (!Array.isArray(values) || values.length !== section.questions.length) {
      throw new Error(`Missing scores for ${section.title}.`);
    }

    for (const value of values) {
      if (!Number.isInteger(value) || value < 1 || value > 5) {
        throw new Error(`Invalid score for ${section.title}. Scores must be whole numbers from 1 to 5.`);
      }
    }

    sectionScores[section.key] = values.reduce((sum, value) => sum + value, 0);
  }

  const totalScore = Object.values(sectionScores).reduce((sum, value) => sum + value, 0);
  const lowestSection = CHECK_IN_SECTIONS.reduce((lowest, section) =>
    sectionScores[section.key] < sectionScores[lowest.key] ? section : lowest,
  );

  return {
    sectionScores,
    totalScore,
    lowestAreaKey: lowestSection.key,
    lowestAreaLabel: lowestSection.title,
    lowestAreaTag: lowestSection.lowestTag,
    scoreRangeCategory: getScoreRangeCategory(totalScore),
  };
}

export function getScoreRangeCategory(totalScore: number) {
  if (totalScore >= 100 && totalScore <= 125) return SCORE_RANGE_LABELS.aligned;
  if (totalScore >= 75) return SCORE_RANGE_LABELS.stretched;
  if (totalScore >= 50) return SCORE_RANGE_LABELS.drifting;
  return SCORE_RANGE_LABELS.rebuild;
}
