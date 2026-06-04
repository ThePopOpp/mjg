import { NextResponse } from "next/server";
import { syncInboxEmails } from "@/lib/email/inbox";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireUserManager } from "@/lib/user-management/auth";

export async function POST(request: Request) {
  let actor: Awaited<ReturnType<typeof requireUserManager>> | null = null;

  try {
    actor = await requireUserManager();
    const body = await request.json().catch(() => ({}));
    const result = await syncInboxEmails({
      mailbox: body.mailbox ?? "INBOX",
      limit: Number(body.limit ?? 25),
    });

    await logSync(actor.id, "sent", `Synced ${result.synced} emails from ${result.mailbox}.`, result);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Email sync failed.";
    if (actor) {
      await logSync(actor.id, "failed", message, { error: message });
    }
    const status = message.includes("required") || message.includes("permission") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

async function logSync(actorUserId: string, status: "sent" | "failed", message: string, metadata: Record<string, unknown>) {
  const supabase = createSupabaseAdminClient();
  await supabase.from("notifications").insert({
    type: "imap_email_sync",
    title: "Email inbox sync",
    message,
    destination: "dashboard",
    status,
    actor_user_id: actorUserId,
    metadata,
  });
}
