import { NextResponse } from "next/server";
import { requireActiveProfile } from "@/lib/user-management/auth";
import { listMyUnread, markMineRead } from "@/lib/notifications/personal";
import { fireDueReminders } from "@/lib/dashboard/overview/items";

// The signed-in person's own dashboard notifications (lib/notifications/personal.ts).
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const me = await requireActiveProfile(request);
    // Dashboard reminders become notifications when due (no scheduled job needed).
    await fireDueReminders(me.id).catch(() => undefined);
    return NextResponse.json({ notifications: await listMyUnread(me.id) });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Not allowed." }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as { id?: string; actionToken?: string };
    const me = await requireActiveProfile(request, body.actionToken);
    if (!body.id) return NextResponse.json({ error: "id is required." }, { status: 400 });
    await markMineRead(me.id, body.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Not allowed." }, { status: 401 });
  }
}
