import { NextResponse } from "next/server";
import { requireExperienceManager } from "@/lib/user-management/auth";
import { saveExperienceType, saveExperienceTypeSteps } from "@/lib/experiences/repository";
import type { ExperienceFrequency } from "@/lib/experiences/types";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const actor = await requireExperienceManager(request, body.actionToken);

    const name = String(body.name ?? "").trim();
    if (!name) return NextResponse.json({ error: "Type name is required." }, { status: 400 });
    const defaultFrequency = (body.defaultFrequency === "biweekly" ? "biweekly" : "weekly") as ExperienceFrequency;
    const defaultDurationWeeks = Math.max(1, Math.floor(Number(body.defaultDurationWeeks) || 6));

    const type = await saveExperienceType({
      id: body.id || undefined,
      name,
      description: body.description ?? null,
      defaultFrequency,
      defaultDurationWeeks,
      actorUserId: actor.id,
    });

    // Optional: replace the per-week email sequence in the same call.
    if (Array.isArray(body.steps)) {
      await saveExperienceTypeSteps(
        type.id,
        body.steps.map((s: any) => ({
          stepNumber: Number(s.stepNumber),
          label: s.label ?? null,
          emailTemplateId: s.emailTemplateId ?? null,
          subjectOverride: s.subjectOverride ?? null,
        })),
      );
    }

    return NextResponse.json({ ok: true, type });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save experience type.";
    const status = message.includes("permission") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
