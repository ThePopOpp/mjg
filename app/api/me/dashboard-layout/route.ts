import { NextResponse } from "next/server";
import { requireActiveProfile } from "@/lib/user-management/auth";
import { getOverviewLayout, saveOverviewLayout } from "@/lib/dashboard/overview/store";
import { blankLayout, defaultLayoutFor } from "@/lib/dashboard/overview/layout";

// The signed-in person's Overview dashboard layout. Writes are cleaned against
// their real role (see lib/dashboard/overview/store.ts).

function fail(error: unknown) {
  const message = error instanceof Error ? error.message : "Unable to save the dashboard.";
  return NextResponse.json({ error: message }, { status: /authentication|required|profile/i.test(message) ? 401 : 500 });
}

export async function GET(request: Request) {
  try {
    const me = await requireActiveProfile(request);
    return NextResponse.json(await getOverviewLayout(me.id, me.role));
  } catch (error) {
    return fail(error);
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const me = await requireActiveProfile(request, body.actionToken);
    // `reset` rebuilds a starting layout on the server (keeping the person's weather
    // location and stat range); otherwise save what was sent.
    let raw: unknown = body.layout;
    if (body.reset === "standard" || body.reset === "blank") {
      const { layout: current } = await getOverviewLayout(me.id, me.role);
      const fresh = body.reset === "standard" ? defaultLayoutFor(me.role) : blankLayout();
      raw = { ...fresh, location: current.location, statRange: current.statRange };
    }
    if (!raw || typeof raw !== "object") return NextResponse.json({ error: "layout is required." }, { status: 400 });
    if (JSON.stringify(raw).length > 60_000) return NextResponse.json({ error: "That layout is too large." }, { status: 413 });
    const layout = await saveOverviewLayout(me.id, me.role, raw);
    return NextResponse.json({ ok: true, layout });
  } catch (error) {
    return fail(error);
  }
}
