import Stripe from "stripe";

// The Stripe client, plus the two guards worth having in one place.
//
// Stripe is a RECORD OF PAYMENT FACTS here and nothing more. Clause D25 keeps
// entitlement independent of every other fact, so nothing in the app asks Stripe
// "is this person allowed in?" — that answer is computed from steward_orders,
// steward_activations and steward_entitlements. A live subscription is evidence
// that a payment happened, not permission.

let client: Stripe | null = null;

export class StripeNotConfigured extends Error {
  constructor() {
    super("Stripe is not configured. Set STRIPE_SECRET_KEY in the environment.");
    this.name = "StripeNotConfigured";
  }
}

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function getStripe(): Stripe {
  if (client) return client;

  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) throw new StripeNotConfigured();

  // A live key reaching a deployment that was not deliberately switched to live
  // takes real money. Cheap insurance against a mis-pasted key. Restricted keys
  // (rk_live_) take real money too.
  if (/^(sk|rk)_live_/.test(secret) && process.env.STRIPE_MODE !== "live") {
    throw new Error(
      "STRIPE_SECRET_KEY is a LIVE key but STRIPE_MODE is not 'live'. Refusing to initialise Stripe.",
    );
  }

  client = new Stripe(secret);
  return client;
}

/** True when running against test keys. Surfaced in the UI so nobody is unsure. */
export function isStripeTestMode(): boolean {
  return /^(sk|rk)_test_/.test(process.env.STRIPE_SECRET_KEY ?? "");
}

/**
 * Verifies a webhook signature and returns the event.
 *
 * This is the only thing that makes a payment trustworthy. The browser's return
 * from Checkout is a redirect the user controls — anyone can navigate to the
 * success URL — so an entitlement must never be granted from it. The signature
 * proves Stripe sent the message and that it has not been altered.
 *
 * `rawBody` must be the exact bytes Stripe sent. Parsing to JSON and
 * re-stringifying changes whitespace and key order and the signature then fails.
 */
export function constructWebhookEvent(rawBody: string, signature: string | null): Stripe.Event {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error("STRIPE_WEBHOOK_SECRET is not set. Refusing to trust an unverified webhook.");
  }
  if (!signature) {
    throw new Error("Missing stripe-signature header.");
  }
  return getStripe().webhooks.constructEvent(rawBody, signature, secret);
}
