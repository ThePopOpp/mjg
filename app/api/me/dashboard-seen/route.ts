import { NextResponse } from "next/server";
import { requireActiveProfile } from "@/lib/user-management/auth";
import { setSectionSeen } from "@/lib/dashboard/section-seen";

// Mark a dashboard section as "seen" at the given count (turns its badge from red to gold).
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const me = await requireActiveProfile(request, body.actionToken);
    const section = String(body.section ?? "").slice(0, 60);
    const count = Math.max(0, Math.floor(Number(body.count) || 0));
    if (!section) return NextResponse.json({ error: "section is required." }, { status: 400 });
    await setSectionSeen(me.id, section, count);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update.";
    return NextResponse.json({ error: message }, { status: /authentication|required/i.test(message) ? 401 : 500 });
  }
}
