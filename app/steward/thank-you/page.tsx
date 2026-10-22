import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Check, Clock, Loader2 } from "lucide-react";
import { getCurrentProfile } from "@/lib/auth/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getActivationPolicy } from "@/lib/steward/config";
import { describeBilling, formatPrice, getOffer } from "@/lib/steward/catalogue";
import { addCalendarDays } from "@/lib/steward/lifecycle";
import { ActivateButton } from "@/components/steward/activate-button";
import { SITE_CONTENT_BOX, SiteShell } from "@/components/public-site/site-shell";

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
//
// It carries the site chrome rather than floating on a blank page: someone who
// has just paid should still be somewhere recognisable, with a way onward.

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
  // The offer row, so the page names what was bought and repeats the billing
  // sentence from the catalogue rather than describing it in its own words.
  const offer = order ? await getOffer(order.offer_key as string).catch(() => null) : null;

  // What activation actually starts, from the offer's own benefits — a monthly
  // subscription has no build window and no "first year".
  const benefits = offer?.benefits ?? [];
  const hasBuild = benefits.includes("build_window");
  const isSubscription = offer?.billing === "RECURRING";
  const premiumLabel = benefits.includes("premium_first_year")
    ? "your first year of Premium"
    : benefits.includes("premium")
      ? "your Premium"
      : null;
  const buildLabel = hasBuild ? `your ${offer?.build_days ?? policy?.buildDays ?? 30}-day build window` : null;
  const starts = [buildLabel, premiumLabel].filter(Boolean) as string[];
  const startsSentence = starts.length
    ? `${capitalize(starts.join(" and "))} ${starts.length > 1 ? "both start" : "starts"} the moment you activate — not now.`
    : "Your plan starts the moment you activate — not now.";

  return (
    <SiteShell>
      <section className={`${SITE_CONTENT_BOX} py-14 md:py-20`}>
        <div className="mx-auto w-full max-w-2xl">
          {!order ? (
            <Pending />
          ) : order.status !== "paid" ? (
            <Settling />
          ) : (
            <>
              <header className="text-center">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#b88a4a] text-white">
                  <Check className="h-7 w-7" strokeWidth={2.5} />
                </span>
                <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.16em] text-[#b88a4a]">
                  Steward
                </p>
                <h1 className="mt-2.5 font-serif text-4xl leading-tight md:text-5xl">Thank you</h1>
                <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-muted-foreground">
                  We received{" "}
                  <strong className="font-semibold text-foreground">
                    {formatPrice(order.amount_minor as number, (order.currency as string) ?? "USD")}
                  </strong>
                  . Stripe has emailed your receipt.
                </p>
              </header>

              {/* What was bought, in the catalogue's own words. */}
              {offer ? (
                <div className="mt-9 rounded-xl border bg-card">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b px-5 py-4">
                    <p className="font-serif text-lg">{offer.label}</p>
                    <p className="font-serif text-lg tabular-nums">
                      {formatPrice(order.amount_minor as number, (order.currency as string) ?? "USD")}
                    </p>
                  </div>
                  <p className="px-5 py-4 text-[13px] leading-relaxed text-muted-foreground">
                    {describeBilling(offer)}
                  </p>
                </div>
              ) : null}

              {activation ? (
                <div className="mt-6 rounded-xl border border-[#b88a4a]/50 bg-[#b88a4a]/[0.06] p-5">
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#b88a4a]">
                    Your plan is active
                  </p>
                  <dl className="mt-3 space-y-2.5 text-[14px]">
                    {hasBuild ? (
                      <div className="flex flex-wrap justify-between gap-x-4 gap-y-0.5">
                        <dt className="text-muted-foreground">Build window runs until</dt>
                        <dd className="font-medium">{formatDate(activation.build_ends_at as string)}</dd>
                      </div>
                    ) : null}
                    {premiumLabel ? (
                      <div className="flex flex-wrap justify-between gap-x-4 gap-y-0.5">
                        <dt className="text-muted-foreground">
                          {isSubscription ? "Premium paid through" : "Premium runs until"}
                        </dt>
                        <dd className="font-medium">{formatDate(activation.premium_ends_at as string)}</dd>
                      </div>
                    ) : null}
                  </dl>
                  <Link
                    href="/steward"
                    className="mt-5 inline-flex items-center gap-2 rounded-md bg-[#b88a4a] px-4 py-2.5 text-sm font-semibold text-white no-underline transition-colors hover:bg-[#a67c42]"
                  >
                    Start with Steward <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              ) : (
                <div className="mt-6 rounded-xl border border-[#b88a4a]/50 bg-[#b88a4a]/[0.06] p-5">
                  <p className="font-serif text-lg leading-snug">One more step: activate when you are ready</p>
                  <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
                    {startsSentence} That means you can take your time: nothing is ticking yet.
                    {policy && order.paid_at ? (
                      <>
                        {" "}
                        You have until{" "}
                        <strong className="font-semibold text-foreground">
                          {formatDate(
                            addCalendarDays(
                              new Date(order.paid_at as string),
                              policy.activationDeadlineDays,
                            ).toISOString(),
                          )}
                        </strong>{" "}
                        to activate.
                      </>
                    ) : null}
                  </p>
                  <div className="mt-5">
                    <ActivateButton orderId={order.id as string} />
                  </div>
                  <p className="mt-3.5 border-t border-[#b88a4a]/25 pt-3.5 text-[12px] leading-relaxed text-muted-foreground">
                    Before you activate you can still request a full refund. Activating starts your term.
                  </p>
                </div>
              )}

              <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 border-t pt-6 text-[13px]">
                <Link href="/dashboard" className="text-muted-foreground hover:text-[#b88a4a]">
                  Go to your dashboard
                </Link>
                <Link href="/steward/more" className="text-muted-foreground hover:text-[#b88a4a]">
                  Receipts and billing
                </Link>
                <Link href="/terms" className="text-muted-foreground hover:text-[#b88a4a]">
                  Terms
                </Link>
              </div>
            </>
          )}
        </div>
      </section>
    </SiteShell>
  );
}

/** The webhook has not landed yet. Says so rather than guessing. */
function Pending() {
  return (
    <div className="rounded-xl border bg-card p-8 text-center">
      <Loader2 className="mx-auto h-6 w-6 animate-spin text-[#b88a4a]" />
      <h1 className="mt-4 font-serif text-2xl">Confirming your payment…</h1>
      <p className="mx-auto mt-3 max-w-md text-[14px] leading-relaxed text-muted-foreground">
        We are waiting for Stripe to confirm. This usually takes a few seconds — refresh in a moment. Nothing is lost
        if you close this page; your receipt is emailed by Stripe either way.
      </p>
    </div>
  );
}

/** A payment method that confirms on a delay. */
function Settling() {
  return (
    <div className="rounded-xl border bg-card p-8 text-center">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-[#b88a4a]/40 bg-[#b88a4a]/10 text-[#b88a4a]">
        <Clock className="h-6 w-6" />
      </span>
      <h1 className="mt-4 font-serif text-2xl">Payment is still settling</h1>
      <p className="mx-auto mt-3 max-w-md text-[14px] leading-relaxed text-muted-foreground">
        Your payment method confirms after a short delay rather than instantly. We will email you as soon as it
        clears, and your plan becomes available to activate then.
      </p>
    </div>
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

function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
