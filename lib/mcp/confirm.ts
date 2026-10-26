import { createHash } from "node:crypto";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { ToolContext, ToolDef } from "@/lib/tools/types";

// High-risk actions: preview first, then mjg_confirm.
//
// The first call stores the exact arguments (plus a hash of them) and returns a
// preview and a confirmation id. mjg_confirm(id) then runs those stored
// arguments — the model can't change them between preview and confirm — once,
// for the same connection, within the time limit. Claiming the row is a single
// conditional UPDATE, so two confirms racing can't both run.
//
// Calls made with an agent token are parked as 'awaiting_approval' instead: an
// agent can never approve its own high-risk action; a person approves it in the
// dashboard (Settings → Claude & Agents).

export const CONFIRM_TTL_MINUTES = 10;

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, v]) => v !== undefined)
      .sort(([a], [b]) => a.localeCompare(b));
    return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${stableStringify(v)}`).join(",")}}`;
  }
  return JSON.stringify(value ?? null);
}

export function argsHash(args: unknown): string {
  return createHash("sha256").update(stableStringify(args)).digest("hex");
}

export async function createConfirmation(tool: ToolDef, args: unknown, ctx: ToolContext) {
  const preview = tool.preview ? await tool.preview(args, ctx) : null;
  const summary = tool.summarize ? tool.summarize(args) : `${tool.title}`;
  const awaitingApproval = ctx.tokenKind === "agent";
  const expiresAt = new Date(Date.now() + (awaitingApproval ? 24 * 60 : CONFIRM_TTL_MINUTES) * 60_000).toISOString();

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("mcp_pending_confirmations")
    .insert({
      token_id: ctx.tokenId,
      profile_id: ctx.actorId,
      tool: tool.name,
      args,
      args_hash: argsHash(args),
      preview: { summary, details: preview },
      status: awaitingApproval ? "awaiting_approval" : "pending",
      expires_at: expiresAt,
    })
    .select("id, expires_at, status")
    .single();
  if (error) throw error;

  return { confirmationId: data.id as string, expiresAt: data.expires_at as string, summary, preview, awaitingApproval };
}

export type ClaimResult =
  | { ok: true; tool: string; args: unknown }
  | { ok: false; reason: string };

/** Claims a pending confirmation for this connection. On success the caller runs it. */
export async function claimConfirmation(id: string, ctx: ToolContext): Promise<ClaimResult> {
  const supabase = createSupabaseAdminClient();
  const { data: row } = await supabase
    .from("mcp_pending_confirmations")
    .select("id, token_id, profile_id, tool, args, args_hash, status, expires_at")
    .eq("id", id)
    .maybeSingle();

  if (!row) return { ok: false, reason: "No such confirmation." };
  if (row.profile_id !== ctx.actorId || row.token_id !== ctx.tokenId) {
    return { ok: false, reason: "That confirmation belongs to a different connection." };
  }
  if (row.status === "awaiting_approval") return { ok: false, reason: "This action is waiting for approval in the MJG dashboard." };
  if (row.status !== "pending") return { ok: false, reason: `This confirmation was already ${row.status}.` };
  if (new Date(row.expires_at).getTime() <= Date.now()) {
    await supabase.from("mcp_pending_confirmations").update({ status: "expired" }).eq("id", id).eq("status", "pending");
    return { ok: false, reason: "This confirmation expired. Ask for the action again to get a fresh preview." };
  }
  if (argsHash(row.args) !== row.args_hash) return { ok: false, reason: "The stored action was altered; refusing to run it." };

  // The atomic claim: only one caller can move it out of 'pending'.
  const { data: claimed } = await supabase
    .from("mcp_pending_confirmations")
    .update({ status: "executed", decided_by: ctx.actorId, decided_at: new Date().toISOString() })
    .eq("id", id)
    .eq("status", "pending")
    .select("id")
    .maybeSingle();
  if (!claimed) return { ok: false, reason: "This confirmation was already used." };

  return { ok: true, tool: row.tool, args: row.args };
}

export async function recordConfirmationResult(id: string, outcome: { ok: boolean; result?: unknown; error?: string }) {
  const supabase = createSupabaseAdminClient();
  await supabase
    .from("mcp_pending_confirmations")
    .update({ status: outcome.ok ? "executed" : "failed", result: outcome.ok ? { ok: true } : { error: outcome.error ?? "failed" } })
    .eq("id", id);
}
