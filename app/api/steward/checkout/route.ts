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
    const origin = new URL(request.url).origin;

    // WHY THE BUNDLE IS NOT A SUBSCRIPTION AT CHECKOUT.
    //
    // build_plus_first_year is $299 today and $199/year afterwards, which looks
    // like a two-phase subscription. It cannot be one here, for two reasons:
    //
    //   1. Stripe refuses a one-time price in subscription mode ("You must
    //      provide at least one recurring price in subscription mode"), and the
    //      $299 genuinely is one-time — it buys the build plus the first year.
    //   2. More importantly, the renewal is anchored to ACTIVATION plus 12
    //      calendar months, not to purchase (renewal_terms.anchor =
    //      CONFIRMED_EXPLICIT_ACTIVATION). Activation can be up to 90 days after
    //      payment, so a subscription created now would bill on the wrong date —
    //      up to three months early.
    //
    // So the bundle is taken as a payment, with the card saved off-session, and
    // the recurring half is created at activation with its anchor set from the
    // activation instant. Plain RECURRING offers have no such gap and stay
    // ordinary subscriptions.
    const isBundle = offer.billing === "INITIAL_BUNDLE_THEN_RECURRING_ANNUAL";
    const mode: "payment" | "subscription" =
      offer.billing === "ONE_TIME" || isBundle ? "payment" : "subscription";

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
      // The bundle needs the card again at activation, so keep it on file.
      // Without this the renewal could not be set up and the member would have
      // to re-enter a card months later to keep what they already paid for.
      ...(isBundle
        ? { payment_intent_data: { setup_future_usage: "off_session" as const }, customer_creation: "always" as const }
        : {}),

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
