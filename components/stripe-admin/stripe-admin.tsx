"use client";

import { FlaskConical, AlertTriangle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CouponsAdmin, type OfferOption } from "@/components/stripe-admin/coupons-admin";
import type { CouponWithUsage } from "@/lib/stripe-admin/coupon-rules";

// Tab shell for /dashboard/stripe. New areas (Products, Orders, Reports) are
// added here as further tabs.
export function StripeAdmin({
  coupons,
  offers,
  configured,
  livemode,
}: {
  coupons: CouponWithUsage[];
  offers: OfferOption[];
  configured: boolean;
  livemode: boolean;
}) {
  return (
    <div className="space-y-4">
      {!configured ? (
        <div className="flex items-start gap-2.5 rounded-lg border border-destructive/40 bg-destructive/5 p-3.5 text-sm">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
          <p>Stripe is not configured on this server (STRIPE_SECRET_KEY is missing), so coupons cannot be created.</p>
        </div>
      ) : !livemode ? (
        <div className="flex items-start gap-2.5 rounded-lg border border-amber-500/40 bg-amber-500/5 p-3.5 text-sm">
          <FlaskConical className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <p>
            <strong>Stripe test mode.</strong> Coupons made here are created in Stripe&rsquo;s test mode and only work
            with test checkouts. Live coupons are made on the live site.
          </p>
        </div>
      ) : null}

      <Tabs defaultValue="coupons">
        <TabsList>
          <TabsTrigger value="coupons">Coupons</TabsTrigger>
        </TabsList>
        <TabsContent value="coupons" className="mt-4">
          <CouponsAdmin initial={coupons} offers={offers} livemode={livemode} disabled={!configured} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
