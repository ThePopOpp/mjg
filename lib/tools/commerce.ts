import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { formatPrice, listAllOffers } from "@/lib/steward/catalogue";
import { grantEntitlement, listActiveEntitlements, revokeEntitlements, type BenefitKey } from "@/lib/steward/orders";
import { assessRefund } from "@/lib/steward/lifecycle";
import { getRefundPolicy } from "@/lib/steward/config";
import { getStripe } from "@/lib/steward/stripe";
import { createCoupon, deleteCoupon, listCoupons, updateCouponRules } from "@/lib/stripe-admin/coupons";
import { listBookWaitlist, updateBookWaitlistStatus } from "@/lib/book-waitlist/repository";
import { createUserInvitation } from "@/lib/user-management/repository";
import { isAppRole } from "@/lib/rbac/roles";
import { publicSiteUrl } from "@/lib/public-site/static-pages";
import type { ToolDef } from "./types";

// Customers & orders: the Steward catalogue, orders, refunds and cancellations
// (through Stripe — the Stripe webhook then updates the order and access, as
// for any refund), entitlements (access), coupons, the book waitlist, and
// inviting people. Money and access changes are high risk.

const BENEFITS = ["free_blueprint", "full_acquisition", "build_window", "premium"];
const ORDER_ID = { type: "string", description: "Order id (from orders_list)." };

async function loadOrder(id: string) {
  const supabase = createSupabaseAdminClient();
  const { data: order, error } = await supabase
    .from("steward_orders")
    .select("*, profile:profiles!steward_orders_user_id_fkey(id, email, full_name)")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!order) throw new Error("Order not found.");
  const { data: activation } = await supabase.from("steward_activations").select("activated_at").eq("order_id", id).maybeSingle();
  return { order: order as Record<string, any>, activatedAt: activation?.activated_at ? new Date(activation.activated_at) : null };
}

const catalogue: ToolDef = {
  name: "catalogue_list",
  title: "Products & prices",
  description: "The Steward offers (products) with their prices, billing and whether they're on sale.",
  domain: "commerce",
  inputSchema: { type: "object", properties: {} },
  risk: "read",
  minRole: "super_admin",
  run: async () =>
    (await listAllOffers()).map((o) => ({ ...o, priceFormatted: formatPrice(o.price_minor, o.currency) })),
};

const ordersList: ToolDef = {
  name: "orders_list",
  title: "Orders",
  description: "Recent orders (newest first) with customer, product, amount and status. Filter by customer email or status.",
  domain: "commerce",
  inputSchema: {
    type: "object",
    properties: {
      email: { type: "string" },
      status: { type: "string", description: "pending, paid, failed, refunded, …" },
      limit: { type: "integer", minimum: 1, maximum: 200 },
    },
  },
  risk: "read",
  minRole: "super_admin",
  run: async (a: { email?: string; status?: string; limit?: number }) => {
    const supabase = createSupabaseAdminClient();
    let userIds: string[] | null = null;
    if (a.email) {
      const { data } = await supabase.from("profiles").select("id").ilike("email", a.email.trim());
      userIds = (data ?? []).map((p) => p.id);
      if (!userIds.length) return [];
    }
    let query = supabase
      .from("steward_orders")
      .select("id, offer_key, amount_minor, currency, status, paid_at, created_at, stripe_subscription_id, profile:profiles!steward_orders_user_id_fkey(email, full_name)")
      .order("created_at", { ascending: false })
      .limit(a.limit ?? 50);
    if (userIds) query = query.in("user_id", userIds);
    if (a.status) query = query.eq("status", a.status);
    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []).map((o: any) => ({ ...o, amount: formatPrice(o.amount_minor, o.currency) }));
  },
};

const orderGet: ToolDef = {
  name: "orders_get",
  title: "One order",
  description: "An order's details, the customer's current access (entitlements), and whether a refund is within policy.",
  domain: "commerce",
  inputSchema: { type: "object", properties: { id: ORDER_ID }, required: ["id"] },
  risk: "read",
  minRole: "super_admin",
  run: async (a: { id: string }) => {
    const { order, activatedAt } = await loadOrder(a.id);
    const entitlements = await listActiveEntitlements(order.user_id);
    const refund = order.paid_at
      ? assessRefund({ requestedAt: new Date(), paidAt: new Date(order.paid_at), activatedAt, policy: await getRefundPolicy() })
      : null;
    return { order: { ...order, amount: formatPrice(order.amount_minor, order.currency) }, activatedAt, entitlements, refundPolicy: refund };
  },
};

const refund: ToolDef = {
  name: "orders_refund",
  title: "Refund an order",
  description:
    "Refunds a paid order through Stripe (full, or a partial amount in cents). The Stripe webhook then marks the order refunded and removes the access it gave. Preview shows the amount and the refund-policy assessment.",
  domain: "commerce",
  inputSchema: {
    type: "object",
    properties: {
      id: ORDER_ID,
      amount_minor: { type: "integer", minimum: 1, description: "Partial refund in cents; omit for the full amount." },
      reason: { type: "string", description: "Why (kept with the refund in Stripe)." },
    },
    required: ["id"],
  },
  risk: "high",
  minRole: "super_admin",
  summarize: (a: { amount_minor?: number }) => `Refund ${a.amount_minor ? formatPrice(a.amount_minor) : "the full amount"} of this order to the customer's card`,
  preview: async (a: { id: string; amount_minor?: number }) => {
    const { order, activatedAt } = await loadOrder(a.id);
    if (order.status !== "paid") throw new Error(`Only paid orders can be refunded (this one is ${order.status}).`);
    if (!order.stripe_payment_intent_id) throw new Error("This order has no Stripe payment to refund.");
    if (a.amount_minor && a.amount_minor > order.amount_minor) throw new Error("The refund is larger than the order.");
    const policy = assessRefund({ requestedAt: new Date(), paidAt: new Date(order.paid_at), activatedAt, policy: await getRefundPolicy() });
    return {
      customer: order.profile?.email,
      product: order.offer_key,
      paid: formatPrice(order.amount_minor, order.currency),
      refund: formatPrice(a.amount_minor ?? order.amount_minor, order.currency),
      withinPolicy: policy,
    };
  },
  run: async (a: { id: string; amount_minor?: number; reason?: string }, ctx) => {
    const { order } = await loadOrder(a.id);
    if (order.status !== "paid" || !order.stripe_payment_intent_id) throw new Error("This order can't be refunded.");
    const refundObj = await getStripe().refunds.create(
      {
        payment_intent: order.stripe_payment_intent_id,
        ...(a.amount_minor ? { amount: a.amount_minor } : {}),
        reason: "requested_by_customer",
        metadata: { mjg_order_id: order.id, requested_by: ctx.actorEmail, note: (a.reason ?? "").slice(0, 400) },
      },
      { idempotencyKey: `mjg-refund-${order.id}-${a.amount_minor ?? "full"}` },
    );
    return { refundId: refundObj.id, status: refundObj.status, amount: formatPrice(refundObj.amount, refundObj.currency.toUpperCase()) };
  },
};

const cancelSubscription: ToolDef = {
  name: "orders_cancel_subscription",
  title: "Cancel a subscription",
  description: "Cancels the subscription behind an order — at the end of the paid period (default) or immediately.",
  domain: "commerce",
  inputSchema: { type: "object", properties: { id: ORDER_ID, immediately: { type: "boolean" } }, required: ["id"] },
  risk: "high",
  minRole: "super_admin",
  summarize: (a: { immediately?: boolean }) => (a.immediately ? "Cancel this subscription immediately" : "Cancel this subscription at the end of its paid period"),
  preview: async (a: { id: string }) => {
    const { order } = await loadOrder(a.id);
    if (!order.stripe_subscription_id) throw new Error("This order isn't a subscription.");
    const sub = await getStripe().subscriptions.retrieve(order.stripe_subscription_id);
    return { customer: order.profile?.email, product: order.offer_key, status: sub.status, cancelAtPeriodEnd: sub.cancel_at_period_end };
  },
  run: async (a: { id: string; immediately?: boolean }) => {
    const { order } = await loadOrder(a.id);
    if (!order.stripe_subscription_id) throw new Error("This order isn't a subscription.");
    const stripe = getStripe();
    const sub = a.immediately
      ? await stripe.subscriptions.cancel(order.stripe_subscription_id)
      : await stripe.subscriptions.update(order.stripe_subscription_id, { cancel_at_period_end: true });
    return { status: sub.status, cancelAtPeriodEnd: sub.cancel_at_period_end };
  },
};

const grant: ToolDef = {
  name: "access_grant",
  title: "Give someone access",
  description: "Grants a person a Steward benefit (free_blueprint, full_acquisition, build_window, premium) without a purchase — e.g. a comp or a fix.",
  domain: "commerce",
  inputSchema: {
    type: "object",
    properties: {
      user_id: { type: "string", description: "profiles.id" },
      benefit: { type: "string", enum: BENEFITS },
      ends_at: { type: "string", description: "ISO date-time; omit for no end." },
      reason: { type: "string" },
    },
    required: ["user_id", "benefit", "reason"],
  },
  risk: "high",
  minRole: "super_admin",
  summarize: (a: { benefit: string; ends_at?: string }) => `Grant ${a.benefit}${a.ends_at ? ` until ${a.ends_at}` : ""}`,
  run: async (a: { user_id: string; benefit: BenefitKey; ends_at?: string; reason: string }, ctx) => {
    await grantEntitlement({
      userId: a.user_id,
      benefit: a.benefit,
      source: "grant",
      endsAt: a.ends_at ? new Date(a.ends_at) : null,
      grantedBy: ctx.actorId,
      grantReason: a.reason,
    });
    return { ok: true, access: await listActiveEntitlements(a.user_id) };
  },
};

const revoke: ToolDef = {
  name: "access_revoke",
  title: "Remove someone's access",
  description: "Removes a person's Steward access — one benefit, or everything from one order.",
  domain: "commerce",
  inputSchema: {
    type: "object",
    properties: { user_id: { type: "string" }, benefit: { type: "string", enum: BENEFITS }, order_id: { type: "string" }, reason: { type: "string" } },
    required: ["user_id", "reason"],
  },
  risk: "high",
  minRole: "super_admin",
  summarize: (a: { benefit?: string; order_id?: string }) => `Remove ${a.benefit ?? (a.order_id ? "the access from this order" : "access")}`,
  preview: async (a: { user_id: string }) => ({ currentAccess: await listActiveEntitlements(a.user_id) }),
  run: async (a: { user_id: string; benefit?: BenefitKey; order_id?: string; reason: string }) => ({
    revoked: await revokeEntitlements({ userId: a.user_id, benefit: a.benefit, sourceOrderId: a.order_id ?? null, reason: a.reason }),
  }),
};

const coupons: ToolDef = {
  name: "coupons_list",
  title: "Coupon codes",
  description: "Coupon codes with their discount, dates, limits, spend rules and how often they've been used.",
  domain: "commerce",
  inputSchema: { type: "object", properties: {} },
  risk: "read",
  minRole: "super_admin",
  run: async () => listCoupons(),
};

const RULES = {
  description: { type: ["string", "null"] },
  starts_at: { type: ["string", "null"], description: "ISO date-time or null." },
  expires_at: { type: ["string", "null"] },
  max_redemptions: { type: ["integer", "null"], minimum: 1 },
  once_per_customer: { type: "boolean" },
  min_spend_minor: { type: ["integer", "null"], minimum: 0 },
  max_spend_minor: { type: ["integer", "null"], minimum: 0 },
  active: { type: "boolean" },
};

const couponCreate: ToolDef = {
  name: "coupons_create",
  title: "Create a coupon",
  description: "Creates a coupon code (percentage or fixed amount) in Stripe with MJG's rules: dates, usage limits, spend limits, which products.",
  domain: "commerce",
  inputSchema: {
    type: "object",
    properties: {
      code: { type: "string", description: "3–40 letters/numbers, e.g. WELCOME20." },
      discount_type: { type: "string", enum: ["percent", "amount"] },
      percent_off: { type: ["number", "null"] },
      amount_off_minor: { type: ["integer", "null"], description: "Cents, for a fixed amount." },
      duration: { type: "string", enum: ["once", "repeating", "forever"] },
      duration_in_months: { type: ["integer", "null"] },
      applies_to_offer_keys: { type: "array", items: { type: "string" }, description: "Empty = every product." },
      ...RULES,
    },
    required: ["code", "discount_type", "duration"],
  },
  risk: "write",
  minRole: "super_admin",
  run: async (a: Record<string, any>, ctx) =>
    createCoupon(
      {
        code: a.code,
        description: a.description ?? null,
        discount_type: a.discount_type,
        percent_off: a.percent_off ?? null,
        amount_off_minor: a.amount_off_minor ?? null,
        duration: a.duration,
        duration_in_months: a.duration_in_months ?? null,
        applies_to_offer_keys: a.applies_to_offer_keys ?? [],
        starts_at: a.starts_at ?? null,
        expires_at: a.expires_at ?? null,
        max_redemptions: a.max_redemptions ?? null,
        once_per_customer: a.once_per_customer ?? false,
        min_spend_minor: a.min_spend_minor ?? null,
        max_spend_minor: a.max_spend_minor ?? null,
        active: a.active ?? true,
      },
      ctx.actorId,
    ),
};

const couponRules: ToolDef = {
  name: "coupons_update_rules",
  title: "Change a coupon's rules",
  description: "Changes a coupon's dates, limits, spend rules or on/off switch (the discount itself can't change — make a new coupon).",
  domain: "commerce",
  inputSchema: { type: "object", properties: { id: { type: "string" }, ...RULES }, required: ["id"] },
  risk: "write",
  minRole: "super_admin",
  run: async (a: Record<string, any>) => {
    const current = (await listCoupons()).find((c) => c.id === a.id);
    if (!current) throw new Error("Coupon not found.");
    const pick = <K extends keyof typeof RULES>(k: K) => (k in a ? a[k] : (current as any)[k]);
    return updateCouponRules(a.id, {
      description: pick("description"),
      starts_at: pick("starts_at"),
      expires_at: pick("expires_at"),
      max_redemptions: pick("max_redemptions"),
      once_per_customer: pick("once_per_customer"),
      min_spend_minor: pick("min_spend_minor"),
      max_spend_minor: pick("max_spend_minor"),
      active: pick("active"),
    });
  },
};

const couponDelete: ToolDef = {
  name: "coupons_delete",
  title: "Delete a coupon",
  description: "Deletes a coupon code (in Stripe too). It can no longer be used.",
  domain: "commerce",
  inputSchema: { type: "object", properties: { id: { type: "string" } }, required: ["id"] },
  risk: "high",
  minRole: "super_admin",
  summarize: () => "Delete this coupon code",
  run: async (a: { id: string }) => {
    await deleteCoupon(a.id);
    return { ok: true };
  },
};

const waitlist: ToolDef = {
  name: "book_waitlist_list",
  title: "Book waitlist",
  description: "People waiting for the book: name, email, formats wanted, status and when they joined.",
  domain: "people",
  inputSchema: { type: "object", properties: { limit: { type: "integer", minimum: 1, maximum: 1000 } } },
  risk: "read",
  minRole: "super_admin",
  run: async (a: { limit?: number }) => listBookWaitlist(a.limit ?? 200),
};

const waitlistStatus: ToolDef = {
  name: "book_waitlist_set_status",
  title: "Update a waitlist entry",
  description: "Sets a book-waitlist entry's status (e.g. contacted, fulfilled).",
  domain: "people",
  inputSchema: { type: "object", properties: { id: { type: "string" }, status: { type: "string" } }, required: ["id", "status"] },
  risk: "write",
  minRole: "super_admin",
  run: async (a: { id: string; status: string }) => updateBookWaitlistStatus(a.id, a.status as never),
};

const invite: ToolDef = {
  name: "users_invite",
  title: "Invite someone to the dashboard",
  description: "Invites a person with a role (participant, facilitator, team_member, content_reviewer, admin, super_admin) by email or SMS. Admin roles are high trust.",
  domain: "people",
  inputSchema: {
    type: "object",
    properties: {
      email: { type: "string" },
      phone: { type: "string" },
      role: { type: "string" },
      method: { type: "string", enum: ["email", "sms", "manual"] },
      send_at: { type: "string", description: "ISO date-time to send the invite later." },
    },
    required: ["role"],
  },
  risk: "high",
  minRole: "super_admin",
  summarize: (a: { email?: string; phone?: string; role: string }) => `Invite ${a.email ?? a.phone} as ${a.role}`,
  run: async (a: { email?: string; phone?: string; role: string; method?: "email" | "sms" | "manual"; send_at?: string }, ctx) => {
    if (!isAppRole(a.role)) throw new Error(`Unknown role "${a.role}".`);
    return createUserInvitation({
      email: a.email,
      phone: a.phone,
      role: a.role,
      inviteMethod: a.method ?? (a.email ? "email" : "sms"),
      invitedBy: ctx.actorId,
      siteUrl: publicSiteUrl(),
      scheduledSendAt: a.send_at ?? null,
    });
  },
};

export const COMMERCE_TOOLS: ToolDef[] = [
  catalogue,
  ordersList,
  orderGet,
  refund,
  cancelSubscription,
  grant,
  revoke,
  coupons,
  couponCreate,
  couponRules,
  couponDelete,
  waitlist,
  waitlistStatus,
  invite,
];
