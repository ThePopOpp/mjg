import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarClock, CreditCard, Receipt, Sparkles } from "lucide-react";
import { MetricCard } from "@/components/dashboard/metric-card";
import { SectionHeader } from "@/components/dashboard/section-header";
import { StatCardRow } from "@/components/dashboard/stat-card-row";
import { ManageBillingButton } from "@/components/billing/manage-billing-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { buttonVariants } from "@/components/ui/button";
import { getCurrentProfile } from "@/lib/auth/server";
import { getBillingSummary, type BillingSubscription } from "@/lib/billing/purchases";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

// Purchases & Billing, in every dashboard: what this person has spent, when they're billed
// next, and a way into Stripe's Customer Portal to manage the subscription and card.

const money = (minor: number, currency = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: currency.toUpperCase() }).format(minor / 100);
const day = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—");

const BENEFIT_LABELS: Record<string, string> = {
  free_blueprint: "Free Blueprint",
  full_acquisition: "Full Blueprint",
  build_window: "Build window",
  premium: "Steward Premium",
};

const STATUS_LABELS: Record<string, string> = {
  paid: "Paid",
  due: "Payment due",
  unpaid: "Unpaid",
  refunded: "Refunded",
  partially_refunded: "Partly refunded",
  failed: "Failed",
  canceled: "Canceled",
};

function subscriptionLine(s: BillingSubscription) {
  if (s.status === "canceled") return `Ended ${day(s.periodEnd)}`;
  if (s.cancelAtPeriodEnd) return `Ends ${day(s.periodEnd)} — won't renew`;
  if (s.status === "trialing") return `Free trial until ${day(s.trialEnd)}, then billed ${day(s.periodEnd)}`;
  if (s.status === "past_due" || s.status === "unpaid") return "Payment failed — update your card to keep it active";
  return `Next billing date ${day(s.periodEnd)}`;
}

export default async function BillingPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=/dashboard/billing");
  const summary = await getBillingSummary(profile.id);
  const live = summary.subscriptions.filter((s) => s.status !== "canceled" && s.status !== "incomplete_expired");
  const next = live
    .filter((s) => !s.cancelAtPeriodEnd && s.periodEnd)
    .sort((a, b) => (a.periodEnd ?? "").localeCompare(b.periodEnd ?? ""))[0];
  const premium = summary.entitlements.find((e) => e.benefit === "premium");
  const hasAnything = summary.payments.length > 0 || summary.subscriptions.length > 0 || summary.entitlements.length > 0;

  return (
    <div className="space-y-6">
      <SectionHeader title="Purchases & Billing" description="What you've bought, when you're billed next, and where to manage your subscription and payment method." />

      {summary.stripeUnavailable ? (
        <p className="rounded-lg border border-[#b88a4a]/40 bg-[#b88a4a]/10 px-4 py-2 text-sm">
          We couldn&rsquo;t reach our payment provider just now, so this shows the purchases we&rsquo;ve recorded. Renewal dates may be missing.
        </p>
      ) : null}

      <StatCardRow className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <MetricCard label="Total spent" value={money(summary.totalSpentMinor, summary.currency)} detail={`${summary.payments.filter((p) => p.status === "paid").length} payment(s)`} icon={Receipt} />
        <MetricCard
          label="Next billing date"
          value={next ? day(next.periodEnd) : "—"}
          detail={next ? `${next.label}${next.amountMinor != null ? ` · ${money(next.amountMinor, next.currency)}` : ""}` : "Nothing scheduled"}
          icon={CalendarClock}
        />
        <MetricCard
          label="Steward"
          value={premium ? "Premium" : summary.entitlements.length ? BENEFIT_LABELS[summary.entitlements[0].benefit] ?? "Active" : "Not active"}
          detail={premium ? (premium.ends_at ? `Through ${day(premium.ends_at)}` : "No end date") : "See plans to get started"}
          icon={Sparkles}
        />
      </StatCardRow>

      {!hasAnything ? (
        <Card>
          <CardContent className="flex flex-col items-start gap-3 p-6">
            <p className="font-medium">No purchases yet</p>
            <p className="text-sm text-muted-foreground text-pretty">When you buy Steward, your receipts, renewal dates and subscription settings will be here.</p>
            <Link href="/meet-steward" className={buttonVariants({ variant: "outline", size: "sm" })}>Explore Steward</Link>
          </CardContent>
        </Card>
      ) : null}

      {summary.subscriptions.length || summary.canManage ? (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-base"><CreditCard className="h-4 w-4 text-[#b88a4a]" />Subscription</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {summary.subscriptions.map((s) => (
              <div key={s.id} className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b pb-3 last:border-b-0">
                <div>
                  <p className="font-medium">{s.label}</p>
                  <p className={cn("text-sm", s.status === "past_due" || s.status === "unpaid" ? "text-destructive" : "text-muted-foreground")}>{subscriptionLine(s)}</p>
                </div>
                {s.amountMinor != null ? (
                  <p className="text-sm tabular-nums">{money(s.amountMinor, s.currency)}{s.interval ? ` / ${s.interval}` : ""}</p>
                ) : null}
              </div>
            ))}
            {summary.canManage ? (
              <div className="space-y-2">
                <ManageBillingButton />
                <p className="text-xs text-muted-foreground text-pretty">Opens our secure billing page from Stripe, where you can update your card, download invoices, or cancel.</p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      {summary.payments.length ? (
        <Card>
          <CardHeader><CardTitle className="text-base">Payment history</CardTitle></CardHeader>
          <CardContent className="px-0 sm:px-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead><span className="sr-only">Receipt</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summary.payments.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="whitespace-nowrap">{day(p.date)}</TableCell>
                    <TableCell>{p.description}</TableCell>
                    <TableCell className="text-right tabular-nums">{money(p.amountMinor, p.currency)}</TableCell>
                    <TableCell>{STATUS_LABELS[p.status] ?? p.status}</TableCell>
                    <TableCell className="text-right">
                      {p.receiptUrl ? (
                        <a href={p.receiptUrl} target="_blank" rel="noreferrer" className="text-sm font-medium text-[#8a6532] hover:underline dark:text-[#e2ca9a]">Receipt</a>
                      ) : null}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
