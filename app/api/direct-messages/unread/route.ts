import { NextResponse } from "next/server";
import { getUnreadCount } from "@/lib/direct-messages/data";
import { requireActiveProfile } from "@/lib/user-management/auth";

// Total unread DM count for the current user — polled by the bell / nav / FAB badges.
export async function GET(request: Request) {
  try {
    const me = await requireActiveProfile(request);
    const unread = await getUnreadCount(me.id);
    return NextResponse.json({ ok: true, unread });
  } catch {
    // Never break the header chrome on an auth hiccup — just report zero.
    return NextResponse.json({ ok: true, unread: 0 });
  }
}
