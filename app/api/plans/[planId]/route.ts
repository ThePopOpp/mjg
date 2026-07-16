import { NextRequest, NextResponse } from "next/server";
import { requirePlanUser, requirePlanManage } from "@/lib/plans/auth";
import { planError } from "@/lib/plans/api";
import { archivePlan, deletePlan, updatePlan } from "@/lib/plans/repository";
import { logUserActivity } from "@/lib/user-management/repository";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ planId: string }> }) {
  try {
    const { planId } = await params;
    const body = await request.json();
    const actor = await requirePlanUser(request, body?.actionToken);
    await requirePlanManage(planId, actor);

    if (typeof body?.archived === "boolean") {
      const plan = await archivePlan(actor, planId, body.archived);
      return NextResponse.json({ plan });
    }

    const { actionToken, id, created_at, owner_id, ...patch } = body ?? {};
    void actionToken; void id; void created_at; void owner_id;
    const plan = await updatePlan(actor, planId, patch);
    return NextResponse.json({ plan });
  } catch (error) {
    return planError(error, "Plan update failed.");
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ planId: string }> }) {
  try {
    const { planId } = await params;
    const body = await request.json().catch(() => ({}));
    const actor = await requirePlanUser(request, body?.actionToken);
    await requirePlanManage(planId, actor);

    await deletePlan(actor, planId);
    await logUserActivity({
      actorUserId: actor.id,
      action: "plan_deleted",
      entityType: "plan",
      entityId: planId,
    }).catch(() => {});

    return NextResponse.json({ ok: true });
  } catch (error) {
    return planError(error, "Plan delete failed.");
  }
}
