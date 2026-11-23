import { NextResponse } from "next/server";
import { cronSecretMatches, presentedSecret } from "@/lib/auth/cron-secret";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

/**
 * Nightly analytics job, called by a Coolify scheduled task with
 * ANALYTICS_CRON_SECRET (EXPERIENCE_CRON_SECRET also accepted, so it works
 * before a dedicated secret is added).
 *
 * Phase 1: enforces 13-month retention. Search Console / Bing / PageSpeed /
 * AI-visibility syncs hang off this same route in later phases.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const presented = presentedSecret(request, body);
  if (!cronSecretMatches(presented, "ANALYTICS_CRON_SECRET") && !cronSecretMatches(presented)) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const { data, error } = await createSupabaseAdminClient().rpc("analytics_prune");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const row = Array.isArray(data) ? data[0] : data;
  return NextResponse.json({ ok: true, pruned: row ?? null });
}
