// The Personal Stewardship Blueprint — structure and prototype content.
//
// Page titles, taglines and purposes are transcribed from the accepted docset
// (PROJECT_SOURCES/02_Framework_Blueprint_Assessments.md §5), not invented. Two
// depths exist at launch and there is no intermediate edition: a three-page Free
// Blueprint and a thirteen-page Full Blueprint.
//
// THE RULE THAT SHAPES THIS SCREEN, and the reason several pages below are
// deliberately empty:
//
//   "Every page represents actual available content at its actual state. Retain
//    the page's purpose and framework visibility when content is unfinished; do
//    not manufacture a finished-looking participant."
//
// So a page with nothing in it still shows its purpose and says plainly that it
// is unexplored. A Blueprint that looks complete when it is not would be the
// single most misleading thing this product could do.
//
// PROTOTYPE DATA. `EXAMPLE_BLUEPRINT` below is illustrative content for design
// review only — it is not a real participant and nothing reads it from a
// database. Phase 3 replaces it with steward_blueprints / steward_sections /
// steward_fields, where the definition state is derived by functional
// sufficiency rather than stored by hand.

/**
 * Definition state, per clause D25. These are the ONLY three.
 *
 * "Needs Clarity" is deliberately absent: the docset treats it as a content
 * marker on a field, not a fourth definition state, and conflating the two is
 * how the original STATE-001 defect happened.
 */
export type DefinitionState = "Not Yet Explored" | "Taking Shape" | "Defined for This Season";

export type BlueprintPage = {
  number: number;
  slug: string;
  title: string;
  /** The fixed tagline or subtitle the docset gives this page, where it has one. */
  tagline?: string;
  /** What the page is for. Shown even when the page is empty. */
  purpose: string;
  /** True when this page is part of the three-page Free Blueprint. */
  inFree: boolean;
};

export const BLUEPRINT_PAGES: BlueprintPage[] = [
  {
    number: 1,
    slug: "cover",
    title: "My Current Stewardship Blueprint",
    tagline: "A living decision guide for the person I am becoming and the life I am building.",
    purpose:
      "Identifies you, the season you are in, and the version of this guide you are looking at. It orients you without assuming anything about your age, work, household or certainty.",
    inFree: true,
  },
  {
    number: 2,
    slug: "north-star",
    title: "My North Star",
    tagline: "My whole life in one view.",
    purpose:
      "One whole-life overview: what you stand on, all four pillars, the people who matter, this season's focus, your protection, rhythms, energy and legacy. It summarises the rest rather than replacing it.",
    inFree: true,
  },
  {
    number: 3,
    slug: "what-i-stand-on",
    title: "What I Stand On",
    purpose:
      "Your bedrock and foundation — identity, faith, and the convictions underneath the decisions. Where belief is still unsettled, that is shown as unsettled rather than filled in for you.",
    inFree: false,
  },
  {
    number: 4,
    slug: "becoming",
    title: "The Person I Am Becoming + My Why",
    purpose:
      "Directions, not arrival. Who you are becoming, why it matters, and how today's choices connect to the life you hope to live.",
    inFree: false,
  },
  {
    number: 5,
    slug: "values",
    title: "My Governing Values + Decision Filter",
    purpose:
      "A small, usable set of values — each in your own words, each with a question you can actually ask when a decision is in front of you.",
    inFree: false,
  },
  {
    number: 6,
    slug: "four-pillars",
    title: "My Four Pillars",
    tagline: "Family · Fitness · Fun · Finances",
    purpose:
      "The four kept visible together, each with this season's direction and the one practice, focus or protection that matters most right now.",
    inFree: false,
  },
  {
    number: 7,
    slug: "finances",
    title: "My Finances",
    tagline: "Enough → Freedom → Multiplication",
    purpose: "What enough looks like for you, what freedom would make possible, and what you want your resources to multiply.",
    inFree: false,
  },
  {
    number: 8,
    slug: "guardrails",
    title: "Guardrails — Protect What Matters",
    purpose:
      "Boundaries decided before the pressure arrives. Each one names what it protects, so it holds when it is inconvenient.",
    inFree: false,
  },
  {
    number: 9,
    slug: "drift-return",
    title: "Drift + Return",
    tagline: "Recognise drift. Return quickly.",
    purpose:
      "How you notice you have drifted, and the way back. Written while things are clear, for a season when they are not.",
    inFree: false,
  },
  {
    number: 10,
    slug: "accountability",
    title: "My Accountability Partner",
    purpose:
      "The person or people who can ask you the real question — a spouse, a friend, a mentor, a pastor, a group. Whatever your actual structure is.",
    inFree: false,
  },
  {
    number: 11,
    slug: "keystone-rhythms",
    title: "Keystone Rhythms",
    tagline: "The rhythms that sustain alignment",
    purpose: "The few repeated practices that hold everything else together, and what protects them.",
    inFree: false,
  },
  {
    number: 12,
    slug: "energy",
    title: "Energy",
    tagline: "Steward the fuel behind the life",
    purpose: "Where your energy actually goes, what drains it, and what restores it — because everything else runs on this.",
    inFree: false,
  },
  {
    number: 13,
    slug: "legacy",
    title: "Legacy",
    tagline: "What my life is multiplying",
    purpose: "What you are building that outlasts you, and what you want it to multiply in the people who come after.",
    inFree: false,
  },
];

/** The three-page Free Blueprint, in order. */
export const FREE_PAGES = [
  BLUEPRINT_PAGES[0],
  BLUEPRINT_PAGES[1],
  {
    number: 3,
    slug: "starting-plan",
    title: "My Starting Plan / My Next Faithful Step",
    purpose: "One step small enough to actually take this week, and the reason it is the right one.",
    inFree: true,
  } satisfies BlueprintPage,
];

// == Prototype content =======================================================
// Illustrative only. Deliberately uneven: some pages carry real content, some
// are part-finished, and several are untouched — because the empty and
// half-finished states are the ones worth reviewing, and a demo where every
// page is full would hide exactly the behaviour the docset cares about.

export type PageState = {
  slug: string;
  state: DefinitionState;
  /** What the participant has approved so far, if anything. */
  entries?: { label: string; value: string; needsClarity?: boolean }[];
  /** Last time this page changed. */
  updated?: string;
};

export const EXAMPLE_BLUEPRINT: Record<string, PageState> = {
  cover: {
    slug: "cover",
    state: "Defined for This Season",
    updated: "2026-10-02",
    entries: [
      { label: "Season", value: "Rebuilding after a hard year" },
      { label: "Direction", value: "Present at home before I am impressive anywhere else." },
    ],
  },
  "north-star": {
    slug: "north-star",
    state: "Taking Shape",
    updated: "2026-10-09",
    entries: [
      { label: "This season's focus", value: "Family and health, in that order." },
      { label: "What I stand on", value: "Still working this out.", needsClarity: true },
    ],
  },
  "what-i-stand-on": {
    slug: "what-i-stand-on",
    state: "Taking Shape",
    updated: "2026-10-09",
    entries: [
      { label: "Bedrock", value: "I believe I am held, not measured. I do not always live like it." },
      { label: "Foundation", value: "", needsClarity: true },
    ],
  },
  becoming: {
    slug: "becoming",
    state: "Taking Shape",
    updated: "2026-09-28",
    entries: [{ label: "Becoming", value: "A man my daughters come to first, not last." }],
  },
  values: { slug: "values", state: "Not Yet Explored" },
  "four-pillars": {
    slug: "four-pillars",
    state: "Taking Shape",
    updated: "2026-10-11",
    entries: [
      { label: "Family", value: "Dinner at the table five nights a week." },
      { label: "Fitness", value: "Walking again. Three times a week, no heroics." },
      { label: "Fun", value: "", needsClarity: true },
      { label: "Finances", value: "", needsClarity: true },
    ],
  },
  finances: { slug: "finances", state: "Not Yet Explored" },
  guardrails: {
    slug: "guardrails",
    state: "Defined for This Season",
    updated: "2026-10-05",
    entries: [
      { label: "Phone", value: "Nothing after 9pm. It lives in the kitchen." },
      { label: "Travel", value: "No more than one night away per week this season." },
    ],
  },
  "drift-return": { slug: "drift-return", state: "Not Yet Explored" },
  accountability: {
    slug: "accountability",
    state: "Taking Shape",
    updated: "2026-09-30",
    entries: [{ label: "Who", value: "Dave. Thursday mornings, before work." }],
  },
  "keystone-rhythms": { slug: "keystone-rhythms", state: "Not Yet Explored" },
  energy: {
    slug: "energy",
    state: "Taking Shape",
    updated: "2026-10-12",
    entries: [{ label: "What drains me", value: "Saying yes on the spot. Every time." }],
  },
  legacy: { slug: "legacy", state: "Not Yet Explored" },
  "starting-plan": {
    slug: "starting-plan",
    state: "Defined for This Season",
    updated: "2026-10-12",
    entries: [{ label: "My next faithful step", value: "Put the phone in the kitchen at 9pm. Tonight." }],
  },
};

export const STATE_ORDER: DefinitionState[] = ["Not Yet Explored", "Taking Shape", "Defined for This Season"];

/** Tailwind classes per state. Gold for settled, warm neutral for in progress. */
export const STATE_STYLE: Record<DefinitionState, string> = {
  "Not Yet Explored": "border-border text-muted-foreground",
  "Taking Shape": "border-[#b88a4a]/40 text-[#b88a4a]",
  "Defined for This Season": "border-[#b88a4a] bg-[#b88a4a] text-white",
};

/**
 * The three conversational choices, which are a product decision rather than a
 * UI flourish: the docset names them and keeps them available in every mode.
 */
export const CONVERSATION_CHOICES = [
  {
    key: "listen",
    label: "Listen First",
    blurb: "Say it out loud. No advice back unless you ask.",
  },
  {
    key: "think",
    label: "Help Me Think",
    blurb: "Work through it together. Questions, options, trade-offs.",
  },
  {
    key: "step",
    label: "Help Me Take a Step",
    blurb: "Turn it into one thing you can actually do this week.",
  },
] as const;

export type ConversationChoice = (typeof CONVERSATION_CHOICES)[number]["key"];

/** The opening line, mandated verbatim by the docset. Do not reword. */
export const STEWARD_OPENING_LINE =
  "Welcome. I'm Steward, your personal guide for designing and living a life that matters.";
