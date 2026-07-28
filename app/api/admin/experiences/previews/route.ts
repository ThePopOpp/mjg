import { NextResponse } from "next/server";
import { requireExperienceManager } from "@/lib/user-management/auth";
import { createExperiencePreview } from "@/lib/experiences/previews";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const actor = await requireExperienceManager(request, body.actionToken);
    const result = await createExperiencePreview(
      {
        title: String(body.title ?? ""),
        content: body.content ?? null,
        imageUrl: body.imageUrl ?? null,
        videoUrl: body.videoUrl ?? null,
        audioUrl: body.audioUrl ?? null,
        documentUrl: body.documentUrl ?? null,
        frequencyLabel: body.frequencyLabel ?? null,
      },
      actor.id,
    );
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save preview.";
    const status = message.includes("permission") ? 403 : message.includes("required") ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
