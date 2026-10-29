import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { ToolContext } from "@/lib/tools/types";

// One row in mcp_tool_calls per tool call. Never throws: a logging failure must
// not turn a successful action into an error (it is reported to the server log).

const SECRET_KEY = /pass(word)?|secret|token|api[_-]?key|authorization|cookie/i;
const MAX_STRING = 2000;

/** Copies args for the log with secrets masked and long strings trimmed. */
export function redactArgs(value: unknown, depth = 0): unknown {
  if (depth > 6) return "[…]";
  if (typeof value === "string") return value.length > MAX_STRING ? `${value.slice(0, MAX_STRING)}… [${value.length} chars]` : value;
  if (Array.isArray(value)) return value.slice(0, 50).map((v) => redactArgs(v, depth + 1));
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, SECRET_KEY.test(k) ? "[redacted]" : redactArgs(v, depth + 1)]),
    );
  }
  return value;
}

export async function logToolCall(input: {
  ctx: ToolContext | null;
  tool: string;
  risk?: string;
  args?: unknown;
  status: "ok" | "error" | "denied" | "preview" | "invalid";
  error?: string;
  durationMs?: number;
  /** The record the call changed (lib/mcp/records.ts), with snapshots either side. */
  entity?: string;
  recordId?: string;
  before?: unknown;
  after?: unknown;
}) {
  try {
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.from("mcp_tool_calls").insert({
      token_id: input.ctx?.tokenId ?? null,
      profile_id: input.ctx?.actorId ?? null,
      client_id: input.ctx?.clientId ?? null,
      client_label: input.ctx?.clientLabel ?? null,
      tool: input.tool,
      risk: input.risk ?? null,
      args: input.args === undefined ? null : redactArgs(input.args),
      status: input.status,
      error: input.error?.slice(0, 2000) ?? null,
      duration_ms: input.durationMs ?? null,
      entity: input.entity ?? null,
      record_id: input.recordId ?? null,
      before: input.before === undefined ? null : redactArgs(input.before),
      after: input.after === undefined ? null : redactArgs(input.after),
    });
    if (error) console.error("[mcp] audit insert failed", error.message);
  } catch (err) {
    console.error("[mcp] audit insert failed", err instanceof Error ? err.message : err);
  }
}
