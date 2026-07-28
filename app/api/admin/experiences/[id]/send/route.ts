import { NextResponse } from "next/server";
import { requireExperienceManager } from "@/lib/user-management/auth";
import { sendExperience } from "@/lib/experiences/repository";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const actor = await requireExperienceManager(request, body.actionToken);
    const result = await sendExperience(id, actor.id);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to send experience.";
    const status = message.includes("permission") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
