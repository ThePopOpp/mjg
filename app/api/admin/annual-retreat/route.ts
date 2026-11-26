import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/user-management/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { FOLLOWUP_STEPS } from "@/lib/annual-retreat/config";
import { followupProblems, getRetreatSettings, sendRetreatEmail } from "@/lib/annual-retreat/server";
import type { EmailKey } from "@/lib/annual-retreat/emails";

// Super-admin controls for the Annual Retreat Guide (Dashboard → Annual Retreat).
//   POST { action: "test", key: "delivery" | <follow-up key> | "all" }
//        sends "[Test]" copies to the signed-in admin; works while everything is off.
//   POST { action: "settings", mailing_address?, followups_enabled? }

export const dynamic = "force-dynamic";

const KEYS: EmailKey[] = ["delivery", ...FOLLOWUP_STEPS.map((s) => s.key)];

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  let me: Awaited<ReturnType<typeof requireSuperAdmin>>;
  try {
    me = await requireSuperAdmin(request, typeof body.actionToken === "string" ? body.actionToken : null);
  } catch {
    return NextResponse.json({ error: "Super admin access is required." }, { status: 403 });
  }

  if (body.action === "test") {
    const keys = body.key === "all" ? KEYS : KEYS.filter((k) => k === body.key);
    if (!keys.length) return NextResponse.json({ error: "Unknown email." }, { status: 400 });
    const settings = await getRetreatSettings();
    const results = [];
    for (const [i, key] of keys.entries()) {
      const r = await sendRetreatEmail(key, {
        email: me.email,
        firstName: null,
        withUnsubscribe: key !== "delivery",
        mailingAddress: settings.mailing_address?.trim() || "[Postal address not set yet]",
        subjectPrefix: `[Test ${keys.length > 1 ? `${i + 1}/${keys.length}` : ""}] `.replace(" ]", "]"),
        actorId: me.id,
      });
      results.push({ key, status: r.status, error: r.error ?? null });
    }
    return NextResponse.json({ ok: results.every((r) => r.status === "sent"), to: me.email, results });
  }

  if (body.action === "settings") {
    const current = await getRetreatSettings();
    const next = {
      mailing_address: typeof body.mailing_address === "string" ? body.mailing_address.trim().slice(0, 300) || null : current.mailing_address,
      followups_enabled: typeof body.followups_enabled === "boolean" ? body.followups_enabled : current.followups_enabled,
    };
    if (next.followups_enabled) {
      const problems = followupProblems({ ...current, ...next });
      if (problems.length) return NextResponse.json({ error: problems.join(" ") }, { status: 400 });
    }
    const { error } = await createSupabaseAdminClient()
      .from("annual_retreat_settings")
      .update({ ...next, updated_by: me.id, updated_at: new Date().toISOString() })
      .eq("id", 1);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, settings: { ...current, ...next } });
  }

  return NextResponse.json({ error: "Unknown action." }, { status: 400 });
}
