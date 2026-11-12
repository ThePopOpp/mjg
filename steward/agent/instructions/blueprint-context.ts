import { defineDynamic, defineInstructions } from "eve/instructions";
import { callApp } from "../lib/app-tools.ts";
import { principalFromAuth } from "../lib/member.ts";
import { turnContext, type Overview, type Snapshot } from "../lib/turn-context.ts";

// The member's Blueprint and Check-In results, SUPPLIED rather than fetched.
//
// Steward was once asked "what's on my Blueprint?" and answered with five
// plausible categories that were not the member's pages, without calling the
// tool. Telling it more firmly did not fix it. The docset's invocation contract
// (§E02) supplies server-owned participant context INTO the invocation, so the
// real page list and scores are in front of the model on every turn. Inventing
// a Blueprint then means contradicting data already in context.
//
// Still no wording here — page names, states and scores only. The member's own
// words are fetched per page or per assessment when there is a reason to, which
// keeps the default amount of private content in context as small as the task
// allows.
//
// The text itself is built in ../lib/turn-context.ts (pure, shared with the
// response-quality harness).

export default defineDynamic({
  events: {
    "turn.started": async (_event, ctx) => {
      const principal = principalFromAuth(ctx.session.auth);
      // Fetched together; one failing must not cost them the other.
      const [blueprint, results] = await Promise.allSettled([
        callApp<Overview>("blueprint.overview", {}, principal),
        callApp<Snapshot>("assessments.snapshot", {}, principal),
      ]);
      if (blueprint.status === "rejected") console.warn("[steward] blueprint context unavailable", blueprint.reason);
      if (results.status === "rejected") console.warn("[steward] assessment context unavailable", results.reason);

      return defineInstructions({
        content: turnContext(
          blueprint.status === "fulfilled" ? blueprint.value : null,
          results.status === "fulfilled" ? results.value : null,
        ),
      });
    },
  },
});
