import { NextResponse } from "next/server";
import { sendTemplateEmail } from "@/lib/email/templates";
import { requireUserManager } from "@/lib/user-management/auth";

// "Send test to me" — renders the given template with sample merge data and
// sends it to the logged-in admin's own email so they can preview it live.
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const actor = await requireUserManager(request, body.actionToken);
    const templateId = String(body.templateId ?? "").trim();
    if (!templateId) return NextResponse.json({ error: "Template id is required." }, { status: 400 });

    const to = String(body.to ?? "").trim() || String(actor.email ?? "").trim();
    if (!to) return NextResponse.json({ error: "No recipient email is available for this account." }, { status: 400 });

    const result = await sendTemplateEmail({
      templateId,
      recipient: { email: to, first_name: "there", full_name: "there" },
      actorUserId: actor.id,
    });

    if (result?.skipped) {
      return NextResponse.json({ error: result.reason ?? "SMTP is not configured, so no test was sent." }, { status: 400 });
    }
    return NextResponse.json({ ok: true, to });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Test send failed.";
    const status = message.includes("permission") || message.includes("required") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
