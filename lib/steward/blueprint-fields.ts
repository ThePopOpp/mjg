// The fields on each Blueprint page.
//
// Transcribed from PROJECT_SOURCES/02_Framework_Blueprint_Assessments.md §5
// (the full thirteen-page specification), not designed here. Where the docset
// names fields explicitly — Page 3's "all six fields", Page 6's four pillars,
// Page 12's four energies — they appear exactly as named.
//
// `essential` answers one question and only one: does the page stop being
// USABLE without this? It is the bar `evaluateSectionState` applies, and it is
// why a page can be Defined for This Season while an optional field is still
// Taking Shape. It is NOT a measure of importance, and it is not a checklist.
//
// Two structural notes the docset is explicit about, both encoded below:
//
//   * Page 2 (My North Star) has no fields of its own. It "summarizes the
//     underlying Blueprint rather than redefining it", so its state is DERIVED
//     from the pages it draws on. Giving it editable fields would let someone
//     write a whole-life overview that contradicts the pages beneath it.
//
//   * Page 7's financial Guardrails and Page 8's Guardrails "refer to the same
//     approved content, not independently edited versions". So the guardrails
//     field lives on Page 8 once, and Page 7 references it.

export type BlueprintFieldSpec = {
  field_key: string;
  label: string;
  /** Does the page stop being usable without this? */
  essential: boolean;
  /** What the docset says this field is for. Shown when the field is empty. */
  prompt: string;
};

export type BlueprintSectionSpec = {
  slug: string;
  /** Fields the participant fills. Empty for a derived page. */
  fields: BlueprintFieldSpec[];
  /**
   * Set on a page that summarises others. Its definition state is the LOWEST
   * state among these sources rather than anything written on the page itself.
   */
  derivedFrom?: string[];
};

const f = (field_key: string, label: string, essential: boolean, prompt: string): BlueprintFieldSpec => ({
  field_key,
  label,
  essential,
  prompt,
});

export const SECTION_FIELDS: BlueprintSectionSpec[] = [
  {
    slug: "cover",
    fields: [
      f("display_name", "Display name", true, "The name you want on your own Blueprint."),
      f("current_season", "Current season", true, "The season you are actually in right now."),
      f(
        "identity_statement",
        "Identity or direction statement",
        false,
        "One concise line, in your words. Only if you want one — it is never borrowed from someone else's.",
      ),
    ],
  },
  {
    slug: "north-star",
    fields: [],
    // Orientation at a glance. As settled as the pages it draws on, no more.
    derivedFrom: [
      "what-i-stand-on",
      "becoming",
      "values",
      "four-pillars",
      "guardrails",
      "keystone-rhythms",
      "energy",
      "legacy",
    ],
  },
  {
    // "Explicitly provide for all six fields" — so all six are essential, and
    // this page stays Taking Shape until every one of them is settled. That is
    // the honest reading, not a bug to soften.
    slug: "what-i-stand-on",
    fields: [
      f(
        "bedrock_identity",
        "Bedrock — Identity in Christ",
        true,
        "Your actual anchor, kept distinct from framework teaching where belief is still unsettled.",
      ),
      f("mission", "Mission", true, "The enduring contribution you want your life to make across changing roles."),
      f(
        "life_verse",
        "Life verse or guiding Scripture",
        true,
        "Your chosen reference, and what it means to you. Never assigned to you and never inferred from a passing mention.",
      ),
      f(
        "current_calling",
        "Current calling",
        true,
        "What is receiving your attention this season. Not necessarily a job or a platform.",
      ),
      f("daily_purpose", "Daily purpose", true, "How you intend to show up today — not a list of tasks."),
      f(
        "current_season_shape",
        "Current season",
        true,
        "What belongs now, what stays important, and what should wait.",
      ),
    ],
  },
  {
    slug: "becoming",
    fields: [
      f("directions", "Who I am becoming", true, "Directions, not arrival."),
      f("why_it_matters", "Why it matters", true, "Why this is the direction worth going."),
      f(
        "present_choices",
        "How today's choices connect",
        true,
        "How a decision in front of you now relates to the life you hope to live.",
      ),
      f("important_people", "People who matter here", false, "Named only where you want them named."),
    ],
  },
  {
    slug: "values",
    fields: [
      f(
        "governing_values",
        "Governing values",
        true,
        "A small, usable set — each in your own words, each with a question you can actually ask when a decision is in front of you.",
      ),
      f(
        "supporting_postures",
        "Supporting values or postures",
        false,
        "A role is responsibility, a gift is capacity, a standard is a boundary. These are not automatically governing values.",
      ),
      f(
        "decision_hierarchy",
        "Priority under pressure",
        false,
        "Only where you have actually worked it out, with its real scope. A hierarchy never authorises permanent neglect.",
      ),
    ],
  },
  {
    // Kept visible together. All four are essential because the page's purpose
    // is that none of them disappears.
    slug: "four-pillars",
    fields: [
      f(
        "family",
        "Family",
        true,
        "Your actual relationships — friendship, church, community, mentorship included. No assumed spouse or children.",
      ),
      f("fitness", "Fitness", true, "Your actual capacity and limits, not a universal health target."),
      f("fun", "Fun", true, "Meaningful joy and renewal, without a prescribed cost or intensity."),
      f("finances", "Finances", true, "What your resources are meant to serve. Page 7 goes deeper."),
    ],
  },
  {
    slug: "finances",
    fields: [
      f("financial_season", "Current financial season", true, "Never inferred from your age, income or a few balances."),
      f(
        "enough",
        "Enough",
        true,
        "Provision, obligations, contentment — and what you will not sacrifice merely to have more.",
      ),
      f(
        "freedom",
        "Freedom",
        true,
        "The flexibility or capacity you want in order to live purposefully. Not an assumption of financial independence.",
      ),
      f(
        "multiplication",
        "Multiplication",
        true,
        "Resources connected to generosity and people being equipped — not account growth alone.",
      ),
      f("long_term_direction", "Long-term direction", false, "Where this is heading over years, not months."),
      // The guardrails themselves live on Page 8. Page 7 points at them so the
      // two can never be edited into disagreement.
      f(
        "guardrail_reference",
        "Financial guardrails",
        false,
        "These are the same guardrails as Page 8 — written once, read in both places.",
      ),
    ],
  },
  {
    slug: "guardrails",
    fields: [
      f(
        "guardrails",
        "My guardrails",
        true,
        "Boundaries decided before the pressure arrives. Each one names what it protects and is concrete enough to use.",
      ),
      f(
        "refuse_to_trade",
        "What I refuse to trade",
        false,
        "Explains a guardrail's purpose. It does not replace a usable boundary when a decision needs one.",
      ),
      f(
        "cues",
        "When → Then cues",
        false,
        "A prompt for a response, where it directly operationalises a boundary. Broader return actions belong on Drift + Return.",
      ),
    ],
  },
  {
    slug: "drift-return",
    fields: [
      f(
        "early_warning_signs",
        "My early warning signs",
        true,
        "Specific to you. Drift is never inferred from tiredness, a missed action or a low score alone.",
      ),
      f("return_process", "Return to alignment", true, "The way back — adapted to you, not a fixed-length ritual."),
      f("when_then_cues", "When → Then cues", false, "Prompts that help you notice and respond."),
    ],
  },
  {
    slug: "accountability",
    fields: [
      f(
        "who",
        "Who I involve",
        true,
        "A spouse, friend, mentor, pastor, group — your actual structure, which may be more than one person.",
      ),
      f("cadence", "Cadence", true, "How often, and when."),
      f("permission_to_ask", "Permission to ask", true, "What you are giving them permission to ask you about."),
      f("roles", "Their roles", false, "Different people may carry different roles."),
      f("questions", "The questions", false, "Yours to choose. No question set is manufactured for you."),
      f("privacy_boundaries", "Privacy boundaries", false, "What stays between you. Naming someone grants no access to this Blueprint."),
      f("close_commitment", "How we close", false, "The response you chose and when it will be revisited. Continuing, pausing or resting may be the response."),
    ],
  },
  {
    slug: "keystone-rhythms",
    fields: [
      f(
        "rhythms",
        "My rhythms",
        true,
        "Daily, weekly, monthly or annual — only at a useful depth, with existing practices and new experiments kept distinguishable.",
      ),
      f(
        "minimum_viable",
        "The minimum version",
        false,
        "What keeps it going on a hard week. Support for continuity, not another performance demand.",
      ),
      f("review_cadence", "When I review this", false, "Review what was agreed and what actually happened before renewing it."),
    ],
  },
  {
    slug: "energy",
    fields: [
      f("spiritual_energy", "Spiritual energy", true, "Grounded in the sources. Depleted capacity is never evidence of weak faith."),
      f("physical_energy", "Physical energy", true, "What your body is actually carrying this season."),
      f("emotional_energy", "Emotional energy", true, "What costs you and what restores you."),
      f("mental_energy", "Mental energy", true, "Where your attention actually goes."),
      f("renewal_practice", "This season's renewal practice", true, "The one you have chosen for now."),
      f("protect", "What deserves protection", false, "Deposits that renew capacity, and what must not be spent."),
      f(
        "patterns",
        "Patterns needing attention",
        false,
        "Avoidable leaks, as distinct from necessary withdrawals. Not every tiring responsibility is a leak.",
      ),
    ],
  },
  {
    slug: "legacy",
    fields: [
      f(
        "living_multiplication",
        "What my life is multiplying",
        true,
        "Living multiplication in and through other people — family, church, community, mentorship, generosity.",
      ),
      f("relationships", "Through whom", false, "Only where actually supplied and approved."),
      f(
        "legacy_giving",
        "Legacy giving practice",
        false,
        "Model + Explain · Practice Together · Entrust + Pass On · Reflect. Never claiming willingness or impact that has not been reported.",
      ),
      f("next_step", "A next faithful step", false, "It may be an invitation or a question rather than a promised outcome."),
      f("closing_statement", "A closing statement", false, "Your own direction, in your words. Never a generic commissioning."),
      f(
        "estate_continuity",
        "Estate continuity",
        false,
        "A clearly identified supporting concern. It does not define Legacy.",
      ),
    ],
  },
  // The third Free page. Not part of the thirteen; the Free Blueprint's own.
  {
    slug: "starting-plan",
    fields: [
      f("next_faithful_step", "My next faithful step", true, "One step small enough that you will actually take it this week."),
      f("why_this_one", "Why this one", true, "What makes this the right step now rather than a different one."),
    ],
  },
];

export function fieldsForSection(slug: string): BlueprintFieldSpec[] {
  return SECTION_FIELDS.find((s) => s.slug === slug)?.fields ?? [];
}

export function sectionSpec(slug: string): BlueprintSectionSpec | undefined {
  return SECTION_FIELDS.find((s) => s.slug === slug);
}

/** True for a page whose state comes from the pages it summarises. */
export function isDerivedSection(slug: string): boolean {
  return (sectionSpec(slug)?.derivedFrom?.length ?? 0) > 0;
}
