import { defineDynamic, defineInstructions } from "eve/instructions";
import { callApp } from "../lib/app-tools.ts";
import { principalFromAuth } from "../lib/member.ts";

// The member's Blueprint, SUPPLIED rather than fetched.
//
// WHY THIS EXISTS
// ---------------
// Steward was asked "what's on my Blueprint?" and answered with five plausible
// categories — Faith, Family, Community, Work, Stewardship — that were not the
// member's pages. It never called the tool. Telling it more firmly to call the
// tool did not fix it: a second attempt invented a different five.
//
// That was a design error, not a wording problem. The docset's invocation
// contract (§E02) supplies "server-owned participant context ... authorised
// record refs and versions" INTO the invocation. I had built it the other way
// round, so the truth was only available if the model chose to go and get it.
//
// Now the real page list is in front of the model on every turn. Inventing a
// Blueprint requires contradicting data already in context, which is a far
// harder mistake to make than filling a gap.
//
// Still no wording here — page names and states only. The member's actual words
// are fetched per page, when there is a reason to, which keeps the default
// amount of private content in the model's context as small as the task allows.

type Overview = {
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

type Snapshot = {
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
 * Their Check-In results, supplied for the same reason as the Blueprint.
 *
 * Without these Steward answered every member the same way: "I don't know where
 * to start with my family" got a general tour of family life, because the one
 * thing that would make it specific — that this member rated "the people I love
 * are receiving my presence, not just my provision" a 2 — was in a table no tool
 * reached. Scores only here; statement ratings and their own written
 * reflections come from read_assessments when the conversation turns to them.
 */
function assessmentLines(snapshot: Snapshot | null): string[] {
  if (!snapshot) {
    return [
      "THEIR CHECK-IN RESULTS COULD NOT BE READ THIS TURN. Do not guess at them or describe typical results. " +
        "If they come up, say you cannot see them right now.",
    ];
  }

  const lines: string[] = ["THEIR CHECK-IN RESULTS (self-reported):"];
  const when = (days: number, date: string) => (days === 0 ? "today" : days === 1 ? "yesterday" : `${days} days ago (${date})`);

  const c = snapshot.check_in;
  if (c) {
    lines.push(
      `Created for More Check-In, taken ${when(c.days_ago, c.taken)}${c.times_taken > 1 ? `, ${c.times_taken} times in all` : ""}: ` +
        `${c.total}/${c.out_of}, "${c.stage}".`,
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
        `${e.total}/${e.out_of}, "${e.result}".`,
      ...e.sources.map((s) => `  ${s.energy}: ${s.score}/${s.out_of}, ${s.level}`),
      `  Lowest: ${e.lowest.join(" and ")}.${e.chosen_focus ? ` They chose to focus on ${e.chosen_focus}.` : ""}`,
    );
  } else {
    lines.push("Energy Audit: not taken.");
  }

  lines.push(
    "",
    "Use these to make your answer theirs. When they raise something these touch, connect it — briefly, in " +
      "their terms — and ask whether it still fits; a result months old may not. Do not open with their " +
      "scores, recite them, or treat the lowest score as what they must work on. For how they rated specific " +
      "statements, and what they wrote, call read_assessments.",
  );
  return lines;
}

/**
 * Repeated at the end of every turn, deliberately.
 *
 * The voice rules live in instructions.md, hundreds of lines up, and the model
 * reads them — it opens with the mandated welcome line, which comes from there
 * — and then produces a seven-point checklist anyway. A fourth rule in the same
 * place would not help. This one lands last, immediately before it answers.
 *
 * Short on purpose. A long reminder is just more prompt to skim.
 */
const VOICE_REMINDER = [
  "BEFORE YOU ANSWER — how Steward talks:",
  "No numbered lists. No bold headings. No \"Here are some steps\". You are talking, not writing a handout.",
  "Two or three sentences, then ONE question. Longer only if they asked for detail.",
  "They came with something specific on their mind. Find out what it actually is before offering anything.",
  "If your answer would suit a stranger with the same question, it is not their answer. You know their " +
    "Blueprint and their Check-In results — let them shape the question you ask.",
].join("\n");

export default defineDynamic({
  events: {
    "turn.started": async (_event, ctx) => {
      const principal = principalFromAuth(ctx.session.auth);
      // Read from this resolver's own context rather than the tools' session
      // state, which is documented as not exposed here. Fetched together; the
      // results failing must not cost them the Blueprint, or the reverse.
      const [blueprint, results] = await Promise.allSettled([
        callApp<Overview>("blueprint.overview", {}, principal),
        callApp<Snapshot>("assessments.snapshot", {}, principal),
      ]);
      if (results.status === "rejected") console.warn("[steward] assessment context unavailable", results.reason);
      const snapshot = results.status === "fulfilled" ? results.value : null;

      if (blueprint.status === "rejected") {
        // Say so rather than leaving a silence the model will fill. A turn that
        // could not read the Blueprint must produce "I couldn't reach it",
        // never a plausible summary.
        console.warn("[steward] blueprint context unavailable", blueprint.reason);
        return defineInstructions({
          content: [
            "THEIR BLUEPRINT COULD NOT BE READ THIS TURN. If they ask about it, say plainly that you cannot " +
              "reach it right now and offer to carry on without it. Do not describe what it contains, do not " +
              "list pages from memory, and do not describe what a Stewardship Blueprint generally includes.",
            "",
            ...assessmentLines(snapshot),
            "",
            VOICE_REMINDER,
          ].join("\n"),
        });
      }
      const overview = blueprint.value;

      // Only the pages this member actually has. On Free that is three, not
      // thirteen — listing the Full Build's pages as theirs misrepresents what
      // they own and quietly promises content they have not bought.
      const theirs = overview.pages.filter((page) => page.in_edition);
      const notYetTheirs = overview.pages.length - theirs.length;

      const lines = theirs
        .map((page) => {
          const written = page.summarises_other_pages
            ? "summarises the others"
            : `${page.fields_with_wording}/${page.fields_total} fields written`;
          return `${page.number}. ${page.title} — ${page.state}, ${written}`;
        })
        .join("\n");

      return defineInstructions({
        content: [
          `THIS MEMBER'S ACTUAL BLUEPRINT (${overview.edition} edition), as it stands right now:`,
          "",
          lines,
          "",
          notYetTheirs > 0
            ? `They are on the Free Blueprint, which is these ${theirs.length} pages. The Full Build adds ` +
              `${notYetTheirs} more. Do not describe those as part of their Blueprint — they do not have them ` +
              "yet — and do not turn this into a sales pitch either. Mention it only if they ask."
            : "They have the full thirteen-page Blueprint.",
          "",
          "This is their real record. When they ask what is on their Blueprint, answer from this list and " +
            "nothing else. Never substitute a general description of what a Stewardship Blueprint contains.",
          "",
          "Answer conversationally: say where they are in a sentence or two and name the page worth starting " +
            "with. Do not reproduce this list page by page with a description of each unless they ask for the " +
            "whole thing. A wall of numbered items is not an answer, it is a filing cabinet.",
          "",
          "This list does not include what they WROTE. For the words on a page, call read_blueprint_page.",
          "",
          ...assessmentLines(snapshot),
          "",
          VOICE_REMINDER,
        ].join("\n"),
      });
    },
  },
});
