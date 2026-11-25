"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { AlertCircle, ArrowUpRight, RotateCw } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OverviewCard } from "@/lib/dashboard/overview/layout";
import type { WidgetDef } from "@/lib/dashboard/overview/catalog";

// Building blocks shared by every Overview card.

export type WidgetProps = { card: OverviewCard; def: WidgetDef };

export const GOLD = "#b88a4a";

/** The standard card: icon + title header, optional link/action, scrollable body. */
export function WidgetCard({
  icon: Icon,
  title,
  href,
  hrefLabel = "Open",
  action,
  children,
  className,
  bodyClassName,
  id,
}: {
  icon?: LucideIcon;
  title: string;
  href?: string;
  hrefLabel?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  id?: string;
}) {
  return (
    <section id={id} aria-label={title} className={cn("flex h-full min-h-0 flex-col rounded-2xl border bg-card shadow-sm", className)}>
      <header className="flex items-center gap-2 px-4 pb-2 pt-3.5">
        {Icon ? (
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#b88a4a]/15 text-[#9a7038] dark:text-[#d9b27a]">
            <Icon className="h-4 w-4" aria-hidden />
          </span>
        ) : null}
        <h3 className="min-w-0 flex-1 truncate text-sm font-semibold tracking-tight">{title}</h3>
        {action}
        {href ? (
          <Link href={href} className="inline-flex shrink-0 items-center gap-0.5 rounded-md px-1.5 py-1 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground">
            {hrefLabel}
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        ) : null}
      </header>
      <div className={cn("min-h-0 flex-1 px-4 pb-4", bodyClassName)}>{children}</div>
    </section>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-muted", className)} />;
}

export function LoadingRows({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-2" aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-9 w-full" />
      ))}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <span className="flex-1">{message}</span>
      {onRetry ? (
        <button type="button" onClick={onRetry} className="inline-flex items-center gap-1 text-xs font-medium underline-offset-2 hover:underline">
          <RotateCw className="h-3 w-3" aria-hidden /> Retry
        </button>
      ) : null}
    </div>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <p className="py-6 text-center text-sm text-muted-foreground">{children}</p>;
}

/** Wraps loading / error / data for a card body. */
export function Load<T>({ state, rows, children }: { state: { data: T | null; error: string | null; loading: boolean; reload: () => void }; rows?: number; children: (data: T) => React.ReactNode }) {
  if (state.error && !state.data) return <ErrorState message={state.error} onRetry={state.reload} />;
  if (!state.data) return <LoadingRows rows={rows} />;
  return <>{children(state.data)}</>;
}

/** A row in a card list: title, muted subtitle, optional right-hand meta. */
export function ListRow({ href, title, subtitle, meta, icon }: { href?: string; title: React.ReactNode; subtitle?: React.ReactNode; meta?: React.ReactNode; icon?: React.ReactNode }) {
  const inner = (
    <>
      {icon}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium">{title}</span>
        {subtitle ? <span className="block truncate text-xs text-muted-foreground">{subtitle}</span> : null}
      </span>
      {meta ? <span className="shrink-0 text-xs text-muted-foreground">{meta}</span> : null}
    </>
  );
  const cls = "flex items-center gap-3 rounded-lg px-2 py-2 -mx-2";
  return href ? (
    <li>
      <Link href={href} className={cn(cls, "transition hover:bg-muted/60")}>
        {inner}
      </Link>
    </li>
  ) : (
    <li className={cls}>{inner}</li>
  );
}

export function Pill({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "gold" | "bad" | "warn" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium",
        tone === "neutral" && "bg-muted text-muted-foreground",
        tone === "gold" && "bg-[#b88a4a]/15 text-[#8a6430] dark:text-[#e0bd88]",
        tone === "bad" && "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
        tone === "warn" && "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
      )}
    >
      {children}
    </span>
  );
}

export function relTime(iso: string | null | undefined): string {
  if (!iso) return "";
  const diff = new Date(iso).getTime() - Date.now();
  const abs = Math.abs(diff);
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
  if (abs < 60_000) return "just now";
  if (abs < 3_600_000) return rtf.format(Math.round(diff / 60_000), "minute");
  if (abs < 86_400_000) return rtf.format(Math.round(diff / 3_600_000), "hour");
  if (abs < 7 * 86_400_000) return rtf.format(Math.round(diff / 86_400_000), "day");
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function fmtNumber(n: number | null | undefined): string {
  if (n === null || n === undefined) return "—";
  return new Intl.NumberFormat(undefined, { notation: n >= 10_000 ? "compact" : "standard", maximumFractionDigits: 1 }).format(n);
}

export function fmtBytes(n: number | null | undefined): string {
  if (!n) return "0 B";
  const u = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.min(u.length - 1, Math.floor(Math.log(n) / Math.log(1024)));
  return `${(n / 1024 ** i).toFixed(i ? 1 : 0)} ${u[i]}`;
}

export function fmtMoney(amount: number, currency = "usd"): string {
  return new Intl.NumberFormat(undefined, { style: "currency", currency: currency.toUpperCase(), maximumFractionDigits: amount >= 1000 ? 0 : 2 }).format(amount);
}

/** Tiny dependency-free sparkline in gold. */
export function Sparkline({ values, className, label }: { values: number[]; className?: string; label?: string }) {
  if (values.length < 2) return null;
  const max = Math.max(1, ...values);
  const w = 100;
  const h = 28;
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * w},${h - (v / max) * (h - 2) - 1}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className={cn("h-7 w-full", className)} role="img" aria-label={label ?? "Trend"}>
      <polyline points={`0,${h} ${pts} ${w},${h}`} fill={`${GOLD}22`} stroke="none" />
      <polyline points={pts} fill="none" stroke={GOLD} strokeWidth="1.6" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
    </svg>
  );
}
