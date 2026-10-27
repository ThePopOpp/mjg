import { NextResponse } from "next/server";
import { requireActiveProfile } from "@/lib/user-management/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getFinderSettings, isGroupAdmin } from "@/lib/facilitator-groups/repository";
import { cancelMyReservation, requestSpot } from "@/lib/facilitator-groups/reservations";
import { groupError } from "@/lib/facilitator-groups/http";

// Request a spot ({ partySize, message }) — auto-booked or sent for approval, per the group.
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const me = await requireActiveProfile(request, body.actionToken);
    const settings = await getFinderSettings();
    if (settings.mode !== "open" && !isGroupAdmin(me.role)) throw new Error("Requests open when group sign-ups open.");

    const supabase = createSupabaseAdminClient();
    const { data: prof } = await supabase.from("profiles").select("first_name,last_name,email").eq("id", me.id).maybeSingle();
    const name = [prof?.first_name, prof?.last_name].filter(Boolean).join(" ") || prof?.email || "A participant";
    const { reservation, already } = await requestSpot({ id: me.id, email: prof?.email ?? me.email ?? null, name }, id, {
      partySize: Number(body.partySize) || 1,
      message: typeof body.message === "string" ? body.message : null,
    });
    return NextResponse.json({ reservation: { id: reservation.id, status: reservation.status }, already });
  } catch (error) {
    return groupError(error, "Unable to request a spot.");
  }
}

// Withdraw my request / give up my spot: { reservationId }.
export async function DELETE(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const me = await requireActiveProfile(request, body.actionToken);
    const r = await cancelMyReservation(me, String(body.reservationId ?? ""));
    return NextResponse.json({ reservation: r ? { id: r.id, status: r.status } : null });
  } catch (error) {
    return groupError(error, "Unable to cancel.");
  }
}
