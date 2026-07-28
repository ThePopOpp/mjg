import { NextResponse } from "next/server";
import { requireExperienceManager } from "@/lib/user-management/auth";
import { createExperience, sendExperience } from "@/lib/experiences/repository";
import type { AttendeeInput, ExperienceFrequency } from "@/lib/experiences/types";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const actor = await requireExperienceManager(request, body.actionToken);

    const experienceTypeId = String(body.experienceTypeId ?? "").trim();
    const startDate = String(body.startDate ?? "").trim();
    const frequency = (body.frequency === "biweekly" ? "biweekly" : "weekly") as ExperienceFrequency;
    const durationWeeks = Number(body.durationWeeks);
    const attendees: AttendeeInput[] = Array.isArray(body.attendees) ? body.attendees : [];

    if (!experienceTypeId) return NextResponse.json({ error: "Select an experience type." }, { status: 400 });
    if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate)) return NextResponse.json({ error: "A valid start date is required." }, { status: 400 });
    if (!Number.isFinite(durationWeeks) || durationWeeks < 1) return NextResponse.json({ error: "Duration must be at least 1 week." }, { status: 400 });
    const validAttendees = attendees.filter((a) => typeof a?.email === "string" && a.email.includes("@"));
    if (!validAttendees.length) return NextResponse.json({ error: "Add at least one attendee with an email." }, { status: 400 });

    const experience = await createExperience(
      {
        experienceTypeId,
        name: typeof body.name === "string" ? body.name : undefined,
        startDate,
        frequency,
        durationWeeks: Math.floor(durationWeeks),
        facilitatorId: body.facilitatorId || null,
        attendees: validAttendees,
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
