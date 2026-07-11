import { NextResponse } from "next/server";
import { getDmPrefs, setDmPrefs } from "@/lib/direct-messages/preferences";
import { requireActiveProfile } from "@/lib/user-management/auth";

export async function GET(request: Request) {
  try {
    const me = await requireActiveProfile(request);
    const prefs = await getDmPrefs(me.id);
    return NextResponse.json({ ok: true, prefs });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load preferences.";
    return NextResponse.json({ error: message }, { status: message.includes("Authentication required") ? 401 : 400 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const me = await requireActiveProfile(request, body.actionToken);
    const prefs = await setDmPrefs(me.id, { email: Boolean(body.email), sms: Boolean(body.sms) });
    return NextResponse.json({ ok: true, prefs });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save preferences.";
    return NextResponse.json({ error: message }, { status: message.includes("Authentication required") ? 401 : 400 });
  }
}
