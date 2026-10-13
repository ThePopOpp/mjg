import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getOffer } from "./catalogue";
import { getActivationPolicy } from "./config";
import { computeActivationWindows } from "./lifecycle";

// Order and entitlement writes.
//
// Everything here is driven by VERIFIED webhook events or by an explicit
// super-admin action. Nothing is driven by a browser redirect, because the
// success URL is user-controllable and granting from it would hand out
// entitlements to anyone who can type.
//
// The docset's separation again: Stripe says what was paid; this module decides
// what that means. A refund revokes an entitlement here, it does not "un-pay" in
// Stripe. An activation starts clocks here, Stripe knows nothing about them.

export type OrderStatus = "pending" | "paid" | "failed" | "refunded" | "partially_refunded" | "canceled";

/**
 * Records a checkout session, or updates the one already recorded.
 *
 * Keyed on the Stripe session id so a redelivered webhook — Stripe guarantees
 * at-least-once, not exactly-once — updates rather than duplicates.
 */
export async function upsertOrderFromSession(input: {
  userId: string;
  offerKey: string;
  sessionId: string;
  paymentIntentId?: string | null;
  subscriptionId?: string | null;
  customerId?: string | null;
  amountMinor: number;
  currency: string;
  status: OrderStatus;
  paidAt: Date | null;
  acceptedTerms: Record<string, unknown>;
}): Promise<{ id: string }> {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("steward_orders")
    .upsert(
      {
        user_id: input.userId,
        offer_key: input.offerKey,
        stripe_checkout_session_id: input.sessionId,
        stripe_payment_intent_id: input.paymentIntentId ?? null,
        stripe_subscription_id: input.subscriptionId ?? null,
        stripe_customer_id: input.customerId ?? null,
        amount_minor: input.amountMinor,
        currency: input.currency,
        status: input.status,
        paid_at: input.paidAt ? input.paidAt.toISOString() : null,
        accepted_terms: input.acceptedTerms,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "stripe_checkout_session_id" },
    )
    .select("id")
    .single();

  if (error) throw error;
  return { id: data.id as string };
}

export async function markOrderStatus(
  orderId: string,
  status: OrderStatus,
  patch: { paidAt?: Date | null } = {},
): Promise<void> {
  const supabase = createSupabaseAdminClient();
  const update: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
  if (patch.paidAt !== undefined) update.paid_at = patch.paidAt ? patch.paidAt.toISOString() : null;
  const { error } = await supabase.from("steward_orders").update(update).eq("id", orderId);
  if (error) throw error;
}

export async function findOrderBySubscription(subscriptionId: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("steward_orders")
    .select("id, user_id, offer_key, status, paid_at")
    .eq("stripe_subscription_id", subscriptionId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

// == Entitlements ============================================================

export type BenefitKey = "free_blueprint" | "full_acquisition" | "build_window" | "premium";

/**
 * Grants a benefit.
 *
 * `source` matters as much as the benefit: 'purchase' is backed by an order,
 * 'grant' is a human decision recorded with who and why, and 'role' stands only
 * while a role does. The docset sets models_can_grant = false, so nothing in the
 * agent layer may call this — it is reachable from webhooks and from
 * super-admin-guarded routes only.
 */
export async function grantEntitlement(input: {
  userId: string;
  benefit: BenefitKey;
  source: "purchase" | "grant" | "role";
  sourceOrderId?: string | null;
  startsAt?: Date;
  endsAt?: Date | null;
  grantedBy?: string | null;
  grantReason?: string | null;
  grantTemplate?: string | null;
}): Promise<void> {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("steward_entitlements").insert({
    user_id: input.userId,
    benefit: input.benefit,
    source: input.source,
    source_order_id: input.sourceOrderId ?? null,
    starts_at: (input.startsAt ?? new Date()).toISOString(),
    ends_at: input.endsAt ? input.endsAt.toISOString() : null,
    granted_by: input.grantedBy ?? null,
    grant_reason: input.grantReason ?? null,
    grant_template: input.grantTemplate ?? null,
  });
  if (error) throw error;
}

/**
 * Revokes entitlements, without deleting them.
 *
 * A refund has to leave a trail — "this person had premium and it was withdrawn
 * on this date for this reason" — so rows are marked revoked rather than
 * removed. Deleting would also make the six-axis separation unauditable.
 */
export async function revokeEntitlements(input: {
  userId: string;
  sourceOrderId?: string | null;
  benefit?: BenefitKey;
  reason: string;
}): Promise<number> {
  const supabase = createSupabaseAdminClient();
  let query = supabase
    .from("steward_entitlements")
    .update({ revoked_at: new Date().toISOString(), revoked_reason: input.reason })
    .eq("user_id", input.userId)
    .is("revoked_at", null);

  if (input.sourceOrderId) query = query.eq("source_order_id", input.sourceOrderId);
  if (input.benefit) query = query.eq("benefit", input.benefit);

  const { data, error } = await query.select("id");
  if (error) throw error;
  return (data ?? []).length;
}

export type ActiveEntitlement = {
  benefit: BenefitKey;
  source: string;
  starts_at: string;
  ends_at: string | null;
  grant_reason: string | null;
};

/**
 * What a member is entitled to right now.
 *
 * End-exclusive, matching the lifecycle rules: an entitlement whose ends_at is
 * exactly now has already expired.
 */
export async function listActiveEntitlements(userId: string, at: Date = new Date()): Promise<ActiveEntitlement[]> {
  const supabase = createSupabaseAdminClient();
  const iso = at.toISOString();
  const { data, error } = await supabase
    .from("steward_entitlements")
    .select("benefit, source, starts_at, ends_at, grant_reason")
    .eq("user_id", userId)
    .is("revoked_at", null)
    .lte("starts_at", iso)
    .or(`ends_at.is.null,ends_at.gt.${iso}`);
  if (error) throw error;
  return (data ?? []) as ActiveEntitlement[];
}

export async function hasBenefit(userId: string, benefit: BenefitKey, at: Date = new Date()): Promise<boolean> {
  return (await listActiveEntitlements(userId, at)).some((e) => e.benefit === benefit);
}

// == Activation ==============================================================

export class ActivationError extends Error {}

/**
 * The explicit activation that starts every clock.
 *
 * Idempotent (activation.idempotent = true): the unique constraint on order_id
 * means a double-click or a retried request returns the existing activation
 * rather than restarting someone's term.
 *
 * Deliberately NOT automatic on payment. The docset requires an explicit action
 * — activation is what locks against the unused-purchase refund, so starting it
 * for someone would quietly remove a refund right they still had.
 */
export async function activateOrder(input: {
  orderId: string;
  userId: string;
  at?: Date;
}): Promise<{ activationId: string; alreadyActivated: boolean }> {
  const supabase = createSupabaseAdminClient();

  // OWNERSHIP IS CHECKED BEFORE ANYTHING ELSE, including the idempotency
  // short-circuit. Checking "is it already activated?" first would answer that
  // question for anyone holding an order id that is not theirs — it grants
  // nothing, but it confirms the order exists and that it is activated, which
  // is not ours to disclose.
  const { data: order, error: orderError } = await supabase
    .from("steward_orders")
    .select("id, user_id, offer_key, status, paid_at")
    .eq("id", input.orderId)
    .maybeSingle();
  if (orderError) throw orderError;
  // Same message for "no such order" and "not yours", so the error cannot be
  // used to probe which order ids exist.
  if (!order || order.user_id !== input.userId) throw new ActivationError("Order not found.");

  const { data: existing } = await supabase
    .from("steward_activations")
    .select("id")
    .eq("order_id", input.orderId)
    .maybeSingle();
  if (existing) return { activationId: existing.id as string, alreadyActivated: true };

  if (order.status !== "paid" || !order.paid_at) {
    throw new ActivationError("This order is not paid. Activation requires a confirmed payment.");
  }

  const policy = await getActivationPolicy();
  const at = input.at ?? new Date();

  const paidAt = new Date(order.paid_at as string);
  const deadline = new Date(paidAt.getTime());
  deadline.setUTCDate(deadline.getUTCDate() + policy.activationDeadlineDays);
  if (at.getTime() >= deadline.getTime()) {
    throw new ActivationError(
      `Activation closed on ${deadline.toISOString().slice(0, 10)} — ${policy.activationDeadlineDays} days after payment.`,
    );
  }

  const windows = computeActivationWindows(at, policy);

  const { data: activation, error } = await supabase
    .from("steward_activations")
    .insert({
      order_id: order.id,
      user_id: order.user_id,
      activated_at: windows.activatedAt.toISOString(),
      build_starts_at: windows.buildStartsAt.toISOString(),
      build_ends_at: windows.buildEndsAt.toISOString(),
      premium_starts_at: windows.premiumStartsAt.toISOString(),
      premium_ends_at: windows.premiumEndsAt.toISOString(),
      renewal_anchor_at: windows.renewalAnchorAt.toISOString(),
      policy_version: policy.policyVersion,
    })
    .select("id")
    .single();
  if (error) throw error;

  // Benefits from the offer, each with the window the docset gives it.
  const offer = await getOffer(order.offer_key as string);
  const benefits = offer?.benefits ?? [];

  if (benefits.includes("full_acquisition")) {
    // No expiry: paid_expiry.retain_legitimate_created_blueprint — the full
    // acquisition survives premium ending.
    await grantEntitlement({
      userId: order.user_id as string,
      benefit: "full_acquisition",
      source: "purchase",
      sourceOrderId: order.id as string,
      startsAt: windows.activatedAt,
      endsAt: null,
    });
  }
  if (benefits.includes("build_window")) {
    await grantEntitlement({
      userId: order.user_id as string,
      benefit: "build_window",
      source: "purchase",
      sourceOrderId: order.id as string,
      startsAt: windows.buildStartsAt,
      endsAt: windows.buildEndsAt,
    });
  }
  if (benefits.includes("premium_first_year") || benefits.includes("premium")) {
    await grantEntitlement({
      userId: order.user_id as string,
      benefit: "premium",
      source: "purchase",
      sourceOrderId: order.id as string,
      startsAt: windows.premiumStartsAt,
      endsAt: windows.premiumEndsAt,
    });
  }

  return { activationId: activation.id as string, alreadyActivated: false };
}
