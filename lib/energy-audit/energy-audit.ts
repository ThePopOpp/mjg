// The Energy Audit Check-In — a Stewardship Blueprint assessment.
// Content is from docs/energy-audit/mjg-energy-audit-check-in.md. Four energy sources ×
// five statements, rated 1–5 → section score /25, total /100.
//
// Copy here is kept verbatim with the source document: the spec asks that results language
// stay exactly aligned with its interpretation copy. Edit the document and this file together.

export type EnergySource = "physical" | "emotional" | "mental" | "spiritual";

export type EnergySection = {
  key: EnergySource;
  index: number;
  title: string;
  coreQuestion: string;
  /** From "The Four Energies" teaching. */
  summary: string;
  statements: string[];
  /** "What Refills the Tank" starting points for this source. */
  refills: string[];
};

export const SCALE = [
  { value: 1, label: "Strongly Disagree", description: "This is rarely true in my life right now." },
  { value: 2, label: "Disagree", description: "This is occasionally true, but not consistently." },
  { value: 3, label: "Neutral / Unsure", description: "This is somewhat true, but I have room to grow." },
  { value: 4, label: "Agree", description: "This is mostly true in my life." },
  { value: 5, label: "Strongly Agree", description: "This is consistently true and intentionally protected." },
] as const;

export const SECTIONS: EnergySection[] = [
  {
    key: "physical",
    index: 1,
    title: "Physical Energy",
    coreQuestion: "Am I fueling and recovering my body enough to carry what I've been entrusted with?",
    summary: "Physical Energy gives you the capacity to act, endure, and stay consistent. It is shaped by sleep, movement, nutrition, and recovery.",
    statements: [
      "I am intentional about sleep, movement, and nutrition, not just reactive to what's convenient.",
      "I have enough physical capacity to be fully present for what matters most, most days.",
      "I build real recovery into my week instead of resting only when I finally collapse.",
      "I notice early signs of physical depletion instead of pushing through until I break down.",
      "I see my body as capacity for my calling, not just something to maintain or ignore.",
    ],
    refills: [
      "Protect a consistent sleep window — the regularity matters as much as the total hours.",
      "Move your body daily, even briefly. A walk counts as a deposit.",
      "Build one real day of rest into your week — not just a lighter day, a different day.",
      "Fuel with food that sustains energy, not just food that's convenient in the moment.",
    ],
  },
  {
    key: "emotional",
    index: 2,
    title: "Emotional Energy",
    coreQuestion: "Am I bringing a healthy, steady tone into the relationships and responsibilities entrusted to me?",
    summary: "Emotional Energy shapes the tone you bring into your marriage, your parenting, your leadership, and your friendships. It is the difference between responding and reacting.",
    statements: [
      "I can regulate my emotions under pressure instead of reacting from stress or fatigue.",
      "The people closest to me generally get my patience, not my leftover irritability.",
      "I have people or practices that help me process stress instead of carrying it alone.",
      "I can turn a setback into a challenge to rise to, instead of spiraling into fear or frustration.",
      "I am investing in relationships that fill me, not only ones that drain me.",
    ],
    refills: [
      "Name what you're actually feeling before you react to it.",
      "Keep at least one relationship where you're fully honest, not just informed.",
      "Practice gratitude on purpose — don't wait until you feel like it.",
      "Make room for laughter, play, and lightness, not only responsibility.",
    ],
  },
  {
    key: "mental",
    index: 3,
    title: "Mental Energy",
    coreQuestion: "Am I focused and clear, or scattered and reactive?",
    summary: "Mental Energy determines your focus, your clarity, and your ability to make wise decisions instead of scattered ones. It is shaped by what you allow into your attention.",
    statements: [
      "I can concentrate on one important thing at a time without constant fragmentation.",
      "My use of phone, screens, and media leaves me clearer, not foggier.",
      "I make time for quiet, undistracted thinking instead of filling every gap with noise.",
      "I make decisions from a place of clarity more often than from exhaustion or urgency.",
      "I protect blocks of focused time instead of letting every request interrupt me.",
    ],
    refills: [
      "Protect blocks of undistracted, single-focus time.",
      "Take real breaks from screens — not just a different screen.",
      "Simplify what you can. Fewer daily decisions leaves more capacity for the ones that matter.",
      "Get unhurried, quiet thinking time — a walk, a drive, a journal, a porch.",
    ],
  },
  {
    key: "spiritual",
    index: 4,
    title: "Spiritual Energy",
    coreQuestion: "Am I staying connected to the Source, or running on my own reserves?",
    summary: "Spiritual Energy is the Source beneath the other three — your connection to God, to purpose, and to something bigger than your own effort. When this one runs dry, everything else eventually does too.",
    statements: [
      "I have consistent rhythms of prayer, Scripture, or spiritual reflection.",
      "My strength in hard seasons comes from more than willpower alone.",
      "I sense when I am spiritually dry and know how to return to renewal.",
      "My daily choices are shaped by purpose and calling, not only by pressure and demand.",
      "I trust God with the outcomes I cannot control instead of carrying them alone.",
    ],
    refills: [
      "Return to a consistent rhythm of prayer or Scripture, even a short one.",
      "Practice Sabbath as a full stop, not just a slower pace.",
      "Serve someone else. Purpose renews capacity as much as rest does.",
      "Surrender what you can't control instead of carrying it alone.",
    ],
  },
];

export const STATEMENTS_PER_SECTION = 5;
export const SECTION_MAX = STATEMENTS_PER_SECTION * 5; // 25
export const TOTAL_MAX = SECTIONS.length * SECTION_MAX; // 100
export const TOTAL_STATEMENTS = SECTIONS.length * STATEMENTS_PER_SECTION; // 20

/** Response key, matching the source document's field names: "physical_1" … "spiritual_5". */
export const answerKey = (source: EnergySource, index: number) => `${source}_${index + 1}`;

export type InterpretationKey = "fully-engaged-and-renewing" | "running-warm" | "running-on-reserves" | "empty-tank";

export type Interpretation = {
  key: InterpretationKey;
  min: number;
  title: string;
  meaning: string;
  reflection: string;
};

// Overall interpretation from the total /100 — thresholds and copy verbatim from the source.
export const INTERPRETATIONS: Interpretation[] = [
  {
    key: "fully-engaged-and-renewing",
    min: 85,
    title: "Fully Engaged and Renewing",
    meaning: "You appear to be stewarding your energy with real intentionality. The next step is not complacency. It is protection — these rhythms are rare, and they deserve to be guarded.",
    reflection: "What rhythm is renewing me most right now, and how do I protect it?",
  },
  {
    key: "running-warm",
    min: 65,
    title: "Running Warm",
    meaning: "You likely have real strength in some energy sources, but you may be quietly drawing down reserves in others. This is a common place for capable, responsible people to live.",
    reflection: "Where am I pushing past the point of true renewal?",
  },
  {
    key: "running-on-reserves",
    min: 40,
    title: "Running on Reserves",
    meaning: "Parts of your life may currently be sustained more by willpower than by real renewal. This is not shameful — it is common. But it is urgent enough to pay attention to now.",
    reflection: "What has become normal in my life that shouldn't be?",
  },
  {
    key: "empty-tank",
    min: 0,
    title: "Empty Tank — Time to Stop and Refuel",
    meaning: "This may be a season of real depletion. Do not try to fix everything at once. Consider deeper rest, honest conversation, and support beyond what you can generate on your own.",
    reflection: "What is one honest step toward renewal I can take this week?",
  },
];

export function interpretationFor(total: number): Interpretation {
  return INTERPRETATIONS.find((i) => total >= i.min) ?? INTERPRETATIONS[INTERPRETATIONS.length - 1];
}

// Per-source tank level. The source document defines bands only for the total, so these apply
// the SAME percentage thresholds (85% / 65% / 40%) to each /25 section: 22+, 17–21, 10–16, <10.
// That keeps a section and the overall result speaking the same language.
export const TANK_LEVELS = [
  { min: 22, label: "Full", tone: "full" },
  { min: 17, label: "Running warm", tone: "warm" },
  { min: 10, label: "Running on reserves", tone: "reserves" },
  { min: 0, label: "Running empty", tone: "empty" },
] as const;

export function tankLevelFor(sectionScore: number) {
  return TANK_LEVELS.find((l) => sectionScore >= l.min) ?? TANK_LEVELS[TANK_LEVELS.length - 1];
}

export type EnergyAuditScore = {
  sections: { key: EnergySource; title: string; score: number; level: string; tone: string }[];
  total: number;
  interpretation: Interpretation;
  strongest: EnergySource;
  lowest: EnergySource;
  /** Every source tied for the lowest score — the user picks their focus in "Next Step". */
  lowestTied: EnergySource[];
};

/** True when every one of the 20 statements has a 1–5 rating. */
export function isComplete(answers: Record<string, number>) {
  return SECTIONS.every((s) => s.statements.every((_, i) => isRating(answers[answerKey(s.key, i)])));
}

export function isSectionComplete(answers: Record<string, number>, source: EnergySource) {
  const section = SECTIONS.find((s) => s.key === source);
  return Boolean(section && section.statements.every((_, i) => isRating(answers[answerKey(source, i)])));
}

export function isRating(value: unknown): value is number {
  return Number.isInteger(value) && (value as number) >= 1 && (value as number) <= 5;
}

export function scoreEnergyAudit(answers: Record<string, number>): EnergyAuditScore {
  const sections = SECTIONS.map((section) => {
    const score = section.statements.reduce((sum, _s, i) => {
      const v = answers[answerKey(section.key, i)];
      return sum + (isRating(v) ? v : 0);
    }, 0);
    const level = tankLevelFor(score);
    return { key: section.key, title: section.title, score, level: level.label, tone: level.tone };
  });

  const total = sections.reduce((n, s) => n + s.score, 0);
  const high = Math.max(...sections.map((s) => s.score));
  const low = Math.min(...sections.map((s) => s.score));
  const lowestTied = sections.filter((s) => s.score === low).map((s) => s.key);

  return {
    sections,
    total,
    interpretation: interpretationFor(total),
    // Ties resolve in the document's canonical order; the user can change their focus later.
    strongest: sections.find((s) => s.score === high)!.key,
    lowest: lowestTied[0],
    lowestTied,
  };
}

export const sectionByKey = (key: EnergySource) => SECTIONS.find((s) => s.key === key)!;

export const REFLECTION_QUESTIONS = [
  "What kind of pace am I actually keeping right now?",
  "Where have I been running on empty instead of building in a real refueling cycle?",
  "What shortcut withdrawals have I been making that are quietly creating an energy debt?",
  "Which of the four energies — physical, emotional, mental, spiritual — is my lowest right now, and why?",
  "What does my body already know that my calendar hasn't caught up to?",
  "Who is receiving my most depleted self, and who deserves better?",
  "What rhythm once renewed me that I have slowly drifted away from?",
  "Where am I trying to run on willpower instead of real renewal?",
  "What would it look like to treat rest as obedience rather than as weakness?",
  "What is one honest step I can take this week to begin renewing?",
];

export type EnergyAuditNextStep = {
  lowestEnergySource: EnergySource;
  renewalFocus: string;
  nextAction: string;
  conversationPerson: string;
  renewalRhythm: string;
};
