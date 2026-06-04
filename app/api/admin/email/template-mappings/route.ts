import { NextResponse } from "next/server";
import { EMAIL_EVENT_KEYS, type EmailEventKey } from "@/lib/email/constants";
import { saveEmailTemplateMapping } from "@/lib/email/templates";
import { requireUserManager } from "@/lib/user-management/auth";

export async function POST(request: Request) {
  try {
    const actor = await requireUserManager();
    const body = await request.json();
    const eventKey = String(body.eventKey ?? "") as EmailEventKey;
    if (!EMAIL_EVENT_KEYS.some((event) => event.key === eventKey)) {
      return NextResponse.json({ error: "Unknown email event." }, { status: 400 });
    }

    const mapping = await saveEmailTemplateMapping({
      eventKey,
      templateId: body.templateId ? String(body.templateId) : null,
      enabled: body.enabled !== false,
      actorUserId: actor.id,
    });

    return NextResponse.json({ ok: true, mapping });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save email mapping.";
    const status = message.includes("permission") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
