import { NextRequest, NextResponse } from "next/server";
import { createRegistration, loadEventBySlug } from "@/lib/booking/data";

// PUBLIC: register for a published event.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const slug = String(body?.slug || "");
    const name = String(body?.name || "").trim();
    if (!slug || !name) throw new Error("Your name is required.");

    const event = await loadEventBySlug(slug, { publicOnly: true });
    if (!event) return NextResponse.json({ message: "Event not found." }, { status: 404 });

    const { waitlisted } = await createRegistration({
      event_id: event.id,
      name,
      email: body?.email ? String(body.email) : null,
      phone: body?.phone ? String(body.phone) : null,
      party_size: Number(body?.party_size) || 1,
      answers: body?.answers && typeof body.answers === "object" ? body.answers : {},
      source: "public",
    });

    return NextResponse.json({
      ok: true,
      waitlisted,
      message: waitlisted
        ? "This event is full — you've been added to the waitlist and we'll be in touch if a spot opens."
        : "You're registered! A confirmation is on its way.",
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Registration failed";
    const status = /closed|not open|not found/i.test(msg) ? 409 : 400;
    return NextResponse.json({ message: msg }, { status });
  }
}
