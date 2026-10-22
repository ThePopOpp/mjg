"use client";

import { useMemo, useState } from "react";
import { Loader2, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useDashboardActionToken } from "@/components/layout/dashboard-action-token";
import {
  couponStatus,
  discountLabel,
  durationLabel,
  formatMinor,
  normalizeCode,
  validateCreate,
  validateRules,
  type CouponCreateInput,
  type CouponDuration,
  type CouponRulesInput,
  type CouponStatus,
  type CouponWithUsage,
  type DiscountType,
} from "@/lib/stripe-admin/coupon-rules";
import { cn } from "@/lib/utils";

export type OfferOption = { offerKey: string; label: string; priceMinor: number; inStripe: boolean };

const STATUS_LABEL: Record<CouponStatus, string> = {
  active: "Active",
  scheduled: "Scheduled",
  expired: "Expired",
  used_up: "Used up",
  inactive: "Off",
};

function fmtDateTime(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
}

/** ISO → the form's "YYYY-MM-DDTHH:MM", in the admin's own timezone. */
function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromLocalInput(value: string): string | null {
  return value ? new Date(value).toISOString() : null;
}

/**
 * The form keeps "YYYY-MM-DDTHH:MM" (local time); DateTimePicker deals in a
 * separate date and time. A date picked without a time takes `fallbackTime` —
 * start of day for a start date, end of day for an expiry.
 */
function joinDateTime(date: string, time: string, fallbackTime: string): string {
  return date ? `${date}T${time || fallbackTime}` : "";
}

function dollarsToMinor(value: string): number | null {
  if (!value.trim()) return null;
  const n = Number(value);
  return Number.isFinite(n) ? Math.round(n * 100) : NaN;
}

function minorToDollars(minor: number | null): string {
  return minor === null ? "" : (minor / 100).toFixed(2);
}

function intOrNull(value: string): number | null {
  if (!value.trim()) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : NaN;
}

type FormState = {
  code: string;
  description: string;
  discountType: DiscountType;
  percent: string;
  amount: string;
  duration: CouponDuration;
  months: string;
  allOffers: boolean;
  offerKeys: string[];
  startsAt: string;
  expiresAt: string;
  maxRedemptions: string;
  oncePerCustomer: boolean;
  minSpend: string;
  maxSpend: string;
  active: boolean;
};

const EMPTY_FORM: FormState = {
  code: "",
  description: "",
  discountType: "percent",
  percent: "",
  amount: "",
  duration: "once",
  months: "3",
  allOffers: true,
  offerKeys: [],
  startsAt: "",
  expiresAt: "",
  maxRedemptions: "",
  oncePerCustomer: true,
  minSpend: "",
  maxSpend: "",
  active: true,
};

function formFromCoupon(c: CouponWithUsage): FormState {
  return {
    code: c.code,
    description: c.description ?? "",
    discountType: c.discount_type,
    percent: c.percent_off === null ? "" : String(c.percent_off),
    amount: minorToDollars(c.amount_off_minor),
    duration: c.duration,
    months: c.duration_in_months ? String(c.duration_in_months) : "3",
    allOffers: c.applies_to_offer_keys.length === 0,
    offerKeys: c.applies_to_offer_keys,
    startsAt: toLocalInput(c.starts_at),
    expiresAt: toLocalInput(c.expires_at),
    maxRedemptions: c.max_redemptions === null ? "" : String(c.max_redemptions),
    oncePerCustomer: c.once_per_customer,
    minSpend: minorToDollars(c.min_spend_minor),
    maxSpend: minorToDollars(c.max_spend_minor),
    active: c.active,
  };
}

function rulesFromForm(f: FormState): CouponRulesInput {
  return {
    description: f.description.trim() || null,
    starts_at: fromLocalInput(f.startsAt),
    expires_at: fromLocalInput(f.expiresAt),
    max_redemptions: intOrNull(f.maxRedemptions),
    once_per_customer: f.oncePerCustomer,
    min_spend_minor: dollarsToMinor(f.minSpend),
    max_spend_minor: dollarsToMinor(f.maxSpend),
    active: f.active,
  };
}

function createFromForm(f: FormState): CouponCreateInput {
  return {
    ...rulesFromForm(f),
    code: normalizeCode(f.code),
    description: f.description.trim() || null,
    discount_type: f.discountType,
    percent_off: f.discountType === "percent" ? intOrNull(f.percent) : null,
    amount_off_minor: f.discountType === "amount" ? dollarsToMinor(f.amount) : null,
    duration: f.duration,
    duration_in_months: f.duration === "repeating" ? intOrNull(f.months) : null,
    applies_to_offer_keys: f.allOffers ? [] : f.offerKeys,
  };
}

export function CouponsAdmin({
  initial,
  offers,
  livemode,
  disabled,
}: {
  initial: CouponWithUsage[];
  offers: OfferOption[];
  livemode: boolean;
  disabled: boolean;
}) {
  const actionToken = useDashboardActionToken();
  const [coupons, setCoupons] = useState(initial);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<CouponWithUsage | "new" | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const offerLabel = useMemo(() => new Map(offers.map((o) => [o.offerKey, o.label])), [offers]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return coupons;
    return coupons.filter((c) => [c.code, c.description].filter(Boolean).some((v) => String(v).toLowerCase().includes(q)));
  }, [coupons, query]);

  const stats = useMemo(() => {
    const current = coupons.filter((c) => c.stripe_livemode === livemode);
    return {
      active: current.filter((c) => couponStatus(c, c.usage) === "active").length,
      scheduled: current.filter((c) => couponStatus(c, c.usage) === "scheduled").length,
      redemptions: current.reduce((n, c) => n + c.usage.redemptions, 0),
      discount: current.reduce((n, c) => n + c.usage.discountMinor, 0),
    };
  }, [coupons, livemode]);

  async function refresh() {
    const res = await fetch("/api/admin/stripe/coupons", { headers: { "x-mjg-action-token": actionToken ?? "" } });
    const data = await res.json().catch(() => ({}));
    if (res.ok) setCoupons(data.coupons);
  }

  async function toggleActive(c: CouponWithUsage) {
    setBusyId(c.id);
    setError(null);
    try {
      const rules: CouponRulesInput = {
        starts_at: c.starts_at,
        expires_at: c.expires_at,
        max_redemptions: c.max_redemptions,
        once_per_customer: c.once_per_customer,
        min_spend_minor: c.min_spend_minor,
        max_spend_minor: c.max_spend_minor,
        active: !c.active,
      };
      const res = await fetch(`/api/admin/stripe/coupons/${c.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rules, actionToken }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Update failed.");
      setCoupons((rows) => rows.map((r) => (r.id === c.id ? { ...r, ...data.coupon } : r)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed.");
    } finally {
      setBusyId(null);
    }
  }

  async function remove(c: CouponWithUsage) {
    if (!window.confirm(`Delete ${c.code}? This also removes the discount from Stripe.`)) return;
    setBusyId(c.id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/stripe/coupons/${c.id}`, {
        method: "DELETE",
        headers: { "x-mjg-action-token": actionToken ?? "" },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Delete failed.");
      setCoupons((rows) => rows.filter((r) => r.id !== c.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Active codes" value={String(stats.active)} detail={`${stats.scheduled} scheduled`} />
        <Stat label="Redemptions" value={String(stats.redemptions)} detail="Orders that used a code" />
        <Stat label="Discounts given" value={formatMinor(stats.discount)} detail="Total taken off orders" />
        <Stat label="Mode" value={livemode ? "Live" : "Test"} detail={livemode ? "Real payments" : "No real money moves"} />
      </div>

      <Card>
        <CardHeader className="flex-col items-stretch gap-3 space-y-0 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base">Coupon codes ({filtered.length})</CardTitle>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-56">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search codes" className="pl-8" />
            </div>
            <Button onClick={() => setEditing("new")} disabled={disabled}>
              <Plus className="mr-1.5 h-4 w-4" />
              New coupon
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {error ? <p className="px-4 pb-2 text-sm text-destructive">{error}</p> : null}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Applies to</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Spend</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">On</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((c) => {
                  const status = couponStatus(c, c.usage);
                  const otherMode = c.stripe_livemode !== livemode;
                  return (
                    <TableRow key={c.id} className={cn(otherMode && "opacity-60")}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-semibold">{c.code}</span>
                          {!c.stripe_livemode ? <Badge variant="outline" className="text-[10px]">Test</Badge> : null}
                        </div>
                        {c.description ? <p className="mt-0.5 max-w-[16rem] text-xs text-muted-foreground">{c.description}</p> : null}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm">
                        {discountLabel(c)}
                        {c.duration !== "once" ? <p className="text-xs text-muted-foreground">Subscriptions: {durationLabel(c)}</p> : null}
                      </TableCell>
                      <TableCell className="text-sm">
                        {c.applies_to_offer_keys.length
                          ? c.applies_to_offer_keys.map((k) => offerLabel.get(k) ?? k).join(", ")
                          : <span className="text-muted-foreground">All plans</span>}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-xs">
                        <p><span className="text-muted-foreground">Starts </span>{fmtDateTime(c.starts_at) ?? "now"}</p>
                        <p><span className="text-muted-foreground">Expires </span>{fmtDateTime(c.expires_at) ?? "never"}</p>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm">
                        <span className="tabular-nums">{c.usage.redemptions}</span>
                        <span className="text-muted-foreground"> / {c.max_redemptions ?? "∞"}</span>
                        {c.once_per_customer ? <p className="text-xs text-muted-foreground">Once per customer</p> : null}
                        {c.usage.discountMinor ? <p className="text-xs text-muted-foreground">{formatMinor(c.usage.discountMinor)} saved</p> : null}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-xs">
                        {c.min_spend_minor === null && c.max_spend_minor === null ? (
                          <span className="text-muted-foreground">Any</span>
                        ) : (
                          <>
                            {c.min_spend_minor !== null ? <p>Min {formatMinor(c.min_spend_minor)}</p> : null}
                            {c.max_spend_minor !== null ? <p>Max {formatMinor(c.max_spend_minor)}</p> : null}
                          </>
                        )}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <Switch
                          checked={c.active}
                          onCheckedChange={() => void toggleActive(c)}
                          disabled={busyId === c.id}
                          aria-label={`Turn ${c.code} ${c.active ? "off" : "on"}`}
                        />
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-right">
                        {busyId === c.id ? <Loader2 className="inline h-4 w-4 animate-spin text-muted-foreground" /> : null}
                        <Button variant="ghost" size="icon" onClick={() => setEditing(c)} aria-label={`Edit ${c.code}`}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => void remove(c)}
                          disabled={c.usage.redemptions > 0 || busyId === c.id}
                          title={c.usage.redemptions > 0 ? "Used codes are kept for order history. Turn it off instead." : "Delete"}
                          aria-label={`Delete ${c.code}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {!filtered.length ? (
                  <TableRow>
                    <TableCell colSpan={9} className="py-10 text-center text-sm text-muted-foreground">
                      {coupons.length ? "No codes match that search." : "No coupon codes yet. Create one to offer a discount at checkout."}
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {editing ? (
        <CouponDialog
          coupon={editing === "new" ? null : editing}
          offers={offers}
          actionToken={actionToken}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            void refresh();
          }}
        />
      ) : null}
    </div>
  );
}

function CouponDialog({
  coupon,
  offers,
  actionToken,
  onClose,
  onSaved,
}: {
  coupon: CouponWithUsage | null;
  offers: OfferOption[];
  actionToken: string | null | undefined;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isNew = coupon === null;
  const [form, setForm] = useState<FormState>(coupon ? formFromCoupon(coupon) : EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => ({ ...f, [key]: value }));

  async function save() {
    setError(null);
    const problem = isNew ? validateCreate(createFromForm(form)) : validateRules(rulesFromForm(form));
    if (problem) {
      setError(problem);
      return;
    }
    if (isNew && !form.allOffers && !form.offerKeys.length) {
      setError("Choose at least one plan, or select All plans.");
      return;
    }
    setSaving(true);
    try {
      const res = isNew
        ? await fetch("/api/admin/stripe/coupons", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ coupon: createFromForm(form), actionToken }),
          })
        : await fetch(`/api/admin/stripe/coupons/${coupon.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ rules: rulesFromForm(form), actionToken }),
          });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Save failed.");
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed.");
      setSaving(false);
    }
  }

  return (
    <Dialog open onOpenChange={(open) => (!open ? onClose() : undefined)}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isNew ? "New coupon" : `Edit ${coupon.code}`}</DialogTitle>
          <DialogDescription>
            {isNew
              ? "The code, discount and plans are fixed once created, because Stripe cannot change a discount after the fact. Dates, limits and spend rules can be edited any time."
              : "The discount itself is fixed. To change it, create a new code and turn this one off."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* The discount (fixed after creation) */}
          <section className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Code" hint="What buyers type. Letters, numbers, - and _.">
                <Input
                  value={form.code}
                  onChange={(e) => set("code", e.target.value.toUpperCase())}
                  placeholder="LAUNCH50"
                  className="font-mono uppercase"
                  disabled={!isNew}
                />
              </Field>
              <Field label="Internal note" hint="Only admins see this.">
                <Textarea
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  placeholder="Book launch email, October"
                  rows={1}
                  className="min-h-10"
                />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Discount type">
                <div className="grid grid-cols-2 gap-1 rounded-md bg-muted p-1">
                  {(["percent", "amount"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      disabled={!isNew}
                      onClick={() => set("discountType", t)}
                      className={cn(
                        "rounded px-3 py-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed",
                        form.discountType === t ? "bg-background shadow-sm" : "text-muted-foreground",
                      )}
                    >
                      {t === "percent" ? "Percentage" : "Fixed amount"}
                    </button>
                  ))}
                </div>
              </Field>
              {form.discountType === "percent" ? (
                <Field label="Percent off">
                  <Affixed suffix="%">
                    <Input type="number" min={1} max={100} step="1" value={form.percent} onChange={(e) => set("percent", e.target.value)} placeholder="25" disabled={!isNew} />
                  </Affixed>
                </Field>
              ) : (
                <Field label="Amount off (USD)">
                  <Affixed prefix="$">
                    <Input type="number" min={0.01} step="0.01" value={form.amount} onChange={(e) => set("amount", e.target.value)} placeholder="20.00" disabled={!isNew} />
                  </Affixed>
                </Field>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="On subscriptions, discount" hint="One-time purchases always get it once.">
                <Select value={form.duration} onValueChange={(v) => set("duration", v as CouponDuration)} disabled={!isNew}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="once">The first payment only</SelectItem>
                    <SelectItem value="repeating">A set number of months</SelectItem>
                    <SelectItem value="forever">Every payment</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              {form.duration === "repeating" ? (
                <Field label="Number of months">
                  <Input type="number" min={1} max={36} value={form.months} onChange={(e) => set("months", e.target.value)} disabled={!isNew} />
                </Field>
              ) : null}
            </div>

            <Field label="Applies to">
              <div className="space-y-2 rounded-md border p-3">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" className="h-4 w-4 accent-[#b88a4a]" checked={form.allOffers} onChange={(e) => set("allOffers", e.target.checked)} disabled={!isNew} />
                  All plans
                </label>
                {!form.allOffers ? (
                  <div className="grid gap-1.5 border-t pt-2 sm:grid-cols-2">
                    {offers.map((o) => (
                      <label key={o.offerKey} className={cn("flex items-center gap-2 text-sm", !o.inStripe && "text-muted-foreground")}>
                        <input
                          type="checkbox"
                          className="h-4 w-4 accent-[#b88a4a]"
                          disabled={!isNew || !o.inStripe}
                          checked={form.offerKeys.includes(o.offerKey)}
                          onChange={(e) =>
                            set("offerKeys", e.target.checked ? [...form.offerKeys, o.offerKey] : form.offerKeys.filter((k) => k !== o.offerKey))
                          }
                        />
                        {o.label} <span className="text-xs text-muted-foreground">{formatMinor(o.priceMinor)}</span>
                      </label>
                    ))}
                  </div>
                ) : null}
              </div>
            </Field>
          </section>

          {/* The rules (editable any time) */}
          <section className="space-y-4 border-t pt-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Rules — editable any time</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Starts" hint="Blank = usable right away.">
                <DateTimePicker
                  date={form.startsAt.slice(0, 10)}
                  time={form.startsAt.slice(11, 16)}
                  onChange={(d, t) => set("startsAt", joinDateTime(d, t, "00:00"))}
                  placeholder="Right away"
                  className="h-10 px-3 text-sm"
                />
              </Field>
              <Field label="Expires" hint="Blank = never expires.">
                <DateTimePicker
                  date={form.expiresAt.slice(0, 10)}
                  time={form.expiresAt.slice(11, 16)}
                  onChange={(d, t) => set("expiresAt", joinDateTime(d, t, "23:59"))}
                  placeholder="Never"
                  className="h-10 px-3 text-sm"
                />
              </Field>
              <Field label="Usage limit" hint="Total uses across everyone. Blank = unlimited.">
                <Input type="number" min={1} step="1" value={form.maxRedemptions} onChange={(e) => set("maxRedemptions", e.target.value)} placeholder="Unlimited" />
              </Field>
              <Field label="Once per customer" hint="Each member can use this code one time.">
                <div className="flex h-10 items-center">
                  <Switch checked={form.oncePerCustomer} onCheckedChange={(v) => set("oncePerCustomer", v)} />
                </div>
              </Field>
              <Field label="Minimum spend" hint="Plan price must be at least this. Blank = none.">
                <Affixed prefix="$">
                  <Input type="number" min={0} step="0.01" value={form.minSpend} onChange={(e) => set("minSpend", e.target.value)} placeholder="None" />
                </Affixed>
              </Field>
              <Field label="Maximum spend" hint="Plan price must be at most this. Blank = none.">
                <Affixed prefix="$">
                  <Input type="number" min={0} step="0.01" value={form.maxSpend} onChange={(e) => set("maxSpend", e.target.value)} placeholder="None" />
                </Affixed>
              </Field>
            </div>
            <label className="flex items-center gap-2.5 text-sm">
              <Switch checked={form.active} onCheckedChange={(v) => set("active", v)} />
              Code is on
            </label>
          </section>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={() => void save()} disabled={saving}>
            {saving ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : null}
            {isNew ? "Create coupon" : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {hint ? <p className="text-[11.5px] leading-snug text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

function Affixed({ prefix, suffix, children }: { prefix?: string; suffix?: string; children: React.ReactNode }) {
  return (
    <div className="relative">
      {prefix ? <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">{prefix}</span> : null}
      <div className={cn(prefix && "[&_input]:pl-7", suffix && "[&_input]:pr-8")}>{children}</div>
      {suffix ? <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">{suffix}</span> : null}
    </div>
  );
}

function StatusBadge({ status }: { status: CouponStatus }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "whitespace-nowrap",
        status === "active" && "border-[#b88a4a] bg-[#b88a4a]/10 text-[#8a6532] dark:text-[#d9b47a]",
        status === "scheduled" && "border-amber-500/50 text-amber-700 dark:text-amber-400",
        (status === "expired" || status === "used_up" || status === "inactive") && "text-muted-foreground",
      )}
    >
      {STATUS_LABEL[status]}
    </Badge>
  );
}

function Stat({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-semibold">{value}</p>
        <p className="text-xs text-muted-foreground">{detail}</p>
      </CardContent>
    </Card>
  );
}
