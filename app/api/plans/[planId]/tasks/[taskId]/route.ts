import { NextRequest, NextResponse } from "next/server";
import { requirePlanUser, requirePlanEdit } from "@/lib/plans/auth";
import { planError } from "@/lib/plans/api";
import { deleteTask, setChecklist, updateTask } from "@/lib/plans/repository";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ planId: string; taskId: string }> }) {
  try {
    const { planId, taskId } = await params;
    const body = await request.json();
    const actor = await requirePlanUser(request, body?.actionToken);
    await requirePlanEdit(planId, actor);

    const task = await updateTask(actor, planId, taskId, body ?? {});
    if (Array.isArray(body?.checklist)) await setChecklist(planId, taskId, body.checklist);

    return NextResponse.json({ task });
  } catch (error) {
    return planError(error, "Task update failed.");
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ planId: string; taskId: string }> }) {
  try {
    const { planId, taskId } = await params;
    const body = await request.json().catch(() => ({}));
    const actor = await requirePlanUser(request, body?.actionToken);
    await requirePlanEdit(planId, actor);

    await deleteTask(actor, planId, taskId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return planError(error, "Task delete failed.");
  }
}
