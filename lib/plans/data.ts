import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { ROLES, DASHBOARD_ROLES, normalizeAppRole } from "@/lib/rbac/roles";
import { computeAccess, type PlanActor } from "./auth";
import type {
  ChecklistItem,
  Plan,
  PlanGroup,
  PlanLabel,
  PlanMember,
  PlanMemberRole,
  PlanPerson,
  PlanSummary,
  PlanTask,
  PlanTaskDetail,
  PlanTemplate,
  PlanWorkspaceData,
} from "./types";

// Reads for Plan Builder. Server-only: every function uses the service-role client
// (the house pattern) and therefore re-applies visibility itself — see lib/plans/auth.ts.

function personFrom(row: { id: string; first_name: string | null; last_name: string | null; email: string | null }): PlanPerson {
  const name = [row.first_name, row.last_name].filter(Boolean).join(" ").trim();
  return { id: row.id, name: name || row.email || "Unknown", email: row.email ?? "" };
}

export async function listPeople(): Promise<PlanPerson[]> {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("profiles")
    .select("id,first_name,last_name,email,role,status")
    .eq("status", "active")
    .in("role", [...DASHBOARD_ROLES])
    .order("first_name", { ascending: true });
  return (data ?? []).map(personFrom);
}

// Plans the actor may see: their own, ones they are a member of, and team-visible
// ones. Mirrors can_view_plan(). Super admins see everything.
export async function listPlansForActor(actor: PlanActor, includeArchived = false): Promise<PlanSummary[]> {
  const supabase = createSupabaseAdminClient();
  const isSuperAdmin = normalizeAppRole(actor.role) === ROLES.SUPER_ADMIN;

  const { data: memberships } = await supabase.from("plan_members").select("plan_id,role").eq("user_id", actor.id);
  const memberPlanIds = (memberships ?? []).map((m) => m.plan_id as string);
  const myRoleByPlan = new Map((memberships ?? []).map((m) => [m.plan_id as string, m.role as PlanMemberRole]));

  let query = supabase.from("plans").select("*").order("updated_at", { ascending: false });
  if (!includeArchived) query = query.is("archived_at", null);

  if (!isSuperAdmin) {
    const clauses = ["visibility.eq.team", `owner_id.eq.${actor.id}`];
    if (memberPlanIds.length) clauses.push(`id.in.(${memberPlanIds.join(",")})`);
    query = query.or(clauses.join(","));
  }

  const { data, error } = await query;
  if (error) throw error;

  const plans = (data ?? []) as Plan[];
  if (!plans.length) return [];

  const planIds = plans.map((p) => p.id);
  const [tasksRes, membersRes, ownersRes] = await Promise.all([
    supabase.from("plan_tasks").select("plan_id,status").in("plan_id", planIds).is("archived_at", null),
    supabase.from("plan_members").select("plan_id").in("plan_id", planIds),
    supabase.from("profiles").select("id,first_name,last_name,email").in("id", [...new Set(plans.map((p) => p.owner_id))]),
  ]);

  const tasks = (tasksRes.data ?? []) as Array<{ plan_id: string; status: string }>;
  const members = (membersRes.data ?? []) as Array<{ plan_id: string }>;
  const owners = new Map((ownersRes.data ?? []).map((o) => [o.id as string, personFrom(o)]));

  return plans.map((plan) => {
    const planTasks = tasks.filter((t) => t.plan_id === plan.id);
    return {
      ...plan,
      task_count: planTasks.length,
      completed_count: planTasks.filter((t) => t.status === "complete").length,
      member_count: members.filter((m) => m.plan_id === plan.id).length,
      owner: owners.get(plan.owner_id) ?? null,
      can_manage: computeAccess(plan, myRoleByPlan.get(plan.id) ?? null, actor).canManage,
    };
  });
}

// Everything the plan workspace renders. Grid and Board are handed this one task
// array — they are two presentations of the same records, never two queries.
export async function loadPlanWorkspace(planId: string, actor: PlanActor): Promise<PlanWorkspaceData | null> {
  const supabase = createSupabaseAdminClient();

  const { data: planRow } = await supabase.from("plans").select("*").eq("id", planId).maybeSingle();
  if (!planRow) return null;
  const plan = planRow as Plan;

  const { data: memberRows } = await supabase.from("plan_members").select("*").eq("plan_id", planId);
  const members = (memberRows ?? []) as PlanMember[];

  const myRole = (members.find((m) => m.user_id === actor.id)?.role as PlanMemberRole | undefined) ?? null;
  const access = computeAccess(plan, myRole, actor);
  if (!access.canView) return null;

  const [groupsRes, labelsRes, tasksRes, peopleRes] = await Promise.all([
    supabase.from("plan_groups").select("*").eq("plan_id", planId).order("position", { ascending: true }),
    supabase.from("plan_labels").select("*").eq("plan_id", planId).order("position", { ascending: true }),
    supabase.from("plan_tasks").select("*").eq("plan_id", planId).is("archived_at", null).order("position", { ascending: true }),
    listPeople(),
  ]);

  const tasks = (tasksRes.data ?? []) as PlanTask[];
  const taskIds = tasks.map((t) => t.id);

  const [assigneesRes, taskLabelsRes, checklistRes] = taskIds.length
    ? await Promise.all([
        supabase.from("plan_task_assignees").select("task_id,user_id").in("task_id", taskIds),
        supabase.from("plan_task_labels").select("task_id,label_id").in("task_id", taskIds),
        supabase.from("plan_task_checklist_items").select("*").in("task_id", taskIds).order("position", { ascending: true }),
      ])
    : [{ data: [] }, { data: [] }, { data: [] }];

  const assignees = (assigneesRes.data ?? []) as Array<{ task_id: string; user_id: string }>;
  const taskLabels = (taskLabelsRes.data ?? []) as Array<{ task_id: string; label_id: string }>;
  const checklist = (checklistRes.data ?? []) as ChecklistItem[];

  const detailed: PlanTaskDetail[] = tasks.map((task) => ({
    ...task,
    assignee_ids: assignees.filter((a) => a.task_id === task.id).map((a) => a.user_id),
    label_ids: taskLabels.filter((l) => l.task_id === task.id).map((l) => l.label_id),
    checklist: checklist.filter((c) => c.task_id === task.id),
  }));

  const people = peopleRes;
  const peopleById = new Map(people.map((p) => [p.id, p]));

  return {
    plan,
    groups: (groupsRes.data ?? []) as PlanGroup[],
    labels: (labelsRes.data ?? []) as PlanLabel[],
    tasks: detailed,
    members: members.map((m) => ({ ...m, person: peopleById.get(m.user_id) ?? null })),
    people,
    access,
  };
}

// Templates for the create-plan modal, split into the three source tabs.
// App templates are the product's own; shared come from other users; mine are the
// actor's private ones. Mirrors the plan_templates_select RLS policy.
export async function listTemplatesForActor(actor: PlanActor): Promise<PlanTemplate[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("plan_templates")
    .select("*")
    .or(`visibility.in.(app,shared),created_by.eq.${actor.id}`)
    .order("category", { ascending: true })
    .order("name", { ascending: true });
  if (error) throw error;
  return (data ?? []) as PlanTemplate[];
}

export function templateSourceOf(template: PlanTemplate, actorId: string): "app" | "shared" | "mine" {
  if (template.created_by === actorId && !template.is_system_template) return "mine";
  if (template.visibility === "shared") return "shared";
  return "app";
}
