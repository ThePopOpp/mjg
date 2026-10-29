import { getStripe, isStripeConfigured, isStripeTestMode } from "@/lib/steward/stripe";
import { listAllOffers } from "@/lib/steward/catalogue";

// Stripe products and prices as Stripe holds them, matched to the Steward offer
// that uses each. Read only: products and prices are created and changed in
// Stripe itself (plan §2.2).

function mode() {
  if (!isStripeConfigured()) throw new Error("Stripe is not configured on this deployment.");
  return isStripeTestMode() ? "test" : "live";
}

export async function listStripeProducts(opts: { active?: boolean; limit?: number } = {}) {
  const m = mode();
  const [products, offers] = await Promise.all([
    getStripe().products.list({ limit: Math.min(Math.max(opts.limit ?? 50, 1), 100), ...(opts.active === undefined ? {} : { active: opts.active }) }),
    listAllOffers(),
  ]);
  return {
    mode: m,
    products: products.data.map((p) => ({
      id: p.id, name: p.name, description: p.description, active: p.active,
      defaultPrice: typeof p.default_price === "string" ? p.default_price : p.default_price?.id ?? null,
      created: new Date(p.created * 1000).toISOString(),
      offers: offers.filter((o) => o.stripe_product_id === p.id).map((o) => o.offer_key),
    })),
    hasMore: products.has_more,
  };
}

export async function listStripePrices(opts: { product?: string; active?: boolean; limit?: number } = {}) {
  const m = mode();
  const [prices, offers] = await Promise.all([
    getStripe().prices.list({
      limit: Math.min(Math.max(opts.limit ?? 50, 1), 100),
      ...(opts.product ? { product: opts.product } : {}),
      ...(opts.active === undefined ? {} : { active: opts.active }),
    }),
    listAllOffers(),
  ]);
  return {
    mode: m,
    prices: prices.data.map((p) => ({
      id: p.id, product: typeof p.product === "string" ? p.product : p.product.id, active: p.active,
      nickname: p.nickname, currency: p.currency, unitAmountMinor: p.unit_amount, type: p.type,
      interval: p.recurring?.interval ?? null, intervalCount: p.recurring?.interval_count ?? null,
      created: new Date(p.created * 1000).toISOString(),
      offers: offers.filter((o) => o.stripe_price_id === p.id || o.stripe_renewal_price_id === p.id).map((o) => o.offer_key),
    })),
    hasMore: prices.has_more,
  };
}
