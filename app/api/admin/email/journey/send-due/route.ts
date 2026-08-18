import { NextResponse } from "next/server";
import { sendDueJourneyEmails } from "@/lib/email/templates";
import { requireUserManager } from "@/lib/user-management/auth";

export const dynamic = "force-dynamic";

/**
 * Releases due 7-Day Journey emails. Two ways to call it:
 *  - Unattended: a Coolify scheduled task (any cadence the owner sets) presenting the
 *    shared EXPERIENCE_CRON_SECRET via `x-cron-secret` / Bearer header or `{secret}` body.
 *  - Manually: an admin session (the "Send due journey emails" button).
 * Either way it sends whatever journey emails are due right now, so it works with any
 * custom schedule.
 */
async function handle(request: Request) {
  const body = await request.json().catch(() => ({}));
  const secret = process.env.EXPERIENCE_CRON_SECRET;
  const presented =
    request.headers.get("x-cron-secret") ||
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim() ||
    (typeof body.secret === "string" ? body.secret : "");

  let actorId: string | null = null;
  if (secret && presented && presented === secret) {
    actorId = null; // system-initiated on schedule
  } else {
    const actor = await requireUserManager(request, body.actionToken);
    actorId = actor.id;
  }

  const result = await sendDueJourneyEmails({ actorUserId: actorId ?? undefined, limit: Number(body.limit ?? 25) });
  return NextResponse.json({ ok: true, ...result });
}

export async function POST(request: Request) {
  try {
    return await handle(request);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to send due journey emails.";
    const status = message.includes("permission") || message.includes("Authentication") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
