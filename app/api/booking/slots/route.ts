import { NextRequest, NextResponse } from "next/server";
import { computeSlots } from "@/lib/booking/availability";
import { loadAvailability, loadBookingTypeBySlug, loadBookingsForType, loadDateOverrides } from "@/lib/booking/data";

// PUBLIC: compute open slots for a booking type over a date range.
export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;
    const slug = sp.get("slug") || "";
    if (!slug) throw new Error("slug is required.");
    const type = await loadBookingTypeBySlug(slug, { publicOnly: true });
    if (!type) return NextResponse.json({ message: "Booking type not found." }, { status: 404 });

    const today = new Date().toISOString().slice(0, 10);
    const fromDate = sp.get("from") || today;
    const maxTo = new Date(Date.now() + (type.max_advance_days || 60) * 86400000).toISOString().slice(0, 10);
    let toDate = sp.get("to") || new Date(Date.now() + 28 * 86400000).toISOString().slice(0, 10);
    if (toDate > maxTo) toDate = maxTo;

    const [rules, overrides] = await Promise.all([loadAvailability(type.id), loadDateOverrides(type.id)]);
    const fromIso = new Date(`${fromDate}T00:00:00Z`).toISOString();
    const toIso = new Date(`${toDate}T23:59:59Z`).toISOString();
    const bookings = await loadBookingsForType(type.id, fromIso, toIso);

    const slots = computeSlots({ type, rules, overrides, bookings, fromDate, toDate });
    return NextResponse.json({
      slots,
      timezone: type.timezone,
      duration_minutes: type.duration_minutes,
      name: type.name,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to load slots";
    return NextResponse.json({ message: msg }, { status: 500 });
  }
}
