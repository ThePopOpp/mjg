import { NextRequest, NextResponse } from "next/server";
import { requirePlanUser, requirePlanEdit } from "@/lib/plans/auth";
import { planError } from "@/lib/plans/api";
import { createTask, setChecklist } from "@/lib/plans/repository";

export async function POST(request: NextRequest, { params }: { params: Promise<{ planId: string }> }) {
  try {
    const { planId } = await params;
    const body = await request.json();
    const actor = await requirePlanUser(request, body?.actionToken);
    await requirePlanEdit(planId, actor);

    const task = await createTask(actor, planId, body ?? {});
    if (Array.isArray(body?.checklist)) await setChecklist(planId, task.id, body.checklist);

    return NextResponse.json({ task });
  } catch (error) {
    return planError(error, "Task create failed.");
  }
}
