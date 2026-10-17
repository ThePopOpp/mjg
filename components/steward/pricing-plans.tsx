"use client";

import * as React from "react";
import { Check, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PlanDetailsDialog } from "@/components/steward/plan-details-dialog";

// The monthly/annual toggle, the plan cards, and the full-width band.
//
// Everything on a card — price, cadence, badge, benefits, the billing sentence
// and the saving — arrives as data from the catalogue. Nothing is written into
// this component, so a price or copy change never needs a code change and the
// disclosure shown cannot drift from what Stripe actually charges.

export type PlanCard = {
  offerKey: string;
  label: string;
  description: string;
  priceLabel: string;
  /** "/mo", "/yr", or null for one-time and free. */
  priceSuffix: string | null;
  billingSummary: string;
  benefits: string[];
  badge: string | null;
  highlight: boolean;
  billingPeriod: "any" | "monthly" | "annual";
  /** 'card' = a column in the grid; 'row' = the full-width band. */
  layout: "card" | "row";
  purchasable: boolean;
  reason: string | null;
  isFree: boolean;
  trialDays: number | null;
  savingLabel: string | null;
  activationNote: string | null;
};

export function PricingPlans({ plans, signedIn }: { plans: PlanCard[]; signedIn: boolean }) {
  // Annual first: it carries the flagship and is the better value on both
  // comparisons, so opening there is honest rather than a dark pattern.
  const [period, setPeriod] = React.useState<"monthly" | "annual">("annual");
  const [busyKey, setBusyKey] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const visible = plans.filter((p) => p.billingPeriod === "any" || p.billingPeriod === period);

  // An offer marked layout:'row' is only a band on the ANNUAL tab, where three
  // plans already fill the grid and the standalone build belongs underneath as
  // a footnote. Month-to-month has two plans, so the build joins them and
  // completes a single three-up row instead of leaving a gap and a stray band.
  //
  // This is a property of the toggle rather than of the offer, which is why it
  // lives here and not in the catalogue.
  const asRow = (p: PlanCard) => p.layout === "row" && period === "annual";

  const cards = visible.filter((p) => !asRow(p));
  const rows = visible.filter(asRow);

  // Match the column count to what is actually there, so two cards never sit in
  // a three-column grid with a hole where the third should be.
  const gridCols =
    cards.length >= 3 ? "md:grid-cols-3" : cards.length === 2 ? "md:grid-cols-2 lg:max-w-3xl" : "md:max-w-md";

  async function choose(plan: PlanCard) {
    if (!signedIn) {
      window.location.href = `/login?next=${encodeURIComponent("/steward/pricing")}`;
      return;
    }
    setBusyKey(plan.offerKey);
    setError(null);
    try {
      const res = await fetch("/api/steward/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ offerKey: plan.offerKey }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.url) throw new Error(json.error || "Could not start checkout.");
      window.location.href = json.url as string;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not start checkout.");
      setBusyKey(null);
    }
  }

  function ctaLabel(plan: PlanCard) {
    if (plan.isFree) return "Start free";
    if (!signedIn) return "Sign in to continue";
    if (plan.trialDays) return `Start ${plan.trialDays}-day trial`;
    return "Choose this plan";
  }

  const bandSection = rows.length ? (
    <div className="mt-8 space-y-4">
      {rows.map((plan) => (
        <section
          key={plan.offerKey}
          className="rounded-2xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-md sm:p-7"
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
            {/* Identity + price */}
            <div className="min-w-0 lg:w-[19rem] lg:shrink-0">
              {plan.badge ? (
                <span className="mb-2 inline-flex rounded-full border bg-background px-2.5 py-0.5 text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">
                  {plan.badge}
                </span>
              ) : null}
              <h3 className="font-serif text-xl">{plan.label}</h3>
              <p className="mt-1.5 flex items-baseline gap-1">
                <span className="text-3xl font-semibold tabular-nums tracking-tight">{plan.priceLabel}</span>
                {plan.priceSuffix ? <span className="text-sm text-muted-foreground">{plan.priceSuffix}</span> : null}
              </p>
            </div>

            {/* What it is */}
            <div className="min-w-0 flex-1">
              <p className="text-sm leading-relaxed text-muted-foreground">{plan.description}</p>
              {plan.benefits.length ? (
                <ul className="mt-3 grid gap-x-6 gap-y-2 sm:grid-cols-2">
                  {plan.benefits.map((b) => (
                    <li key={b} className="flex gap-2.5 text-[13px] leading-snug">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#b88a4a]" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>

            {/* Action */}
            <div className="lg:w-[15rem] lg:shrink-0">
              <Button
                className="w-full"
                variant="outline"
                onClick={() => void choose(plan)}
                disabled={busyKey !== null || (signedIn && !plan.purchasable)}
                title={plan.reason ?? undefined}
              >
                {busyKey === plan.offerKey ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : null}
                {ctaLabel(plan)}
              </Button>
              <div className="mt-1.5">
                <PlanDetailsDialog offerKey={plan.offerKey} planLabel={plan.label} />
              </div>
              <p className="mt-1.5 text-[11.5px] leading-relaxed text-muted-foreground">{plan.billingSummary}</p>
              {signedIn && !plan.purchasable && plan.reason ? (
                <p className="mt-2 text-[11.5px] leading-relaxed text-amber-600 dark:text-amber-500">{plan.reason}</p>
              ) : null}
            </div>
          </div>

          {plan.activationNote ? (
            <p className="mt-4 border-t pt-3 text-[11.5px] leading-relaxed text-muted-foreground">
              {plan.activationNote}
            </p>
          ) : null}
        </section>
      ))}
    </div>
  ) : null;

  return (
    <div>
      {/* Toggle */}
      <div className="flex justify-center">
        <div
          role="tablist"
          aria-label="Billing period"
          className="inline-flex items-center rounded-full border bg-card p-1 shadow-sm"
        >
          {(["monthly", "annual"] as const).map((value) => (
            <button
              key={value}
              role="tab"
              type="button"
              aria-selected={period === value}
              onClick={() => setPeriod(value)}
              className={cn(
                "rounded-full px-5 py-2 text-sm font-semibold transition-colors",
                period === value ? "bg-[#b88a4a] text-white shadow-sm" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {value === "monthly" ? "Month to month" : "Annual"}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <p className="mt-5 text-center text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <div className="mt-9">
        <div className={cn("mx-auto grid gap-6", gridCols)}>
          {cards.map((plan) => (
            <section
              key={plan.offerKey}
              className={cn(
                "relative flex h-full flex-col rounded-2xl border bg-card p-6 transition-shadow",
                plan.highlight
                  ? "border-[#b88a4a] shadow-lg shadow-[#b88a4a]/10 md:-mt-3 md:pb-8"
                  : "shadow-sm hover:shadow-md",
              )}
            >
              {plan.badge ? (
                <span
                  className={cn(
                    "absolute -top-3 left-6 inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider",
                    plan.highlight ? "bg-[#b88a4a] text-white" : "border bg-background text-muted-foreground",
                  )}
                >
                  {plan.highlight ? <Sparkles className="h-3 w-3" /> : null}
                  {plan.badge}
                </span>
              ) : null}

              <h3 className="mt-1 font-serif text-xl">{plan.label}</h3>

              <p className="mt-3 flex items-baseline gap-1">
                <span className="text-4xl font-semibold tabular-nums tracking-tight">{plan.priceLabel}</span>
                {plan.priceSuffix ? <span className="text-sm text-muted-foreground">{plan.priceSuffix}</span> : null}
              </p>

              {plan.savingLabel ? (
                <p className="mt-1.5 text-[13px] font-semibold text-[#b88a4a]">{plan.savingLabel}</p>
              ) : (
                // Holds the baseline so price blocks line up across the row
                // whether or not a card has a saving to show.
                <p className="mt-1.5 text-[13px]">&nbsp;</p>
              )}

              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{plan.description}</p>

              {plan.benefits.length ? (
                <ul className="mt-5 space-y-2">
                  {plan.benefits.map((b) => (
                    <li key={b} className="flex gap-2.5 text-[13px] leading-snug">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#b88a4a]" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              ) : null}

              {/* The CTA is the LAST child of an mt-auto block, so with
                  equal-height cards every button lands on the same line. Put it
                  first and a card with extra fine print lifts its own button
                  clear of its neighbours'. */}
              <div className="mt-auto pt-6">
                <p className="text-[11.5px] leading-relaxed text-muted-foreground">{plan.billingSummary}</p>

                {plan.activationNote ? (
                  <p className="mt-2 text-[11.5px] leading-relaxed text-muted-foreground">{plan.activationNote}</p>
                ) : null}

                {signedIn && !plan.purchasable && plan.reason ? (
                  <p className="mt-2 text-[11.5px] leading-relaxed text-amber-600 dark:text-amber-500">{plan.reason}</p>
                ) : null}

                <Button
                  className={cn("mt-4 w-full", plan.highlight && "bg-[#b88a4a] text-white hover:bg-[#a67c42]")}
                  variant={plan.highlight ? "default" : "outline"}
                  onClick={() => void choose(plan)}
                  disabled={busyKey !== null || (signedIn && !plan.purchasable)}
                  title={plan.reason ?? undefined}
                >
                  {busyKey === plan.offerKey ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : null}
                  {ctaLabel(plan)}
                </Button>

                <div className="mt-1.5">
                  <PlanDetailsDialog offerKey={plan.offerKey} planLabel={plan.label} />
                </div>
              </div>
            </section>
          ))}
        </div>

        {bandSection}
      </div>
    </div>
  );
}
