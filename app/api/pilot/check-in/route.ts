import { NextResponse } from "next/server";
import { saveCheckIn } from "@/lib/pilot/repository";
import { scoreCheckInDef } from "@/lib/scoring/check-in";
import { resolveCheckInDef } from "@/lib/pilot/forms-data";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const contact = body.contact ?? {};
    const scores = (body.scores ?? {}) as Record<string, number[]>;
    const reflections = body.reflections ?? {};

    if (!contact.firstName || !contact.lastName || !contact.email) {
      return NextResponse.json({ error: "First name, last name, and email are required." }, { status: 400 });
    }
    if (!contact.consent?.emailJourneyOptIn) {
      return NextResponse.json({ error: "Email journey opt-in is required to join the 7-day pilot." }, { status: 400 });
    }

    const def = await resolveCheckInDef();
    for (const section of def.sections) {
      if (!Array.isArray(scores?.[section.key])) {
        return NextResponse.json({ error: `Missing scores for ${section.title}.` }, { status: 400 });
      }
    }

    const result = scoreCheckInDef(def, scores);
    const sections = def.sections.map((s) => ({ key: s.key, title: s.title, questions: s.questions.map((q) => q.text) }));
    const saved = await saveCheckIn({ contact, scores, result, reflections, sections });

    return NextResponse.json({ ok: true, result, ...saved });
  } catch (error) {
    console.error("Check-In submission failed", error);
    return NextResponse.json({ error: "We could not save your Check-In yet. Please try again." }, { status: 500 });
  }
}
