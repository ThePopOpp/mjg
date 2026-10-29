import { getExperienceById, getExperiencesData, sendExperience, setExperienceArchived, updateExperience } from "@/lib/experiences/repository";
import { pauseSteps, rescheduleSteps, resendSteps, resumeSteps } from "@/lib/experiences/bulk";
import { sendExperienceEventNow } from "@/lib/experiences/scheduler";
import { addAttendeeToExperience } from "@/lib/experiences/add-attendee";
import { createDocument, deleteDocument, getDocument, listDocuments, searchDocuments, updateDocument } from "@/lib/workspace/repository";
import { createComment } from "@/lib/workspace/comments";
import { extractPlainText } from "@/lib/workspace/types";
import { createTask, deleteTask, updateTask } from "@/lib/plans/repository";
import { listPlansForActor, loadPlanWorkspace } from "@/lib/plans/data";
import type { PlanActor } from "@/lib/plans/auth";
import type { AppRole } from "@/lib/rbac/roles";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getCheckInSubmissionStats } from "@/lib/check-in/submissions";
import { getEnergyAuditStats } from "@/lib/energy-audit/submissions";
import { getBookWaitlistStats } from "@/lib/book-waitlist/repository";
import type { ToolContext, ToolDef } from "./types";

// Operations: Experiences (email programs like the 6-Week Challenge), Workspace
// documents, and Plans. Each wraps the module's own lib functions, so the same
// rules apply as in the dashboard. Building a NEW experience stays in the
// dashboard wizard (Experiences → New); these manage running ones.

// ── Experiences ─────────────────────────────────────────────────────────────

const EXP_ID = { type: "string", description: "Experience id (from experiences_list)." };
const STEPS = { type: "array", items: { type: "integer", minimum: 1 }, minItems: 1, description: "Step (week/email) numbers, e.g. [3, 4]." };
const bulkCtx = (ctx: ToolContext, experienceId: string) => ({ actorId: ctx.actorId, experienceId });

const expList: ToolDef = {
  name: "experiences_list",
  title: "List experiences",
  description: "Active (not archived) experiences — email programs/drips — with status, type, dates, facilitator and attendee counts.",
  domain: "ops",
  inputSchema: { type: "object", properties: {} },
  risk: "read",
  minRole: "super_admin",
  run: async () => {
    const { experiences } = await getExperiencesData();
    return (experiences as Array<Record<string, any>>).map((e) => ({
        id: e.id,
        name: e.name,
        status: e.status,
        type: e.experience_types?.name ?? null,
        startDate: e.start_date,
        facilitator: e.profiles?.full_name ?? e.profiles?.email ?? null,
        attendees: e.attendee_count ?? 0,
      }));
  },
};

const expGet: ToolDef = {
  name: "experiences_get",
  title: "One experience",
  description: "An experience's details: its steps (emails), schedule, attendees and send status.",
  domain: "ops",
  inputSchema: { type: "object", properties: { id: EXP_ID }, required: ["id"] },
  risk: "read",
  minRole: "super_admin",
  run: async (a: { id: string }) => {
    const exp = await getExperienceById(a.id);
    if (!exp) throw new Error("Experience not found.");
    return exp;
  },
};

const expUpdate: ToolDef = {
  name: "experiences_update",
  title: "Update an experience",
  description: "Changes an experience's name, facilitator, status, or start date/time.",
  domain: "ops",
  inputSchema: {
    type: "object",
    properties: {
      id: EXP_ID,
      name: { type: "string" },
      facilitator_id: { type: ["string", "null"] },
      status: { type: "string" },
      start_date: { type: "string", description: "YYYY-MM-DD" },
      start_time: { type: "string", description: "HH:MM (24h)" },
    },
    required: ["id"],
  },
  risk: "write",
  minRole: "super_admin",
  run: async (a: { id: string; name?: string; facilitator_id?: string | null; status?: string; start_date?: string; start_time?: string }) =>
    updateExperience(a.id, { name: a.name, facilitatorId: a.facilitator_id, status: a.status, startDate: a.start_date, startTime: a.start_time }),
};

const expAddAttendee: ToolDef = {
  name: "experiences_add_attendee",
  title: "Add someone to an experience",
  description: "Adds a person (by email) to an experience; optionally sends their invitation and any emails they missed.",
  domain: "ops",
  inputSchema: {
    type: "object",
    properties: { id: EXP_ID, email: { type: "string" }, name: { type: "string" }, send_invitation: { type: "boolean" }, send_backlog: { type: "boolean" } },
    required: ["id", "email"],
  },
  risk: "write",
  minRole: "super_admin",
  run: async (a: { id: string; email: string; name?: string; send_invitation?: boolean; send_backlog?: boolean }, ctx) =>
    addAttendeeToExperience(a.id, { email: a.email, name: a.name, sendInvitation: a.send_invitation, sendBacklog: a.send_backlog }, ctx.actorId),
};

const expPause: ToolDef = {
  name: "experiences_pause_steps",
  title: "Pause emails",
  description: "Pauses selected step emails of an experience so they don't send.",
  domain: "ops",
  inputSchema: { type: "object", properties: { id: EXP_ID, steps: STEPS }, required: ["id", "steps"] },
  risk: "write",
  minRole: "super_admin",
  run: async (a: { id: string; steps: number[] }, ctx) => pauseSteps(bulkCtx(ctx, a.id), a.steps),
};

const expResume: ToolDef = {
  name: "experiences_resume_steps",
  title: "Resume emails",
  description: "Resumes paused step emails of an experience.",
  domain: "ops",
  inputSchema: { type: "object", properties: { id: EXP_ID, steps: STEPS }, required: ["id", "steps"] },
  risk: "write",
  minRole: "super_admin",
  run: async (a: { id: string; steps: number[] }, ctx) => resumeSteps(bulkCtx(ctx, a.id), a.steps),
};

const expReschedule: ToolDef = {
  name: "experiences_reschedule_steps",
  title: "Reschedule emails",
  description:
    "Moves selected step emails. mode 'anchor': earliest selected email goes to `at`, the rest keep their spacing; 'absolute': all on `at`; 'shift': all moved by `days`.",
  domain: "ops",
  inputSchema: {
    type: "object",
    properties: {
      id: EXP_ID,
      steps: STEPS,
      mode: { type: "string", enum: ["anchor", "absolute", "shift"] },
      at: { type: "string", description: "ISO date-time (anchor/absolute)." },
      days: { type: "integer", description: "Days to move, may be negative (shift)." },
    },
    required: ["id", "steps", "mode"],
  },
  risk: "write",
  minRole: "super_admin",
  run: async (a: { id: string; steps: number[]; mode: "anchor" | "absolute" | "shift"; at?: string; days?: number }, ctx) =>
    rescheduleSteps(bulkCtx(ctx, a.id), a.steps, { mode: a.mode, at: a.at, days: a.days }),
};

const expResend: ToolDef = {
  name: "experiences_resend_steps",
  title: "Resend emails",
  description: "Sends selected step emails again to the experience's attendees (now, or at a given time).",
  domain: "ops",
  inputSchema: { type: "object", properties: { id: EXP_ID, steps: STEPS, at: { type: "string", description: "ISO date-time; default now." } }, required: ["id", "steps"] },
  risk: "high",
  minRole: "super_admin",
  summarize: (a: { steps: number[]; at?: string }) => `Resend step${a.steps.length > 1 ? "s" : ""} ${a.steps.join(", ")} to every attendee${a.at ? ` at ${a.at}` : " now"}`,
  run: async (a: { id: string; steps: number[]; at?: string }, ctx) => resendSteps(bulkCtx(ctx, a.id), a.steps, { at: a.at }),
};

const expSendNow: ToolDef = {
  name: "experiences_send_email_now",
  title: "Send a scheduled email now",
  description: "Sends one scheduled experience email (a send event id from experiences_get) immediately instead of at its time.",
  domain: "ops",
  inputSchema: { type: "object", properties: { event_id: { type: "string" } }, required: ["event_id"] },
  risk: "high",
  minRole: "super_admin",
  summarize: () => "Send this scheduled experience email now",
  run: async (a: { event_id: string }, ctx) => sendExperienceEventNow(a.event_id, ctx.actorId),
};

const expLaunch: ToolDef = {
  name: "experiences_launch",
  title: "Launch an experience",
  description: "Starts an experience: schedules its emails for every attendee and sends whatever is due.",
  domain: "ops",
  inputSchema: { type: "object", properties: { id: EXP_ID }, required: ["id"] },
  risk: "high",
  minRole: "super_admin",
  summarize: () => "Launch this experience — its emails start going to attendees",
  preview: async (a: { id: string }) => {
    const found = await getExperienceById(a.id);
    if (!found) throw new Error("Experience not found.");
    const exp = found.experience as Record<string, any>;
    return { name: exp.name, status: exp.status, startDate: exp.start_date, attendees: found.attendees.length, scheduledEmails: found.sendEvents.length };
  },
  run: async (a: { id: string }, ctx) => sendExperience(a.id, ctx.actorId),
};

const expArchive: ToolDef = {
  name: "experiences_archive",
  title: "Archive or restore an experience",
  description: "Archives an experience (hides it and stops it being managed as active) or restores it.",
  domain: "ops",
  inputSchema: { type: "object", properties: { id: EXP_ID, archived: { type: "boolean" } }, required: ["id", "archived"] },
  risk: "high",
  minRole: "super_admin",
  summarize: (a: { archived: boolean }) => (a.archived ? "Archive this experience" : "Restore this experience"),
  run: async (a: { id: string; archived: boolean }) => setExperienceArchived(a.id, a.archived),
};

// ── Workspace documents ─────────────────────────────────────────────────────

/** Plain text → editor nodes: "# " headings, "- " bullets, blank-line paragraphs. */
function textToNodes(text: string): unknown[] {
  const blocks = text.replace(/\r\n/g, "\n").split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);
  const nodes: unknown[] = [];
  for (const block of blocks) {
    const heading = block.match(/^(#{1,3})\s+([\s\S]*)$/);
    if (heading) {
      nodes.push({ type: `h${heading[1].length}`, children: [{ text: heading[2].trim() }] });
      continue;
    }
    const lines = block.split("\n");
    if (lines.every((l) => /^[-*]\s+/.test(l))) {
      for (const l of lines) nodes.push({ type: "p", listStyleType: "disc", indent: 1, children: [{ text: l.replace(/^[-*]\s+/, "") }] });
      continue;
    }
    nodes.push({ type: "p", children: [{ text: lines.join("\n") }] });
  }
  return nodes.length ? nodes : [{ type: "p", children: [{ text: "" }] }];
}

const DOC_ID = { type: "string", description: "Document id (from workspace_search or workspace_list)." };

const wsList: ToolDef = {
  name: "workspace_list",
  title: "List workspace documents",
  description: "Your workspace documents and the ones shared with you (titles, folders, last updated).",
  domain: "ops",
  inputSchema: { type: "object", properties: {} },
  risk: "read",
  minRole: "super_admin",
  run: async (_a, ctx) => listDocuments(ctx.actorId),
};

const wsSearch: ToolDef = {
  name: "workspace_search",
  title: "Search workspace documents",
  description: "Finds workspace documents by words in the title or text.",
  domain: "ops",
  inputSchema: { type: "object", properties: { query: { type: "string", minLength: 1 } }, required: ["query"] },
  risk: "read",
  minRole: "super_admin",
  run: async (a: { query: string }, ctx) => searchDocuments(ctx.actorId, a.query),
};

const wsGet: ToolDef = {
  name: "workspace_get",
  title: "Read a document",
  description: "A workspace document's title, plain text and metadata (updated_at — pass it back as expected_updated_at when editing).",
  domain: "ops",
  inputSchema: { type: "object", properties: { id: DOC_ID }, required: ["id"] },
  risk: "read",
  minRole: "super_admin",
  run: async (a: { id: string }, ctx) => {
    const doc = (await getDocument(a.id, ctx.actorId)) as Record<string, any> | null;
    if (!doc) throw new Error("Document not found.");
    const { content, ...rest } = doc;
    return { ...rest, text: extractPlainText(content) };
  },
};

const wsCreate: ToolDef = {
  name: "workspace_create",
  title: "Create a document",
  description: "Creates a workspace document from text (\"# \" headings, \"- \" bullets, blank lines between paragraphs). Personal by default, or shared with the team.",
  domain: "ops",
  inputSchema: {
    type: "object",
    properties: { title: { type: "string" }, text: { type: "string" }, scope: { type: "string", enum: ["personal", "shared"] }, folder_id: { type: "string" } },
    required: ["title"],
  },
  risk: "write",
  minRole: "super_admin",
  run: async (a: { title: string; text?: string; scope?: "personal" | "shared"; folder_id?: string }, ctx) =>
    createDocument({ title: a.title, scope: a.scope ?? "personal", folderId: a.folder_id ?? null, content: a.text ? textToNodes(a.text) : undefined }, ctx.actorId),
};

const wsUpdate: ToolDef = {
  name: "workspace_update",
  title: "Edit a document",
  description:
    "Renames a document and/or replaces its text (same simple formatting as workspace_create), or appends text to the end. Pass expected_updated_at from workspace_get to avoid overwriting someone's edits.",
  domain: "ops",
  inputSchema: {
    type: "object",
    properties: {
      id: DOC_ID,
      title: { type: "string" },
      text: { type: "string", description: "Replaces the whole body." },
      append_text: { type: "string", description: "Added to the end instead." },
      expected_updated_at: { type: "string" },
    },
    required: ["id"],
  },
  risk: "write",
  minRole: "super_admin",
  run: async (a: { id: string; title?: string; text?: string; append_text?: string; expected_updated_at?: string }, ctx) => {
    let content: unknown[] | undefined;
    if (a.text !== undefined) content = textToNodes(a.text);
    else if (a.append_text) {
      const doc = (await getDocument(a.id, ctx.actorId)) as Record<string, any> | null;
      if (!doc) throw new Error("Document not found.");
      content = [...(Array.isArray(doc.content) ? doc.content : []), ...textToNodes(a.append_text)];
    }
    return updateDocument(a.id, { title: a.title, content, expectedUpdatedAt: a.expected_updated_at ?? null }, ctx.actorId);
  },
};

const wsComment: ToolDef = {
  name: "workspace_comment",
  title: "Comment on a document",
  description: "Adds a comment to a workspace document (optionally quoting the passage it's about).",
  domain: "ops",
  inputSchema: { type: "object", properties: { id: DOC_ID, body: { type: "string", minLength: 1 }, quote: { type: "string" } }, required: ["id", "body"] },
  risk: "write",
  minRole: "super_admin",
  run: async (a: { id: string; body: string; quote?: string }, ctx) => createComment({ documentId: a.id, body: a.body, quote: a.quote ?? null }, ctx.actorId),
};

const wsDelete: ToolDef = {
  name: "workspace_delete",
  title: "Move a document to trash",
  description: "Moves a workspace document to the trash (restorable from Workspace → Archive).",
  domain: "ops",
  inputSchema: { type: "object", properties: { id: DOC_ID }, required: ["id"] },
  risk: "high",
  minRole: "super_admin",
  summarize: () => "Move this workspace document to the trash",
  run: async (a: { id: string }) => deleteDocument(a.id),
};

// ── Plans ───────────────────────────────────────────────────────────────────

const planActor = (ctx: ToolContext): PlanActor => ({ id: ctx.actorId, role: ctx.role as AppRole, email: ctx.actorEmail });
const PLAN_ID = { type: "string", description: "Plan id (from plans_list)." };
const TASK_FIELDS = {
  title: { type: "string" },
  description: { type: "string" },
  notes: { type: "string" },
  status: { type: "string", description: "e.g. not_started, in_progress, complete" },
  priority: { type: "string", description: "e.g. low, medium, high, urgent" },
  progress: { type: "integer", minimum: 0, maximum: 100 },
  start_date: { type: "string", description: "YYYY-MM-DD" },
  due_date: { type: "string", description: "YYYY-MM-DD" },
  group_id: { type: "string", description: "Bucket/column id from plans_get." },
  is_milestone: { type: "boolean" },
};

const planList: ToolDef = {
  name: "plans_list",
  title: "List plans",
  description: "Plans (project boards) you can see, with progress.",
  domain: "ops",
  inputSchema: { type: "object", properties: { include_archived: { type: "boolean" } } },
  risk: "read",
  minRole: "super_admin",
  run: async (a: { include_archived?: boolean }, ctx) => listPlansForActor(planActor(ctx), a.include_archived),
};

const planGet: ToolDef = {
  name: "plans_get",
  title: "Open a plan",
  description: "A plan's buckets, tasks (status, dates, assignees, checklist) and members.",
  domain: "ops",
  inputSchema: { type: "object", properties: { id: PLAN_ID }, required: ["id"] },
  risk: "read",
  minRole: "super_admin",
  run: async (a: { id: string }, ctx) => loadPlanWorkspace(a.id, planActor(ctx)),
};

const taskCreate: ToolDef = {
  name: "plans_create_task",
  title: "Add a task",
  description: "Adds a task to a plan.",
  domain: "ops",
  inputSchema: { type: "object", properties: { plan_id: PLAN_ID, ...TASK_FIELDS }, required: ["plan_id", "title"] },
  risk: "write",
  minRole: "super_admin",
  run: async (a: { plan_id: string } & Record<string, unknown>, ctx) => {
    const { plan_id, ...body } = a;
    return createTask(planActor(ctx), plan_id, body);
  },
};

const taskUpdate: ToolDef = {
  name: "plans_update_task",
  title: "Update a task",
  description: "Changes a task's fields (title, status, dates, progress, bucket…).",
  domain: "ops",
  inputSchema: { type: "object", properties: { plan_id: PLAN_ID, task_id: { type: "string" }, ...TASK_FIELDS }, required: ["plan_id", "task_id"] },
  risk: "write",
  minRole: "super_admin",
  run: async (a: { plan_id: string; task_id: string } & Record<string, unknown>, ctx) => {
    const { plan_id, task_id, ...body } = a;
    return updateTask(planActor(ctx), plan_id, task_id, body);
  },
};

const taskDelete: ToolDef = {
  name: "plans_delete_task",
  title: "Delete a task",
  description: "Removes a task from a plan.",
  domain: "ops",
  inputSchema: { type: "object", properties: { plan_id: PLAN_ID, task_id: { type: "string" } }, required: ["plan_id", "task_id"] },
  risk: "high",
  minRole: "super_admin",
  summarize: () => "Delete this plan task",
  run: async (a: { plan_id: string; task_id: string }, ctx) => deleteTask(planActor(ctx), a.plan_id, a.task_id),
};

export const OPS_TOOLS: ToolDef[] = [
  expList,
  expGet,
  expUpdate,
  expAddAttendee,
  expPause,
  expResume,
  expReschedule,
  expResend,
  expSendNow,
  expLaunch,
  expArchive,
  wsList,
  wsSearch,
  wsGet,
  wsCreate,
  wsUpdate,
  wsComment,
  wsDelete,
  planList,
  planGet,
  taskCreate,
  taskUpdate,
  taskDelete,
];

// ── Notifications & reports ─────────────────────────────────────────────────

const notificationsList: ToolDef = {
  name: "notifications_list",
  title: "Dashboard notifications",
  description: "Recent dashboard notifications (form submissions, check-ins, sign-ups…), unread first.",
  domain: "ops",
  inputSchema: { type: "object", properties: { unread_only: { type: "boolean" }, limit: { type: "integer", minimum: 1, maximum: 100 } } },
  risk: "read",
  minRole: "super_admin",
  run: async (a: { unread_only?: boolean; limit?: number }, ctx) => {
    let query = createSupabaseAdminClient()
      .from("notifications")
      .select("id, type, title, message, status, read_at, created_at, metadata")
      .eq("destination", "dashboard")
      // Shared notifications, plus your own personal ones — never someone else's.
      .or(`user_id.is.null,user_id.eq.${ctx.actorId}`)
      .order("read_at", { ascending: true, nullsFirst: true })
      .order("created_at", { ascending: false })
      .limit(a.limit ?? 30);
    if (a.unread_only) query = query.is("read_at", null);
    const { data, error } = await query;
    if (error) throw error;
    return data ?? [];
  },
};

const notificationsMarkRead: ToolDef = {
  name: "notifications_mark_read",
  title: "Mark notifications read",
  description: "Marks dashboard notifications as read (by id, or all).",
  domain: "ops",
  inputSchema: { type: "object", properties: { ids: { type: "array", items: { type: "string" } }, all: { type: "boolean" } } },
  risk: "write",
  minRole: "super_admin",
  run: async (a: { ids?: string[]; all?: boolean }, ctx) => {
    if (!a.all && !a.ids?.length) throw new Error("Give ids, or all: true.");
    let query = createSupabaseAdminClient()
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .is("read_at", null)
      .eq("destination", "dashboard")
      .or(`user_id.is.null,user_id.eq.${ctx.actorId}`);
    if (!a.all) query = query.in("id", a.ids ?? []);
    const { error } = await query;
    if (error) throw error;
    return { ok: true };
  },
};

const reportsSummary: ToolDef = {
  name: "reports_summary",
  title: "Business snapshot",
  description: "Key numbers at a glance: Check-In submissions (total, last 7 days, average score), Energy Audits, book waitlist, and pilot metrics.",
  domain: "ops",
  inputSchema: { type: "object", properties: {} },
  risk: "read",
  minRole: "super_admin",
  run: async () => {
    const [checkIns, energy, waitlist, pilot] = await Promise.all([
      getCheckInSubmissionStats().catch((e) => ({ error: String(e) })),
      getEnergyAuditStats().catch((e) => ({ error: String(e) })),
      getBookWaitlistStats().catch((e) => ({ error: String(e) })),
      getPilotMetricsSafe(),
    ]);
    return { checkIns, energyAudits: energy, bookWaitlist: waitlist, pilot };
  },
};

async function getPilotMetricsSafe() {
  try {
    const { getPilotDashboardData, getPilotMetrics } = await import("@/lib/dashboard/pilot-data");
    return getPilotMetrics(await getPilotDashboardData());
  } catch (e) {
    return { error: String(e) };
  }
}

OPS_TOOLS.push(notificationsList, notificationsMarkRead, reportsSummary);
