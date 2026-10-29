import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getTool } from "@/lib/tools";
import type { ToolContext } from "@/lib/tools/types";
import { getActiveProfileRole } from "@/lib/user-management/auth";
import { ROLES } from "@/lib/rbac/roles";
import { getDailyCaps } from "./caps";
import { inTrash, restoreRecord } from "./records";
import { AGENT_LABEL } from "./clients";
import { executeTool } from "./execute";
import { listTasks } from "@/lib/agents/tasks";

// Dashboard side of the connector (Settings → Claude & Agents): the on/off
// switch, connections and agent tokens, the activity log, and the approval
// queue for high-risk actions requested by agents, the AI clients (Claude,
// ChatGPT) with their own switches, and the daily send limits. Callers check
// Super Admin.

/** Activity filter: one AI client's calls ("Claude", "ChatGPT", "Other", "Agent"). */
export type ClientFilter = string | null;

export async function getMcpOverview(options: { client?: ClientFilter } = {}) {
  const supabase = createSupabaseAdminClient();
  let callsQuery = supabase
    .from("mcp_tool_calls")
    .select("id, created_at, tool, risk, status, error, duration_ms, client_label, entity, record_id, profile:profiles(email)")
    .order("created_at", { ascending: false })
    .limit(50);
  if (options.client) callsQuery = callsQuery.eq("client_label", options.client);

  const [settings, tokens, calls, approvals, tasks, clients, caps] = await Promise.all([
    supabase.from("mcp_settings").select("enabled, updated_at").eq("id", 1).maybeSingle(),
    supabase
      .from("mcp_tokens")
      .select("id, kind, name, scopes, created_at, last_used_at, expires_at, refresh_expires_at, paused_at, profile:profiles!mcp_tokens_profile_id_fkey(email)")
      .is("revoked_at", null)
      .order("created_at", { ascending: false })
      .limit(100),
    callsQuery,
    supabase
      .from("mcp_pending_confirmations")
      .select("id, tool, preview, created_at, expires_at, token:mcp_tokens(name), profile:profiles!mcp_pending_confirmations_profile_id_fkey(email)")
      .eq("status", "awaiting_approval")
      .order("created_at", { ascending: false }),
    listTasks({ limit: 30 }),
    supabase
      .from("mcp_oauth_clients")
      .select("client_id, client_name, client_label, redirect_uris, disabled_at, created_at")
      .order("created_at", { ascending: false })
      .limit(50),
    getDailyCaps(),
  ]);
  for (const r of [settings, tokens, calls, approvals, clients]) if (r.error) throw r.error;

  // A successful delete whose record is still in the trash can be restored from the activity list.
  const deletes = (calls.data ?? []).filter((c) => c.status === "ok" && c.entity && c.record_id && /_delete$/.test(c.tool));
  const trashed = await inTrash(deletes.map((c) => ({ entity: c.entity as string, id: c.record_id as string })));

  const now = Date.now();
  // A person's connection is live while its refresh token is; an agent token while unexpired.
  const live = (tokens.data ?? []).filter((t) => {
    const until = t.kind === "user" ? t.refresh_expires_at : t.expires_at;
    return !until || new Date(until).getTime() > now;
  });
  return {
    enabled: Boolean(settings.data?.enabled),
    connections: live,
    calls: (calls.data ?? []).map((c) => ({ ...c, restorable: trashed.has(`${c.entity}:${c.record_id}`) && /_delete$/.test(c.tool) })),
    clients: clients.data ?? [],
    caps,
    approvals: approvals.data ?? [],
    tasks,
  };
}

export async function setMcpEnabled(enabled: boolean, by: string) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("mcp_settings").upsert({ id: 1, enabled, updated_by: by, updated_at: new Date().toISOString() });
  if (error) throw error;
}

/**
 * Switches one AI client off or back on — every registration with that label
 * (Claude registers more than once). Checked on every call; a client that
 * registers again while switched off starts off too (lib/mcp/oauth.ts).
 */
export async function setClientDisabled(label: string, disabled: boolean, by: string) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("mcp_oauth_clients")
    .update({ disabled_at: disabled ? new Date().toISOString() : null, disabled_by: disabled ? by : null })
    .eq("client_label", label);
  if (error) throw error;
}

/** Restore from the Activity list (a delete made through the connector). */
export async function restoreFromActivity(entity: string, id: string) {
  return restoreRecord(entity, id);
}

export async function revokeConnection(id: string) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("mcp_tokens").update({ revoked_at: new Date().toISOString() }).eq("id", id).is("revoked_at", null);
  if (error) throw error;
}

/** A person approves or rejects a high-risk action an agent asked for. Approve runs it now. */
export async function decideApproval(id: string, decision: "approve" | "reject", deciderId: string) {
  const supabase = createSupabaseAdminClient();
  const { data: claimed } = await supabase
    .from("mcp_pending_confirmations")
    .update({ status: decision === "approve" ? "approved" : "rejected", decided_by: deciderId, decided_at: new Date().toISOString() })
    .eq("id", id)
    .eq("status", "awaiting_approval")
    .gt("expires_at", new Date().toISOString())
    .select("id, tool, args, token_id, profile_id")
    .maybeSingle();
  if (!claimed) throw new Error("That request was already decided or has expired.");
  if (decision === "reject") return { ok: true as const, result: null };

  const tool = getTool(claimed.tool);
  if (!tool) throw new Error("That tool no longer exists.");
  // The action runs as the agent's account, as it would have if it ran directly;
  // the approver is recorded on the request (decided_by).
  const resolved = await getActiveProfileRole(claimed.profile_id);
  if (!resolved || resolved.role !== ROLES.SUPER_ADMIN) throw new Error("The agent's account can no longer act.");
  const ctx: ToolContext = {
    actorId: resolved.profile.id,
    actorEmail: resolved.profile.email ?? "",
    role: resolved.role,
    via: "mcp",
    tokenKind: "agent",
    tokenId: claimed.token_id,
    clientLabel: AGENT_LABEL,
  };
  const outcome = await executeTool(tool, claimed.args, ctx);
  if (outcome.ok) {
    await supabase.from("mcp_pending_confirmations").update({ status: "executed", result: { ok: true } }).eq("id", id);
    return { ok: true as const, result: outcome.result };
  }
  await supabase.from("mcp_pending_confirmations").update({ status: "failed", result: { error: outcome.error } }).eq("id", id);
  throw new Error(`Approved, but it failed: ${outcome.error}`);
}
