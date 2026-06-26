import { NextRequest, NextResponse } from "next/server";
import { createBooking, loadBookingTypeBySlug } from "@/lib/booking/data";

// PUBLIC: create a booking against a published booking type.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const slug = String(body?.slug || "");
    const start_at = String(body?.start_at || "");
    const name = String(body?.invitee_name || "").trim();
    if (!slug || !start_at || !name) throw new Error("Name and a selected time are required.");

    const type = await loadBookingTypeBySlug(slug, { publicOnly: true });
    if (!type) return NextResponse.json({ message: "Booking type not found." }, { status: 404 });

    const start = new Date(start_at);
    if (Number.isNaN(start.getTime())) throw new Error("Invalid start time.");
    if (start.getTime() < Date.now()) throw new Error("That time is in the past.");
    const end = new Date(start.getTime() + type.duration_minutes * 60000);

    const booking = await createBooking({
      booking_type_id: type.id,
      host_staff_id: type.host_staff_id,
      invitee_name: name,
      invitee_email: body?.invitee_email ? String(body.invitee_email) : null,
      invitee_phone: body?.invitee_phone ? String(body.invitee_phone) : null,
      start_at: start.toISOString(),
      end_at: end.toISOString(),
      timezone: type.timezone,
      location_type: type.location_type,
      location_details: type.location_details,
      answers: body?.answers && typeof body.answers === "object" ? body.answers : {},
      source: "public",
    });

    return NextResponse.json({
      ok: true,
      reference: booking.reference,
      confirmation_message: type.confirmation_message,
      start_at: booking.start_at,
      end_at: booking.end_at,
      timezone: booking.timezone,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Booking failed";
    // 409 for slot clashes so the client can refresh availability.
    const status = /just taken|in the past/i.test(msg) ? 409 : 400;
    return NextResponse.json({ message: msg }, { status });
  }
}
