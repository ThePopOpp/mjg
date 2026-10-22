// Coupon shapes and rules shared by the admin UI and the server.
//
// No server imports here: the dashboard form uses the same validation and the
// same summary sentence the API does, so what the admin sees while typing is
// exactly what gets saved.

export type DiscountType = "percent" | "amount";
export type CouponDuration = "once" | "repeating" | "forever";

export type StripeCoupon = {
  id: string;
  code: string;
  description: string | null;
  discount_type: DiscountType;
  percent_off: number | null;
  amount_off_minor: number | null;
  currency: string;
  duration: CouponDuration;
  duration_in_months: number | null;
  applies_to_offer_keys: string[];
  starts_at: string | null;
  expires_at: string | null;
  max_redemptions: number | null;
  once_per_customer: boolean;
  min_spend_minor: number | null;
  max_spend_minor: number | null;
  active: boolean;
  stripe_coupon_id: string;
  stripe_livemode: boolean;
  created_at: string;
  updated_at: string;
};

export type CouponUsage = {
  redemptions: number;
  discountMinor: number;
  lastUsedAt: string | null;
};

export type CouponWithUsage = StripeCoupon & { usage: CouponUsage };

/** Fields fixed at creation, because the Stripe coupon behind them cannot change. */
export type CouponCreateInput = {
  code: string;
  description: string | null;
  discount_type: DiscountType;
  percent_off: number | null;
  amount_off_minor: number | null;
  duration: CouponDuration;
  duration_in_months: number | null;
  applies_to_offer_keys: string[];
} & CouponRulesInput;

/** Fields an admin can change at any time. The app enforces them, not Stripe. */
export type CouponRulesInput = {
  description?: string | null;
  starts_at: string | null;
  expires_at: string | null;
  max_redemptions: number | null;
  once_per_customer: boolean;
  min_spend_minor: number | null;
  max_spend_minor: number | null;
  active: boolean;
};

export const CODE_PATTERN = /^[A-Z0-9][A-Z0-9_-]{2,39}$/;

export function normalizeCode(code: string): string {
  return code.trim().toUpperCase();
}

export function formatMinor(minor: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(minor / 100);
}

/** "50% off", "$20.00 off" */
export function discountLabel(c: Pick<StripeCoupon, "discount_type" | "percent_off" | "amount_off_minor" | "currency">) {
  return c.discount_type === "percent"
    ? `${Number(c.percent_off)}% off`
    : `${formatMinor(c.amount_off_minor ?? 0, c.currency)} off`;
}

/** How long the discount lasts on a subscription. */
export function durationLabel(c: Pick<StripeCoupon, "duration" | "duration_in_months">) {
  if (c.duration === "forever") return "every payment";
  if (c.duration === "repeating") return `the first ${c.duration_in_months} months`;
  return "the first payment";
}

export type CouponStatus = "active" | "scheduled" | "expired" | "used_up" | "inactive";

export function couponStatus(c: StripeCoupon, usage: CouponUsage, now = new Date()): CouponStatus {
  if (!c.active) return "inactive";
  if (c.expires_at && new Date(c.expires_at) <= now) return "expired";
  if (c.max_redemptions !== null && usage.redemptions >= c.max_redemptions) return "used_up";
  if (c.starts_at && new Date(c.starts_at) > now) return "scheduled";
  return "active";
}

/** Returns an error message, or null when the rules are consistent. */
export function validateRules(r: CouponRulesInput): string | null {
  if (r.starts_at && Number.isNaN(Date.parse(r.starts_at))) return "Start date is not a valid date.";
  if (r.expires_at && Number.isNaN(Date.parse(r.expires_at))) return "Expiration date is not a valid date.";
  if (r.starts_at && r.expires_at && Date.parse(r.starts_at) >= Date.parse(r.expires_at)) {
    return "The expiration date must be after the start date.";
  }
  if (r.max_redemptions !== null && (!Number.isInteger(r.max_redemptions) || r.max_redemptions < 1)) {
    return "Usage limit must be a whole number of at least 1.";
  }
  for (const [label, v] of [["Minimum spend", r.min_spend_minor], ["Maximum spend", r.max_spend_minor]] as const) {
    if (v !== null && (!Number.isInteger(v) || v < 0)) return `${label} must be zero or more.`;
  }
  if (r.min_spend_minor !== null && r.max_spend_minor !== null && r.min_spend_minor > r.max_spend_minor) {
    return "Minimum spend cannot be more than maximum spend.";
  }
  return null;
}

export function validateCreate(input: CouponCreateInput): string | null {
  const code = normalizeCode(input.code ?? "");
  if (!CODE_PATTERN.test(code)) {
    return "Code must be 3–40 characters: letters, numbers, dashes or underscores.";
  }
  if (input.discount_type === "percent") {
    const p = input.percent_off;
    if (p === null || !(p > 0 && p <= 100)) return "Percent off must be more than 0 and at most 100.";
  } else if (input.discount_type === "amount") {
    const a = input.amount_off_minor;
    if (a === null || !Number.isInteger(a) || a < 1) return "Amount off must be at least $0.01.";
  } else {
    return "Choose percent or fixed amount.";
  }
  if (!["once", "repeating", "forever"].includes(input.duration)) return "Choose how long the discount lasts.";
  if (input.duration === "repeating") {
    const m = input.duration_in_months;
    if (m === null || !Number.isInteger(m) || m < 1 || m > 36) return "Number of months must be between 1 and 36.";
  }
  return validateRules(input);
}
