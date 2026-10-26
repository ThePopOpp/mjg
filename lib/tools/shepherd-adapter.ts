import { AGENT_TOOLS, type AgentTool } from "@/lib/ai-agent/tools";
import type { ToolDef, ToolDomain, ToolRisk } from "./types";

// Lifts Shepherd's existing tools (lib/ai-agent/tools.ts + the Frontend Editor
// tools in lib/website/shepherd-tools.ts) into the shared registry, so Claude
// gets the same 80-odd actions the dashboard agent already has, with the same
// handlers. New tools are written directly against ToolDef (lib/tools/*).
//
// Shepherd only knows "needs confirmation or not". The registry needs a risk
// tier, so confirmation-gated tools default to "write" and the ones below are
// raised to "high": they publish publicly, reach many people, delete, or change
// what happens automatically later.

const HIGH_RISK = new Set([
  "delete_email_template",
  "run_due_journey_emails",
  "set_email_automation",
  "publish_social_post",
  "update_blog_post_status", // can publish, hide or delete a post
  "set_social_automation",
  "website_publish_page",
  "website_page_lifecycle",
  "website_site_wide_replace",
  "website_update_navigation",
  "website_update_global",
]);

/** Tools that change state without Shepherd asking first (its own memory). */
const UNGATED_WRITES = new Set(["remember", "forget"]);

function riskOf(tool: AgentTool): ToolRisk {
  if (HIGH_RISK.has(tool.name)) return "high";
  if (tool.requiresConfirmation || UNGATED_WRITES.has(tool.name)) return "write";
  return "read";
}

function domainOf(name: string): ToolDomain {
  if (name.startsWith("website_")) return "website";
  if (name === "run_sql_query") return "data";
  if (/dev_request/.test(name)) return "dev";
  if (/blog/.test(name)) return "blog";
  if (/media|brand_kit/.test(name)) return "media";
  if (/cms/.test(name)) return "website";
  if (/social/.test(name)) return "social";
  if (/sms/.test(name)) return "sms";
  if (/call/.test(name)) return "calls";
  if (/email|journey/.test(name)) return "email";
  if (/contact|business_card|booking|form_submission/.test(name)) return "crm";
  if (/participant|pilot|tag|user/.test(name)) return "people";
  if (/project/.test(name)) return "ops";
  if (/training_doc|remember|forget/.test(name)) return "agent";
  return "core";
}

function titleOf(name: string): string {
  const words = name.replace(/^website_/, "website ").replace(/_tool$/, "").split(/[_\s]+/);
  const text = words.join(" ");
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function adaptShepherdTool(tool: AgentTool): ToolDef {
  return {
    name: tool.name,
    title: titleOf(tool.name),
    description: tool.description,
    domain: domainOf(tool.name),
    inputSchema: tool.parameters,
    risk: riskOf(tool),
    minRole: "super_admin",
    summarize: tool.summarize,
    run: (args, ctx) => tool.execute(args, { actorId: ctx.actorId, actorEmail: ctx.actorEmail }),
  };
}

/**
 * Shepherd tools NOT offered through the connector because a stricter
 * replacement exists: send_sms → sms_send (requires a recorded opt-in).
 */
const REPLACED = new Set(["send_sms"]);

export const SHEPHERD_TOOLS: ToolDef[] = AGENT_TOOLS.filter((t) => !REPLACED.has(t.name)).map(adaptShepherdTool);
