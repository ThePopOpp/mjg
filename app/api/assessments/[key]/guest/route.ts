import { NextResponse } from "next/server";
import { AssessmentSaveError, saveAssessmentResult } from "@/lib/assessments/save";

// Saves a signed-out visitor's results under the name and email they typed on the
// results screen, so the results survive leaving the page, a forgotten password or a
// different device. The row has no profile_id: Steward matches it by email once they
// sign in with that address, and signing in on this browser attaches it to the account
// (the claimer re-posts the same attempt id to ../save). A row already attached to an
// account can't be changed from here (saveAssessmentResult returns 403).
const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export async function POST(request: Request, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const body = await request.json().catch(() => ({}));
  const name = typeof body.name === "string" ? body.name.trim().replace(/\s+/g, " ").slice(0, 120) : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase().slice(0, 254) : "";
  if (!name) return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
  if (!EMAIL.test(email)) return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });

  const [firstName, ...rest] = name.split(" ");
  try {
    const saved = await saveAssessmentResult({
      key,
      profile: { id: null, email, firstName, lastName: rest.join(" ") },
      answers: body.answers,
      attemptId: typeof body.attemptId === "string" ? body.attemptId : "",
    });
    return NextResponse.json({ ok: true, id: saved.id, created: saved.created });
  } catch (error) {
    if (error instanceof AssessmentSaveError) return NextResponse.json({ error: error.message }, { status: error.status });
    console.error("[assessments] guest save failed", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "We couldn't save your results. Please try again." }, { status: 500 });
  }
}
