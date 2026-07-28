import { NextResponse } from "next/server";
import { requireExperienceManager } from "@/lib/user-management/auth";
import { testExperience } from "@/lib/experiences/repository";
import type { OffsetUnit, WizardStepInput } from "@/lib/experiences/types";

const UNITS = new Set<OffsetUnit>(["minute", "hour", "day", "week", "month"]);

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const actor = await requireExperienceManager(request, body.actionToken);

    const testEmail = String(body.testEmail ?? "").trim();
    if (!testEmail.includes("@")) return NextResponse.json({ error: "A valid test email is required." }, { status: 400 });

    const steps: WizardStepInput[] = (Array.isArray(body.steps) ? body.steps : []).map((s: any) => ({
      emailTemplateId: s?.emailTemplateId || null,
      offsetValue: Math.max(0, Math.floor(Number(s?.offsetValue) || 0)),
      offsetUnit: UNITS.has(s?.offsetUnit) ? s.offsetUnit : "week",
    }));

    const result = await testExperience({ steps, testEmail, name: typeof body.name === "string" ? body.name : undefined }, actor.id);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to send test.";
    const status = message.includes("permission") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
