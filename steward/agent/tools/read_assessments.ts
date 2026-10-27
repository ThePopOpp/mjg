import { defineTool } from "eve/tools";
import { z } from "zod";
import { callApp } from "../lib/app-tools.ts";

/**
 * The member's own Check-In results, in detail.
 *
 * Their scores are already in context every turn. This adds how they rated each
 * statement, the next step and reflections they wrote on the Energy Audit, and
 * the assessment's own guidance for where they came out lowest — which is what
 * lets Steward talk about THEIR life instead of lives in general.
 *
 * Kept behind a tool rather than in every turn because the reflections are
 * their own private words, fetched when there is a reason to.
 */
export default defineTool({
  description:
    "Read the member's own Created for More Check-In and Energy Audit results in detail: how they rated each " +
    "statement, the next step and reflections they wrote, how their scores have moved, and the assessment's own " +
    "guidance for their result. Call this when the conversation touches a layer, a pillar or an energy, when they " +
    "ask about their results, or before suggesting where to start. Results are self-reported and dated — treat " +
    "them as a starting point to check with the member, not a verdict.",
  inputSchema: z.object({}),
  execute: () => callApp("assessments.detail"),
});
