import { NextResponse } from "next/server";
import { requireUserManager } from "@/lib/user-management/auth";
import { sendDueInvitations } from "@/lib/user-management/repository";
import { cronSecretMatches, presentedSecret } from "@/lib/auth/cron-secret";

export const dynamic = "force-dynamic";

/**
 * Sends invitation emails scheduled for a future time that are now due. Called on a
 * schedule by a Coolify task with EXPERIENCE_CRON_SECRET, or manually by an admin session.
 */
async function handle(request: Request) {
  const body = await request.json().catch(() => ({}));
  const cronOk = cronSecretMatches(presentedSecret(request, body));

  if (!cronOk) {
    await requireUserManager(request, body.actionToken);
  }

  const result = await sendDueInvitations({ limit: Number(body.limit ?? 50) });
  return NextResponse.json({ ok: true, ...result });
}

export async function POST(request: Request) {
  try {
    return await handle(request);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to send due invitations.";
    const status = message.includes("permission") || message.includes("Authentication") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
