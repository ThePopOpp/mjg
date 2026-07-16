import { NextRequest, NextResponse } from "next/server";
import { requirePlanUser, PlanAccessError } from "@/lib/plans/auth";
import { planError } from "@/lib/plans/api";
import { listPlansForActor, listTemplatesForActor } from "@/lib/plans/data";
import { createPlan } from "@/lib/plans/repository";
import { logUserActivity } from "@/lib/user-management/repository";
import { FLAGS, isFeatureEnabled } from "@/lib/flags";

export async function GET(request: NextRequest) {
  try {
    const actor = await requirePlanUser(request);
    const includeArchived = request.nextUrl.searchParams.get("archived") === "true";
    const plans = await listPlansForActor(actor, includeArchived);
    return NextResponse.json({ plans });
  } catch (error) {
    return planError(error, "Plans load failed.");
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const actor = await requirePlanUser(request, body?.actionToken);

    const planType = body?.planType === "premium" ? "premium" : "basic";

    // The template's own plan_type also forces premium — otherwise picking the
    // Construction template would be a free route around the flag.
    const templateId = body?.templateId ? String(body.templateId) : null;
    const template = templateId ? (await listTemplatesForActor(actor)).find((t) => t.id === templateId) ?? null : null;
    if (templateId && !template) throw new PlanAccessError("Template not found.", 404);

    const effectiveType = template?.plan_type === "premium" ? "premium" : planType;

    if (effectiveType === "premium") {
      const allowed = await isFeatureEnabled(FLAGS.PLAN_BUILDER_PREMIUM, actor);
      if (!allowed) throw new PlanAccessError("Premium plans are not enabled for your account.", 403);
    }

    const planId = await createPlan(actor, {
      name: String(body?.name ?? ""),
      description: body?.description ?? null,
      planType: effectiveType,
      visibility: body?.visibility === "private" ? "private" : "team",
      defaultView: body?.defaultView === "grid" ? "grid" : "board",
      color: String(body?.color ?? "gold"),
      icon: String(body?.icon ?? "clipboard-list"),
      startDate: body?.startDate ?? null,
      targetDate: body?.targetDate ?? null,
      memberIds: Array.isArray(body?.memberIds) ? body.memberIds.map(String) : [],
      template,
    });

    // plan_activity already has the detailed row (written inside the creation
    // transaction); this is the coarse entry on the app-wide audit log.
    await logUserActivity({
      actorUserId: actor.id,
      action: "plan_created",
      entityType: "plan",
      entityId: planId,
      metadata: { plan_type: effectiveType, template_slug: template?.slug ?? null },
    }).catch(() => {});

    return NextResponse.json({ planId });
  } catch (error) {
    return planError(error, "Plan create failed.");
  }
}
