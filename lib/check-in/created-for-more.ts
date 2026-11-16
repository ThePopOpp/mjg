// The Created for More Check-In — a Stewardship Blueprint self-assessment.
// Content is v4 (Created_for_More_Check-In_v4, revised September 11, 2026 —
// docs/Updates-11-16-26). Seven layers × four statements, rated 1–5 → layer
// score 4–20, total 28–140.
//
// v4 rewords seven statements (Keystone Rhythms 1, 3, 4 and all four Legacy
// statements), four core questions and three layer subtitles. Answer keys
// ("<layerKey>:<index>"), the scale, the bands and their names are unchanged.
// Earlier attempts were taken on v3: CHECK_IN_V3 keeps that wording so an old
// answer is never shown under a question it was not given to.

export type Statement = { text: string; pillar?: "Family" | "Fitness" | "Fun" | "Finances" };
export type Layer = { key: string; index: number; title: string; subtitle: string; coreQuestion: string; statements: Statement[] };

/** Stored on every new result (check_in_submissions.details.version). */
export const CHECK_IN_VERSION = "cfm-v4-2026-09-11";
/** What a result with no recorded version was taken on: everything saved before v4 shipped. */
export const CHECK_IN_V3 = "cfm-v3";

export const SCALE = [
  { value: 1, label: "Strongly Disagree", description: "Rarely true in my life right now." },
  { value: 2, label: "Disagree", description: "Occasionally true, but not consistently." },
  { value: 3, label: "Neutral / Unsure", description: "Somewhat true — there is room to grow." },
  { value: 4, label: "Agree", description: "Mostly true in my life." },
  { value: 5, label: "Strongly Agree", description: "Consistently true and intentionally protected." },
];

export const LAYERS: Layer[] = [
  {
    key: "bedrock", index: 1, title: "Bedrock", subtitle: "Faith + Identity",
    coreQuestion: "Is my identity rooted in something deeper than performance and pressure?",
    statements: [
      { text: "I know who I am beneath my roles, titles, and achievements." },
      { text: "My daily choices flow from a settled identity, not from proving myself." },
      // "Sunday habit" is ordinary language and intentionally unchanged in v4.
      { text: "I return to my faith as a source of stability, not just a Sunday habit." },
      { text: "I can name the truth I stand on when life feels uncertain." },
    ],
  },
  {
    key: "foundation", index: 2, title: "Foundation", subtitle: "Mission + Values + Direction",
    coreQuestion: "Am I living with clarity about what kind of life I am building?",
    statements: [
      { text: "I have clarity about what matters most in this season." },
      { text: "My calendar reflects my stated priorities." },
      { text: "I could state my mission and values in a sentence if asked." },
      { text: "I am building my life around purpose, not just pressure or expectation." },
    ],
  },
  {
    key: "pillars", index: 3, title: "The Four Pillars", subtitle: "Family, Fitness, Fun + Finances",
    coreQuestion: "Are the areas I steward every day receiving the attention they need?",
    statements: [
      { text: "The people I love are receiving my presence, not just my provision.", pillar: "Family" },
      { text: "My sleep, movement, and health support the life I want to build.", pillar: "Fitness" },
      { text: "I make room for joy, rest, and meaningful experiences — not just obligation.", pillar: "Fun" },
      { text: "My finances serve my purpose and values, not fear or comparison.", pillar: "Finances" },
    ],
  },
  {
    key: "guardrails", index: 4, title: "Guardrails", subtitle: "Boundaries That Protect What Matters",
    coreQuestion: "Do I have boundaries in place before I need them — not just after damage is done?",
    statements: [
      { text: "I have clear boundaries around my time, attention, and commitments." },
      { text: "I have limits in place that protect my integrity under pressure." },
      { text: "I say no to good things that would crowd out my best things." },
      { text: "Someone else knows my guardrails and helps me keep them." },
    ],
  },
  {
    // The key stays "habits": it is the stored answer key for every past result.
    key: "habits", index: 5, title: "Keystone Rhythms", subtitle: "Small Rhythms That Strengthen the Structure",
    coreQuestion: "Do my repeated rhythms support the life I say I want?",
    statements: [
      { text: "I have identified one or two keystone rhythms that strengthen other important areas of my life." },
      { text: "My mornings or evenings have a rhythm that supports who I am trying to become." },
      { text: "When a keystone rhythm slips, I notice quickly and return instead of spiraling." },
      { text: "My rhythms support who I am becoming, rather than simply filling my to-do list." },
    ],
  },
  {
    key: "energy", index: 6, title: "Energy", subtitle: "Capacity to Receive, Renew, Direct, and Protect",
    coreQuestion: "Am I renewing and wisely directing the energy entrusted to me?",
    statements: [
      { text: "I know where my physical, emotional, mental, and spiritual energy actually goes." },
      { text: "I have rhythms of renewal built in before I hit empty, not just after." },
      { text: "I recognize the difference between being busy and being depleted." },
      { text: "I am living on today's connection with God, not yesterday's." },
    ],
  },
  {
    key: "legacy", index: 7, title: "Legacy", subtitle: "What Your Life Multiplies Now",
    coreQuestion: "What am I helping others learn, practice, and pass on while I am living?",
    statements: [
      { text: "I intentionally model the values I hope others will learn from my life." },
      { text: "I use my time, resources, and influence to help others grow in what matters now." },
      { text: "I model and explain generosity and invite others to practice it with me." },
      { text: "I give others opportunities to practice what they are learning and encourage them to pass it on." },
    ],
  },
];

/**
 * The v3 wording that differs from v4, for reading results taken before v4.
 * Anything not listed here was identical in v3.
 */
export const V3_WORDING: {
  subtitles: Record<string, string>;
  coreQuestions: Record<string, string>;
  statements: Record<string, string>;
} = {
  subtitles: {
    bedrock: "Faith & Identity",
    foundation: "Mission, Values & Purpose",
    pillars: "Family, Fitness, Fun & Finances",
    energy: "The Resource Beneath Every Other Resource",
    legacy: "What Your Life Multiplies",
  },
  coreQuestions: {
    pillars: "Are the areas I stand on every day actually able to hold weight?",
    habits: "Do my daily habits move me toward the life I say I want?",
    energy: "Am I stewarding the energy beneath everything I do?",
    legacy: "What is my life producing beyond me?",
  },
  statements: {
    "habits:0": "I have identified one or two habits that, if kept, would change everything else.",
    "habits:2": "When a keystone habit slips, I notice quickly and recover instead of spiraling.",
    "habits:3": "My habits are shaping my identity, not just filling my to-do list.",
    "legacy:0": "I am intentionally shaping what the next generation sees in me.",
    "legacy:1": "My time, money, and influence are aligned with what I want to leave behind.",
    "legacy:2": "I have had a real conversation about legacy with someone I love.",
    "legacy:3": "I am building something today that will outlast me.",
  },
};

/** The layers exactly as a given version asked them. */
export function layersForVersion(version: string): Layer[] {
  if (version === CHECK_IN_VERSION) return LAYERS;
  return LAYERS.map((layer) => ({
    ...layer,
    subtitle: V3_WORDING.subtitles[layer.key] ?? layer.subtitle,
    coreQuestion: V3_WORDING.coreQuestions[layer.key] ?? layer.coreQuestion,
    statements: layer.statements.map((s, i) => ({ ...s, text: V3_WORDING.statements[`${layer.key}:${i}`] ?? s.text })),
  }));
}

export const TOTAL_STATEMENTS = LAYERS.reduce((n, l) => n + l.statements.length, 0); // 28
export const MAX_SCORE = TOTAL_STATEMENTS * 5; // 140
export const MIN_SCORE = TOTAL_STATEMENTS; // 28 — a blank is never zero

// Overall reflection category from the total. Names and boundaries unchanged in v4;
// the wording is v4's. "Below 56" means 28–55 for a complete Check-In.
export const SCORE_BANDS = [
  { min: 112, max: 140, stage: "Aligned & Intentional", meaning: "Your responses suggest meaningful clarity across the layers.", nextStep: "Protect what is working; consider a willing opportunity to help others learn." },
  { min: 84, max: 111, stage: "Aware but Stretched", meaning: "You may have alignment in some layers while feeling stretched elsewhere.", nextStep: "Choose one useful area to explore." },
  { min: 56, max: 83, stage: "Drifting in Key Layers", meaning: "Some areas may be shaped more by default than by design.", nextStep: "Pause, seek context, and choose one realistic adjustment." },
  { min: 28, max: 55, stage: "Time to Pause & Rebuild", meaning: "This may be a season for greater reflection and trusted support.", nextStep: "Begin with one honest, manageable step — not a life overhaul." },
];

/** Shown with every result: these are reflection bands, not verdicts. */
export const SCORE_NOTE =
  "These are reflection bands, not diagnoses or Blueprint definition states. A high total can still contain an area that needs attention.";

// Per-layer category from the layer's 4–20.
export const LAYER_STATUS = [
  { min: 17, max: 20, status: "Strong / Protect", meaning: "Your responses suggest this area is working well. Notice and protect what helps." },
  { min: 13, max: 16, status: "Stable / Strengthen", meaning: "Your responses suggest meaningful alignment; one rhythm or clarification may help." },
  { min: 9, max: 12, status: "Stretched / Focus", meaning: "Your responses suggest strain worth understanding before choosing a next step." },
  { min: 4, max: 8, status: "Drifting / Rebuild", meaning: "Your responses suggest an area to explore with care and support — not an automatic verdict." },
];

/**
 * A possible pattern and one possible faithful step, per layer. A lowest score
 * begins a question; it does not name the cause or choose the priority.
 */
export const LOWEST_LAYER_GUIDANCE: Record<string, { drift: string; step: string }> = {
  bedrock: { drift: "Performance, pressure, or self-reliance may be crowding out your sense of identity and stability.", step: "Name the truth you stand on. Consider Scripture, prayer, or a conversation with a trusted spiritual mentor." },
  foundation: { drift: "You may be carrying responsibility without enough clarity about mission, values, or this season.", step: "Begin a sentence about what matters now; test it against one real decision." },
  pillars: { drift: "One or more everyday areas may be receiving less attention than you intend.", step: "Look at the individual Pillar responses and choose the most relevant area — not automatically the lowest." },
  guardrails: { drift: "Good intentions may need a clearer boundary before a familiar pressure arrives.", step: "Propose one boundary and consider which trusted person could support it." },
  habits: { drift: "The life you want may need a repeatable practice or a clearer return point.", step: "Try one small rhythm, or return to a useful rhythm you already chose." },
  energy: { drift: "Important responsibilities may be drawing on capacity that is not being sufficiently renewed.", step: "Distinguish necessary demands from avoidable leaks; protect one renewing practice." },
  legacy: { drift: "You may want greater intention about what others learn and practice through your life now.", step: "Consider one willing person with whom you could model, explain, or practice what matters, including generosity." },
};

export const LOWEST_LAYER_NOTE =
  "A lowest score can point toward a useful question. It does not tell us the cause or automatically select your most important priority. Consider what has been happening, what you already protect, and where you are ready to begin.";

export const PILLAR_GUIDANCE: Record<string, { meaning: string; step: string }> = {
  Family: { meaning: "Presence, care, repair, friendship, or connection may need attention.", step: "Choose a conversation, meal, walk, apology, or act of presence with a safe person." },
  Fitness: { meaning: "Sleep, movement, recovery, or health needs may be affecting your capacity.", step: "Choose a familiar movement or renewal practice, or seek appropriate care when needed." },
  Fun: { meaning: "Joy, rest, play, or meaningful experiences may be crowded out by obligation.", step: "Make room for one life-giving experience that fits your circumstances." },
  Finances: { meaning: "Money may feel reactive or disconnected from what you want it to serve.", step: "Review one spending, saving, giving, or planning choice and name its purpose." },
};

// Pathways are offered to everyone. None is unlocked or recommended by a score —
// in particular, a high score does not establish readiness to lead a group.
// Keys are stored in check_in_submissions.chosen_pathways; keep them stable.
export const PATHWAYS = [
  { key: "personal_30", title: "Begin with your next faithful step", bestFit: "Act on one insight now and choose a realistic review point. No purchase is needed.", action: "Choose one layer or Pillar, one small action this week, and a review point. Consider retaking the Check-In in 30 days." },
  { key: "steward", title: "Free Personal Stewardship Blueprint", bestFit: "Steward is your personal guide for designing and living a life that matters.", action: "Begin a free Personal Stewardship Blueprint with Steward. A Full Blueprint Build and ongoing guidance are optional, and your work carries forward." },
  { key: "join_group", title: "Six-week study or group", bestFit: "Learn and practice the framework with others.", action: "The study remains the primary experience; deeper personalization can follow afterward." },
  { key: "book", title: "The Life You're Building", bestFit: "Learn the framework through story, Scripture, reflection, and practical action.", action: "Join the book waitlist or updates list." },
  { key: "forgedlife", title: "ForgedLife", bestFit: "Community, practice, and human accountability.", action: "A complementary way to practice with others — never a step you must take before your results." },
  { key: "church", title: "Church, ministry, or facilitating", bestFit: "You lead people, or want to explore facilitating a group.", action: "Explore preparation and support with a church or group leader. An assessment score does not establish readiness to lead." },
];

export const NEXT_STEP_OPTIONS = [
  { key: "results", label: "Send me my results and one practical next step." },
  { key: "steward", label: "I want to build my free Personal Stewardship Blueprint with Steward." },
  { key: "join_group", label: "I want to join a six-week Stewardship Blueprint group." },
  { key: "lead_group", label: "I may be interested in leading or facilitating a group." },
  { key: "book", label: "I want updates about The Life You're Building book." },
  { key: "forgedlife", label: "I want updates or early access for the ForgedLife app." },
  { key: "church", label: "I am a church or ministry leader and want to explore this for my people." },
];

export const SUPPORT_NOTE =
  "This is a reflection assessment. If a situation involves danger, abuse, self-harm, or urgent medical concerns, prioritize appropriate immediate human help. A score alone does not determine the need.";

export type LayerScore = { key: string; title: string; subtitle: string; score: number; status: string; statusMeaning: string };

export type CheckInScore = {
  version: string;
  answers: Record<string, number>;
  layerScores: LayerScore[];
  total: number;
  stage: string;
  stageMeaning: string;
  stageNextStep: string;
  /** Every layer tied for highest / lowest — a tie never gets an invented winner. */
  strongestLayers: string[];
  lowestLayers: string[];
  lowestLayerKeys: string[];
  /** The same lists joined, for the single text columns and short summaries. */
  strongestLayer: string;
  lowestLayer: string;
  /** Kept for callers that want one key: the first of lowestLayerKeys. */
  lowestLayerKey: string;
  /** Each Pillar's own 1–5 response. */
  pillarResponses: Record<string, number>;
  /** Lowest Pillar(s) when the Four Pillars layer is among the lowest; ties joined with " / ". */
  lowestPillar: string | null;
  lowestPillars: string[];
};

export class IncompleteCheckInError extends Error {
  constructor() {
    super("Please answer every statement first.");
  }
}

const isRating = (n: unknown): n is number => Number.isInteger(n) && (n as number) >= 1 && (n as number) <= 5;

/**
 * Keep only the 28 known statements with a whole-number 1–5 rating. Returns null
 * unless all 28 are present: a missing answer is never filled in as 0 or "neutral".
 */
export function completeAnswers(raw: unknown): Record<string, number> | null {
  const source = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const answers: Record<string, number> = {};
  for (const layer of LAYERS) {
    for (let i = 0; i < layer.statements.length; i++) {
      const key = `${layer.key}:${i}`;
      const value = source[key];
      const n = typeof value === "string" && value.trim() !== "" ? Number(value) : value;
      if (!isRating(n)) return null;
      answers[key] = n;
    }
  }
  return answers;
}

const bandFor = (score: number) => SCORE_BANDS.find((b) => score >= b.min && score <= b.max) ?? SCORE_BANDS[SCORE_BANDS.length - 1];
const statusFor = (score: number) => LAYER_STATUS.find((s) => score >= s.min && score <= s.max) ?? LAYER_STATUS[LAYER_STATUS.length - 1];
const label = (l: { title: string; subtitle: string }) => `${l.title} — ${l.subtitle}`;

/** Answers keyed "<layerKey>:<statementIndex>" → 1..5. All 28 are required. */
export function scoreCheckIn(raw: Record<string, number>): CheckInScore {
  const answers = completeAnswers(raw);
  if (!answers) throw new IncompleteCheckInError();

  const layerScores = LAYERS.map((layer) => {
    const score = layer.statements.reduce((sum, _s, i) => sum + answers[`${layer.key}:${i}`], 0);
    const st = statusFor(score);
    return { key: layer.key, title: layer.title, subtitle: layer.subtitle, score, status: st.status, statusMeaning: st.meaning };
  });
  const total = layerScores.reduce((n, l) => n + l.score, 0);
  const band = bandFor(total);
  const high = Math.max(...layerScores.map((l) => l.score));
  const low = Math.min(...layerScores.map((l) => l.score));
  const strongest = layerScores.filter((l) => l.score === high);
  const lowest = layerScores.filter((l) => l.score === low);

  const pillarStatements = LAYERS.find((l) => l.key === "pillars")!.statements;
  const pillarResponses: Record<string, number> = {};
  pillarStatements.forEach((s, i) => {
    if (s.pillar) pillarResponses[s.pillar] = answers[`pillars:${i}`];
  });
  let lowestPillars: string[] = [];
  if (lowest.some((l) => l.key === "pillars")) {
    const min = Math.min(...Object.values(pillarResponses));
    lowestPillars = Object.keys(pillarResponses).filter((p) => pillarResponses[p] === min);
  }

  return {
    version: CHECK_IN_VERSION,
    answers,
    layerScores,
    total,
    stage: band.stage,
    stageMeaning: band.meaning,
    stageNextStep: band.nextStep,
    strongestLayers: strongest.map(label),
    lowestLayers: lowest.map(label),
    lowestLayerKeys: lowest.map((l) => l.key),
    strongestLayer: strongest.map(label).join(" · "),
    lowestLayer: lowest.map(label).join(" · "),
    lowestLayerKey: lowest[0].key,
    pillarResponses,
    lowestPillar: lowestPillars.length ? lowestPillars.join(" / ") : null,
    lowestPillars,
  };
}

/** check_in_submissions.details for a scored result. */
export function checkInDetails(score: CheckInScore) {
  return {
    version: score.version,
    strongest_layers: score.strongestLayers,
    lowest_layers: score.lowestLayers,
    lowest_layer_keys: score.lowestLayerKeys,
    pillar_responses: score.pillarResponses,
  };
}
