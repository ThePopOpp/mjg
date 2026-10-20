import { defineTool } from "eve/tools";
import { z } from "zod";
import { callApp } from "../lib/app-tools.ts";

/**
 * One page, including the wording the member approved.
 *
 * Also returns any proposal still awaiting their decision, so Steward does not
 * stack a second proposal on a field where the member has not answered the
 * first.
 */
export default defineTool({
  description:
    "Read one page of the member's Blueprint: its purpose, each field, what the member has approved so far, and " +
    "any proposal still waiting on them. Read the page before proposing wording for it.",
  inputSchema: z.object({
    page: z
      .string()
      .describe('The page slug from read_blueprint, e.g. "guardrails", "what-i-stand-on", "four-pillars".'),
  }),
  execute: (input, options) => callApp(options.context, "blueprint.page", { page: input.page }),
});
