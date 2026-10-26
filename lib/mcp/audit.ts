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
}) {
  try {
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.from("mcp_tool_calls").insert({
      token_id: input.ctx?.tokenId ?? null,
      profile_id: input.ctx?.actorId ?? null,
      client_id: input.ctx?.clientId ?? null,
      tool: input.tool,
      risk: input.risk ?? null,
      args: input.args === undefined ? null : redactArgs(input.args),
      status: input.status,
      error: input.error?.slice(0, 2000) ?? null,
      duration_ms: input.durationMs ?? null,
    });
    if (error) console.error("[mcp] audit insert failed", error.message);
  } catch (err) {
    console.error("[mcp] audit insert failed", err instanceof Error ? err.message : err);
  }
}
