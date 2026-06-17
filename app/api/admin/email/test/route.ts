import { NextResponse } from "next/server";
import { sendSmtpEmail } from "@/lib/email/smtp";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireUserManager } from "@/lib/user-management/auth";

export async function POST(request: Request) {
  let actor: Awaited<ReturnType<typeof requireUserManager>> | null = null;
  let to = "";
  let subject = "";
  let message = "";

  try {
    const body = await request.json();
    actor = await requireUserManager(request, body.actionToken);
    to = String(body.to ?? "").trim();
    subject = String(body.subject ?? "").trim();
    message = String(body.message ?? "").trim();

    if (!to || !subject || !message) {
      return NextResponse.json({ error: "Recipient, subject, and message are required." }, { status: 400 });
    }

    const result = await sendSmtpEmail({
      to,
      subject,
      text: message,
      html: `<p>${escapeHtml(message).replace(/\n/g, "<br />")}</p>`,
    });

    await logEmailTest({
      actorUserId: actor.id,
      to,
      subject,
      status: result.skipped ? "skipped" : "sent",
      message: result.skipped ? result.reason ?? "SMTP is not configured." : "Test email sent.",
      metadata: result,
    });

    return NextResponse.json(result);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Test email failed.";

    if (actor) {
      await logEmailTest({
        actorUserId: actor.id,
        to,
        subject,
        status: "failed",
        message: errorMessage,
        metadata: { error: errorMessage },
      });
    }

    const status = errorMessage.includes("required") || errorMessage.includes("permission") ? 403 : 500;
    return NextResponse.json({ error: errorMessage }, { status });
  }
}

async function logEmailTest(input: {
  actorUserId: string;
  to: string;
  subject: string;
  status: "sent" | "failed" | "skipped";
  message: string;
  metadata: Record<string, unknown>;
}) {
  const supabase = createSupabaseAdminClient();
  await supabase.from("notifications").insert({
    type: "smtp_test_email",
    title: `SMTP test ${input.status}`,
    message: input.message,
    destination: "dashboard",
    status: input.status,
    actor_user_id: input.actorUserId,
    metadata: {
      to: input.to,
      subject: input.subject,
      ...input.metadata,
    },
  });
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
