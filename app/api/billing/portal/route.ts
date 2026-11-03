import { NextResponse } from "next/server";
import { requireActiveProfile } from "@/lib/user-management/auth";
import { stripeCustomerFor } from "@/lib/billing/purchases";
import { getStripe, isStripeConfigured } from "@/lib/steward/stripe";

// Opens Stripe's Customer Portal for the signed-in member's own Stripe customer — update the
// card, download invoices, cancel or resume a subscription. Returns { url } to redirect to.
export async function POST(request: Request) {
  let me;
  try {
    const body = await request.clone().json().catch(() => ({}));
    me = await requireActiveProfile(request, body.actionToken ?? request.headers.get("x-mjg-action-token"));
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unauthorized.";
    return NextResponse.json({ error: msg }, { status: /authentication/i.test(msg) ? 401 : 403 });
  }

  if (!isStripeConfigured()) return NextResponse.json({ error: "Billing isn't available right now." }, { status: 503 });
  const customer = await stripeCustomerFor(me.id);
  if (!customer) return NextResponse.json({ error: "There's no billing account to manage yet." }, { status: 404 });

  try {
    const origin = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin;
    const session = await getStripe().billingPortal.sessions.create({ customer, return_url: `${origin}/dashboard/billing` });
    return NextResponse.json({ ok: true, url: session.url });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    console.error("[billing] portal session failed", msg);
    // Stripe refuses until the Customer Portal is saved once in the Stripe dashboard.
    const notSetUp = /configuration|portal/i.test(msg);
    return NextResponse.json(
      { error: notSetUp ? "Subscription management isn't switched on yet. Contact MJG and we'll help." : "Couldn't open billing. Please try again." },
      { status: notSetUp ? 503 : 502 },
    );
  }
}
