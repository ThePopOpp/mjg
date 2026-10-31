import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth/server";
import { AssessmentSaveError, saveAssessmentResult } from "@/lib/assessments/save";

// Saves a completed assessment to the signed-in member's account. Called by
// useAssessmentAutosave when results are shown, and by the pending-results
// claimer after a signed-out visitor signs in. 401 for signed-out callers — the
// client keeps their results in the browser until they sign in.
export async function POST(request: Request, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const profile = await getCurrentProfile().catch(() => null);
  if (!profile || profile.id === "local-preview" || !profile.email) {
    return NextResponse.json({ error: "Sign in to save your results." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  try {
    const saved = await saveAssessmentResult({
      key,
      profile,
      answers: body.answers,
      attemptId: typeof body.attemptId === "string" ? body.attemptId : "",
    });
    return NextResponse.json({ ok: true, id: saved.id, created: saved.created });
  } catch (error) {
    if (error instanceof AssessmentSaveError) return NextResponse.json({ error: error.message }, { status: error.status });
    console.error("[assessments] save failed", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "We couldn't save your results. Please try again." }, { status: 500 });
  }
}
