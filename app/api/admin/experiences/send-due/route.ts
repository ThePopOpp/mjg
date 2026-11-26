import { NextResponse } from "next/server";
import { requireExperienceManager } from "@/lib/user-management/auth";
import { sendDueExperienceEmails } from "@/lib/experiences/scheduler";
import { cronSecretMatches, presentedSecret } from "@/lib/auth/cron-secret";
import { sendDueFacilitatorWelcome } from "@/lib/facilitator-welcome/series";
import { sendDueRetreatFollowups } from "@/lib/annual-retreat/server";

export const dynamic = "force-dynamic";

/**
 * Releases due Experience emails — and, on the same schedule, due Facilitator
 * Welcome Series messages (lib/facilitator-welcome/series.ts) and Annual Retreat
 * follow-ups (lib/annual-retreat/server.ts), so neither needs a scheduled task
 * of its own. Called on a schedule (e.g. a Coolify scheduled task
 * every ~10 min) with the EXPERIENCE_CRON_SECRET, or manually by an admin session.
 */
async function handle(request: Request) {
  const body = await request.json().catch(() => ({}));
  const cronOk = cronSecretMatches(presentedSecret(request, body));

  // Unattended path: a valid shared secret. Otherwise fall back to an admin session.
  let actorId: string | null = null;
  if (cronOk) {
    actorId = null; // system-initiated
  } else {
    const actor = await requireExperienceManager(request, body.actionToken);
    actorId = actor.id;
  }

  const result = await sendDueExperienceEmails({ actorUserId: actorId, limit: Number(body.limit ?? 25) });
  // Study emails go first; a welcome failure never fails the study run.
  const facilitatorWelcome = await sendDueFacilitatorWelcome({ limit: 50 }).catch((e) => ({
    error: e instanceof Error ? e.message : "Facilitator welcome run failed.",
  }));
  // Optional retreat follow-ups: held while switched off; a failure never fails the run.
  const annualRetreat = await sendDueRetreatFollowups({ limit: 50 }).catch((e) => ({
    error: e instanceof Error ? e.message : "Annual retreat follow-up run failed.",
  }));
  return NextResponse.json({ ok: true, ...result, facilitatorWelcome, annualRetreat });
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
