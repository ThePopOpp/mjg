// Created for More Check-In — results content (client-safe, no DB).
// The narrative shown after scoring: stage bands, per-layer drift patterns,
// recommended pathways, and lead-capture intents. Sourced from the Stewardship
// Blueprint Check-In document.

import {
  LOWEST_LAYER_GUIDANCE,
  NEXT_STEP_OPTIONS,
  PATHWAYS as CHECK_IN_PATHWAYS,
  SCORE_BANDS,
  SUPPORT_NOTE as CHECK_IN_SUPPORT_NOTE,
} from "@/lib/check-in/created-for-more";

// All of this is derived from the v4 Check-In content in
// lib/check-in/created-for-more.ts, so the pilot flow and the public Check-In
// can no longer drift apart.

export type StageContent = { meaning: string; nextStep: string };

// Keyed by the range label produced by the scorer (see DEFAULT_RANGES).
export const STAGE_CONTENT: Record<string, StageContent> = Object.fromEntries(
  SCORE_BANDS.map((b) => [b.stage, { meaning: b.meaning, nextStep: b.nextStep }]),
);

/** A possible pattern to explore — a question, not a diagnosis. */
export type LayerDrift = { driftPattern: string; nextStep: string };

// Keyed by check-in section key (see CHECK_IN_SECTIONS).
export const LAYER_DRIFT: Record<string, LayerDrift> = Object.fromEntries(
  Object.entries(LOWEST_LAYER_GUIDANCE).map(([key, g]) => [key, { driftPattern: g.drift, nextStep: g.step }]),
);

export type Pathway = { title: string; bestFit: string; action: string };

export const PATHWAYS: Pathway[] = CHECK_IN_PATHWAYS.map(({ title, bestFit, action }) => ({ title, bestFit, action }));

export const LEAD_INTENTS: string[] = NEXT_STEP_OPTIONS.map((o) => o.label);

export const SUPPORT_NOTE = CHECK_IN_SUPPORT_NOTE;

// Per-layer status from a section's raw score and the scale. For the standard
// four statements on 1–5 (4–20) these are exactly v4's boundaries: 17 / 13 / 9.
export function layerStatus(sectionScore: number, questionCount: number, scaleMax: number): string {
  const max = questionCount * scaleMax || 1;
  const pct = (sectionScore / max) * 100;
  if (pct >= 85) return "Strong / Protect";
  if (pct >= 65) return "Stable / Strengthen";
  if (pct >= 45) return "Stretched / Focus";
  return "Drifting / Rebuild";
}
