import { AGENT_LAYER_TOOLS } from "./agents";
import { CALL_TOOLS } from "./calls";
import { COMMERCE_TOOLS } from "./commerce";
import { CONTENT_TOOLS } from "./content";
import { CORE_TOOLS } from "./core";
import { DEPLOY_TOOLS } from "./deploy";
import { DEV_TOOLS } from "./dev";
import { EMAIL_TOOLS } from "./email";
import { GROUP_TOOLS } from "./groups";
import { LEGAL_TOOLS } from "./legal";
import { OPS_TOOLS } from "./ops";
import { SHEPHERD_TOOLS } from "./shepherd-adapter";
import { SMS_TOOLS } from "./sms";
import { WEBSITE_PLUS_TOOLS } from "./website-plus";
import type { ToolDef } from "./types";

// The registry: every tool Claude (via the MCP) can call. Built-in tools first,
// then Shepherd's existing tools. Domain modules (content, email, sms, ops, …)
// are added here as each phase lands.

export const TOOLS: ToolDef[] = [
  ...CORE_TOOLS,
  // P1 · website & content
  ...CONTENT_TOOLS,
  ...WEBSITE_PLUS_TOOLS,
  ...LEGAL_TOOLS,
  ...DEV_TOOLS,
  // P2 · email, SMS & calls
  ...EMAIL_TOOLS,
  ...SMS_TOOLS,
  ...CALL_TOOLS,
  // P3 · operations
  ...OPS_TOOLS,
  // P4 · customers & orders
  ...COMMERCE_TOOLS,
  // Find a Group (facilitator listings, rosters, launch switch, facilitator import)
  ...GROUP_TOOLS,
  // P5 · agent layer (task queue for Paperclip / Hermes / OpenClaw)
  ...AGENT_LAYER_TOOLS,
  // P6 · building & shipping (GitHub issues/PRs, Coolify deploys)
  ...DEPLOY_TOOLS,
  // Shepherd's existing tools (website editor, blog, media, email, SMS, social, people, CRM, projects…)
  ...SHEPHERD_TOOLS,
];

const BY_NAME = new Map(TOOLS.map((t) => [t.name, t]));

export function getTool(name: string): ToolDef | undefined {
  return BY_NAME.get(name);
}

export type { ToolDef, ToolContext, ToolRisk, ToolDomain } from "./types";
