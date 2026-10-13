import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircle2, Clock, Loader2 } from "lucide-react";
import { getCurrentProfile } from "@/lib/auth/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getActivationPolicy } from "@/lib/steward/config";
import { formatPrice } from "@/lib/steward/catalogue";
import { addCalendarDays } from "@/lib/steward/lifecycle";
import { ActivateButton } from "@/components/steward/activate-button";

export const dynamic = "force-dynamic";
export const metadata = { title: "Thank you — Steward" };

// Where Checkout returns the member.
//
// THIS PAGE GRANTS NOTHING. The redirect here is user-controllable — anyone can
// type this URL with any session_id — so it only ever READS the order the
// webhook already recorded. If the webhook has not arrived yet, it says so
// rather than guessing, because "pending" and "paid" are different facts and the
// docset's persistence axis says a result is reported from its receipt, never
// inferred.

export default async function StewardThankYouPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=/steward/pricing");

  const { session_id: sessionId } = await searchParams;

  const supabase = createSupabaseAdminClient();
  const { data: order } = sessionId
    ? await supabase
        .from("steward_orders")
        .select("id, offer_key, status, amount_minor, currency, paid_at, user_id")
        .eq("stripe_checkout_session_id", sessionId)
        // Scoped to the signed-in member: a guessed session id from someone
        // else's purchase must not reveal anything.
        .eq("user_id", profile.id)
        .maybeSingle()
    : { data: null };

  const { data: activation } = order
    ? await supabase
        .from("steward_activations")
        .select("activated_at, build_ends_at, premium_ends_at")
        .eq("order_id", order.id)
        .maybeSingle()
    : { data: null };

  const policy = await getActivationPolicy().catch(() => null);

  return (
    <main className="mx-auto w-full max-w-2xl px-5 py-12">
      {!order ? (
        <section className="rounded-xl border bg-card p-6 text-center">
          <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
          <h1 className="mt-3 text-xl font-semibold">Confirming your payment…</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            We are waiting for Stripe to confirm. This usually takes a few seconds — refresh in a moment. Nothing is
            lost if you close this page; your receipt is emailed by Stripe either way.
          </p>
        </section>
      ) : order.status !== "paid" ? (
        <section className="rounded-xl border bg-card p-6">
          <Clock className="h-6 w-6 text-amber-600" />
          <h1 className="mt-3 text-xl font-semibold">Payment is still settling</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your payment method confirms after a short delay rather than instantly. We will email you as soon as it
            clears, and your plan becomes available to activate then.
          </p>
        </section>
      ) : (
        <section className="rounded-xl border bg-card p-6">
          <CheckCircle2 className="h-7 w-7 text-emerald-600" />
          <h1 className="mt-3 text-2xl font-semibold tracking-tight">Thank you</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            We received {formatPrice(order.amount_minor as number, (order.currency as string) ?? "USD")}. Stripe has
            emailed your receipt.
          </p>

          {activation ? (
            <div className="mt-5 rounded-lg border bg-muted/40 p-4 text-sm">
              <p className="font-medium">Your plan is active.</p>
              <ul className="mt-2 space-y-1 text-muted-foreground">
                <li>
                  Build window runs until{" "}
                  <strong className="text-foreground">{formatDate(activation.build_ends_at as string)}</strong>
                </li>
                <li>
                  Premium runs until{" "}
                  <strong className="text-foreground">{formatDate(activation.premium_ends_at as string)}</strong>
                </li>
              </ul>
            </div>
          ) : (
            <div className="mt-5 rounded-lg border bg-muted/40 p-4">
              <p className="text-sm font-medium">One more step: activate when you are ready</p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
                Your build window and your first year of Premium both start the moment you activate — not now. That
                means you can take your time: nothing is ticking yet.
                {policy && order.paid_at ? (
                  <>
                    {" "}
                    You have until{" "}
                    <strong className="text-foreground">
                      {formatDate(
                        addCalendarDays(new Date(order.paid_at as string), policy.activationDeadlineDays).toISOString(),
                      )}
                    </strong>{" "}
                    to activate.
                  </>
                ) : null}
              </p>
              <div className="mt-4">
                <ActivateButton orderId={order.id as string} />
              </div>
              <p className="mt-3 text-[11px] leading-snug text-muted-foreground">
                Before you activate you can still request a full refund. Activating starts your term.
              </p>
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-3 text-sm">
            <Link href="/dashboard" className="underline underline-offset-2">
              Go to your dashboard
            </Link>
            <Link href="/terms" className="underline underline-offset-2">
              Terms
            </Link>
          </div>
        </section>
      )}
    </main>
  );
}

function formatDate(iso: string): string {
  // Arizona has no DST, so a fixed -7 renders the billing-local date exactly.
  const local = new Date(new Date(iso).getTime() - 7 * 3600 * 1000);
  return local.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}
