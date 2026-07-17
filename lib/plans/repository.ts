import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { PlanAccessError, type PlanActor } from "./auth";
import { DEFAULT_SCRATCH_GROUPS } from "./constants";
import type { PlanTask, PlanTemplate, TaskPriority, TaskStatus, TemplateData } from "./types";

// Writes for Plan Builder. Every function here assumes the caller has ALREADY
// authorized the actor via lib/plans/auth.ts — these do not re-check.

const TASK_STATUSES = new Set<TaskStatus>(["not_started", "in_progress", "waiting", "blocked", "complete"]);
const TASK_PRIORITIES = new Set<TaskPriority>(["low", "medium", "high", "urgent"]);
const PLAN_VIEWS = new Set(["grid", "board", "list", "calendar"]);
const PLAN_VISIBILITIES = new Set(["private", "team"]);
const PLAN_COLOR_VALUES = new Set(["gold", "sand", "clay", "plum", "slate", "ink"]);

const now = () => new Date().toISOString();

// Plan activity is an audit trail, and a failed audit write must never break the
// user's action — so this swallows, the way createDashboardNotification does. It
// logs loudly enough to notice in server output.
export async function logPlanActivity(input: {
  planId: string;
  taskId?: string | null;
  actorId?: string | null;
  action: string;
  entityType?: string;
  entityId?: string | null;
  previousValue?: unknown;
  newValue?: unknown;
  source?: "user" | "admin" | "automation" | "api" | "import" | "ai";
  metadata?: Record<string, unknown>;
}) {
  try {
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.from("plan_activity").insert({
      plan_id: input.planId,
      task_id: input.taskId ?? null,
      actor_id: input.actorId ?? null,
      action: input.action,
      entity_type: input.entityType ?? null,
      entity_id: input.entityId ?? null,
      previous_value: input.previousValue ?? null,
      new_value: input.newValue ?? null,
      source: input.source ?? "user",
      metadata: input.metadata ?? {},
    });
    if (error) console.error("Plan activity insert failed", error);
  } catch (error) {
    console.error("Plan activity insert failed", error);
  }
}

function slugify(name: string) {
  const base = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48);
  const suffix = Math.random().toString(36).slice(2, 7);
  return `${base || "plan"}-${suffix}`;
}

function optionalDate(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) return null;
  // <input type="date"> gives YYYY-MM-DD; reject anything else rather than letting
  // Postgres throw a less obvious error.
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value.trim())) return null;
  return value.trim();
}

export type CreatePlanInput = {
  name: string;
  description?: string | null;
  planType: "basic" | "premium";
  visibility: "private" | "team";
  defaultView: "grid" | "board";
  color: string;
  icon: string;
  startDate?: string | null;
  targetDate?: string | null;
  memberIds?: string[];
  template?: PlanTemplate | null;
};

export async function createPlan(actor: PlanActor, input: CreatePlanInput): Promise<string> {
  const name = (input.name ?? "").trim();
  if (!name) throw new PlanAccessError("Plan name is required.", 400);
  if (name.length > 120) throw new PlanAccessError("Plan name must be 120 characters or fewer.", 400);

  // No template → seed the default columns. A plan with no groups renders an empty
  // board with nowhere to add a task, and it would contradict the create-plan
  // preview, which shows these four.
  const templateData: TemplateData = input.template?.template_data ?? {
    groups: DEFAULT_SCRATCH_GROUPS.map((g) => ({ key: g.key, name: g.name })),
  };
  const supabase = createSupabaseAdminClient();

  // One transaction: plan + owner + members + groups + labels + tasks + checklists
  // + the activity row. See create_plan_from_template in migration 202607160040.
  const { data, error } = await supabase.rpc("create_plan_from_template", {
    p_actor_id: actor.id,
    p_plan: {
      name,
      slug: slugify(name),
      description: (input.description ?? "").trim() || null,
      plan_type: input.planType === "premium" ? "premium" : "basic",
      visibility: PLAN_VISIBILITIES.has(input.visibility) ? input.visibility : "team",
      default_view: PLAN_VIEWS.has(input.defaultView) ? input.defaultView : "board",
      color: PLAN_COLOR_VALUES.has(input.color) ? input.color : "gold",
      icon: (input.icon ?? "clipboard-list").trim() || "clipboard-list",
      start_date: optionalDate(input.startDate),
      target_date: optionalDate(input.targetDate),
      template_id: input.template?.id ?? null,
      template_slug: input.template?.slug ?? null,
      settings: {},
    },
    p_template_data: templateData,
    p_member_ids: [...new Set(input.memberIds ?? [])],
  });

  if (error) throw error;
  return data as string;
}

export async function updatePlan(actor: PlanActor, planId: string, patch: Record<string, unknown>) {
  const supabase = createSupabaseAdminClient();
  const { data: before } = await supabase.from("plans").select("*").eq("id", planId).maybeSingle();

  const update: Record<string, unknown> = { updated_at: now() };
  if (typeof patch.name === "string" && patch.name.trim()) update.name = patch.name.trim().slice(0, 120);
  if ("description" in patch) update.description = String(patch.description ?? "").trim() || null;
  if (typeof patch.visibility === "string" && PLAN_VISIBILITIES.has(patch.visibility)) update.visibility = patch.visibility;
  if (typeof patch.default_view === "string" && PLAN_VIEWS.has(patch.default_view)) update.default_view = patch.default_view;
  if (typeof patch.color === "string" && PLAN_COLOR_VALUES.has(patch.color)) update.color = patch.color;
  if (typeof patch.icon === "string" && patch.icon.trim()) update.icon = patch.icon.trim();
  if ("start_date" in patch) update.start_date = optionalDate(patch.start_date);
  if ("target_date" in patch) update.target_date = optionalDate(patch.target_date);

  const { data, error } = await supabase.from("plans").update(update).eq("id", planId).select().single();
  if (error) throw error;

  await logPlanActivity({
    planId,
    actorId: actor.id,
    action: "plan_updated",
    entityType: "plan",
    entityId: planId,
    previousValue: before ? Object.fromEntries(Object.keys(update).map((k) => [k, (before as Record<string, unknown>)[k]])) : null,
    newValue: update,
  });

  return data;
}

export async function archivePlan(actor: PlanActor, planId: string, archived: boolean) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("plans")
    .update({ archived_at: archived ? now() : null, status: archived ? "archived" : "active", updated_at: now() })
    .eq("id", planId)
    .select()
    .single();
  if (error) throw error;

  await logPlanActivity({
    planId,
    actorId: actor.id,
    action: archived ? "plan_archived" : "plan_restored",
    entityType: "plan",
    entityId: planId,
  });
  return data;
}

export async function deletePlan(actor: PlanActor, planId: string) {
  const supabase = createSupabaseAdminClient();
  // plan_activity cascades with the plan, so the trail is recorded on the global
  // user_activity_logs by the API route instead.
  const { error } = await supabase.from("plans").delete().eq("id", planId);
  if (error) throw error;
}

function normalizeTaskPatch(body: Record<string, unknown>) {
  const patch: Record<string, unknown> = {};
  if (typeof body.title === "string" && body.title.trim()) patch.title = body.title.trim().slice(0, 300);
  if ("description" in body) patch.description = String(body.description ?? "").trim() || null;
  if ("notes" in body) patch.notes = String(body.notes ?? "").trim() || null;
  if (typeof body.status === "string" && TASK_STATUSES.has(body.status as TaskStatus)) patch.status = body.status;
  if (typeof body.priority === "string" && TASK_PRIORITIES.has(body.priority as TaskPriority)) patch.priority = body.priority;
  if (body.progress !== undefined) patch.progress = Math.max(0, Math.min(100, Number(body.progress) || 0));
  if ("start_date" in body) patch.start_date = optionalDate(body.start_date);
  if ("due_date" in body) patch.due_date = optionalDate(body.due_date);
  if ("group_id" in body) patch.group_id = body.group_id ? String(body.group_id) : null;
  if ("is_milestone" in body) patch.is_milestone = Boolean(body.is_milestone);
  if ("estimated_minutes" in body) {
    const n = Number(body.estimated_minutes);
    patch.estimated_minutes = Number.isFinite(n) && n > 0 ? Math.round(n) : null;
  }
  return patch;
}

export async function createTask(actor: PlanActor, planId: string, body: Record<string, unknown>) {
  const title = String(body.title ?? "").trim();
  if (!title) throw new PlanAccessError("Task title is required.", 400);

  const supabase = createSupabaseAdminClient();
  const groupId = body.group_id ? String(body.group_id) : null;

  // Append to the end of its column.
  const { data: last } = await supabase
    .from("plan_tasks")
    .select("position")
    .eq("plan_id", planId)
    .is("archived_at", null)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  const payload = {
    ...normalizeTaskPatch(body),
    plan_id: planId,
    title,
    group_id: groupId,
    position: (last?.position ?? -1) + 1,
    created_by: actor.id,
  };

  const { data, error } = await supabase.from("plan_tasks").insert(payload).select().single();
  if (error) throw error;

  const task = data as PlanTask;
  await applyAssignees(actor, task.id, body.assignee_ids, true);
  await applyLabels(task.id, body.label_ids);

  await logPlanActivity({
    planId,
    taskId: task.id,
    actorId: actor.id,
    action: "task_created",
    entityType: "task",
    entityId: task.id,
    newValue: { title: task.title, status: task.status, group_id: task.group_id },
  });

  return task;
}

export async function updateTask(actor: PlanActor, planId: string, taskId: string, body: Record<string, unknown>) {
  const supabase = createSupabaseAdminClient();
  const { data: before } = await supabase.from("plan_tasks").select("*").eq("id", taskId).eq("plan_id", planId).maybeSingle();
  if (!before) throw new PlanAccessError("Task not found.", 404);

  const patch = normalizeTaskPatch(body);

  // Completion is derived from status so the two can never disagree, whichever
  // surface (board drag, grid select, drawer) made the change.
  if (patch.status && patch.status !== (before as PlanTask).status) {
    if (patch.status === "complete") {
      patch.completed_at = now();
      patch.completed_by = actor.id;
      if (body.progress === undefined) patch.progress = 100;
    } else {
      patch.completed_at = null;
      patch.completed_by = null;
      if (body.progress === undefined && (before as PlanTask).status === "complete") patch.progress = 0;
    }
  }

  patch.updated_at = now();
  const { data, error } = await supabase.from("plan_tasks").update(patch).eq("id", taskId).eq("plan_id", planId).select().single();
  if (error) throw error;

  if ("assignee_ids" in body) await applyAssignees(actor, taskId, body.assignee_ids, false);
  if ("label_ids" in body) await applyLabels(taskId, body.label_ids);

  const changed = Object.keys(patch).filter((k) => k !== "updated_at");
  await logPlanActivity({
    planId,
    taskId,
    actorId: actor.id,
    action: "task_updated",
    entityType: "task",
    entityId: taskId,
    previousValue: Object.fromEntries(changed.map((k) => [k, (before as Record<string, unknown>)[k]])),
    newValue: Object.fromEntries(changed.map((k) => [k, patch[k]])),
  });

  return data as PlanTask;
}

// Move a task to a group and index, then renumber the affected columns so positions
// stay dense. Board drag-and-drop and grid reordering both land here.
export async function moveTask(actor: PlanActor, planId: string, taskId: string, targetGroupId: string | null, targetIndex: number) {
  const supabase = createSupabaseAdminClient();
  const { data: before } = await supabase.from("plan_tasks").select("*").eq("id", taskId).eq("plan_id", planId).maybeSingle();
  if (!before) throw new PlanAccessError("Task not found.", 404);
  const task = before as PlanTask;

  const { data: allRows } = await supabase
    .from("plan_tasks")
    .select("id,group_id,position")
    .eq("plan_id", planId)
    .is("archived_at", null)
    .order("position", { ascending: true });

  const all = (allRows ?? []) as Array<{ id: string; group_id: string | null; position: number }>;
  const sourceGroupId = task.group_id;

  const target = all.filter((t) => t.group_id === targetGroupId && t.id !== taskId).map((t) => t.id);
  const index = Math.max(0, Math.min(Number.isFinite(targetIndex) ? targetIndex : target.length, target.length));
  target.splice(index, 0, taskId);

  // PostgrestFilterBuilder is thenable but not a Promise, hence PromiseLike.
  const updates: Array<PromiseLike<unknown>> = target.map((id, i) =>
    supabase.from("plan_tasks").update({ group_id: targetGroupId, position: i, updated_at: now() }).eq("id", id).eq("plan_id", planId),
  );

  if (sourceGroupId !== targetGroupId) {
    const source = all.filter((t) => t.group_id === sourceGroupId && t.id !== taskId).map((t) => t.id);
    updates.push(
      ...source.map((id, i) => supabase.from("plan_tasks").update({ position: i, updated_at: now() }).eq("id", id).eq("plan_id", planId)),
    );
  }

  await Promise.all(updates);

  await logPlanActivity({
    planId,
    taskId,
    actorId: actor.id,
    action: "task_moved",
    entityType: "task",
    entityId: taskId,
    previousValue: { group_id: sourceGroupId, position: task.position },
    newValue: { group_id: targetGroupId, position: index },
  });

  const { data } = await supabase.from("plan_tasks").select("*").eq("id", taskId).maybeSingle();
  return data as PlanTask;
}

export async function deleteTask(actor: PlanActor, planId: string, taskId: string) {
  const supabase = createSupabaseAdminClient();
  const { data: before } = await supabase.from("plan_tasks").select("title").eq("id", taskId).eq("plan_id", planId).maybeSingle();
  if (!before) throw new PlanAccessError("Task not found.", 404);

  const { error } = await supabase.from("plan_tasks").delete().eq("id", taskId).eq("plan_id", planId);
  if (error) throw error;

  // taskId is intentionally NOT set: plan_activity.task_id cascades on delete, so
  // writing it here would erase the record we just made.
  await logPlanActivity({
    planId,
    actorId: actor.id,
    action: "task_deleted",
    entityType: "task",
    entityId: taskId,
    previousValue: { title: (before as { title: string }).title },
  });
}

async function applyAssignees(actor: PlanActor, taskId: string, ids: unknown, isNew: boolean) {
  if (!Array.isArray(ids)) return;
  const supabase = createSupabaseAdminClient();
  const next = [...new Set(ids.map(String).filter(Boolean))];
  if (!isNew) await supabase.from("plan_task_assignees").delete().eq("task_id", taskId);
  if (!next.length) return;
  await supabase
    .from("plan_task_assignees")
    .upsert(next.map((user_id) => ({ task_id: taskId, user_id, assigned_by: actor.id })), { onConflict: "task_id,user_id" });
}

async function applyLabels(taskId: string, ids: unknown) {
  if (!Array.isArray(ids)) return;
  const supabase = createSupabaseAdminClient();
  const next = [...new Set(ids.map(String).filter(Boolean))];
  await supabase.from("plan_task_labels").delete().eq("task_id", taskId);
  if (!next.length) return;
  await supabase.from("plan_task_labels").upsert(next.map((label_id) => ({ task_id: taskId, label_id })), { onConflict: "task_id,label_id" });
}

export async function setChecklist(planId: string, taskId: string, items: unknown) {
  if (!Array.isArray(items)) return;
  const supabase = createSupabaseAdminClient();
  await supabase.from("plan_task_checklist_items").delete().eq("task_id", taskId);
  const rows = items.flatMap((item, i) => {
    const record = item as { title?: unknown; is_complete?: unknown };
    const title = String(record?.title ?? "").trim();
    return title ? [{ task_id: taskId, title: title.slice(0, 300), is_complete: Boolean(record?.is_complete), position: i }] : [];
  });
  if (rows.length) await supabase.from("plan_task_checklist_items").insert(rows);
}

export async function createGroup(actor: PlanActor, planId: string, name: string) {
  const trimmed = name.trim();
  if (!trimmed) throw new PlanAccessError("Group name is required.", 400);

  const supabase = createSupabaseAdminClient();
  const { data: last } = await supabase
    .from("plan_groups")
    .select("position")
    .eq("plan_id", planId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data, error } = await supabase
    .from("plan_groups")
    .insert({ plan_id: planId, name: trimmed.slice(0, 80), position: (last?.position ?? -1) + 1 })
    .select()
    .single();
  if (error) throw error;

  await logPlanActivity({ planId, actorId: actor.id, action: "group_created", entityType: "group", entityId: data.id, newValue: { name: trimmed } });
  return data;
}

export async function updateGroup(actor: PlanActor, planId: string, groupId: string, patch: Record<string, unknown>) {
  const supabase = createSupabaseAdminClient();
  const update: Record<string, unknown> = { updated_at: now() };
  if (typeof patch.name === "string" && patch.name.trim()) update.name = patch.name.trim().slice(0, 80);
  if ("is_collapsed" in patch) update.is_collapsed = Boolean(patch.is_collapsed);

  const { data, error } = await supabase.from("plan_groups").update(update).eq("id", groupId).eq("plan_id", planId).select().single();
  if (error) throw error;

  await logPlanActivity({ planId, actorId: actor.id, action: "group_updated", entityType: "group", entityId: groupId, newValue: update });
  return data;
}

export async function deleteGroup(actor: PlanActor, planId: string, groupId: string) {
  const supabase = createSupabaseAdminClient();
  // plan_tasks.group_id is ON DELETE SET NULL, so the tasks survive as ungrouped
  // rather than disappearing with their column.
  const { error } = await supabase.from("plan_groups").delete().eq("id", groupId).eq("plan_id", planId);
  if (error) throw error;
  await logPlanActivity({ planId, actorId: actor.id, action: "group_deleted", entityType: "group", entityId: groupId });
}
