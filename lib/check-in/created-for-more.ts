// The Created for More Check-In — a Stewardship Blueprint self-assessment.
// Content is from V.3 Created_for_More_Check-In_Stewardship_Blueprint_Assessment.
// Seven layers × four statements, rated 1–5 → layer score /20, total /140.

export type Statement = { text: string; pillar?: "Family" | "Fitness" | "Fun" | "Finances" };
export type Layer = { key: string; index: number; title: string; subtitle: string; coreQuestion: string; statements: Statement[] };

export const SCALE = [
  { value: 1, label: "Strongly Disagree", description: "Rarely true in my life right now." },
  { value: 2, label: "Disagree", description: "Occasionally true, but not consistently." },
  { value: 3, label: "Neutral / Unsure", description: "Somewhat true — there is room to grow." },
  { value: 4, label: "Agree", description: "Mostly true in my life." },
  { value: 5, label: "Strongly Agree", description: "Consistently true and intentionally protected." },
];

export const LAYERS: Layer[] = [
  {
    key: "bedrock", index: 1, title: "Bedrock", subtitle: "Faith & Identity",
    coreQuestion: "Is my identity rooted in something deeper than performance and pressure?",
    statements: [
      { text: "I know who I am beneath my roles, titles, and achievements." },
      { text: "My daily choices flow from a settled identity, not from proving myself." },
      { text: "I return to my faith as a source of stability, not just a Sunday habit." },
      { text: "I can name the truth I stand on when life feels uncertain." },
    ],
  },
  {
    key: "foundation", index: 2, title: "Foundation", subtitle: "Mission, Values & Purpose",
    coreQuestion: "Am I living with clarity about what kind of life I am building?",
    statements: [
      { text: "I have clarity about what matters most in this season." },
      { text: "My calendar reflects my stated priorities." },
      { text: "I could state my mission and values in a sentence if asked." },
      { text: "I am building my life around purpose, not just pressure or expectation." },
    ],
  },
  {
    key: "pillars", index: 3, title: "The Four Pillars", subtitle: "Family, Fitness, Fun & Finances",
    coreQuestion: "Are the areas I stand on every day actually able to hold weight?",
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
    key: "habits", index: 5, title: "Keystone Habits", subtitle: "Small Rhythms That Strengthen the Structure",
    coreQuestion: "Do my daily habits move me toward the life I say I want?",
    statements: [
      { text: "I have identified one or two habits that, if kept, would change everything else." },
      { text: "My mornings or evenings have a rhythm that supports who I am trying to become." },
      { text: "When a keystone habit slips, I notice quickly and recover instead of spiraling." },
      { text: "My habits are shaping my identity, not just filling my to-do list." },
    ],
  },
  {
    key: "energy", index: 6, title: "Energy", subtitle: "The Resource Beneath Every Other Resource",
    coreQuestion: "Am I stewarding the energy beneath everything I do?",
    statements: [
      { text: "I know where my physical, emotional, mental, and spiritual energy actually goes." },
      { text: "I have rhythms of renewal built in before I hit empty, not just after." },
      { text: "I recognize the difference between being busy and being depleted." },
      { text: "I am living on today's connection with God, not yesterday's." },
    ],
  },
  {
    key: "legacy", index: 7, title: "Legacy", subtitle: "What Your Life Multiplies",
    coreQuestion: "What is my life producing beyond me?",
    statements: [
      { text: "I am intentionally shaping what the next generation sees in me." },
      { text: "My time, money, and influence are aligned with what I want to leave behind." },
      { text: "I have had a real conversation about legacy with someone I love." },
      { text: "I am building something today that will outlast me." },
    ],
  },
];

export const TOTAL_STATEMENTS = LAYERS.reduce((n, l) => n + l.statements.length, 0); // 28
export const MAX_SCORE = TOTAL_STATEMENTS * 5; // 140

// Overall stage from the total /140.
export const SCORE_BANDS = [
  { min: 112, max: 140, stage: "Aligned & Intentional", meaning: "You appear to be living with meaningful clarity and intentionality across the seven layers. The next step is not complacency — it is protection and multiplication.", nextStep: "Protect what is healthy. Consider helping others begin." },
  { min: 84, max: 111, stage: "Aware but Stretched", meaning: "You likely have real alignment in some layers, but you may also feel stretched, reactive, or inconsistent. Busyness may be beginning to create drift.", nextStep: "Choose one layer and join a guided 6-week group or 30-day plan." },
  { min: 56, max: 83, stage: "Drifting in Key Layers", meaning: "Parts of your life may be shaped more by default than by design. This is not a reason for shame; it is a reason to pause and adjust.", nextStep: "Start with your lowest layer and invite accountability." },
  { min: 0, max: 55, stage: "Time to Pause & Rebuild", meaning: "This may be a season that calls for deeper reflection, support, and realignment. Do not try to fix everything at once.", nextStep: "Begin with one honest step and trusted support." },
];

// Per-layer status from the layer's /20.
export const LAYER_STATUS = [
  { min: 17, max: 20, status: "Strong / Protect", meaning: "This area is healthy. Protect and strengthen what is already working." },
  { min: 13, max: 16, status: "Stable / Strengthen", meaning: "This area has meaningful alignment but may need a clearer rhythm." },
  { min: 9, max: 12, status: "Stretched / Focus", meaning: "This area needs attention soon before drift becomes normal." },
  { min: 0, max: 8, status: "Drifting / Rebuild", meaning: "This area should become a primary focus for your next faithful step." },
];

// One faithful next step, keyed by the lowest layer.
export const LOWEST_LAYER_GUIDANCE: Record<string, { drift: string; step: string }> = {
  bedrock: { drift: "You may be carrying too much of life from performance, pressure, or self-reliance instead of returning to a deeper source of identity and strength.", step: "Name the truth you need to stand on this week. Reconnect with God, Scripture, prayer, or a trusted spiritual mentor." },
  foundation: { drift: "You may be moving with responsibility but without enough clarity about mission, values, and direction in this season.", step: "Draft a one-sentence purpose statement and use it to make one decision this week." },
  pillars: { drift: "One or more everyday areas of life may be carrying more strain than the structure can sustain long term.", step: "Choose the lowest pillar — Family, Fitness, Fun, or Finances — and take one visible action." },
  guardrails: { drift: "You may be relying on good intentions where a clear boundary is needed before regret arrives.", step: "Write one guardrail and tell one trusted person who can help you keep it." },
  habits: { drift: "Your desired life may not yet have enough repeated rhythms to make alignment sustainable.", step: "Choose one small habit and attach it to an existing daily or weekly rhythm." },
  energy: { drift: "You may be trying to steward important things while running low on the fuel needed to sustain them.", step: "Identify one drain to reduce and one renewal rhythm to protect this week." },
  legacy: { drift: "You may be living responsibly today, but without enough clarity about what your life is multiplying beyond you.", step: "Have one conversation about legacy, values, generosity, or next-generation impact." },
};

export const PILLAR_GUIDANCE: Record<string, { meaning: string; step: string }> = {
  Family: { meaning: "The people closest to you may need more presence, intentional leadership, repair, or connection.", step: "Schedule one conversation, meal, walk, apology, or act of presence." },
  Fitness: { meaning: "Your body, health, sleep, movement, or recovery may not be supporting the life you want to build.", step: "Choose one capacity rhythm: walk, workout, bedtime, medical appointment, or recovery practice." },
  Fun: { meaning: "Joy, rest, adventure, celebration, or meaningful experience may be crowded out by obligation.", step: "Schedule one life-giving experience this week and one larger experience to plan." },
  Finances: { meaning: "Money may be carrying too much fear, identity, comparison, or reaction instead of serving purpose.", step: "Review one spending, saving, giving, or planning pattern and name what money should serve." },
};

export const PATHWAYS = [
  { key: "personal_30", title: "Personal 30-Day Plan", bestFit: "You want to begin privately or your score shows one layer that needs focused attention.", action: "Choose one layer, one action, one conversation, and one rhythm. Retake the Check-In in 30 days." },
  { key: "join_group", title: "Join a 6-Week Group", bestFit: "You want structure, conversation, and accountability with others.", action: "Join a Stewardship Blueprint group or challenge and complete the Check-In before and after the six weeks." },
  { key: "lead_group", title: "Lead or Host a Group", bestFit: "Your score is strong, no major layer is in rebuild, and you feel called to help others begin.", action: "Explore leading or facilitating a 6-week Stewardship Blueprint group with humility, support, and preparation." },
  { key: "book", title: "The Life You're Building", bestFit: "You want to learn the framework through story, Scripture, reflection, and practical action.", action: "Join the book waitlist or updates list." },
  { key: "forgedlife", title: "ForgedLife", bestFit: "You want app-based accountability, habits, challenges, prayer, and group follow-through.", action: "Join the ForgedLife early access list or app waitlist." },
  { key: "church", title: "Church or Ministry Pathway", bestFit: "You are a church, ministry, or group leader considering this for your people.", action: "Explore bringing the Stewardship Blueprint journey to your church or group." },
];

export const NEXT_STEP_OPTIONS = [
  { key: "results", label: "Send me my results and one practical next step." },
  { key: "join_group", label: "I want to join a 6-week Stewardship Blueprint group." },
  { key: "lead_group", label: "I may be interested in leading or facilitating a group." },
  { key: "book", label: "I want updates about The Life You're Building book." },
  { key: "forgedlife", label: "I want updates or early access for the ForgedLife app." },
  { key: "church", label: "I am a church or ministry leader and want to explore this for my people." },
];

export type CheckInScore = {
  answers: Record<string, number>;
  layerScores: { key: string; title: string; subtitle: string; score: number; status: string; statusMeaning: string }[];
  total: number;
  stage: string;
  stageMeaning: string;
  stageNextStep: string;
  strongestLayer: string;
  lowestLayer: string;
  lowestLayerKey: string;
  lowestPillar: string | null;
};

const bandFor = (score: number) => SCORE_BANDS.find((b) => score >= b.min && score <= b.max) ?? SCORE_BANDS[SCORE_BANDS.length - 1];
const statusFor = (score: number) => LAYER_STATUS.find((s) => score >= s.min && score <= s.max) ?? LAYER_STATUS[LAYER_STATUS.length - 1];

// Answers keyed "<layerKey>:<statementIndex>" → 1..5.
export function scoreCheckIn(answers: Record<string, number>): CheckInScore {
  const layerScores = LAYERS.map((layer) => {
    const score = layer.statements.reduce((sum, _s, i) => sum + (answers[`${layer.key}:${i}`] ?? 0), 0);
    const st = statusFor(score);
    return { key: layer.key, title: layer.title, subtitle: layer.subtitle, score, status: st.status, statusMeaning: st.meaning };
  });
  const total = layerScores.reduce((n, l) => n + l.score, 0);
  const band = bandFor(total);
  const sorted = [...layerScores].sort((a, b) => b.score - a.score);
  const strongest = sorted[0];
  const lowest = sorted[sorted.length - 1];

  let lowestPillar: string | null = null;
  if (lowest.key === "pillars") {
    const pillars = LAYERS.find((l) => l.key === "pillars")!.statements;
    let best = Infinity;
    pillars.forEach((s, i) => { const v = answers[`pillars:${i}`] ?? 0; if (s.pillar && v < best) { best = v; lowestPillar = s.pillar; } });
  }

  return {
    answers,
    layerScores,
    total,
    stage: band.stage,
    stageMeaning: band.meaning,
    stageNextStep: band.nextStep,
    strongestLayer: `${strongest.title} — ${strongest.subtitle}`,
    lowestLayer: `${lowest.title} — ${lowest.subtitle}`,
    lowestLayerKey: lowest.key,
    lowestPillar,
  };
}
