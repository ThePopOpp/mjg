import { createSupabaseAdminClient } from "@/lib/supabase/admin";

// The offer catalogue.
//
// Every price in the product comes from here. The docset sets
// global.fixed_prices_in_prompts = false and the Terms require the exact price
// to be stated at checkout, so there is one source and no literal prices in
// prompts, pages or checkout code.
//
// Two gates decide whether an offer can be bought, and they are separate on
// purpose:
//   production_enabled — has a human cleared this offer for sale? Ships false
//                        for every offer in the catalogue.
//   eligible_roles     — who may buy it. Empty means everyone; the facilitator
//                        trial is scoped this way so it cannot be reached from
//                        the public pricing page.

export type OfferBilling =
  | "NONE"
  | "ONE_TIME"
  | "RECURRING"
  | "INITIAL_BUNDLE_THEN_RECURRING_ANNUAL"
  | "ONE_TIME_PREPAID_NO_AUTORENEW";

export type StewardOffer = {
  id: string;
  offer_key: string;
  product_key: string;
  label: string;
  description: string;
  price_minor: number;
  currency: string;
  billing: OfferBilling;
  interval: "MONTH" | "YEAR" | null;
  card_required: boolean;
  benefits: string[];
  build_days: number | null;
  activation_deadline_days: number | null;
  renewal_price_minor: number | null;
  renewal_interval: "MONTH" | "YEAR" | null;
  renewal_calendar_months: number | null;
  requires_full_acquisition: boolean;
  requires_initial_full_not_already_acquired: boolean;
  requires_recurring_assent: boolean;
  trial_days: number | null;
  eligible_roles: string[];
  stripe_product_id: string | null;
  stripe_price_id: string | null;
  stripe_renewal_price_id: string | null;
  production_enabled: boolean;
  is_historical_record: boolean;
  sort_order: number;
  source_ref: string | null;
};

const COLUMNS =
  "id, offer_key, product_key, label, description, price_minor, currency, billing, interval, card_required, benefits, " +
  "build_days, activation_deadline_days, renewal_price_minor, renewal_interval, renewal_calendar_months, " +
  "requires_full_acquisition, requires_initial_full_not_already_acquired, requires_recurring_assent, " +
  "trial_days, eligible_roles, stripe_product_id, stripe_price_id, stripe_renewal_price_id, " +
  "production_enabled, is_historical_record, sort_order, source_ref";

/** Every offer, enabled or not. For the Agent Manager. */
export async function listAllOffers(): Promise<StewardOffer[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from("steward_offers").select(COLUMNS).order("sort_order");
  if (error) throw error;
  return (data ?? []) as unknown as StewardOffer[];
}

export async function getOffer(offerKey: string): Promise<StewardOffer | null> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from("steward_offers").select(COLUMNS).eq("offer_key", offerKey).maybeSingle();
  if (error) throw error;
  return (data as unknown as StewardOffer | null) ?? null;
}

/**
 * The offers a given role may actually buy right now.
 *
 * Pass role = null for an anonymous visitor on the public pricing page: that
 * drops every role-scoped offer, so the facilitator trial never appears there.
 */
export async function listPurchasableOffers(role: string | null): Promise<StewardOffer[]> {
  const offers = await listAllOffers();
  return offers.filter((offer) => {
    if (!offer.production_enabled) return false;
    if (offer.eligible_roles.length === 0) return true;
    return role !== null && offer.eligible_roles.includes(role);
  });
}

export type OfferAvailability = { purchasable: true } | { purchasable: false; reason: string };

/**
 * Whether a specific role may buy a specific offer.
 *
 * Called again server-side at checkout. The pricing page filtering above is
 * presentation; this is the check that matters, because an offer_key can be
 * posted directly.
 */
export function checkOfferAvailability(offer: StewardOffer, role: string | null): OfferAvailability {
  if (!offer.production_enabled) {
    return {
      purchasable: false,
      reason: `"${offer.label}" is not enabled for sale. Every offer in the accepted catalogue ships disabled; a Super Admin enables it once the Terms §8 blanks are filled in.`,
    };
  }
  // Prepaid and historical are both ONE_TIME_PREPAID_NO_AUTORENEW, so the flag
  // decides, not the billing type: the $299 offer is prepaid AND sellable, while
  // the BUILD_LIVE_299_Y1 alias exists only so prior purchases resolve.
  if (offer.is_historical_record) {
    return { purchasable: false, reason: `"${offer.label}" is a historical record and cannot be purchased.` };
  }
  if (offer.eligible_roles.length > 0) {
    if (role === null || !offer.eligible_roles.includes(role)) {
      return { purchasable: false, reason: `"${offer.label}" is only available to ${offer.eligible_roles.join(", ")}.` };
    }
  }
  if (!offer.stripe_price_id && offer.price_minor > 0) {
    return {
      purchasable: false,
      reason: `"${offer.label}" has no Stripe price yet. Run npm run stripe:sync.`,
    };
  }
  return { purchasable: true };
}

/** "$149.00" — formatting lives here so no page hardcodes a currency symbol. */
export function formatPrice(minor: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(minor / 100);
}

/**
 * The exact billing sentence shown at checkout.
 *
 * Terms §7 requires the price, interval, trial and recurring charge to be
 * stated before payment, and §8 requires auto-renewal to be identified clearly.
 * Generating it from the offer row means the disclosure cannot drift from what
 * Stripe will actually charge.
 */
export function describeBilling(offer: StewardOffer): string {
  const price = formatPrice(offer.price_minor, offer.currency);

  switch (offer.billing) {
    case "NONE":
      return "Free. No card required.";

    case "ONE_TIME":
      return `${price} once. This is not a subscription and does not renew.`;

    case "ONE_TIME_PREPAID_NO_AUTORENEW": {
      const months = offer.renewal_calendar_months ?? 12;
      // Said plainly, because "prepaid" is the whole point: nothing is kept on
      // file, nothing renews, and there is nothing to cancel later.
      return (
        `${price} once, covering ${months} months. This does NOT renew — ` +
        `no card is kept on file and you will not be charged again.`
      );
    }

    case "RECURRING": {
      const every = offer.interval === "YEAR" ? "year" : "month";
      if (offer.trial_days && offer.trial_days > 0) {
        return (
          `Free for ${offer.trial_days} days, then ${price} every ${every} until canceled. ` +
          `Your card is saved now and the first charge happens when the trial ends. Cancel any time before then and you are not charged.`
        );
      }
      return `${price} every ${every} until canceled.`;
    }

    case "INITIAL_BUNDLE_THEN_RECURRING_ANNUAL": {
      const renewal = formatPrice(offer.renewal_price_minor ?? 0, offer.currency);
      const months = offer.renewal_calendar_months ?? 12;
      return (
        `${price} today, then ${renewal} every ${months} months until canceled. ` +
        `The renewal date is ${months} calendar months after you activate, not after you pay.`
      );
    }

    default:
      return price;
  }
}
