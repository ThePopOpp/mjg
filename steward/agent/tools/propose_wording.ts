import { defineTool } from "eve/tools";
import { z } from "zod";
import { callApp } from "../lib/app-tools.ts";

/**
 * Propose wording for one field. It does NOT go on the Blueprint.
 *
 * There is deliberately no approve tool anywhere in this agent. Approval is the
 * member's act, made from their own screen, and the application is what records
 * it. Steward proposing something changes nothing until they say yes.
 *
 * The tool returns `saved: false` and `status: "awaiting_member_approval"` so
 * that the honest summary is the one closest to hand when the model reports
 * back.
 */
export default defineTool({
  description:
    "Propose wording for one Blueprint field, in the member's own voice, for them to approve or change. This does " +
    "NOT save anything — it puts a suggestion in front of them. Never tell the member it is saved, added or " +
    "written down: it is not on their Blueprint until they approve these exact words. Propose one field at a time, " +
    "and only after reading the page.",
  inputSchema: z.object({
    page: z.string().describe('The page slug, e.g. "guardrails".'),
    field: z.string().describe('The field key from read_blueprint_page, e.g. "guardrails".'),
    wording: z
      .string()
      .min(1)
      .describe(
        "The exact words proposed, written as the member would say them — not about them, and not a summary of " +
          "the conversation.",
      ),
    needs_clarity: z
      .boolean()
      .optional()
      .describe(
        "True when the wording captures something real but a specific part is still unclear. Marks the wording, " +
          "and keeps the field from counting as settled.",
      ),
  }),
  execute: (input) =>
    callApp("blueprint.propose", {
      page: input.page,
      field: input.field,
      wording: input.wording,
      needs_clarity: input.needs_clarity ?? false,
    }),
});
