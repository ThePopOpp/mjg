import { defineTool } from "eve/tools";
import { z } from "zod";
import { callApp } from "../lib/app-tools.ts";

/**
 * The member's Blueprint at a glance.
 *
 * Returns page titles, purposes and states — NOT their wording. A member's own
 * words are the most sensitive thing in this product, and an overview does not
 * need them: read_blueprint_page fetches one page when there is a reason to.
 * Keeping the default small is the "minimum permitted content" the invocation
 * contract asks for, not an optimisation.
 */
export default defineTool({
  description:
    "Look at the member's Blueprint: all pages, each page's purpose, how settled it is, and how many fields have " +
    "wording. Does NOT return what they wrote — use read_blueprint_page for one page. Use this to orient yourself " +
    "before suggesting where to work.",
  inputSchema: z.object({}),
  execute: () => callApp("blueprint.overview"),
});
