// The MJG tool registry — one definition per action, served to both Claude (the
// MCP endpoint, app/api/mcp) and the dashboard AI agent (Shepherd).
//
// A tool is plain data plus a run function. The callers add everything else:
// who may call it (minRole + scopes), how risky it is (which decides whether it
// runs straight away or needs a preview and confirmation), input validation, and
// the audit trail. See lib/mcp/server.ts for how a call flows.

export type ToolRisk =
  /** Reads only. Runs immediately. */
  | "read"
  /** Changes one thing or reaches one person. Runs; the client shows its own approval prompt. */
  | "write"
  /** Goes live publicly, reaches many people, deletes, spends or changes automations.
   *  Returns a preview first; runs only after mjg_confirm. */
  | "high";

export type ToolDomain =
  | "core"
  | "content"
  | "website"
  | "blog"
  | "media"
  | "legal"
  | "email"
  | "sms"
  | "calls"
  | "social"
  | "people"
  | "commerce"
  | "crm"
  | "ops"
  | "dev"
  /** People only — never granted to agent tokens (see PEOPLE_ONLY_DOMAINS). */
  | "deploy"
  | "data"
  | "agent";

export type ToolContext = {
  /** profiles.id of the person (or the agent's service profile) acting. */
  actorId: string;
  actorEmail: string;
  role: string;
  /** Which surface the call came through; recorded in audit logs. */
  via: "mcp" | "shepherd";
  /** "agent" tokens can never confirm their own high-risk actions. */
  tokenKind?: "user" | "agent";
  tokenId?: string;
  clientId?: string | null;
  /** "Claude", "ChatGPT", "Other" (OAuth clients) or "Agent"; recorded in audit logs. */
  clientLabel?: string | null;
};

export type ToolDef = {
  name: string;
  /** Short human title (MCP `title`). */
  title: string;
  description: string;
  domain: ToolDomain;
  /** JSON Schema for the arguments (object). Validated before run. */
  inputSchema: Record<string, unknown>;
  risk: ToolRisk;
  /** Lowest role allowed. The MCP is Super Admin only today; kept per tool for later. */
  minRole: "super_admin" | "admin";
  /** One line describing what a high-risk call will do, for the confirmation preview. */
  summarize?: (args: any) => string;
  /** Optional richer preview for high-risk tools (counts, diffs, amounts). */
  preview?: (args: any, ctx: ToolContext) => Promise<unknown>;
  /** The record a write changes (an entity in lib/mcp/records.ts), so the audit
   *  log keeps a before/after snapshot. `id` gets the result too, for creates. */
  record?: { entity: string | ((args: any) => string); id: (args: any, result?: any) => string | undefined };
  run: (args: any, ctx: ToolContext) => Promise<unknown>;
};

/** The scope that grants a tool to an agent token: "<domain>:read" or "<domain>:write". */
export function scopeFor(tool: Pick<ToolDef, "domain" | "risk">): string {
  return `${tool.domain}:${tool.risk === "read" ? "read" : "write"}`;
}

/**
 * Whether a token's scopes allow a tool. "*" allows everything (people signed in
 * through OAuth); "<domain>:*" allows a whole domain; "<domain>:write" implies
 * "<domain>:read".
 */
export function scopesAllow(scopes: readonly string[], tool: Pick<ToolDef, "domain" | "risk">): boolean {
  if (scopes.includes("*")) return true;
  if (scopes.includes(`${tool.domain}:*`)) return true;
  const needed = scopeFor(tool);
  if (scopes.includes(needed)) return true;
  return needed.endsWith(":read") && scopes.includes(`${tool.domain}:write`);
}
