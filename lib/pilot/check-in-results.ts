// Created for More Check-In — results content (client-safe, no DB).
// The narrative shown after scoring: stage bands, per-layer drift patterns,
// recommended pathways, and lead-capture intents. Sourced from the Stewardship
// Blueprint Check-In document.

export type StageContent = { meaning: string; nextStep: string };

// Keyed by the range label produced by the scorer (see DEFAULT_RANGES).
export const STAGE_CONTENT: Record<string, StageContent> = {
  "Aligned & Intentional": {
    meaning:
      "You appear to be living with meaningful clarity and intentionality across the seven layers. The next step is not complacency — it is protection and multiplication.",
    nextStep: "Protect what is healthy. Consider helping others begin.",
  },
  "Aware but Stretched": {
    meaning:
      "You likely have real alignment in some layers, but you may also feel stretched, reactive, or inconsistent. Busyness may be beginning to create drift.",
    nextStep: "Choose one layer and join a guided 6-week group or 30-day plan.",
  },
  "Drifting in Key Layers": {
    meaning:
      "Parts of your life may be shaped more by default than by design. This is not a reason for shame; it is a reason to pause and adjust.",
    nextStep: "Start with your lowest layer and invite accountability.",
  },
  "Time to Pause & Rebuild": {
    meaning:
      "This may be a season that calls for deeper reflection, support, and realignment. Do not try to fix everything at once.",
    nextStep: "Begin with one honest step and trusted support.",
  },
};

export type LayerDrift = { driftPattern: string; nextStep: string };

// Keyed by check-in section key (see CHECK_IN_SECTIONS).
export const LAYER_DRIFT: Record<string, LayerDrift> = {
  bedrock: {
    driftPattern:
      "You may be carrying too much of life from performance, pressure, or self-reliance instead of returning to a deeper source of identity and strength.",
    nextStep:
      "Name the truth you need to stand on this week. Reconnect with God, Scripture, prayer, or a trusted spiritual mentor.",
  },
  foundation: {
    driftPattern:
      "You may be moving with responsibility but without enough clarity about mission, values, and direction in this season.",
    nextStep: "Draft a one-sentence purpose statement and use it to make one decision this week.",
  },
  pillars: {
    driftPattern:
      "One or more everyday areas of life may be carrying more strain than the structure can sustain long term.",
    nextStep: "Choose the lowest pillar — Family, Fitness, Fun, or Finances — and take one visible action.",
  },
  guardrails: {
    driftPattern: "You may be relying on good intentions where a clear boundary is needed before regret arrives.",
    nextStep: "Write one guardrail and tell one trusted person who can help you keep it.",
  },
  habits: {
    driftPattern: "Your desired life may not yet have enough repeated rhythms to make alignment sustainable.",
    nextStep: "Choose one small habit and attach it to an existing daily or weekly rhythm.",
  },
  energy: {
    driftPattern:
      "You may be trying to steward important things while running low on the fuel needed to sustain them.",
    nextStep: "Identify one drain to reduce and one renewal rhythm to protect this week.",
  },
  legacy: {
    driftPattern:
      "You may be living responsibly today, but without enough clarity about what your life is multiplying beyond you.",
    nextStep: "Have one conversation about legacy, values, generosity, or next-generation impact.",
  },
};

export type Pathway = { title: string; bestFit: string; action: string };

export const PATHWAYS: Pathway[] = [
  {
    title: "Personal 30-Day Plan",
    bestFit: "You want to begin privately, or your score shows one layer that needs focused attention.",
    action: "Choose one layer, one action, one conversation, and one rhythm. Retake the Check-In in 30 days.",
  },
  {
    title: "Join a 6-Week Group",
    bestFit: "You want structure, conversation, and accountability with others.",
    action: "Join a Stewardship Blueprint group or challenge and complete the Check-In before and after the six weeks.",
  },
  {
    title: "Lead or Host a Group",
    bestFit: "Your score is strong, no major layer is in rebuild, and you feel called to help others begin.",
    action: "Explore leading or facilitating a 6-week Stewardship Blueprint group with humility, support, and preparation.",
  },
  {
    title: "The Life You're Building",
    bestFit: "You want to learn the framework through story, Scripture, reflection, and practical action.",
    action: "Join the book waitlist or updates list.",
  },
  {
    title: "ForgedLife",
    bestFit: "You want app-based accountability, habits, challenges, prayer, and group follow-through.",
    action: "Join the ForgedLife early access list or app waitlist.",
  },
  {
    title: "Church or Ministry Pathway",
    bestFit: "You are a church, ministry, or group leader considering this for your people.",
    action: "Explore bringing the Stewardship Blueprint journey to your church or group.",
  },
];

export const LEAD_INTENTS: string[] = [
  "Send me my results and one practical next step.",
  "I want to join a 6-week Stewardship Blueprint group.",
  "I may be interested in leading or facilitating a group.",
  "I want updates about The Life You're Building book.",
  "I want updates or early access for the ForgedLife app.",
  "I am a church or ministry leader and want to explore this for my people.",
];

export const SUPPORT_NOTE =
  "This tool is a reflection assessment. If your answers reveal crisis, danger, abuse, self-harm, addiction risk, or a situation beyond the scope of this guide, please seek appropriate pastoral, clinical, emergency, legal, medical, or financial support.";

// Per-layer status from a section's raw score and the scale (e.g. /20).
export function layerStatus(sectionScore: number, questionCount: number, scaleMax: number): string {
  const max = questionCount * scaleMax || 1;
  const pct = (sectionScore / max) * 100;
  if (pct >= 85) return "Strong / Protect";
  if (pct >= 65) return "Stable / Strengthen";
  if (pct >= 45) return "Stretched / Focus";
  return "Drifting / Rebuild";
}
