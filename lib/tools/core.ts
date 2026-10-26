import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { ToolDef } from "./types";

// Built-in tools: orientation (who am I, what can I do) and the audit trail.
// mjg_confirm lives in lib/mcp/confirm.ts because it needs the caller's token.

const whoami: ToolDef = {
  name: "mjg_whoami",
  title: "Who am I",
  description: "Shows which MJG account this connection acts as, its role, and how it is connected. Call this first if unsure.",
  domain: "core",
  inputSchema: { type: "object", properties: {} },
  risk: "read",
  minRole: "super_admin",
  run: async (_args, ctx) => ({
    profileId: ctx.actorId,
    email: ctx.actorEmail,
    role: ctx.role,
    connection: ctx.tokenKind === "agent" ? "agent token" : "signed-in person",
    via: ctx.via,
  }),
};

const searchTools: ToolDef = {
  name: "mjg_search_tools",
  title: "Find tools",
  description:
    "Lists MJG tools by keyword and/or domain (content, website, blog, media, legal, email, sms, calls, social, people, commerce, crm, ops, dev, deploy, data, agent), with each tool's risk: read (runs immediately), write (changes one thing), high (preview first, then mjg_confirm).",
  domain: "core",
  inputSchema: {
    type: "object",
    properties: {
      query: { type: "string", description: "Words to match in the tool name or description." },
      domain: { type: "string", description: "Limit to one domain." },
    },
  },
  risk: "read",
  minRole: "super_admin",
  run: async (args: { query?: string; domain?: string }) => {
    const { TOOLS } = await import("./index");
    const words = (args.query ?? "").toLowerCase().split(/\s+/).filter(Boolean);
    return TOOLS.filter((t) => !args.domain || t.domain === args.domain)
      .filter((t) => words.every((w) => `${t.name} ${t.description}`.toLowerCase().includes(w)))
      .map((t) => ({ name: t.name, domain: t.domain, risk: t.risk, description: t.description.slice(0, 160) }));
  },
};

const auditRecent: ToolDef = {
  name: "mjg_audit_recent",
  title: "Recent Claude activity",
  description: "The most recent MJG actions taken through this connector (any person or agent): tool, who, outcome and when.",
  domain: "core",
  inputSchema: {
    type: "object",
    properties: {
      limit: { type: "integer", minimum: 1, maximum: 100, description: "How many (default 25)." },
      tool: { type: "string", description: "Only this tool." },
    },
  },
  risk: "read",
  minRole: "super_admin",
  run: async (args: { limit?: number; tool?: string }) => {
    const supabase = createSupabaseAdminClient();
    let query = supabase
      .from("mcp_tool_calls")
      .select("created_at, tool, risk, status, error, duration_ms, profile:profiles(email)")
      .order("created_at", { ascending: false })
      .limit(args.limit ?? 25);
    if (args.tool) query = query.eq("tool", args.tool);
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },
};

export const CORE_TOOLS: ToolDef[] = [whoami, searchTools, auditRecent];
