import { NextResponse } from "next/server";
import { joinBookWaitlist } from "@/lib/book-waitlist/repository";
import { createDashboardNotification } from "@/lib/notifications/notify";

// Public endpoint: joins the book waitlist. Resolves the requester against existing MJG
// accounts by email (see joinBookWaitlist) so the request lands on their dashboard.
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const str = (v: unknown, max = 200) => (typeof v === "string" ? v.trim().slice(0, max) : "");

    const result = await joinBookWaitlist({
      email: str(body.email),
      firstName: str(body.firstName, 120),
      lastName: str(body.lastName, 120),
      phone: str(body.phone, 40),
      // Multi-select: an array of format values (validated in joinBookWaitlist). A single
      // legacy `formatPreference` string is still accepted.
      formatPreferences: Array.isArray(body.formatPreferences)
        ? body.formatPreferences
        : body.formatPreference
          ? [body.formatPreference]
          : [],
      interest: str(body.interest, 2000),
      notes: str(body.notes, 2000),
      source: str(body.source, 120),
    });

    // Dashboard notification only — the waitlist page is high-volume by design, so this
    // doesn't email the team on every signup (the admin page and Reports show the list).
    if (!result.alreadyOnList) {
      await createDashboardNotification({
        type: "book_waitlist_request",
        title: "New book waitlist request",
        message: `${result.email} joined the waitlist for The Life You're Building.`,
        metadata: { email: result.email, hasAccount: result.hasAccount },
      }).catch(() => {});
    }

    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "We couldn't add you to the waitlist.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
