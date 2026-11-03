import type Stripe from "stripe";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { listActiveEntitlements, type ActiveEntitlement } from "@/lib/steward/orders";
import { getStripe, isStripeConfigured } from "@/lib/steward/stripe";

// Purchases & Billing — what a member has bought from MJG (Steward today; books and
// audiobooks later), read for the member themselves. Orders come from steward_orders; live
// subscription state and renewal invoices come from Stripe, which holds the billing facts.
// If Stripe can't be reached the page still shows the orders we recorded.

export type BillingPayment = {
  id: string;
  date: string;
  description: string;
  amountMinor: number;
  currency: string;
  status: string;
  receiptUrl: string | null;
};

export type BillingSubscription = {
  id: string;
  label: string;
  status: Stripe.Subscription.Status;
  amountMinor: number | null;
  currency: string;
  interval: string | null;
  /** Next billing date, or the date it ends when set to cancel. */
  periodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  trialEnd: string | null;
};

export type BillingSummary = {
  payments: BillingPayment[];
  subscriptions: BillingSubscription[];
  entitlements: ActiveEntitlement[];
  totalSpentMinor: number;
  currency: string;
  /** True when a Stripe customer exists, so the Customer Portal can be opened. */
  canManage: boolean;
  /** Set when Stripe couldn't be reached; the orders shown are from our own records. */
  stripeUnavailable: boolean;
};

type OrderRow = {
  id: string;
  offer_key: string;
  amount_minor: number;
  currency: string;
  status: string;
  paid_at: string | null;
  created_at: string;
  stripe_payment_intent_id: string | null;
  stripe_subscription_id: string | null;
  stripe_customer_id: string | null;
  steward_offers: { label: string } | null;
};

const iso = (unix: number | null | undefined) => (unix ? new Date(unix * 1000).toISOString() : null);

/** The member's newest Stripe customer id, from their recorded orders. */
export async function stripeCustomerFor(profileId: string): Promise<string | null> {
  const { data } = await createSupabaseAdminClient()
    .from("steward_orders")
    .select("stripe_customer_id")
    .eq("user_id", profileId)
    .not("stripe_customer_id", "is", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data?.stripe_customer_id as string | null) ?? null;
}

export async function getBillingSummary(profileId: string): Promise<BillingSummary> {
  const supabase = createSupabaseAdminClient();
  const [{ data, error }, entitlements] = await Promise.all([
    supabase
      .from("steward_orders")
      .select("id,offer_key,amount_minor,currency,status,paid_at,created_at,stripe_payment_intent_id,stripe_subscription_id,stripe_customer_id, steward_offers:offer_key(label)")
      .eq("user_id", profileId)
      .neq("status", "pending")
      .order("created_at", { ascending: false }),
    listActiveEntitlements(profileId).catch(() => []),
  ]);
  if (error) throw error;
  const orders = (data ?? []) as unknown as OrderRow[];
  const labelFor = (o: OrderRow) => o.steward_offers?.label ?? "Steward";
  const customers = Array.from(new Set(orders.map((o) => o.stripe_customer_id).filter(Boolean))) as string[];

  // Our own record of each order — the fallback, and the source for one-time payments.
  const recorded: BillingPayment[] = orders.map((o) => ({
    id: o.id,
    date: o.paid_at ?? o.created_at,
    description: labelFor(o),
    amountMinor: o.amount_minor,
    currency: o.currency,
    status: o.status,
    receiptUrl: null,
  }));

  let payments = recorded;
  let subscriptions: BillingSubscription[] = [];
  let stripeUnavailable = false;

  if (isStripeConfigured() && orders.some((o) => o.stripe_customer_id || o.stripe_payment_intent_id)) {
    try {
      const stripe = getStripe();
      const subOrders = orders.filter((o) => o.stripe_subscription_id);
      const [subs, invoices, receipts] = await Promise.all([
        Promise.all(
          Array.from(new Set(subOrders.map((o) => o.stripe_subscription_id as string))).map((id) =>
            stripe.subscriptions.retrieve(id).then((s): Stripe.Subscription | null => s, () => null),
          ),
        ),
        // null = Stripe didn't answer for that customer; their recorded orders stand in.
        Promise.all(customers.map((c) => stripe.invoices.list({ customer: c, limit: 50 }).then((r): Stripe.Invoice[] | null => r.data, () => null))),
        // One-time payments have no invoice; their receipt hangs off the charge.
        Promise.all(
          orders
            .filter((o) => !o.stripe_subscription_id && o.stripe_payment_intent_id)
            .slice(0, 25)
            .map((o) =>
              stripe.paymentIntents
                .retrieve(o.stripe_payment_intent_id as string, { expand: ["latest_charge"] })
                .then((pi) => [o.id, (pi.latest_charge as Stripe.Charge | null)?.receipt_url ?? null] as const)
                .catch(() => [o.id, null] as const),
            ),
        ),
      ]);

      subscriptions = subs
        .filter((s): s is Stripe.Subscription => Boolean(s))
        .map((s) => {
          const item = s.items.data[0];
          const order = subOrders.find((o) => o.stripe_subscription_id === s.id);
          return {
            id: s.id,
            label: order ? labelFor(order) : "Subscription",
            status: s.status,
            amountMinor: item?.price?.unit_amount ?? null,
            currency: (item?.price?.currency ?? order?.currency ?? "usd").toUpperCase(),
            interval: item?.price?.recurring?.interval ?? null,
            periodEnd: iso(item?.current_period_end),
            cancelAtPeriodEnd: s.cancel_at_period_end,
            trialEnd: iso(s.trial_end),
          };
        });

      const receiptByOrder = new Map(receipts);
      const subLabel = new Map(subOrders.map((o) => [o.stripe_subscription_id as string, labelFor(o)]));
      const invoicesMissing = new Set(customers.filter((_, i) => invoices[i] === null));
      const invoicePayments: BillingPayment[] = invoices
        .flatMap((list) => list ?? [])
        .filter((inv) => inv.status === "paid" || inv.status === "open" || inv.status === "uncollectible")
        .map((inv) => {
          const subId = (inv.parent?.subscription_details?.subscription as string | Stripe.Subscription | null | undefined) ?? null;
          const subKey = typeof subId === "string" ? subId : subId?.id ?? null;
          return {
            id: inv.id ?? `${inv.created}`,
            date: iso(inv.status_transitions?.paid_at ?? inv.created) as string,
            description: (subKey && subLabel.get(subKey)) || inv.lines?.data?.[0]?.description || "Invoice",
            amountMinor: inv.status === "paid" ? inv.amount_paid : inv.amount_due,
            currency: inv.currency.toUpperCase(),
            status: inv.status === "paid" ? "paid" : inv.status === "open" ? "due" : "unpaid",
            receiptUrl: inv.hosted_invoice_url ?? null,
          };
        });

      // Subscription orders are covered by their invoices (the first invoice is the checkout),
      // unless Stripe didn't return that customer's invoices.
      const oneTime = recorded
        .filter((p) => {
          const o = orders.find((x) => x.id === p.id);
          return !o?.stripe_subscription_id || (o.stripe_customer_id && invoicesMissing.has(o.stripe_customer_id));
        })
        .map((p) => ({ ...p, receiptUrl: receiptByOrder.get(p.id) ?? null }));
      payments = [...oneTime, ...invoicePayments].sort((a, b) => b.date.localeCompare(a.date));
    } catch (e) {
      console.error("[billing] Stripe lookup failed", e instanceof Error ? e.message : e);
      stripeUnavailable = true;
    }
  }

  const spent = payments.filter((p) => p.status === "paid" || p.status === "partially_refunded");
  return {
    payments,
    subscriptions,
    entitlements,
    totalSpentMinor: spent.reduce((sum, p) => sum + p.amountMinor, 0),
    currency: spent[0]?.currency?.toUpperCase() ?? "USD",
    canManage: customers.length > 0,
    stripeUnavailable,
  };
}
