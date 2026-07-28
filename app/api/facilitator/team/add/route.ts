import { NextResponse } from "next/server";
import { requireFacilitator } from "@/lib/user-management/auth";
import { addTeamParticipant } from "@/lib/facilitator/team";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const actor = await requireFacilitator(request, body.actionToken);

    const email = String(body.email ?? "").trim();
    if (!email.includes("@")) return NextResponse.json({ error: "A valid email is required." }, { status: 400 });

    const participant = await addTeamParticipant(actor.id, {
      name: typeof body.name === "string" ? body.name : undefined,
      email,
      phone: typeof body.phone === "string" ? body.phone : undefined,
    });

    return NextResponse.json({ ok: true, participant });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to add participant.";
    const status = message.includes("permission") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
