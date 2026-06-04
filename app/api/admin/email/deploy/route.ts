import { NextResponse } from "next/server";
import { getRecipientsForAudience, sendTemplateEmail } from "@/lib/email/templates";
import { requireUserManager } from "@/lib/user-management/auth";

export async function POST(request: Request) {
  try {
    const actor = await requireUserManager();
    const body = await request.json();
    const templateId = String(body.templateId ?? "");
    const mode = body.mode === "audience" ? "audience" : "test";

    if (!templateId) return NextResponse.json({ error: "Template is required." }, { status: 400 });
    if (mode === "audience" && body.testSent !== true) {
      return NextResponse.json({ error: "Send a test email before deploying to an audience." }, { status: 400 });
    }

    const recipients =
      mode === "audience"
        ? await getRecipientsForAudience(body.audience === "participants" ? "participants" : "profiles", Number(body.limit ?? 25))
        : [
            {
              email: String(body.testEmail ?? "").trim(),
              first_name: body.firstName ?? "Test",
              last_name: body.lastName ?? "Recipient",
              full_name: `${body.firstName ?? "Test"} ${body.lastName ?? "Recipient"}`.trim(),
            },
          ];

    if (!recipients.length || !recipients[0]?.email) {
      return NextResponse.json({ error: "No recipients were found." }, { status: 400 });
    }

    const results = [];
    for (const recipient of recipients) {
      try {
        const result = await sendTemplateEmail({ templateId, recipient, actorUserId: actor.id });
        results.push({ email: recipient.email, status: result.skipped ? "skipped" : "sent", messageId: result.messageId ?? null });
      } catch (sendError) {
        results.push({ email: recipient.email, status: "failed", error: sendError instanceof Error ? sendError.message : "Send failed." });
      }
    }

    return NextResponse.json({
      ok: true,
      sent: results.filter((result) => result.status === "sent").length,
      skipped: results.filter((result) => result.status === "skipped").length,
      failed: results.filter((result) => result.status === "failed").length,
      results,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Email deployment failed.";
    const status = message.includes("required") || message.includes("permission") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
