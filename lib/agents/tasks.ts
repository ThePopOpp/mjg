import { createSupabaseAdminClient } from "@/lib/supabase/admin";

// The agent task queue (migration 202610260121). People hand work to agents;
// agents claim it, do it through MJG's tools, and report back. MJG holds the
// queue so any harness — Paperclip, Hermes, OpenClaw, or Claude itself — works
// the same way over the connector. See docs/agents/mjg-agent-connector.md.

export type TaskStatus = "queued" | "in_progress" | "needs_review" | "done" | "failed" | "canceled";
export type TaskPriority = "low" | "normal" | "high" | "urgent";
type Actor = { profileId: string; tokenId?: string | null; via: "mcp" | "dashboard" | "agent" };

const PRIORITY_ORDER: TaskPriority[] = ["urgent", "high", "normal", "low"];
const OPEN: TaskStatus[] = ["queued", "in_progress", "needs_review"];

async function addEvent(taskId: string, kind: string, actor: Actor, message?: string | null, data?: unknown) {
  await createSupabaseAdminClient()
    .from("agent_task_events")
    .insert({ task_id: taskId, kind, message: message ?? null, data: data ?? null, actor_token_id: actor.tokenId ?? null, actor_profile_id: actor.profileId });
}

/** Agent tokens (live, not revoked) with their open task counts. */
export async function listAgents() {
  const supabase = createSupabaseAdminClient();
  const [{ data: tokens, error }, { data: open }] = await Promise.all([
    supabase.from("mcp_tokens").select("id, name, scopes, last_used_at, expires_at, paused_at, created_at").eq("kind", "agent").is("revoked_at", null).order("name"),
    supabase.from("agent_tasks").select("agent_token_id, status").in("status", OPEN),
  ]);
  if (error) throw error;
  const counts = new Map<string, number>();
  for (const t of open ?? []) if (t.agent_token_id) counts.set(t.agent_token_id, (counts.get(t.agent_token_id) ?? 0) + 1);
  const now = Date.now();
  return (tokens ?? [])
    .filter((t) => !t.expires_at || new Date(t.expires_at).getTime() > now)
    .map((t) => ({ ...t, status: t.paused_at ? "paused" : "active", openTasks: counts.get(t.id) ?? 0 }));
}

/** Resolves an agent by token id or by (case-insensitive) name. */
export async function resolveAgent(ref: string) {
  const agents = await listAgents();
  const match = agents.find((a) => a.id === ref) ?? agents.filter((a) => a.name.toLowerCase() === ref.trim().toLowerCase())[0];
  if (!match) throw new Error(`No active agent called "${ref}". Use agents_list.`);
  return match;
}

export async function createTask(input: { title: string; instructions?: string; agent?: string | null; priority?: TaskPriority; dueAt?: string | null }, actor: Actor) {
  const title = input.title.trim();
  if (!title) throw new Error("A task needs a title.");
  const agent = input.agent ? await resolveAgent(input.agent) : null;
  const { data, error } = await createSupabaseAdminClient()
    .from("agent_tasks")
    .insert({
      title: title.slice(0, 300),
      instructions: input.instructions ?? "",
      agent_token_id: agent?.id ?? null,
      priority: input.priority ?? "normal",
      due_at: input.dueAt ?? null,
      created_by: actor.profileId,
      created_via: actor.via,
    })
    .select("*")
    .single();
  if (error) throw error;
  await addEvent(data.id, "created", actor, agent ? `Assigned to ${agent.name}` : "Open to any agent");
  return data;
}

export async function listTasks(filter: { status?: TaskStatus | "open"; agentTokenId?: string; limit?: number } = {}) {
  let query = createSupabaseAdminClient()
    .from("agent_tasks")
    .select("id, title, status, priority, due_at, result, created_at, claimed_at, completed_at, agent:mcp_tokens(name)")
    .order("created_at", { ascending: false })
    .limit(filter.limit ?? 50);
  if (filter.status === "open") query = query.in("status", OPEN);
  else if (filter.status) query = query.eq("status", filter.status);
  if (filter.agentTokenId) query = query.eq("agent_token_id", filter.agentTokenId);
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function getTask(id: string) {
  const supabase = createSupabaseAdminClient();
  const [{ data: task, error }, { data: events }] = await Promise.all([
    supabase.from("agent_tasks").select("*, agent:mcp_tokens(name)").eq("id", id).maybeSingle(),
    supabase.from("agent_task_events").select("kind, message, data, created_at, actor_token:mcp_tokens(name), actor:profiles(email)").eq("task_id", id).order("created_at"),
  ]);
  if (error) throw error;
  if (!task) throw new Error("Task not found.");
  return { task, events: events ?? [] };
}

/**
 * The calling agent's next task: its own queued tasks first, then unassigned
 * ones, highest priority and oldest first. Claimed atomically, so two agents
 * polling at once can't both take the same task.
 */
export async function claimNextTask(agentTokenId: string, actor: Actor) {
  const supabase = createSupabaseAdminClient();
  const { data: candidates, error } = await supabase
    .from("agent_tasks")
    .select("id, priority, created_at, agent_token_id")
    .eq("status", "queued")
    .or(`agent_token_id.eq.${agentTokenId},agent_token_id.is.null`)
    .order("created_at", { ascending: true })
    .limit(50);
  if (error) throw error;
  const ordered = (candidates ?? []).sort(
    (a, b) =>
      Number(b.agent_token_id === agentTokenId) - Number(a.agent_token_id === agentTokenId) ||
      PRIORITY_ORDER.indexOf(a.priority) - PRIORITY_ORDER.indexOf(b.priority) ||
      a.created_at.localeCompare(b.created_at),
  );
  for (const candidate of ordered) {
    const now = new Date().toISOString();
    const { data: claimed } = await supabase
      .from("agent_tasks")
      .update({ status: "in_progress", agent_token_id: agentTokenId, claimed_at: now, updated_at: now })
      .eq("id", candidate.id)
      .eq("status", "queued")
      .select("*")
      .maybeSingle();
    if (claimed) {
      await addEvent(claimed.id, "claimed", actor);
      return claimed;
    }
  }
  return null;
}

/** An agent reports on a task it holds. */
export async function reportOnTask(
  input: { id: string; status?: "in_progress" | "needs_review" | "done" | "failed"; message?: string; result?: string; resultData?: unknown },
  agentTokenId: string,
  actor: Actor,
) {
  const supabase = createSupabaseAdminClient();
  const { data: task } = await supabase.from("agent_tasks").select("id, status, agent_token_id").eq("id", input.id).maybeSingle();
  if (!task) throw new Error("Task not found.");
  if (task.agent_token_id !== agentTokenId) throw new Error("This task belongs to another agent.");
  if (!["in_progress", "needs_review"].includes(task.status)) throw new Error(`This task is ${task.status}; it can't be updated.`);

  const now = new Date().toISOString();
  const patch: Record<string, unknown> = { updated_at: now };
  if (input.status) patch.status = input.status;
  if (input.result !== undefined) patch.result = input.result;
  if (input.resultData !== undefined) patch.result_data = input.resultData;
  if (input.status === "done" || input.status === "failed") patch.completed_at = now;
  const { error } = await supabase.from("agent_tasks").update(patch).eq("id", input.id);
  if (error) throw error;
  await addEvent(input.id, input.status && input.status !== "in_progress" ? input.status : "progress", actor, input.message ?? input.result ?? null, input.resultData);
  return { ok: true, status: input.status ?? task.status };
}

/** A person settles a task: accept a review, send it back, or cancel it. */
export async function resolveTask(input: { id: string; outcome: "done" | "failed" | "requeue" | "canceled"; note?: string }, actor: Actor) {
  const supabase = createSupabaseAdminClient();
  const { data: task } = await supabase.from("agent_tasks").select("id, status").eq("id", input.id).maybeSingle();
  if (!task) throw new Error("Task not found.");
  if (["done", "canceled"].includes(task.status) && input.outcome !== "requeue") throw new Error(`This task is already ${task.status}.`);
  const now = new Date().toISOString();
  const patch: Record<string, unknown> =
    input.outcome === "requeue"
      ? { status: "queued", claimed_at: null, completed_at: null, updated_at: now }
      : { status: input.outcome, completed_at: now, updated_at: now };
  const { error } = await supabase.from("agent_tasks").update(patch).eq("id", input.id);
  if (error) throw error;
  await addEvent(input.id, input.outcome === "requeue" ? "comment" : input.outcome, actor, input.note ?? (input.outcome === "requeue" ? "Sent back to the queue" : null));
  return { ok: true, status: patch.status };
}

export async function addTaskComment(id: string, message: string, actor: Actor) {
  await addEvent(id, "comment", actor, message);
  return { ok: true };
}

export async function setAgentPaused(tokenId: string, paused: boolean) {
  const { data, error } = await createSupabaseAdminClient()
    .from("mcp_tokens")
    .update({ paused_at: paused ? new Date().toISOString() : null })
    .eq("id", tokenId)
    .eq("kind", "agent")
    .select("id, name, paused_at")
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error("Agent not found.");
  return data;
}
