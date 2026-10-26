import { addTaskComment, claimNextTask, createTask, getTask, listAgents, listTasks, reportOnTask, resolveAgent, resolveTask, setAgentPaused } from "@/lib/agents/tasks";
import type { ToolContext, ToolDef } from "./types";

// The agent layer over the connector (P5). People in Claude hand work to agents
// and review it; agents (Paperclip, Hermes, OpenClaw — anything holding an agent
// token) claim tasks, do the work with the MJG tools their token allows, and
// report back. Agent high-risk actions still wait for a person's approval.

const actor = (ctx: ToolContext) => ({ profileId: ctx.actorId, tokenId: ctx.tokenId ?? null, via: (ctx.tokenKind === "agent" ? "agent" : "mcp") as "agent" | "mcp" });

function agentOnly(ctx: ToolContext): string {
  if (ctx.tokenKind !== "agent" || !ctx.tokenId) throw new Error("This tool is for agents connected with an agent token.");
  return ctx.tokenId;
}

function peopleOnly(ctx: ToolContext) {
  if (ctx.tokenKind === "agent") throw new Error("Only a person can do this.");
}

const TASK_ID = { type: "string", description: "Task id." };

const agentsList: ToolDef = {
  name: "agents_list",
  title: "List agents",
  description: "The agents connected to MJG (agent tokens): name, what they're allowed to do, active or paused, last seen, and open tasks.",
  domain: "agent",
  inputSchema: { type: "object", properties: {} },
  risk: "read",
  minRole: "super_admin",
  run: async () => listAgents(),
};

const taskCreate: ToolDef = {
  name: "agent_task_create",
  title: "Give an agent a task",
  description:
    "Hands work to an agent (by name or id from agents_list), or leaves it open for any agent. Write clear instructions and what 'done' means. The agent picks it up the next time it checks in.",
  domain: "agent",
  inputSchema: {
    type: "object",
    properties: {
      title: { type: "string", maxLength: 300 },
      instructions: { type: "string" },
      agent: { type: "string", description: "Agent name or id; omit for any agent." },
      priority: { type: "string", enum: ["low", "normal", "high", "urgent"] },
      due_at: { type: "string", description: "ISO date-time." },
    },
    required: ["title", "instructions"],
  },
  risk: "write",
  minRole: "super_admin",
  run: async (a: { title: string; instructions: string; agent?: string; priority?: "low" | "normal" | "high" | "urgent"; due_at?: string }, ctx) =>
    createTask({ title: a.title, instructions: a.instructions, agent: a.agent ?? null, priority: a.priority, dueAt: a.due_at ?? null }, actor(ctx)),
};

const tasksList: ToolDef = {
  name: "agent_tasks_list",
  title: "Agent tasks",
  description: "Tasks handed to agents, newest first. Filter by status (open = queued, in progress or waiting for review) or agent.",
  domain: "agent",
  inputSchema: {
    type: "object",
    properties: {
      status: { type: "string", enum: ["open", "queued", "in_progress", "needs_review", "done", "failed", "canceled"] },
      agent: { type: "string", description: "Agent name or id." },
      limit: { type: "integer", minimum: 1, maximum: 200 },
    },
  },
  risk: "read",
  minRole: "super_admin",
  run: async (a: { status?: any; agent?: string; limit?: number }) =>
    listTasks({ status: a.status, agentTokenId: a.agent ? (await resolveAgent(a.agent)).id : undefined, limit: a.limit }),
};

const taskGet: ToolDef = {
  name: "agent_task_get",
  title: "One agent task",
  description: "A task's instructions, status, result and full history of what the agent did.",
  domain: "agent",
  inputSchema: { type: "object", properties: { id: TASK_ID }, required: ["id"] },
  risk: "read",
  minRole: "super_admin",
  run: async (a: { id: string }) => getTask(a.id),
};

const taskResolve: ToolDef = {
  name: "agent_task_resolve",
  title: "Settle an agent task",
  description: "Accepts a task's result (done), marks it failed, sends it back to the queue (requeue) or cancels it, with an optional note.",
  domain: "agent",
  inputSchema: {
    type: "object",
    properties: { id: TASK_ID, outcome: { type: "string", enum: ["done", "failed", "requeue", "canceled"] }, note: { type: "string" } },
    required: ["id", "outcome"],
  },
  risk: "write",
  minRole: "super_admin",
  run: async (a: { id: string; outcome: "done" | "failed" | "requeue" | "canceled"; note?: string }, ctx) => {
    peopleOnly(ctx);
    return resolveTask(a, actor(ctx));
  },
};

const taskComment: ToolDef = {
  name: "agent_task_comment",
  title: "Comment on an agent task",
  description: "Adds a note to a task's history (guidance for the agent, or a person's remark).",
  domain: "agent",
  inputSchema: { type: "object", properties: { id: TASK_ID, message: { type: "string", minLength: 1 } }, required: ["id", "message"] },
  risk: "write",
  minRole: "super_admin",
  run: async (a: { id: string; message: string }, ctx) => addTaskComment(a.id, a.message, actor(ctx)),
};

const pause: ToolDef = {
  name: "agent_pause",
  title: "Pause or resume an agent",
  description: "Pauses an agent (every call it makes is refused until resumed) or resumes it. Its tasks stay where they are.",
  domain: "agent",
  inputSchema: { type: "object", properties: { agent: { type: "string", description: "Agent name or id." }, paused: { type: "boolean" } }, required: ["agent", "paused"] },
  risk: "write",
  minRole: "super_admin",
  run: async (a: { agent: string; paused: boolean }, ctx) => {
    peopleOnly(ctx);
    const agent = await resolveAgent(a.agent); // paused agents are listed too
    return setAgentPaused(agent.id, a.paused);
  },
};

// ── For agents ──────────────────────────────────────────────────────────────

const next: ToolDef = {
  name: "agent_task_next",
  title: "Take my next task (agents)",
  description:
    "For agents: claims your next task — yours first, then unassigned ones, by priority. Returns null when there's nothing to do. Do the work with MJG tools, then call agent_task_report.",
  domain: "agent",
  inputSchema: { type: "object", properties: {} },
  risk: "write",
  minRole: "super_admin",
  run: async (_a, ctx) => ({ task: await claimNextTask(agentOnly(ctx), actor(ctx)) }),
};

const report: ToolDef = {
  name: "agent_task_report",
  title: "Report on my task (agents)",
  description:
    "For agents: records progress on a task you hold, or finishes it — status needs_review (a person checks it), done, or failed — with a result summary and optional structured data (links, ids).",
  domain: "agent",
  inputSchema: {
    type: "object",
    properties: {
      id: TASK_ID,
      status: { type: "string", enum: ["in_progress", "needs_review", "done", "failed"] },
      message: { type: "string", description: "Progress note." },
      result: { type: "string", description: "Summary of the outcome." },
      result_data: { type: "object" },
    },
    required: ["id"],
  },
  risk: "write",
  minRole: "super_admin",
  run: async (a: { id: string; status?: "in_progress" | "needs_review" | "done" | "failed"; message?: string; result?: string; result_data?: unknown }, ctx) =>
    reportOnTask({ id: a.id, status: a.status, message: a.message, result: a.result, resultData: a.result_data }, agentOnly(ctx), actor(ctx)),
};

export const AGENT_LAYER_TOOLS: ToolDef[] = [agentsList, taskCreate, tasksList, taskGet, taskResolve, taskComment, pause, next, report];
