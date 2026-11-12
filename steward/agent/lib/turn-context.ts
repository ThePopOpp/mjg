// The text Steward is given at the start of every turn: their real Blueprint
// outline, their Check-In results, and a closing reminder.
//
// Pure functions, no eve imports, so the response-quality harness
// (scripts/steward-quality-harness.mjs) builds EXACTLY the same turn context the
// live agent does. Wired into the agent by ../instructions/blueprint-context.ts.

export type Overview = {
  edition: string;
  pages: {
    page: string;
    number: number;
    title: string;
    state: string;
    fields_with_wording: number;
    fields_total: number;
    summarises_other_pages: boolean;
    /** False for a page this member's edition does not include. */
    in_edition: boolean;
  }[];
};

export type Snapshot = {
  check_in: {
    taken: string;
    days_ago: number;
    total: number | null;
    out_of: number;
    stage: string | null;
    layers: { layer: string; score: number; out_of: number; status: string }[];
    lowest: string[];
    strongest: string[];
    lowest_pillar: string | null;
    times_taken: number;
  } | null;
  energy_audit: {
    taken: string;
    days_ago: number;
    total: number | null;
    out_of: number;
    result: string | null;
    sources: { energy: string; score: number; out_of: number; level: string }[];
    lowest: string[];
    chosen_focus: string | null;
    times_taken: number;
  } | null;
};

/**
 * Their Check-In results, supplied rather than fetched: without them Steward
 * answered every member the same way. Scores only here; statement ratings and
 * their own written reflections come from read_assessments.
 */
export function assessmentLines(snapshot: Snapshot | null): string[] {
  if (!snapshot) {
    return [
      "THEIR CHECK-IN RESULTS COULD NOT BE READ THIS TURN. Do not guess at them or describe typical results. " +
        "If they come up, say you cannot see them right now.",
    ];
  }

  const lines: string[] = ["THEIR CHECK-IN RESULTS (self-reported, exactly as recorded):"];
  const when = (days: number, date: string) =>
    days === 0 ? `today (${date})` : days === 1 ? `yesterday (${date})` : `${days} days ago (${date})`;

  const c = snapshot.check_in;
  if (c) {
    lines.push(
      `Created for More Check-In, taken ${when(c.days_ago, c.taken)}${c.times_taken > 1 ? `, ${c.times_taken} times in all` : ""}: ` +
        `${c.total ?? "no complete total"}/${c.out_of}${c.stage ? `, "${c.stage}"` : ""}.`,
      ...c.layers.map((l) => `  ${l.layer}: ${l.score}/${l.out_of}, ${l.status}`),
      `  Lowest: ${c.lowest.join(" and ")}${c.lowest_pillar ? ` (lowest pillar: ${c.lowest_pillar})` : ""}. Strongest: ${c.strongest.join(" and ")}.`,
    );
  } else {
    lines.push("Created for More Check-In: not taken.");
  }

  const e = snapshot.energy_audit;
  if (e) {
    lines.push(
      `Energy Audit, taken ${when(e.days_ago, e.taken)}${e.times_taken > 1 ? `, ${e.times_taken} times in all` : ""}: ` +
        `${e.total ?? "no complete total"}/${e.out_of}${e.result ? `, "${e.result}"` : ""}.`,
      ...e.sources.map((s) => `  ${s.energy}: ${s.score}/${s.out_of}, ${s.level}`),
      `  Lowest: ${e.lowest.join(" and ")}.${e.chosen_focus ? ` They chose to focus on ${e.chosen_focus}.` : ""}`,
    );
  } else {
    lines.push("Energy Audit: not taken.");
  }

  lines.push(
    "",
    "If they have just finished an assessment or ask what their results mean, lead with these: call " +
      "read_assessments, give the dated overview with every section score exactly as above, interpret it from " +
      "their actual statement ratings, then offer the three paths (explore a strength, explore a concern, begin " +
      "the Free Personal Blueprint). Otherwise, bring results in when they bear on what the member raised, dated, " +
      "and check they still fit. The two assessments are separate instruments — never mix them.",
  );
  return lines;
}

/** Their real Blueprint outline — page names and states, never wording. */
export function blueprintLines(overview: Overview | null): string[] {
  if (!overview) {
    return [
      "THEIR BLUEPRINT COULD NOT BE READ THIS TURN. If they ask about it, say plainly that you cannot " +
        "reach it right now and offer to carry on without it. Do not describe what it contains, do not " +
        "list pages from memory, and do not describe what a Stewardship Blueprint generally includes.",
    ];
  }

  // Only the pages this member actually has. On Free that is three, not
  // thirteen — listing the Full Build's pages as theirs misrepresents what
  // they own and quietly promises content they have not bought.
  const theirs = overview.pages.filter((page) => page.in_edition);
  const notYetTheirs = overview.pages.length - theirs.length;

  return [
    `THIS MEMBER'S ACTUAL BLUEPRINT (${overview.edition} edition), as it stands right now:`,
    "",
    ...theirs.map((page) => {
      const written = page.summarises_other_pages
        ? "summarises the others"
        : `${page.fields_with_wording}/${page.fields_total} fields written`;
      return `${page.number}. ${page.title} — ${page.state}, ${written}`;
    }),
    "",
    notYetTheirs > 0
      ? `They are on the Free Blueprint, which is these ${theirs.length} pages. The Full Build adds ` +
        `${notYetTheirs} more. Do not describe those as part of their Blueprint — they do not have them ` +
        "yet — and do not turn this into a sales pitch either."
      : "They have the full thirteen-page Blueprint.",
    "",
    "This is their real record. When they ask what is on their Blueprint, answer from this list and nothing " +
      "else. This list does not include what they WROTE — for the words on a page, call read_blueprint_page.",
  ];
}

/**
 * Lands last, immediately before the model answers — the position with the
 * most pull. It used to say "Two or three sentences, then ONE question … find
 * out what it actually is before offering anything", which overrode everything
 * above it and is why Steward gave short, generic, question-first replies
 * instead of teaching. This is the V2 response-quality check instead.
 */
export const TURN_REMINDER = [
  "BEFORE YOU ANSWER:",
  "Match depth to the need. A quick check-in or Listen First is short. Teaching, results, decisions and hard " +
    "trade-offs deserve a real, specific answer — explain the principle and why it matters. Never trim meaning " +
    "to be brief, never pad.",
  "Use THEIR evidence — the Blueprint and results above, what they told you. If your answer would suit a " +
    "stranger with the same question, it is not their answer.",
  "When you teach the framework, search the library first so it is the Blueprint's teaching, in your words.",
  "Help before you ask. At most one question, and only if it would improve your next answer.",
  "No menu of services, no generic intake questions, no claim that anything was saved or done without a receipt.",
].join("\n");

export function turnContext(overview: Overview | null, snapshot: Snapshot | null): string {
  return [...blueprintLines(overview), "", ...assessmentLines(snapshot), "", TURN_REMINDER].join("\n");
}
