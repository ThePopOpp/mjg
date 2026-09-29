import { NextResponse } from "next/server";
import { requireFacilitator } from "@/lib/user-management/auth";
import {
  assertCanManageExperience, pauseSteps, rescheduleSteps, resendSteps, resumeSteps,
} from "@/lib/experiences/bulk";

/**
 * Bulk actions on a group's email sequence, driven by the selection bar on the
 * Email Automation views.
 *
 * Authorisation is two-stage on purpose: requireFacilitator lets admins AND
 * facilitators in the door, then assertCanManageExperience scopes a facilitator
 * to groups they actually run. Admins pass straight through. Neither check can
 * be skipped by a caller because the second lives in the library, not here.
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const actor = await requireFacilitator(request, body.actionToken);
    await assertCanManageExperience(id, { id: actor.id, role: actor.role });

    const ctx = { actorId: actor.id, experienceId: id };
    const steps = body.steps;

    switch (String(body.action)) {
      case "pause":
        return NextResponse.json(await pauseSteps(ctx, steps));
      case "resume":
        return NextResponse.json(await resumeSteps(ctx, steps));
      case "reschedule":
        return NextResponse.json(
          await rescheduleSteps(ctx, steps, {
            mode: body.mode ?? "anchor",
            at: body.at,
            days: body.days,
            updateDefinition: body.updateDefinition,
          }),
        );
      case "resend":
        return NextResponse.json(await resendSteps(ctx, steps, { at: body.at }));
      default:
        return NextResponse.json({ error: "Unknown action." }, { status: 400 });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "That action could not be completed.";
    const status = /permission|only change/i.test(message) ? 403 : /not found/i.test(message) ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
