import { NextResponse } from "next/server";
import { requireFacilitator } from "@/lib/user-management/auth";
import { assignExperienceType } from "@/lib/facilitator/experiences";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const actor = await requireFacilitator(request, body.actionToken);
    const typeId = String(body.typeId ?? "").trim();
    if (!typeId) return NextResponse.json({ error: "Select an experience." }, { status: 400 });
    const result = await assignExperienceType(actor.id, typeId);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to assign experience.";
    const status = message.includes("permission") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
