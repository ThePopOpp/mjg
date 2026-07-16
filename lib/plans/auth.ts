import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireActiveProfile } from "@/lib/user-management/auth";
import { ROLES, canAccessDashboard, normalizeAppRole, type AppRole } from "@/lib/rbac/roles";
import type { PlanAccess, PlanMemberRole, PlanVisibility } from "./types";

// Authorization for Plan Builder.
//
// Dashboard reads go through the service-role client, which BYPASSES RLS — so these
// checks are the primary enforcement, and the RLS policies in migration 202607160040
// are defense-in-depth. computeAccess() below is a deliberate line-for-line mirror of
// can_view_plan()/can_edit_plan()/can_manage_plan(). Change one, change the other.

export type PlanActor = { id: string; role: AppRole; email?: string | null };

export class PlanAccessError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "PlanAccessError";
    this.status = status;
  }
}

// Plan Builder is for dashboard users. requireActiveProfile also admits participants
// (it exists for Direct Messages), so the dashboard check has to be explicit here.
export async function requirePlanUser(request?: Request, actionToken?: string | null): Promise<PlanActor> {
  const profile = await requireActiveProfile(request, actionToken);
  if (!canAccessDashboard(profile.role)) {
    throw new PlanAccessError("Dashboard permission required.", 403);
  }
  return { id: profile.id, role: profile.role, email: profile.email };
}

type PlanRow = { id: string; owner_id: string; visibility: PlanVisibility; archived_at: string | null };

export function computeAccess(plan: PlanRow, memberRole: PlanMemberRole | null, actor: PlanActor): PlanAccess {
  const isSuperAdmin = normalizeAppRole(actor.role) === ROLES.SUPER_ADMIN;
  const isOwner = plan.owner_id === actor.id;
  const hasDashboard = canAccessDashboard(actor.role);
  const isTeamPlan = plan.visibility === "team" && hasDashboard;

  const canView = isSuperAdmin || isOwner || memberRole !== null || isTeamPlan;
  const canManage = isSuperAdmin || isOwner || memberRole === "owner";

  // An explicit viewer membership is read-only even on a team-visible plan, and it
  // outranks the super-admin shortcut for the same reason it does in SQL: an
  // intentional demotion should hold. Archived plans are frozen for everyone but
  // super admins.
  const canEdit =
    memberRole === "viewer"
      ? false
      : isSuperAdmin
        ? true
        : !plan.archived_at && (isOwner || memberRole !== null || isTeamPlan);

  return { canView, canEdit, canManage };
}

export async function loadPlanAccess(planId: string, actor: PlanActor): Promise<PlanAccess | null> {
  const supabase = createSupabaseAdminClient();

  const { data: plan } = await supabase
    .from("plans")
    .select("id,owner_id,visibility,archived_at")
    .eq("id", planId)
    .maybeSingle();

  if (!plan) return null;

  const { data: member } = await supabase
    .from("plan_members")
    .select("role")
    .eq("plan_id", planId)
    .eq("user_id", actor.id)
    .maybeSingle();

  return computeAccess(plan as PlanRow, (member?.role as PlanMemberRole | undefined) ?? null, actor);
}

async function requireAccess(planId: string, actor: PlanActor, level: keyof PlanAccess, denial: string) {
  const access = await loadPlanAccess(planId, actor);
  if (!access) throw new PlanAccessError("Plan not found.", 404);
  // Hide existence of plans the actor cannot see, rather than leaking a 403.
  if (!access.canView) throw new PlanAccessError("Plan not found.", 404);
  if (!access[level]) throw new PlanAccessError(denial, 403);
  return access;
}

export function requirePlanView(planId: string, actor: PlanActor) {
  return requireAccess(planId, actor, "canView", "You do not have access to this plan.");
}

export function requirePlanEdit(planId: string, actor: PlanActor) {
  return requireAccess(planId, actor, "canEdit", "You have read-only access to this plan.");
}

export function requirePlanManage(planId: string, actor: PlanActor) {
  return requireAccess(planId, actor, "canManage", "Only the plan owner can do that.");
}
