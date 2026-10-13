import Link from "next/link";
import { AlertTriangle, FlaskConical } from "lucide-react";
import { getCurrentProfile } from "@/lib/auth/server";
import { SITE_CONTENT_BOX, SiteHero, SiteShell } from "@/components/public-site/site-shell";
import {
  annualSaving,
  checkOfferAvailability,
  describeBilling,
  formatPrice,
  listAllOffers,
} from "@/lib/steward/catalogue";
import { isStripeTestMode } from "@/lib/steward/stripe";
import { PricingPlans, type PlanCard } from "@/components/steward/pricing-plans";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Steward plans | Michael J. Gauthier",
  description: "Build and live a personal Stewardship Blueprint. Start free, or build the full Blueprint with guidance.",
};

// Steward pricing.
//
// PUBLIC on purpose. Someone deciding whether to buy has to be able to read the
// prices and the renewal terms before creating an account — a pricing page
// behind a login is a pricing page nobody can price. Signing in only changes
// what you can DO: the buy button becomes checkout, and role-scoped offers such
// as the facilitator trial appear.
//
// Everything on a card comes from the catalogue row: price, cadence, badge,
// benefits, the billing sentence and the saving. Terms §7 requires the exact
// price and any recurring charge to be stated before payment, and generating
// that from the same row Stripe charges is what keeps the two from drifting.

const BENEFIT_LABEL: Record<string, string> = {
  free_blueprint: "The free three-page Blueprint",
  full_acquisition: "The full 13-page Blueprint, yours to keep",
  build_window: "A guided build window with Steward",
  premium_first_year: "A full year of Premium included",
  premium: "Keep building and refining with Steward",
};

export default async function StewardPricingPage() {
  const profile = await getCurrentProfile();
  const offers = await listAllOffers();

  const plans: PlanCard[] = offers
    // Historical rows exist so prior purchases resolve; they are not products.
    .filter((offer) => !offer.is_historical_record)
    .map((offer) => {
      const availability = checkOfferAvailability(offer, profile?.role ?? null);
      const saving = annualSaving(offer, offers);

      const suffix =
        offer.billing === "RECURRING" ? (offer.interval === "YEAR" ? "/yr" : "/mo") : null;

      return {
        offerKey: offer.offer_key,
        label: offer.label,
        description: offer.description,
        priceLabel: offer.price_minor === 0 ? "Free" : formatPrice(offer.price_minor, offer.currency),
        priceSuffix: suffix,
        billingSummary: describeBilling(offer),
        benefits: offer.benefits.map((b) => BENEFIT_LABEL[b] ?? b),
        badge: offer.badge,
        highlight: offer.highlight,
        billingPeriod: offer.billing_period,
        layout: offer.layout,
        purchasable: availability.purchasable,
        reason: availability.purchasable ? null : availability.reason,
        isFree: offer.billing === "NONE",
        trialDays: offer.trial_days,
        savingLabel: saving
          ? `Save ${formatPrice(saving.amountMinor, offer.currency)} vs ${saving.versus}`
          : null,
        // Said on the card, not buried in checkout: the clock starts when you
        // activate, which is also why there is no rush to.
        activationNote:
          offer.build_days && offer.activation_deadline_days
            ? `Your ${offer.build_days}-day build window starts when you activate — not when you pay. You have ${offer.activation_deadline_days} days to activate.`
            : null,
      };
    })
    // Role-scoped offers (the facilitator trial) only appear for that role.
    .filter((plan) => plan.purchasable || plan.reason === null || !plan.reason.includes("only available to"));

  const anyPurchasable = plans.some((p) => p.purchasable);

  return (
    <SiteShell>
      <SiteHero
        eyebrow="Steward"
        align="center"
        title="Build a life you can steward"
        description="Steward is a personal guide for designing and living a Stewardship Blueprint — your faith, relationships, health, resources and legacy, in one place. Start free, or build the full Blueprint with guidance."
      />

      <section className={`${SITE_CONTENT_BOX} pb-20`}>
        {isStripeTestMode() ? (
          <div className="mx-auto mb-8 flex max-w-2xl items-start gap-2.5 rounded-lg border border-amber-500/40 bg-amber-500/5 p-3.5 text-sm">
            <FlaskConical className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <p>
              <strong>Stripe test mode.</strong> No real payment is taken. Use card{" "}
              <code className="rounded bg-muted px-1 py-0.5 font-mono text-[12px]">4242 4242 4242 4242</code> with any
              future expiry and any CVC.
            </p>
          </div>
        ) : null}

        {!anyPurchasable ? (
          <div className="mx-auto mb-8 flex max-w-2xl items-start gap-2.5 rounded-lg border border-destructive/40 bg-destructive/5 p-3.5 text-sm">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
            <p>
              <strong>No plan is on sale yet.</strong> Every offer in the accepted catalogue ships disabled, and the
              renewal, cancellation and refund terms have to be finalised before payments are accepted.
            </p>
          </div>
        ) : null}

        <PricingPlans plans={plans} signedIn={Boolean(profile)} />

        <div className="mx-auto mt-14 max-w-2xl border-t pt-8 text-center text-[13px] leading-relaxed text-muted-foreground">
          <p>
            Prices are in USD. The exact amount and any recurring charge are confirmed at checkout before you pay.
            Cancelling a subscription stops future renewals and keeps the access you have already paid for — it never
            deletes your Blueprint.
          </p>
          <p className="mt-3">
            <Link href="/terms" className="underline underline-offset-2 hover:text-[#b88a4a]">Terms of Service</Link>
            <span className="mx-2">·</span>
            <Link href="/privacy" className="underline underline-offset-2 hover:text-[#b88a4a]">Privacy Policy</Link>
            <span className="mx-2">·</span>
            <Link href="/legal" className="underline underline-offset-2 hover:text-[#b88a4a]">Legal &amp; Trust</Link>
          </p>
        </div>
      </section>
    </SiteShell>
  );
}
