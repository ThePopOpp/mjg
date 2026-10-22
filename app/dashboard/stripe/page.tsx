import { SectionHeader } from "@/components/dashboard/section-header";
import { StripeAdmin } from "@/components/stripe-admin/stripe-admin";
import { listAllOffers } from "@/lib/steward/catalogue";
import { isStripeConfigured, isStripeTestMode } from "@/lib/steward/stripe";
import { listCoupons } from "@/lib/stripe-admin/coupons";

export const dynamic = "force-dynamic";
export const metadata = { title: "Stripe — MJG Dashboard" };

// The commerce section. Coupons first; products, orders and reporting join as
// further tabs inside StripeAdmin.
export default async function StripePage() {
  const [coupons, offers] = await Promise.all([listCoupons(), listAllOffers()]);

  const offerOptions = offers
    .filter((o) => o.price_minor > 0 && !o.is_historical_record)
    .map((o) => ({ offerKey: o.offer_key, label: o.label, priceMinor: o.price_minor, inStripe: Boolean(o.stripe_product_id) }));

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Stripe"
        description="Coupon codes for checkout. The discount is created in Stripe; dates, usage limits and spend rules are checked by the site before checkout and can be changed at any time."
      />
      <StripeAdmin
        coupons={coupons}
        offers={offerOptions}
        configured={isStripeConfigured()}
        livemode={isStripeConfigured() && !isStripeTestMode()}
      />
    </div>
  );
}
