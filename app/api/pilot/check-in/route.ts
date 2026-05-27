import { NextResponse } from "next/server";
import { CHECK_IN_SECTIONS } from "@/lib/pilot/constants";
import { saveCheckIn } from "@/lib/pilot/repository";
import { scoreCheckIn, type CheckInScores } from "@/lib/scoring/check-in";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const contact = body.contact ?? {};
    const scores = body.scores as CheckInScores;
    const reflections = body.reflections ?? {};

    if (!contact.firstName || !contact.lastName || !contact.email) {
      return NextResponse.json({ error: "First name, last name, and email are required." }, { status: 400 });
    }

    if (!contact.consent?.emailJourneyOptIn) {
      return NextResponse.json({ error: "Email journey opt-in is required to join the 7-day pilot." }, { status: 400 });
    }

    for (const section of CHECK_IN_SECTIONS) {
      if (!Array.isArray(scores?.[section.key])) {
        return NextResponse.json({ error: `Missing scores for ${section.title}.` }, { status: 400 });
      }
    }

    const result = scoreCheckIn(scores);
    const saved = await saveCheckIn({ contact, scores, result, reflections });

    return NextResponse.json({ ok: true, result, ...saved });
  } catch (error) {
    console.error("Check-In submission failed", error);
    return NextResponse.json({ error: "We could not save your Check-In yet. Please try again." }, { status: 500 });
  }
}
