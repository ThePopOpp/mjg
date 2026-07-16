import { NextRequest, NextResponse } from "next/server";
import { requirePlanUser, requirePlanEdit } from "@/lib/plans/auth";
import { planError } from "@/lib/plans/api";
import { moveTask } from "@/lib/plans/repository";

// Board drag-and-drop and grid reordering both post here. Separate from PATCH
// because a move renumbers sibling tasks, not just this one.
export async function POST(request: NextRequest, { params }: { params: Promise<{ planId: string; taskId: string }> }) {
  try {
    const { planId, taskId } = await params;
    const body = await request.json();
    const actor = await requirePlanUser(request, body?.actionToken);
    await requirePlanEdit(planId, actor);

    const task = await moveTask(
      actor,
      planId,
      taskId,
      body?.groupId ? String(body.groupId) : null,
      Number(body?.index ?? 0),
    );

    return NextResponse.json({ task });
  } catch (error) {
    return planError(error, "Task move failed.");
  }
}
