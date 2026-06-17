import { NextResponse } from "next/server";
import { countRecipientsForAudience } from "@/lib/email/templates";
import { requireUserManager } from "@/lib/user-management/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await requireUserManager(request, body.actionToken);
    const audience = body.audience === "participants" ? "participants" : "profiles";
    const count = await countRecipientsForAudience(audience);
    return NextResponse.json({ ok: true, audience, count });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to count recipients.";
    const status = message.includes("permission") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
