import { NextRequest, NextResponse } from "next/server";
import { requirePlanUser, requirePlanEdit } from "@/lib/plans/auth";
import { planError } from "@/lib/plans/api";
import { createGroup } from "@/lib/plans/repository";

export async function POST(request: NextRequest, { params }: { params: Promise<{ planId: string }> }) {
  try {
    const { planId } = await params;
    const body = await request.json();
    const actor = await requirePlanUser(request, body?.actionToken);
    await requirePlanEdit(planId, actor);

    const group = await createGroup(actor, planId, String(body?.name ?? ""));
    return NextResponse.json({ group });
  } catch (error) {
    return planError(error, "Group create failed.");
  }
}
