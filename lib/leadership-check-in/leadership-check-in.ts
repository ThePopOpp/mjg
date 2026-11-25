// The Leadership Check-In — a Stewardship Blueprint assessment for business owners,
// executives, managers and ministry leaders. Associated study: The Leader You're
// Becoming. Source: docs/assessments/Leadership_Check_In_Jeremy_Implementation_Kit.docx
// (V1.0, November 24, 2026).
//
// A DISTINCT assessment: it reuses the Created for More infrastructure (saving,
// account attachment, Steward's reader) but not its definition. Same shape — seven
// layers × four statements, 1–5, no weighting or reverse scoring, layer 4–20, total
// 28–140 — but its own wording, bands copy and guidance. Never compare its scores
// with the Created for More Check-In as if they were equivalent.
//
// The thresholds are proposed reflective categories, not validated psychometric
// measures (kit §04). Answer keys are "<layerKey>:<index>" and must stay stable.

export type PillarName = "Family" | "Fitness" | "Fun" | "Finances";
export type Statement = { text: string; pillar?: PillarName };
export type Layer = {
  key: string;
  index: number;
  title: string;
  subtitle: string;
  statements: Statement[];
  /** Suggested action for this layer (kit §04). */
  action: string;
  scripture: string;
};

export const ASSESSMENT_KEY = "leadership-check-in";
export const ASSESSMENT_LABEL = "Leadership Check-In";
export const ASSESSMENT_PATH = "/leadership-check-in";
/** Stored on every result (check_in_submissions.details.version). */
export const LEADERSHIP_VERSION = "1.0";

export const SCALE = [
  { value: 1, label: "Strongly disagree" },
  { value: 2, label: "Disagree" },
  { value: 3, label: "Neutral" },
  { value: 4, label: "Agree" },
  { value: 5, label: "Strongly agree" },
] as const;

export const INSTRUCTIONS =
  "Answer based on your current reality, not the leader you hope to become. Your responses identify opportunities for growth, not your worth. All 28 statements are required.";

export const LAYERS: Layer[] = [
  {
    key: "bedrock", index: 1, title: "Bedrock", subtitle: "Identity and ownership",
    statements: [
      { text: "My identity and worth are secure in Christ, regardless of business performance." },
      { text: "I view my leadership responsibilities as something God has entrusted to me." },
      { text: "I regularly seek God’s wisdom in my leadership decisions." },
      { text: "I can experience business setbacks without questioning my personal worth." },
    ],
    action: "Reflect on where your identity rests when performance changes.",
    scripture: "Psalm 24:1",
  },
  {
    key: "foundation", index: 2, title: "Foundation", subtitle: "Faith, values and purpose",
    statements: [
      { text: "I can clearly articulate the purpose behind my work in light of my faith." },
      { text: "My faith actively influences how I make difficult leadership decisions." },
      { text: "My stated values are reflected in how I actually lead." },
      { text: "I have defined success beyond financial performance and professional achievement." },
    ],
    action: "Write a purpose statement, then evaluate one real decision against it.",
    scripture: "Colossians 3:17",
  },
  {
    key: "pillars", index: 3, title: "Four Pillars", subtitle: "Whole-life alignment",
    statements: [
      { text: "My leadership responsibilities allow me to invest meaningfully in my family and closest relationships.", pillar: "Family" },
      { text: "I intentionally protect my physical health and fitness.", pillar: "Fitness" },
      { text: "I make room for rest, joy and meaningful experiences outside of work.", pillar: "Fun" },
      { text: "My financial decisions reflect wisdom, generosity and purpose.", pillar: "Finances" },
    ],
    action: "Protect one commitment outside of work this week.",
    scripture: "Mark 8:36",
  },
  {
    key: "guardrails", index: 4, title: "Guardrails", subtitle: "Protecting what matters",
    statements: [
      { text: "I have clear, pre-decided boundaries around the demands of my work." },
      { text: "I have safeguards against pride, greed and misuse of authority." },
      { text: "I have trusted people who can challenge my leadership decisions honestly." },
      { text: "I maintain my integrity even when doing so has a financial cost." },
    ],
    action: "Choose one boundary and one accountability partner.",
    scripture: "1 Corinthians 10:12–13",
  },
  {
    key: "rhythms", index: 5, title: "Keystone Rhythms", subtitle: "Strengthening leadership",
    statements: [
      { text: "I have consistent rhythms for prayer, reflection and discernment." },
      { text: "I intentionally invest in the development of the people I lead." },
      { text: "I regularly evaluate whether my leadership practices reflect my stated values." },
      { text: "I delegate appropriately rather than making others unnecessarily dependent on me." },
    ],
    action: "Choose one recurring practice that strengthens your leadership.",
    scripture: "Philippians 2:3–4",
  },
  {
    key: "energy", index: 6, title: "Energy", subtitle: "Leadership capacity",
    statements: [
      { text: "I intentionally steward my physical, emotional, mental and spiritual energy." },
      { text: "I recognize when exhaustion is affecting my leadership decisions." },
      { text: "I maintain sustainable rhythms of effort, recovery and renewal." },
      { text: "I respond to criticism and conflict with increasing wisdom and grace." },
    ],
    action: "Identify one source of depletion and one renewal practice.",
    scripture: "Mark 6:31",
  },
  {
    key: "legacy", index: 7, title: "Legacy", subtitle: "Living multiplication",
    statements: [
      { text: "I intentionally model the faith and values I hope others will carry forward." },
      { text: "I equip others to become effective leaders rather than simply effective contributors." },
      { text: "I model and teach generosity in ways others can freely practice and pass on." },
      { text: "I am developing people who can multiply what they have learned through others." },
    ],
    action: "Choose one person to model, teach and equip.",
    scripture: "2 Timothy 2:2",
  },
];

/** Optional, unscored. Stored by index in details.reflections; never in reports or logs. */
export const REFLECTION_QUESTIONS = [
  "What is God currently teaching you through your leadership responsibilities?",
  "Where is the greatest gap between what you believe and how you lead?",
  "If nothing changes over the next five years, what concerns you most about your business or life?",
  "What is one area of leadership you would most like to strengthen?",
];

export const ITEM_KEYS = LAYERS.flatMap((l) => l.statements.map((_, i) => `${l.key}:${i}`));
export const TOTAL_STATEMENTS = ITEM_KEYS.length; // 28
export const LAYER_MAX = 20;
export const MAX_SCORE = TOTAL_STATEMENTS * 5; // 140
export const MIN_SCORE = TOTAL_STATEMENTS; // 28

export const SCORE_BANDS = [
  { min: 112, max: 140, key: "aligned", label: "Aligned & Intentional", copy: "Protect healthy areas and strengthen opportunities." },
  { min: 84, max: 111, key: "stretched", label: "Aware but Stretched", copy: "Leadership demands may be creating gaps between intention and action." },
  { min: 56, max: 83, key: "drifting", label: "Drifting in Key Layers", copy: "Give intentional attention to practical commitments and accountability." },
  { min: 28, max: 55, key: "rebuild", label: "Time to Pause & Rebuild", copy: "Simplify and identify one manageable faithful step." },
] as const;

export const LAYER_STATUS = [
  { min: 17, max: 20, label: "Strong", action: "Protect" },
  { min: 13, max: 16, label: "Stable", action: "Strengthen" },
  { min: 9, max: 12, label: "Stretched", action: "Focus" },
  { min: 4, max: 8, label: "Drifting", action: "Rebuild" },
] as const;

/** Optional, unchecked by default, separate from receiving results (kit §05). */
export const MARKETING_CONSENT_TEXT =
  "Send me occasional emails from Michael J. Gauthier about leadership, stewardship and related studies. I can unsubscribe at any time.";

export const DISCLAIMER = "Your score reflects your current responses, not your worth in Christ.";
export const CATEGORY_NOTE =
  "These are reflective categories, not diagnoses or verdicts. A low score is not a measure of sin, and a high score is not a measure of God’s approval.";
export const ALL_TIED_NOTE =
  "All seven layers scored the same, so no single layer stands out. Choose the one that matters most in this season.";

export type LayerScore = { key: string; title: string; subtitle: string; score: number; label: string; action: string };

export type LeadershipScore = {
  version: string;
  total: number;
  band: { key: string; label: string; copy: string };
  layers: LayerScore[];
  /** Questions 9–12, each 1–5. */
  pillars: Record<PillarName, number>;
  /** Every layer tied for highest / lowest — a tie is never given an invented winner. */
  highestKeys: string[];
  lowestKeys: string[];
  allTied: boolean;
};

export type ParseResult = { ok: true; answers: Record<string, number> } | { ok: false; error: string };

const isRating = (n: unknown): n is number => typeof n === "number" && Number.isInteger(n) && n >= 1 && n <= 5;

/**
 * Strict server-side validation. Accepts either { "<layer>:<i>": n } or
 * [{ id: "<layer>:<i>", value: n }]. Every one of the 28 items must be present
 * exactly once as a whole number 1–5 — missing, fractional, out-of-range,
 * non-numeric and duplicate items are refused, never filled in.
 */
export function parseResponses(raw: unknown): ParseResult {
  const entries: [string, unknown][] = [];
  if (Array.isArray(raw)) {
    for (const item of raw) {
      if (!item || typeof item !== "object") return { ok: false, error: "Invalid response." };
      const { id, value } = item as { id?: unknown; value?: unknown };
      if (typeof id !== "string") return { ok: false, error: "Invalid response." };
      entries.push([id, value]);
    }
  } else if (raw && typeof raw === "object") {
    entries.push(...Object.entries(raw as Record<string, unknown>));
  } else {
    return { ok: false, error: "Please answer every statement first." };
  }

  const known = new Set(ITEM_KEYS);
  const answers: Record<string, number> = {};
  for (const [id, value] of entries) {
    if (!known.has(id)) continue; // unknown keys are ignored, never scored
    if (Object.prototype.hasOwnProperty.call(answers, id)) return { ok: false, error: `Duplicate response for ${id}.` };
    if (!isRating(value)) return { ok: false, error: `Response for ${id} must be a whole number from 1 to 5.` };
    answers[id] = value;
  }
  if (Object.keys(answers).length !== TOTAL_STATEMENTS) return { ok: false, error: "Please answer every statement first." };
  return { ok: true, answers };
}

export const bandFor = (total: number) => SCORE_BANDS.find((b) => total >= b.min && total <= b.max) ?? SCORE_BANDS[SCORE_BANDS.length - 1];
export const layerStatusFor = (score: number) => LAYER_STATUS.find((s) => score >= s.min && score <= s.max) ?? LAYER_STATUS[LAYER_STATUS.length - 1];

export class IncompleteLeadershipCheckInError extends Error {
  constructor(message = "Please answer every statement first.") {
    super(message);
  }
}

/** Score a complete, valid set. Throws rather than scoring partial answers. */
export function scoreLeadership(raw: unknown): LeadershipScore {
  const parsed = parseResponses(raw);
  if (!parsed.ok) throw new IncompleteLeadershipCheckInError(parsed.error);
  const a = parsed.answers;

  const layers = LAYERS.map((layer) => {
    const score = layer.statements.reduce((sum, _s, i) => sum + a[`${layer.key}:${i}`], 0);
    const status = layerStatusFor(score);
    return { key: layer.key, title: layer.title, subtitle: layer.subtitle, score, label: status.label, action: status.action };
  });
  const total = layers.reduce((n, l) => n + l.score, 0);
  const high = Math.max(...layers.map((l) => l.score));
  const low = Math.min(...layers.map((l) => l.score));
  const band = bandFor(total);

  const pillarLayer = LAYERS.find((l) => l.key === "pillars")!;
  const pillars = {} as Record<PillarName, number>;
  pillarLayer.statements.forEach((s, i) => {
    if (s.pillar) pillars[s.pillar] = a[`pillars:${i}`];
  });

  return {
    version: LEADERSHIP_VERSION,
    total,
    band: { key: band.key, label: band.label, copy: band.copy },
    layers,
    pillars,
    highestKeys: layers.filter((l) => l.score === high).map((l) => l.key),
    lowestKeys: layers.filter((l) => l.score === low).map((l) => l.key),
    allTied: high === low,
  };
}

export const layerByKey = (key: string) => LAYERS.find((l) => l.key === key) ?? null;
export const layerName = (key: string) => {
  const l = layerByKey(key);
  return l ? `${l.title} — ${l.subtitle}` : key;
};

/** check_in_submissions columns for a scored result (shared table, distinct assessment key). */
export function leadershipColumns(score: LeadershipScore) {
  return {
    layer_scores: score.layers.map((l) => ({ key: l.key, title: l.title, subtitle: l.subtitle, score: l.score, status: `${l.label} / ${l.action}` })),
    total_score: score.total,
    stage: score.band.label,
    strongest_layer: score.highestKeys.map(layerName).join(" · "),
    lowest_layer: score.lowestKeys.map(layerName).join(" · "),
    lowest_pillar: null,
  };
}

/** Computed details merged into check_in_submissions.details. */
export function leadershipDetails(score: LeadershipScore) {
  return {
    version: score.version,
    band_key: score.band.key,
    pillar_scores: score.pillars,
    highest_layer_keys: score.highestKeys,
    lowest_layer_keys: score.lowestKeys,
    all_tied: score.allTied,
  };
}
