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
  "If your answer would suit a stranger with the same question, it is not their answer.",
].join("\n");

export default defineDynamic({
  events: {
    "turn.started": async (_event, ctx) => {
      let overview: Overview;
      try {
        // Read from this resolver's own context rather than the tools' session
        // state, which is documented as not exposed here.
        overview = await callApp<Overview>("blueprint.overview", {}, principalFromAuth(ctx.session.auth));
      } catch (error) {
        // Say so rather than leaving a silence the model will fill. A turn that
        // could not read the Blueprint must produce "I couldn't reach it",
        // never a plausible summary.
        console.warn("[steward] blueprint context unavailable", error);
        return defineInstructions({
          content:
            "THEIR BLUEPRINT COULD NOT BE READ THIS TURN. If they ask about it, say plainly that you cannot " +
            "reach it right now and offer to carry on without it. Do not describe what it contains, do not " +
            "list pages from memory, and do not describe what a Stewardship Blueprint generally includes.",
        });
      }

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
          VOICE_REMINDER,
        ].join("\n"),
      });
    },
  },
});
