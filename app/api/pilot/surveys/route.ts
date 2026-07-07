import { NextResponse } from "next/server";
import { saveSurvey } from "@/lib/pilot/repository";
import { isSubmittableSurvey } from "@/lib/pilot/forms-data";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const surveyType = String(body.surveyType ?? "");
    const answers = body.answers ?? {};
    const name = String(answers.name ?? "").trim();
    const email = String(answers.email ?? "").trim().toLowerCase();

    // Accept the two legacy surveys + any published builder survey (by its slug).
    if (!(await isSubmittableSurvey(surveyType))) {
      return NextResponse.json({ error: "Invalid survey type." }, { status: 400 });
    }

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required." }, { status: 400 });
    }

    const saved = await saveSurvey({ surveyType, name, email, answers });
    return NextResponse.json({ ok: true, ...saved });
  } catch (error) {
    console.error("Survey submission failed", error);
    return NextResponse.json({ error: "We could not save your survey yet. Please try again." }, { status: 500 });
  }
}
