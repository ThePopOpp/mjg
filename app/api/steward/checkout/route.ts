import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth/server";
import { checkOfferAvailability, describeBilling, getOffer } from "@/lib/steward/catalogue";
import { getTaxPolicy } from "@/lib/steward/config";
import { getStripe, isStripeConfigured } from "@/lib/steward/stripe";

// Creates a Stripe Checkout session for one offer.
//
// Every price, interval and trial comes from the catalogue row. Nothing here
// hardcodes an amount, which is both the docset's rule
// (global.fixed_prices_in_prompts = false) and the only way the disclosure the
// member reads can be guaranteed to match what Stripe actually charges.
//
// The offer_key arrives from the browser and is therefore untrusted: it is
// re-checked server-side against production_enabled and eligible_roles, so a
// disabled offer or the role-scoped facilitator trial cannot be bought by
// posting its key directly.

export const dynamic = "force-dynamic";

/**
 * Where to send the browser back to after Checkout.
 *
 * NOT `new URL(request.url).origin`: Next reconstructs that URL, and it can
 * report https for a plain-http dev server — which sent a local test to
 * https://localhost:3000 and died with ERR_SSL_PROTOCOL_ERROR. The forwarded
 * headers are what the request actually arrived on, which is also what works
 * behind Coolify's proxy, where the app itself speaks http.
 *
 * A bare loopback host with no proxy in front is http; anything else is https,
 * since Stripe will not redirect to an insecure public URL anyway.
 */
function resolveOrigin(request: Request): string {
  const first = (value: string | null) => value?.split(",")[0]?.trim() || null;
  const host = first(request.headers.get("x-forwarded-host")) ?? first(request.headers.get("host"));
  if (!host) return new URL(request.url).origin;

  const forwardedProto = first(request.headers.get("x-forwarded-proto"));
  const isLoopback = /^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/i.test(host);
  const proto = forwardedProto ?? (isLoopback ? "http" : "https");
  return `${proto}://${host}`;
}

export async function POST(request: Request) {
  try {
    if (!isStripeConfigured()) {
      return NextResponse.json({ error: "Payments are not configured yet." }, { status: 503 });
    }

    const profile = await getCurrentProfile();
    if (!profile) {
      return NextResponse.json({ error: "Sign in to continue." }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const offerKey = typeof body?.offerKey === "string" ? body.offerKey : null;
    if (!offerKey) {
      return NextResponse.json({ error: "offerKey is required." }, { status: 400 });
    }

    const offer = await getOffer(offerKey);
    if (!offer) {
      return NextResponse.json({ error: "That offer does not exist." }, { status: 404 });
    }

    // The real gate. The pricing page filters too, but that is presentation.
    const availability = checkOfferAvailability(offer, profile.role);
    if (!availability.purchasable) {
      return NextResponse.json({ error: availability.reason }, { status: 403 });
    }

    if (offer.billing === "NONE") {
      return NextResponse.json({ error: "The free plan does not require checkout." }, { status: 400 });
    }

    const stripe = getStripe();
    const tax = await getTaxPolicy();
    const origin = resolveOrigin(request);

    // The $299 offer is one year PREPAID (owner, 2026-10-13), so the only
    // subscription modes left are the genuinely recurring ones. That removes the
    // problem the bundle used to have: a Stripe subscription created at checkout
    // would have billed from purchase, while the docset anchors renewal to
    // activation — which can be up to 90 days later. Nothing recurring is
    // created here any more, so there is no anchor to reconcile.
    const mode: "payment" | "subscription" =
      offer.billing === "RECURRING" ? "subscription" : "payment";

    const lineItem = { price: offer.stripe_price_id as string, quantity: 1 };

    const session = await stripe.checkout.sessions.create({
      mode,
      line_items: [lineItem],
      client_reference_id: profile.id,
      customer_email: profile.email,

      // Read back by the webhook. Without these the payment cannot be
      // attributed to a member, so the webhook treats them as required.
      metadata: {
        steward_user_id: profile.id,
        steward_offer_key: offer.offer_key,
        steward_billing_summary: describeBilling(offer),
      },
      ...(mode === "subscription"
        ? {
            subscription_data: {
              ...(offer.trial_days ? { trial_period_days: offer.trial_days } : {}),
              metadata: { steward_user_id: profile.id, steward_offer_key: offer.offer_key },
            },
          }
        : {}),
      // No setup_future_usage anywhere: one-time and prepaid purchases never
      // charge again, so keeping a card on file would be storing a payment
      // credential we have no use for.

      // Off for now by owner decision. Prices are tax-exclusive so this can be
      // switched on later without rebuilding the catalogue.
      automatic_tax: { enabled: tax.enabled },

      success_url: `${origin}/steward/thank-you?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/steward/pricing?canceled=1`,
    });

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not start checkout.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
