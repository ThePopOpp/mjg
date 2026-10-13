import Link from "next/link";
import { redirect } from "next/navigation";
import { AlertTriangle, Check, FlaskConical } from "lucide-react";
import { getCurrentProfile } from "@/lib/auth/server";
import { checkOfferAvailability, describeBilling, formatPrice, listAllOffers } from "@/lib/steward/catalogue";
import { isStripeTestMode } from "@/lib/steward/stripe";
import { BuyButton } from "@/components/steward/buy-button";

export const dynamic = "force-dynamic";
export const metadata = { title: "Steward plans" };

// Steward plan selection.
//
// Reads the whole catalogue and shows each offer with the exact billing
// sentence generated from its own row, because Terms §7 requires the price,
// interval and any recurring charge to be stated before payment and §8 requires
// auto-renewal to be identified clearly. Generating that sentence from the same
// row Stripe is charged from means the disclosure cannot drift from the charge.
//
// Offers that are not purchasable are shown greyed with the reason rather than
// hidden, so during the build it is obvious WHY nothing is buyable yet — every
// offer in the accepted catalogue ships production_enabled = false.

const BENEFIT_LABEL: Record<string, string> = {
  free_blueprint: "The free three-page Blueprint",
  full_acquisition: "The full 13-page Blueprint, yours to keep",
  build_window: "A guided build window",
  premium_first_year: "Premium for the first year",
  premium: "Premium — keep building and refining",
};

export default async function StewardPricingPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=/steward/pricing");

  const offers = await listAllOffers();
  const visible = offers.filter((o) => o.billing !== "ONE_TIME_PREPAID_NO_AUTORENEW");
  const anyPurchasable = visible.some((o) => checkOfferAvailability(o, profile.role).purchasable);

  return (
    <main className="mx-auto w-full max-w-5xl px-5 py-10">
      <header className="mb-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">Steward</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Choose your plan</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Steward helps you build and live a personal Stewardship Blueprint. Start free, or build the
          full Blueprint with guidance.
        </p>
      </header>

      {isStripeTestMode() ? (
        <div className="mb-6 flex items-start gap-2.5 rounded-lg border border-amber-500/40 bg-amber-500/5 p-3 text-sm">
          <FlaskConical className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <p>
            <strong>Stripe test mode.</strong> No real payment is taken. Use card{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-[12px]">4242 4242 4242 4242</code> with any
            future expiry and any CVC.
          </p>
        </div>
      ) : null}

      {!anyPurchasable ? (
        <div className="mb-6 flex items-start gap-2.5 rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
          <p>
            <strong>No plan is on sale yet.</strong> Every offer in the accepted catalogue ships disabled, and the
            renewal, cancellation and refund terms in Terms §8 have to be finalised before payments are accepted. A
            Super Admin enables each offer once that is done.
          </p>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((offer) => {
          const availability = checkOfferAvailability(offer, profile.role);
          const purchasable = availability.purchasable;
          return (
            <section
              key={offer.offer_key}
              className={`flex flex-col rounded-xl border p-5 ${purchasable ? "bg-card" : "bg-muted/30"}`}
            >
              <h2 className="text-lg font-semibold">{offer.label}</h2>

              <p className="mt-2">
                <span className="text-3xl font-semibold tabular-nums">
                  {offer.price_minor === 0 ? "Free" : formatPrice(offer.price_minor, offer.currency)}
                </span>
                {offer.billing === "RECURRING" ? (
                  <span className="text-sm text-muted-foreground">/{offer.interval === "YEAR" ? "yr" : "mo"}</span>
                ) : null}
              </p>

              <p className="mt-2 text-sm text-muted-foreground">{offer.description}</p>

              {/* The disclosure, generated from the same row Stripe charges. */}
              <p className="mt-3 rounded-md bg-muted/60 p-2.5 text-[12px] leading-relaxed">
                {describeBilling(offer)}
              </p>

              {offer.benefits.length > 0 ? (
                <ul className="mt-4 space-y-1.5">
                  {offer.benefits.map((b) => (
                    <li key={b} className="flex gap-2 text-[13px]">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                      <span>{BENEFIT_LABEL[b] ?? b}</span>
                    </li>
                  ))}
                </ul>
              ) : null}

              {offer.build_days && offer.activation_deadline_days ? (
                <p className="mt-3 text-[11px] leading-snug text-muted-foreground">
                  Your {offer.build_days}-day build window starts when you activate, not when you pay. You have{" "}
                  {offer.activation_deadline_days} days to activate.
                </p>
              ) : null}

              <div className="mt-5 pt-1">
                {offer.billing === "NONE" ? (
                  <Link
                    href="/dashboard"
                    className="inline-flex w-full items-center justify-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
                  >
                    Continue free
                  </Link>
                ) : (
                  <BuyButton
                    offerKey={offer.offer_key}
                    label={offer.trial_days ? `Start ${offer.trial_days}-day trial` : `Choose ${offer.label}`}
                    disabled={!purchasable}
                    disabledReason={purchasable ? undefined : availability.reason}
                  />
                )}
              </div>
            </section>
          );
        })}
      </div>

      <footer className="mt-8 border-t pt-5 text-[12px] leading-relaxed text-muted-foreground">
        <p>
          Prices are shown in USD. The exact amount, billing interval and any recurring charge are confirmed at
          checkout before payment. Cancelling stops future renewals and keeps access for the term already paid for —
          it does not delete your Blueprint.
        </p>
        <p className="mt-2">
          <Link href="/terms" className="underline underline-offset-2">Terms of Service</Link>
          {" · "}
          <Link href="/privacy" className="underline underline-offset-2">Privacy Policy</Link>
        </p>
      </footer>
    </main>
  );
}
