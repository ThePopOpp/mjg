import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { scoreCheckIn } from "@/lib/check-in/created-for-more";

// Public endpoint: saves a Created for More Check-In submission and returns the score.
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const answers: Record<string, number> = {};
    if (body.answers && typeof body.answers === "object") {
      for (const [k, v] of Object.entries(body.answers)) {
        const n = Number(v);
        if (Number.isFinite(n) && n >= 1 && n <= 5) answers[k] = n;
      }
    }
    if (!Object.keys(answers).length) return NextResponse.json({ error: "No answers were provided." }, { status: 400 });

    const score = scoreCheckIn(answers);
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.from("check_in_submissions").insert({
      assessment: "created-for-more",
      name: typeof body.name === "string" ? body.name.trim().slice(0, 200) || null : null,
      email: typeof body.email === "string" ? body.email.trim().slice(0, 200) || null : null,
      answers,
      layer_scores: score.layerScores,
      total_score: score.total,
      stage: score.stage,
      strongest_layer: score.strongestLayer,
      lowest_layer: score.lowestLayer,
      lowest_pillar: score.lowestPillar,
      chosen_pathway: typeof body.chosenPathway === "string" ? body.chosenPathway.slice(0, 60) || null : null,
    });
    if (error) throw error;
    return NextResponse.json({ ok: true, score });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save your Check-In.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
