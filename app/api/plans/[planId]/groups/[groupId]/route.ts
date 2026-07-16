import { NextRequest, NextResponse } from "next/server";
import { requirePlanUser, requirePlanEdit } from "@/lib/plans/auth";
import { planError } from "@/lib/plans/api";
import { deleteGroup, updateGroup } from "@/lib/plans/repository";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ planId: string; groupId: string }> }) {
  try {
    const { planId, groupId } = await params;
    const body = await request.json();
    const actor = await requirePlanUser(request, body?.actionToken);
    await requirePlanEdit(planId, actor);

    const group = await updateGroup(actor, planId, groupId, body ?? {});
    return NextResponse.json({ group });
  } catch (error) {
    return planError(error, "Group update failed.");
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ planId: string; groupId: string }> }) {
  try {
    const { planId, groupId } = await params;
    const body = await request.json().catch(() => ({}));
    const actor = await requirePlanUser(request, body?.actionToken);
    await requirePlanEdit(planId, actor);

    await deleteGroup(actor, planId, groupId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return planError(error, "Group delete failed.");
  }
}
