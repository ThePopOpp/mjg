import type { ToolContext, ToolDef } from "@/lib/tools/types";
import { logToolCall } from "./audit";
import { checkDailyCap } from "./caps";
import { snapshotRecord } from "./records";

// Runs one tool call and audits it — the single place a tool actually runs,
// whether straight from Claude/ChatGPT, via mjg_confirm, or when a person
// approves an agent's request in the dashboard. On the way it:
//   • refuses sends over the daily cap (lib/mcp/caps.ts),
//   • snapshots the record a write changes, before and after (lib/mcp/records.ts).

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

export type Execution = { ok: true; result: unknown } | { ok: false; error: string; denied?: boolean };

export async function executeTool(tool: ToolDef, args: unknown, ctx: ToolContext): Promise<Execution> {
  const base = { ctx, tool: tool.name, risk: tool.risk, args };

  const overCap = await checkDailyCap(tool.name).catch((err) => `Couldn't check the daily send limit: ${errorText(err)}`);
  if (overCap) {
    await logToolCall({ ...base, status: "denied", error: overCap });
    return { ok: false, error: overCap, denied: true };
  }

  const record = tool.risk === "read" ? undefined : tool.record;
  const entity = record ? (typeof record.entity === "function" ? record.entity(args) : record.entity) : undefined;
  const idBefore = record?.id(args);
  const before = entity && idBefore ? await snapshotRecord(entity, idBefore).catch(() => null) : undefined;

  const started = Date.now();
  try {
    const result = await tool.run(args, ctx);
    const recordId = record?.id(args, result) ?? idBefore;
    const after = entity && recordId ? await snapshotRecord(entity, recordId).catch(() => null) : undefined;
    await logToolCall({ ...base, status: "ok", durationMs: Date.now() - started, entity, recordId, before, after });
    return { ok: true, result };
  } catch (err) {
    const message = errorText(err);
    await logToolCall({ ...base, status: "error", error: message, durationMs: Date.now() - started, entity, recordId: idBefore, before });
    return { ok: false, error: message };
  }
}
