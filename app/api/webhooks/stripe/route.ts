import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { constructWebhookEvent } from "@/lib/steward/stripe";
import {
  findOrderBySubscription,
  markOrderStatus,
  revokeEntitlements,
  upsertOrderFromSession,
} from "@/lib/steward/orders";

// Stripe webhook — the only thing in this app that may record a payment.
//
// WHY THIS EXISTS RATHER THAN TRUSTING THE RETURN URL. After Checkout, Stripe
// redirects the browser to our success page. That redirect is user-controllable:
// anyone can type the success URL. So the success page only ever *reads* state,
// and the entitlement comes from here, where the signature proves Stripe sent it.
//
// Three properties this handler has to have, because Stripe guarantees
// at-least-once delivery and nothing stronger:
//   1. Signature-verified before anything is read.
//   2. Idempotent — every event is recorded by its Stripe id, and a redelivery
//      of an id already processed returns 200 without re-running.
//   3. Fast and forgiving — unknown event types are acknowledged, not failed,
//      so Stripe does not disable the endpoint over events we do not handle.

export const dynamic = "force-dynamic";
// The raw body is required for signature verification; any framework that
// re-serialises it breaks the signature.
export const runtime = "nodejs";

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("stripe-signature");

  let event: Stripe.Event;
  try {
    event = constructWebhookEvent(rawBody, signature);
  } catch (error) {
    // 400 so Stripe retries only if it was a transport problem; a genuinely bad
    // signature will keep failing, which is what we want to see in the logs.
    const message = error instanceof Error ? error.message : "Invalid signature.";
    return NextResponse.json({ error: `Webhook signature verification failed: ${message}` }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();

  // Record first. If handling then throws, the row carries the error and the
  // payload is still there to replay from.
  const { data: seen } = await supabase
    .from("steward_stripe_events")
    .select("id, processed_at")
    .eq("id", event.id)
    .maybeSingle();

  if (seen?.processed_at) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  if (!seen) {
    await supabase.from("steward_stripe_events").insert({
      id: event.id,
      type: event.type,
      payload: event as unknown as Record<string, unknown>,
    });
  }

  try {
    await handleEvent(event);
    await supabase
      .from("steward_stripe_events")
      .update({ processed_at: new Date().toISOString(), error: null })
      .eq("id", event.id);
    return NextResponse.json({ received: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await supabase.from("steward_stripe_events").update({ error: message }).eq("id", event.id);
    // 500 so Stripe retries. The event row keeps the payload either way.
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

async function handleEvent(event: Stripe.Event): Promise<void> {
  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded": {
      const session = event.data.object as Stripe.Checkout.Session;

      // Our own identifiers, set when the session was created. Without them the
      // payment cannot be attributed, so this is a hard failure rather than a
      // silent skip.
      const userId = session.metadata?.steward_user_id;
      const offerKey = session.metadata?.steward_offer_key;
      if (!userId || !offerKey) {
        throw new Error(`Checkout session ${session.id} is missing steward_user_id / steward_offer_key metadata.`);
      }

      // THE CHECK THAT MATTERS. checkout.session.completed fires for delayed
      // payment methods too, with payment_status 'unpaid' and the money landing
      // minutes or days later. Granting on 'completed' alone would hand out paid
      // access before the funds exist.
      const paid = session.payment_status === "paid" || session.payment_status === "no_payment_required";

      await upsertOrderFromSession({
        userId,
        offerKey,
        sessionId: session.id,
        paymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : null,
        subscriptionId: typeof session.subscription === "string" ? session.subscription : null,
        customerId: typeof session.customer === "string" ? session.customer : null,
        amountMinor: session.amount_total ?? 0,
        currency: (session.currency ?? "usd").toUpperCase(),
        status: paid ? "paid" : "pending",
        paidAt: paid ? new Date(event.created * 1000) : null,
        couponId: session.metadata?.steward_coupon_id ?? null,
        couponCode: session.metadata?.steward_coupon_code ?? null,
        discountMinor: session.total_details?.amount_discount ?? 0,
        // Frozen copy of what was agreed. purchased_terms_immutable: a later
        // catalogue edit must never change what this person bought.
        acceptedTerms: {
          offer_key: offerKey,
          amount_total: session.amount_total,
          amount_subtotal: session.amount_subtotal,
          coupon_code: session.metadata?.steward_coupon_code ?? null,
          currency: session.currency,
          mode: session.mode,
          billing_summary: session.metadata?.steward_billing_summary ?? null,
          accepted_at: new Date(event.created * 1000).toISOString(),
        },
      });

      // Deliberately no entitlement here. Benefits start at explicit ACTIVATION,
      // which is a separate member action — activating is what closes the
      // unused-purchase refund window, so it is never done on someone's behalf.
      return;
    }

    case "checkout.session.async_payment_failed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const supabase = createSupabaseAdminClient();
      const { data } = await supabase
        .from("steward_orders")
        .select("id")
        .eq("stripe_checkout_session_id", session.id)
        .maybeSingle();
      if (data) await markOrderStatus(data.id as string, "failed");
      return;
    }

    case "invoice.paid": {
      // A renewal settled. renewal_grant.source = CONFIRMED_QUALIFYING_INVOICE,
      // and the granted interval is the invoice's ACTUAL reconciled period —
      // not a period we compute — so the two can never drift.
      const invoice = event.data.object as Stripe.Invoice;

      // Only renewals. The FIRST period is granted at activation, which the
      // member chooses when to start; granting it here as well would start
      // their Premium before they asked.
      if (invoice.billing_reason !== "subscription_cycle") return;

      // Since the 2025 API versions the subscription lives under
      // parent.subscription_details; older payloads carry it at the top level.
      // Reading only the old field silently skipped every renewal.
      const legacy = (invoice as { subscription?: unknown }).subscription;
      const nested = invoice.parent?.subscription_details?.subscription;
      const subscriptionId =
        typeof nested === "string" ? nested : nested?.id ?? (typeof legacy === "string" ? legacy : null);
      if (!subscriptionId) return;

      const order = await findOrderBySubscription(subscriptionId);
      if (!order) return;

      const line = invoice.lines?.data?.[0];
      const start = line?.period?.start ? new Date(line.period.start * 1000) : null;
      const end = line?.period?.end ? new Date(line.period.end * 1000) : null;
      if (!start || !end) return;

      const { grantEntitlement } = await import("@/lib/steward/orders");
      await grantEntitlement({
        userId: order.user_id as string,
        benefit: "premium",
        source: "purchase",
        sourceOrderId: order.id as string,
        startsAt: start,
        endsAt: end,
      });
      return;
    }

    case "invoice.payment_failed": {
      // Deliberately does NOT revoke. The renewal grace runs from the prior
      // paid-through end, and retries must not reset it, so expiry is decided by
      // the entitlement's own ends_at plus the grace — not by this event. Acting
      // here would cut access off early and reset the clock on every retry.
      return;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const order = await findOrderBySubscription(subscription.id);
      if (!order) return;
      // Future renewals stop; the purchased term is preserved, which is the
      // documented cancel default (STOP_FUTURE_RENEWAL_PRESERVE_PURCHASED_TERM).
      // The existing premium entitlement keeps its own ends_at.
      await markOrderStatus(order.id as string, "canceled");
      return;
    }

    case "customer.subscription.created":
    case "customer.subscription.updated": {
      // Recorded by the event log above. Nothing to decide: the subscription's
      // state is evidence, and entitlement is computed from orders, activations
      // and invoices rather than mirrored from it.
      return;
    }

    case "charge.refunded": {
      const charge = event.data.object as Stripe.Charge;
      const paymentIntentId = typeof charge.payment_intent === "string" ? charge.payment_intent : null;
      if (!paymentIntentId) return;

      const supabase = createSupabaseAdminClient();
      const { data: order } = await supabase
        .from("steward_orders")
        .select("id, user_id, amount_minor")
        .eq("stripe_payment_intent_id", paymentIntentId)
        .maybeSingle();
      if (!order) return;

      const fullyRefunded = charge.amount_refunded >= charge.amount;
      await markOrderStatus(order.id as string, fullyRefunded ? "refunded" : "partially_refunded");

      if (fullyRefunded) {
        // initial_full_unwind_source_qualification: REMOVE_ONLY_AFFECTED_SOURCE
        // — scoped to this order, so refunding a renewal cannot strip the
        // original full acquisition bought under a different order.
        await revokeEntitlements({
          userId: order.user_id as string,
          sourceOrderId: order.id as string,
          reason: `Refunded in full (charge ${charge.id}).`,
        });
      }
      return;
    }

    case "charge.dispute.created": {
      // Money is being pulled back. Recorded for a human; disputes are not
      // resolved automatically.
      return;
    }

    default:
      // Acknowledge anything we do not handle. Failing here would make Stripe
      // retry and eventually disable the endpoint over events we never wanted.
      return;
  }
}
