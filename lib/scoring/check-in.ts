import { CHECK_IN_SECTIONS, SCORE_RANGE_LABELS, type CheckInSectionKey } from "@/lib/pilot/constants";

export type CheckInScores = Record<CheckInSectionKey, number[]>;

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
