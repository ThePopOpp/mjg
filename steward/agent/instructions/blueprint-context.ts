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
  }[];
};

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

      const lines = overview.pages
        .map((page) => {
          const written = page.summarises_other_pages
            ? "summarises the other pages"
            : `${page.fields_with_wording} of ${page.fields_total} fields written`;
          return `${page.number}. ${page.title} — ${page.state}, ${written}`;
        })
        .join("\n");

      return defineInstructions({
        content: [
          `THIS MEMBER'S ACTUAL BLUEPRINT (${overview.edition} edition), as it stands right now:`,
          "",
          lines,
          "",
          "This is their real record. When they ask what is on their Blueprint, answer from this list and " +
            "nothing else — these page names, these states. Never substitute a general description of what a " +
            "Stewardship Blueprint contains; that would be inventing their life.",
          "",
          "This list does not include what they WROTE. For the words on a page, call read_blueprint_page.",
        ].join("\n"),
      });
    },
  },
});
