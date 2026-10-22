import type Stripe from "stripe";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { formatPrice, listAllOffers, type StewardOffer } from "@/lib/steward/catalogue";
import { getStripe, isStripeTestMode } from "@/lib/steward/stripe";
import {
  discountLabel,
  durationLabel,
  formatMinor,
  normalizeCode,
  validateCreate,
  validateRules,
  type CouponCreateInput,
  type CouponRulesInput,
  type CouponUsage,
  type CouponWithUsage,
  type StripeCoupon,
} from "./coupon-rules";

// Coupon codes: the Stripe coupon plus the rules the app enforces around it.
//
// Stripe holds the discount (percent or amount, duration, products). Everything
// an admin may want to change later lives in stripe_coupons and is checked by
// resolveCouponForCheckout() before a session is created — Stripe cannot
// enforce a start date or a maximum spend, and cannot edit limits after the
// fact. Checkout never offers Stripe's own code box, so this is the only door.

const COLUMNS =
  "id, code, description, discount_type, percent_off, amount_off_minor, currency, duration, duration_in_months, " +
  "applies_to_offer_keys, starts_at, expires_at, max_redemptions, once_per_customer, min_spend_minor, " +
  "max_spend_minor, active, stripe_coupon_id, stripe_livemode, created_at, updated_at";

/** Orders that hold a redemption. A refund does not give the use back. */
const REDEEMED_STATUSES = ["pending", "paid", "refunded", "partially_refunded"];

/** Thrown with a message that is safe to show the buyer. */
export class CouponRejected extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CouponRejected";
  }
}

function currentLivemode(): boolean {
  return !isStripeTestMode();
}

function toCoupon(row: Record<string, unknown>): StripeCoupon {
  return { ...(row as StripeCoupon), percent_off: row.percent_off === null ? null : Number(row.percent_off) };
}

// == Admin ====================================================================

export async function listCoupons(): Promise<CouponWithUsage[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("stripe_coupons")
    .select(COLUMNS)
    .order("created_at", { ascending: false });
  if (error) throw error;

  const coupons = (data ?? []).map((row) => toCoupon(row as unknown as Record<string, unknown>));
  const usage = await usageFor(coupons.map((c) => c.id));
  return coupons.map((c) => ({ ...c, usage: usage.get(c.id) ?? { redemptions: 0, discountMinor: 0, lastUsedAt: null } }));
}

async function usageFor(ids: string[]): Promise<Map<string, CouponUsage>> {
  const map = new Map<string, CouponUsage>();
  if (!ids.length) return map;

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("steward_orders")
    .select("coupon_id, discount_minor, created_at")
    .in("coupon_id", ids)
    .in("status", REDEEMED_STATUSES);
  if (error) throw error;

  for (const row of data ?? []) {
    const id = row.coupon_id as string;
    const entry = map.get(id) ?? { redemptions: 0, discountMinor: 0, lastUsedAt: null };
    entry.redemptions += 1;
    entry.discountMinor += (row.discount_minor as number) ?? 0;
    const at = row.created_at as string;
    if (!entry.lastUsedAt || at > entry.lastUsedAt) entry.lastUsedAt = at;
    map.set(id, entry);
  }
  return map;
}

export async function createCoupon(input: CouponCreateInput, actorId: string): Promise<StripeCoupon> {
  const problem = validateCreate(input);
  if (problem) throw new Error(problem);

  const code = normalizeCode(input.code);
  const supabase = createSupabaseAdminClient();
  const livemode = currentLivemode();

  const { data: existing } = await supabase
    .from("stripe_coupons")
    .select("id")
    .eq("code", code)
    .eq("stripe_livemode", livemode)
    .maybeSingle();
  if (existing) throw new Error(`The code ${code} already exists.`);

  // Restricting to offers means restricting to their Stripe products.
  let products: string[] | undefined;
  if (input.applies_to_offer_keys.length) {
    const offers = await listAllOffers();
    const chosen = offers.filter((o) => input.applies_to_offer_keys.includes(o.offer_key));
    products = [...new Set(chosen.map((o) => o.stripe_product_id).filter((p): p is string => Boolean(p)))];
    if (!products.length) throw new Error("None of the chosen offers is in Stripe yet, so the code could never apply.");
  }

  const stripe = getStripe();
  const params: Stripe.CouponCreateParams = {
    name: code,
    duration: input.duration,
    ...(input.duration === "repeating" ? { duration_in_months: input.duration_in_months ?? undefined } : {}),
    ...(input.discount_type === "percent"
      ? { percent_off: input.percent_off ?? undefined }
      : { amount_off: input.amount_off_minor ?? undefined, currency: "usd" }),
    ...(products ? { applies_to: { products } } : {}),
    metadata: { mjg_coupon_code: code },
  };
  const stripeCoupon = await stripe.coupons.create(params);

  const { data, error } = await supabase
    .from("stripe_coupons")
    .insert({
      code,
      description: input.description?.trim() || null,
      discount_type: input.discount_type,
      percent_off: input.discount_type === "percent" ? input.percent_off : null,
      amount_off_minor: input.discount_type === "amount" ? input.amount_off_minor : null,
      currency: "USD",
      duration: input.duration,
      duration_in_months: input.duration === "repeating" ? input.duration_in_months : null,
      applies_to_offer_keys: input.applies_to_offer_keys,
      starts_at: input.starts_at,
      expires_at: input.expires_at,
      max_redemptions: input.max_redemptions,
      once_per_customer: input.once_per_customer,
      min_spend_minor: input.min_spend_minor,
      max_spend_minor: input.max_spend_minor,
      active: input.active,
      stripe_coupon_id: stripeCoupon.id,
      stripe_livemode: stripeCoupon.livemode,
      created_by: actorId,
    })
    .select(COLUMNS)
    .single();

  if (error) {
    // Don't leave an orphan discount in Stripe that nothing in the app knows about.
    await stripe.coupons.del(stripeCoupon.id).catch(() => undefined);
    throw error;
  }
  return toCoupon(data as unknown as Record<string, unknown>);
}

export async function updateCouponRules(id: string, rules: CouponRulesInput): Promise<StripeCoupon> {
  const problem = validateRules(rules);
  if (problem) throw new Error(problem);

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("stripe_coupons")
    .update({
      ...(rules.description !== undefined ? { description: rules.description?.trim() || null } : {}),
      starts_at: rules.starts_at,
      expires_at: rules.expires_at,
      max_redemptions: rules.max_redemptions,
      once_per_customer: rules.once_per_customer,
      min_spend_minor: rules.min_spend_minor,
      max_spend_minor: rules.max_spend_minor,
      active: rules.active,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select(COLUMNS)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error("That coupon no longer exists.");
  return toCoupon(data as unknown as Record<string, unknown>);
}

/** Only a code nobody has used can be deleted; a used one is deactivated instead. */
export async function deleteCoupon(id: string): Promise<void> {
  const supabase = createSupabaseAdminClient();
  const { data: row, error } = await supabase.from("stripe_coupons").select(COLUMNS).eq("id", id).maybeSingle();
  if (error) throw error;
  if (!row) throw new Error("That coupon no longer exists.");
  const coupon = toCoupon(row as unknown as Record<string, unknown>);

  const usage = (await usageFor([id])).get(id);
  if (usage && usage.redemptions > 0) {
    throw new Error("This code has been used, so it is kept for the order history. Turn it off instead.");
  }

  // A coupon made under the other mode's key does not exist for this key.
  if (coupon.stripe_livemode === currentLivemode()) {
    await getStripe()
      .coupons.del(coupon.stripe_coupon_id)
      .catch((e: { code?: string }) => {
        if (e?.code !== "resource_missing") throw e;
      });
  }

  const { error: delError } = await supabase.from("stripe_coupons").delete().eq("id", id);
  if (delError) throw delError;
}

// == Checkout =================================================================

async function findUsableCoupon(rawCode: string): Promise<StripeCoupon> {
  const code = normalizeCode(rawCode);
  if (!code) throw new CouponRejected("Enter a code.");

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("stripe_coupons")
    .select(COLUMNS)
    .eq("code", code)
    .eq("stripe_livemode", currentLivemode())
    .maybeSingle();
  if (error) throw error;

  // Unknown, switched off and wrong-mode all read the same to a buyer.
  const coupon = data ? toCoupon(data as unknown as Record<string, unknown>) : null;
  if (!coupon || !coupon.active) throw new CouponRejected(`${code} isn't a valid code.`);

  const now = new Date();
  if (coupon.starts_at && new Date(coupon.starts_at) > now) {
    const day = new Date(coupon.starts_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    throw new CouponRejected(`${code} can be used from ${day}.`);
  }
  if (coupon.expires_at && new Date(coupon.expires_at) <= now) {
    throw new CouponRejected(`${code} has expired.`);
  }
  if (coupon.max_redemptions !== null) {
    const used = (await usageFor([coupon.id])).get(coupon.id)?.redemptions ?? 0;
    if (used >= coupon.max_redemptions) throw new CouponRejected(`${code} has reached its usage limit.`);
  }
  return coupon;
}

async function assertNotUsedBy(coupon: StripeCoupon, userId: string) {
  if (!coupon.once_per_customer) return;
  const supabase = createSupabaseAdminClient();
  const { count, error } = await supabase
    .from("steward_orders")
    .select("id", { count: "exact", head: true })
    .eq("coupon_id", coupon.id)
    .eq("user_id", userId)
    .in("status", REDEEMED_STATUSES);
  if (error) throw error;
  if ((count ?? 0) > 0) throw new CouponRejected(`You've already used ${coupon.code}.`);
}

/** Why this coupon cannot apply to this offer, or null if it can. */
function offerProblem(coupon: StripeCoupon, offer: StewardOffer): string | null {
  if (coupon.applies_to_offer_keys.length && !coupon.applies_to_offer_keys.includes(offer.offer_key)) {
    return `${coupon.code} doesn't apply to ${offer.label}.`;
  }
  if (coupon.min_spend_minor !== null && offer.price_minor < coupon.min_spend_minor) {
    return `${coupon.code} needs a purchase of at least ${formatMinor(coupon.min_spend_minor, offer.currency)}.`;
  }
  if (coupon.max_spend_minor !== null && offer.price_minor > coupon.max_spend_minor) {
    return `${coupon.code} applies to purchases up to ${formatMinor(coupon.max_spend_minor, offer.currency)}.`;
  }
  return null;
}

function discountedMinor(coupon: StripeCoupon, priceMinor: number): number {
  if (coupon.discount_type === "percent") {
    return Math.max(0, Math.round(priceMinor * (1 - (coupon.percent_off ?? 0) / 100)));
  }
  return Math.max(0, priceMinor - (coupon.amount_off_minor ?? 0));
}

/** Every rule, for one offer and one buyer. Called by the checkout route. */
export async function resolveCouponForCheckout(rawCode: string, offer: StewardOffer, userId: string) {
  const coupon = await findUsableCoupon(rawCode);
  const problem = offerProblem(coupon, offer);
  if (problem) throw new CouponRejected(problem);
  await assertNotUsedBy(coupon, userId);
  return coupon;
}

export type CouponPreview = {
  code: string;
  summary: string;
  /** offer_key → first payment after the discount, for every offer it applies to. */
  prices: Record<string, { minor: number; label: string }>;
};

/** What the pricing page shows after "Apply". The checkout route re-checks everything. */
export async function previewCoupon(rawCode: string, userId: string | null): Promise<CouponPreview> {
  const coupon = await findUsableCoupon(rawCode);
  if (userId) await assertNotUsedBy(coupon, userId);

  const offers = (await listAllOffers()).filter((o) => o.price_minor > 0 && o.production_enabled && !o.is_historical_record);
  const prices: CouponPreview["prices"] = {};
  for (const offer of offers) {
    if (offerProblem(coupon, offer)) continue;
    const minor = discountedMinor(coupon, offer.price_minor);
    prices[offer.offer_key] = { minor, label: formatPrice(minor, offer.currency) };
  }
  if (!Object.keys(prices).length) throw new CouponRejected(`${coupon.code} doesn't apply to any plan available right now.`);

  const recurring = offers.some((o) => prices[o.offer_key] && o.billing === "RECURRING");
  const summary = recurring && coupon.duration !== "once"
    ? `${discountLabel(coupon)} ${durationLabel(coupon)} on subscriptions`
    : discountLabel(coupon);
  return { code: coupon.code, summary, prices };
}
