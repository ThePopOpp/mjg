import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/user-management/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { grantEntitlement, listActiveEntitlements, revokeEntitlements } from "@/lib/steward/orders";

// Granting and withdrawing Steward access by hand.
//
// The docset sets models_can_grant = false and puts grants in the owner
// console, which is exactly this: a human decision, recorded with who made it
// and why. Nothing in the agent layer can reach grantEntitlement.
//
// It exists for comped accounts, Inner Circle, and — immediately — so the two
// people building this can see both the Free and the Full Blueprint without
// running a card through Stripe each time.
//
// A grant is NOT a purchase. source = 'grant' keeps the two distinguishable
// forever: a refund report, a revenue number and an audit all need to know
// which it was.

export const dynamic = "force-dynamic";

/** Everything the Full Build confers. Premium is granted separately. */
const FULL_BENEFITS = ["full_acquisition", "build_window"] as const;

export async function POST(request: Request) {
  let admin;
  try {
    admin = await requireSuperAdmin(request);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Not permitted." }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const action = body?.action === "grant" || body?.action === "revoke" ? body.action : null;
  const level = body?.level === "premium" ? "premium" : "full";

  if (!email || !action) {
    return NextResponse.json({ error: "email and action are required." }, { status: 400 });
  }

  const db = createSupabaseAdminClient();
  const { data: profile } = await db
    .from("profiles")
    .select("id, email, first_name, last_name")
    .ilike("email", email)
    .maybeSingle();

  if (!profile) {
    return NextResponse.json({ error: `No account found for ${email}.` }, { status: 404 });
  }

  const userId = profile.id as string;
  const benefits = level === "premium" ? (["premium"] as const) : FULL_BENEFITS;

  if (action === "revoke") {
    let removed = 0;
    for (const benefit of benefits) {
      removed += await revokeEntitlements({
        userId,
        benefit,
        reason: `Withdrawn from the Super Admin console by ${admin.email}`,
      });
    }
    const active = await listActiveEntitlements(userId);
    return NextResponse.json({ ok: true, removed, active: active.map((e) => e.benefit) });
  }

  // Granted without an end date: a comped or test account should not expire
  // quietly in the middle of someone's work. Withdrawing it is a deliberate act
  // through this same console.
  for (const benefit of benefits) {
    await grantEntitlement({
      userId,
      benefit,
      source: "grant",
      grantedBy: admin.id as string,
      grantReason: typeof body?.reason === "string" && body.reason.trim() ? body.reason.trim() : "Super Admin grant",
      grantTemplate: level === "premium" ? "manual_premium" : "manual_full_build",
    });
  }

  const active = await listActiveEntitlements(userId);
  return NextResponse.json({
    ok: true,
    member: profile.email,
    active: active.map((e) => e.benefit),
  });
}

/** What a member currently holds, for the console to show before changing it. */
export async function GET(request: Request) {
  try {
    await requireSuperAdmin(request);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Not permitted." }, { status: 403 });
  }

  const email = new URL(request.url).searchParams.get("email")?.trim().toLowerCase() ?? "";
  if (!email) return NextResponse.json({ error: "email is required." }, { status: 400 });

  const db = createSupabaseAdminClient();
  const { data: profile } = await db
    .from("profiles")
    .select("id, email")
    .ilike("email", email)
    .maybeSingle();

  if (!profile) return NextResponse.json({ error: `No account found for ${email}.` }, { status: 404 });

  const active = await listActiveEntitlements(profile.id as string);
  return NextResponse.json({
    member: profile.email,
    active: active.map((e) => ({ benefit: e.benefit, source: e.source, endsAt: e.ends_at })),
  });
}
