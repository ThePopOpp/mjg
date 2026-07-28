import { NextResponse } from "next/server";
import { requireExperienceManager } from "@/lib/user-management/auth";
import { sendDueExperienceEmails } from "@/lib/experiences/scheduler";

export const dynamic = "force-dynamic";

/**
 * Releases due Experience emails. Called on a schedule (e.g. a Coolify scheduled task
 * every ~10 min) with the EXPERIENCE_CRON_SECRET, or manually by an admin session.
 */
async function handle(request: Request) {
  const body = await request.json().catch(() => ({}));
  const secret = process.env.EXPERIENCE_CRON_SECRET;
  const presented =
    request.headers.get("x-cron-secret") ||
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim() ||
    (typeof body.secret === "string" ? body.secret : "");

  // Unattended path: a valid shared secret. Otherwise fall back to an admin session.
  let actorId: string | null = null;
  if (secret && presented && presented === secret) {
    actorId = null; // system-initiated
  } else {
    const actor = await requireExperienceManager(request, body.actionToken);
    actorId = actor.id;
  }

  const result = await sendDueExperienceEmails({ actorUserId: actorId, limit: Number(body.limit ?? 25) });
  return NextResponse.json({ ok: true, ...result });
}

export async function POST(request: Request) {
  try {
    return await handle(request);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to send due experience emails.";
    const status = message.includes("permission") || message.includes("Authentication") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
