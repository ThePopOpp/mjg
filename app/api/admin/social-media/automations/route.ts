import { NextResponse } from "next/server";
import { requireUserManager } from "@/lib/user-management/auth";
import { saveAutomation } from "@/lib/social-media/data";

function errStatus(m: string) { return /authentication/i.test(m) ? 401 : /permission|required/i.test(m) ? 403 : 500; }

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const actor = await requireUserManager(request, body.actionToken);
    if (!body.event_key) throw new Error("An event key is required.");
    await saveAutomation({
      event_key: body.event_key, template_id: body.template_id ?? null,
      platforms: body.platforms ?? [], enabled: Boolean(body.enabled), actorUserId: actor.id,
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    const m = error instanceof Error ? error.message : "Failed to save automation.";
    return NextResponse.json({ error: m }, { status: errStatus(m) });
  }
}
