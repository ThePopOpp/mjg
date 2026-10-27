import { NextResponse } from "next/server";
import { requireFacilitator } from "@/lib/user-management/auth";
import { listReservations } from "@/lib/facilitator-groups/repository";
import { addGroupMember, decideReservation } from "@/lib/facilitator-groups/reservations";
import { groupError } from "@/lib/facilitator-groups/http";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const actor = await requireFacilitator(request);
    return NextResponse.json({ reservations: await listReservations(actor, id) });
  } catch (error) {
    return groupError(error, "Unable to load the roster.");
  }
}

// Add someone the facilitator recruited (takes a confirmed spot).
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const actor = await requireFacilitator(request, body.actionToken);
    const reservation = await addGroupMember(actor, id, {
      name: typeof body.name === "string" ? body.name : undefined,
      email: String(body.email ?? ""),
      phone: typeof body.phone === "string" ? body.phone : undefined,
      partySize: Number(body.partySize) || 1,
    });
    return NextResponse.json({ reservation });
  } catch (error) {
    return groupError(error, "Unable to add that person.");
  }
}

// Approve / decline / remove: { reservationId, decision: "confirm" | "decline" | "cancel" }.
export async function PATCH(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const actor = await requireFacilitator(request, body.actionToken);
    if (!["confirm", "decline", "cancel"].includes(body.decision)) throw new Error("Invalid decision.");
    const reservation = await decideReservation(actor, String(body.reservationId ?? ""), body.decision);
    return NextResponse.json({ reservation });
  } catch (error) {
    return groupError(error, "Unable to update the request.");
  }
}
