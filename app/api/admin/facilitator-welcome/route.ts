import { NextResponse } from "next/server";
import { requireUserManager } from "@/lib/user-management/auth";
import { getWelcomeOverview, saveWelcomeSettings } from "@/lib/facilitator-welcome/admin";

export const dynamic = "force-dynamic";

// Facilitator Welcome Series settings (Emails → Automations).

export async function GET(request: Request) {
  try {
    await requireUserManager(request, request.headers.get("x-mjg-action-token") ?? undefined);
    return NextResponse.json({ ok: true, overview: await getWelcomeOverview() });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load the welcome series.";
    return NextResponse.json({ error: message }, { status: message.includes("permission") || message.includes("Authentication") ? 403 : 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const actor = await requireUserManager(request, body.actionToken);
    const overview = await saveWelcomeSettings(body.settings ?? {}, actor.id);
    return NextResponse.json({ ok: true, overview });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save the welcome series.";
    const status = message.includes("permission") || message.includes("Authentication") ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
