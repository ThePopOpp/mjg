import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { CallToolRequestSchema, ListToolsRequestSchema, type CallToolResult, type Tool } from "@modelcontextprotocol/sdk/types.js";
import { TOOLS, getTool } from "@/lib/tools";
import { scopesAllow, type ToolContext, type ToolDef } from "@/lib/tools/types";
import { validateArgs } from "@/lib/tools/validate";
import { ROLES } from "@/lib/rbac/roles";
import type { McpActor } from "./auth";
import { logToolCall } from "./audit";
import { claimConfirmation, createConfirmation, recordConfirmationResult, CONFIRM_TTL_MINUTES } from "./confirm";
import { allowCall } from "./rate-limit";

// The MJG MCP server. Stateless: a fresh server is built per HTTP request for
// the authenticated actor (see app/api/mcp/route.ts), from the shared registry.
//
// Every call: allowed for this actor? → arguments valid? → rate limit →
//   read / write : run, audit
//   high         : store args + return a preview and a confirmation id, audit "preview"
// mjg_confirm(id) runs a stored high-risk call exactly as previewed.

const INSTRUCTIONS = `You are connected to MJG (michaeljgauthier.com) — the Stewardship Blueprint business: website and marketing pages, content, blog, media, email, SMS, calls, social, participants, contacts, project work and the dashboard AI tools.

Every tool has a risk level:
• read — runs immediately.
• write — changes one thing or reaches one person; it runs when called.
• high — goes live publicly, reaches many people, deletes, or changes automations. Calling it returns a PREVIEW and a confirmation_id instead of acting. Show the person the preview, and only after they clearly agree, call mjg_confirm with that id. Never confirm on your own initiative.

Use mjg_search_tools to find tools by keyword or domain. Prefer drafts and preview links for website and content changes. Everything you do is logged under the signed-in person's name.`;

const MAX_RESULT_CHARS = 100_000;
const CONFIRM_TOOL = "mjg_confirm";

function roleAllows(tool: ToolDef, role: string): boolean {
  if (role === ROLES.SUPER_ADMIN) return true;
  return tool.minRole === "admin" && role === ROLES.ADMIN;
}

function visibleTo(actor: McpActor, tool: ToolDef): boolean {
  return roleAllows(tool, actor.ctx.role) && scopesAllow(actor.scopes, tool);
}

function toMcpTool(tool: ToolDef): Tool {
  const riskNote =
    tool.risk === "high"
      ? " [HIGH RISK: returns a preview + confirmation_id; runs only via mjg_confirm after the person agrees.]"
      : tool.risk === "write"
        ? " [WRITE]"
        : "";
  return {
    name: tool.name,
    title: tool.title,
    description: `${tool.description}${riskNote}`,
    inputSchema: { type: "object", ...(tool.inputSchema as object) } as Tool["inputSchema"],
    annotations: {
      title: tool.title,
      readOnlyHint: tool.risk === "read",
      destructiveHint: tool.risk === "high",
      idempotentHint: tool.risk === "read",
      openWorldHint: ["email", "sms", "calls", "social"].includes(tool.domain) && tool.risk !== "read",
    },
  };
}

const CONFIRM_DEFINITION: Tool = {
  name: CONFIRM_TOOL,
  title: "Confirm a high-risk action",
  description: `Runs a high-risk action exactly as previewed. Only call this after the person has seen the preview and clearly said yes. Confirmations expire after ${CONFIRM_TTL_MINUTES} minutes and work once.`,
  inputSchema: {
    type: "object",
    properties: { confirmation_id: { type: "string", description: "The confirmation_id from the preview." } },
    required: ["confirmation_id"],
  },
  annotations: { title: "Confirm a high-risk action", readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: true },
};

/** Readable text for any thrown value — Supabase/PostgREST errors are plain objects, not Errors. */
export function errorText(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (err && typeof err === "object") {
    const e = err as { message?: string; hint?: string; details?: unknown };
    if (e.message) return [e.message, e.hint].filter(Boolean).join(" — ");
    return JSON.stringify(err).slice(0, 500);
  }
  return String(err);
}

function text(value: unknown, isError = false): CallToolResult {
  let body = typeof value === "string" ? value : JSON.stringify(value ?? null, null, 2);
  if (body.length > MAX_RESULT_CHARS) body = `${body.slice(0, MAX_RESULT_CHARS)}\n… [truncated ${body.length - MAX_RESULT_CHARS} characters — narrow the request]`;
  return { content: [{ type: "text", text: body }], ...(isError ? { isError: true } : {}) };
}

async function runTool(tool: ToolDef, args: unknown, ctx: ToolContext): Promise<CallToolResult> {
  const started = Date.now();
  try {
    const result = await tool.run(args, ctx);
    await logToolCall({ ctx, tool: tool.name, risk: tool.risk, args, status: "ok", durationMs: Date.now() - started });
    return text(result ?? { ok: true });
  } catch (err) {
    const message = errorText(err);
    await logToolCall({ ctx, tool: tool.name, risk: tool.risk, args, status: "error", error: message, durationMs: Date.now() - started });
    return text(`Error: ${message}`, true);
  }
}

export function createMcpServer(actor: McpActor): Server {
  const server = new Server({ name: "mjg", title: "MJG", version: "1.0.0" }, { capabilities: { tools: {} }, instructions: INSTRUCTIONS });

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [CONFIRM_DEFINITION, ...TOOLS.filter((t) => visibleTo(actor, t)).map(toMcpTool)],
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { ctx } = actor;
    const name = request.params.name;
    const args = (request.params.arguments ?? {}) as Record<string, unknown>;

    if (name === CONFIRM_TOOL) {
      const id = typeof args.confirmation_id === "string" ? args.confirmation_id : "";
      if (!/^[0-9a-f-]{36}$/i.test(id)) return text("Error: confirmation_id is required.", true);
      const claim = await claimConfirmation(id, ctx);
      if (!claim.ok) {
        await logToolCall({ ctx, tool: CONFIRM_TOOL, args: { confirmation_id: id }, status: "denied", error: claim.reason });
        return text(`Not run: ${claim.reason}`, true);
      }
      const tool = getTool(claim.tool);
      if (!tool || !visibleTo(actor, tool)) {
        await recordConfirmationResult(id, { ok: false, error: "tool unavailable" });
        return text("Not run: that tool is no longer available to this connection.", true);
      }
      const result = await runTool(tool, claim.args, ctx);
      await recordConfirmationResult(id, { ok: !result.isError, error: result.isError ? String(result.content?.[0] && "text" in result.content[0] ? result.content[0].text : "") : undefined });
      return result;
    }

    const tool = getTool(name);
    if (!tool || !visibleTo(actor, tool)) {
      await logToolCall({ ctx, tool: name, args, status: "denied", error: "unknown or not allowed" });
      return text(`Error: no tool named "${name}" is available to this connection. Use mjg_search_tools.`, true);
    }

    const check = validateArgs(tool.name, tool.inputSchema, args);
    if (!check.ok) {
      await logToolCall({ ctx, tool: tool.name, risk: tool.risk, args, status: "invalid", error: check.errors.join("; ") });
      return text(`Error: invalid arguments — ${check.errors.join("; ")}`, true);
    }

    if (!allowCall(actor.tokenId, tool.risk)) {
      await logToolCall({ ctx, tool: tool.name, risk: tool.risk, args, status: "denied", error: "rate limited" });
      return text("Error: too many calls in the last minute. Wait a moment and try again.", true);
    }

    if (tool.risk === "high") {
      try {
        const pending = await createConfirmation(tool, args, ctx);
        await logToolCall({ ctx, tool: tool.name, risk: tool.risk, args, status: "preview" });
        if (pending.awaitingApproval) {
          return text({
            status: "awaiting_approval",
            message: "This high-risk action was sent to the MJG dashboard for a person to approve (Settings → Claude & Agents). It has not run.",
            summary: pending.summary,
            preview: pending.preview,
          });
        }
        return text({
          status: "needs_confirmation",
          summary: pending.summary,
          preview: pending.preview,
          confirmation_id: pending.confirmationId,
          expires_at: pending.expiresAt,
          next: "Show this to the person. Only if they clearly agree, call mjg_confirm with this confirmation_id.",
        });
      } catch (err) {
        const message = errorText(err);
        await logToolCall({ ctx, tool: tool.name, risk: tool.risk, args, status: "error", error: message });
        return text(`Error preparing the preview: ${message}`, true);
      }
    }

    return runTool(tool, args, ctx);
  });

  return server;
}
