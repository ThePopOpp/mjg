import { NextResponse } from "next/server";
import { saveImpactScore } from "@/lib/content/impact-score";
import { requireContentManager } from "@/lib/user-management/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const actor = await requireContentManager(request, body.actionToken);
    const score = await saveImpactScore({
      scoreDate: body.scoreDate,
      totalAmount: Number(body.totalAmount),
      goalLabel: body.goalLabel,
      headline: body.headline,
      bodyText: body.bodyText,
      notes: body.notes,
      published: Boolean(body.published),
      categories: body.categories ?? [],
      actorUserId: actor.id,
    });
    return NextResponse.json({ ok: true, score });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save impact score.";
    const status = message.includes("Authentication required") ? 401 : message.includes("permission") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
