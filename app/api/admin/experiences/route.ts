import { NextResponse } from "next/server";
import { requireExperienceManager } from "@/lib/user-management/auth";
import { createExperience, sendExperience } from "@/lib/experiences/repository";
import type { AttendeeInput, ExperienceFrequency, OffsetUnit, WizardStepInput } from "@/lib/experiences/types";

const UNITS = new Set<OffsetUnit>(["minute", "hour", "day", "week", "month"]);

function coerceSteps(raw: unknown): WizardStepInput[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((s: any) => ({
    emailTemplateId: s?.emailTemplateId || null,
    offsetValue: Math.max(0, Math.floor(Number(s?.offsetValue) || 0)),
    offsetUnit: UNITS.has(s?.offsetUnit) ? s.offsetUnit : "week",
    label: typeof s?.label === "string" ? s.label : null,
  }));
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const actor = await requireExperienceManager(request, body.actionToken);

    const experienceTypeId = body.experienceTypeId ? String(body.experienceTypeId) : null;
    const name = typeof body.name === "string" ? body.name : undefined;
    const startDate = String(body.startDate ?? "").trim();
    const startTime = /^\d{2}:\d{2}$/.test(body.startTime) ? body.startTime : "09:00";
    const frequency = (["weekly", "biweekly", "custom"].includes(body.frequency) ? body.frequency : "weekly") as ExperienceFrequency;
    const durationWeeks = Number(body.durationWeeks);
    const attendees: AttendeeInput[] = Array.isArray(body.attendees) ? body.attendees : [];
    const steps = coerceSteps(body.steps);

    if (!experienceTypeId && !name?.trim()) return NextResponse.json({ error: "Select a trigger or name the experience." }, { status: 400 });
    if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate)) return NextResponse.json({ error: "A valid start date is required." }, { status: 400 });
    if (!Number.isFinite(durationWeeks) || durationWeeks < 1) return NextResponse.json({ error: "Add at least one step." }, { status: 400 });
    const validAttendees = attendees.filter((a) => typeof a?.email === "string" && a.email.includes("@"));
    if (!validAttendees.length) return NextResponse.json({ error: "Add at least one attendee with an email." }, { status: 400 });
    if (!steps.length) return NextResponse.json({ error: "Configure at least one step." }, { status: 400 });

    const experience = await createExperience(
      {
        experienceTypeId,
        name,
        startDate,
        startTime,
        frequency,
        customIntervalValue: frequency === "custom" ? Math.max(1, Math.floor(Number(body.customIntervalValue) || 1)) : null,
        customIntervalUnit: frequency === "custom" && UNITS.has(body.customIntervalUnit) ? body.customIntervalUnit : null,
        durationWeeks: Math.floor(durationWeeks),
        facilitatorId: body.facilitatorId || null,
        previewId: body.previewId || null,
        attendees: validAttendees,
        steps,
      },
      actor.id,
    );

    // The wizard's final "Send to Recipients" step sets send:true.
    let scheduled = 0;
    if (body.send === true) {
      const result = await sendExperience(experience.id, actor.id);
      scheduled = result.scheduledEvents;
    }

    return NextResponse.json({ ok: true, experience, scheduledEvents: scheduled });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create experience.";
    const status = message.includes("permission") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
