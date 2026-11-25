"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useOverview } from "../overview-context";
import { useWidgetData } from "../use-widget-data";
import { Skeleton, fmtBytes, fmtMoney, fmtNumber, type WidgetProps } from "./kit";

type StatsPayload = { range: string; values: Record<string, number | null> };

const RANGE_TEXT: Record<string, string> = { today: "today", "7d": "last 7 days", "30d": "last 30 days" };

type Tile = { value: (v: Record<string, number | null>) => string; detail: (v: Record<string, number | null>, range: string) => string; href: string; tone?: (v: Record<string, number | null>) => "bad" | undefined };

const n = (v: Record<string, number | null>, k: string) => v[k] ?? null;

export const STAT_TILES: Record<string, Tile> = {
  "stat.calls": { value: (v) => fmtNumber(n(v, "calls")), detail: (_v, r) => RANGE_TEXT[r], href: "/dashboard/dialer" },
  "stat.outbound": { value: (v) => fmtNumber(n(v, "outbound")), detail: (_v, r) => `Placed, ${RANGE_TEXT[r]}`, href: "/dashboard/dialer" },
  "stat.inbound": { value: (v) => fmtNumber(n(v, "inbound")), detail: (_v, r) => `Received, ${RANGE_TEXT[r]}`, href: "/dashboard/dialer" },
  "stat.missed": { value: (v) => fmtNumber(n(v, "missed")), detail: (v) => (n(v, "missed") ? "Call back soon" : "None missed"), href: "/dashboard/dialer", tone: (v) => (n(v, "missed") ? "bad" : undefined) },
  "stat.sms": { value: (v) => fmtNumber(n(v, "sms")), detail: (v) => `${fmtNumber(n(v, "smsInbound"))} received`, href: "/dashboard/sms" },
  "stat.bookings": { value: (v) => fmtNumber(n(v, "bookings")), detail: (v) => `${fmtNumber(n(v, "bookingsUpcoming"))} upcoming`, href: "/dashboard/bookings" },
  "stat.calendar": {
    value: (v) => fmtNumber((n(v, "calendarBookings") ?? 0) + (n(v, "calendarEvents") ?? 0)),
    detail: (v) => `${fmtNumber(n(v, "calendarEvents"))} events · next 7 days`,
    href: "/dashboard/bookings",
  },
  "stat.notifications": { value: (v) => fmtNumber(n(v, "notifications")), detail: (v) => (n(v, "notifications") ? "Unread" : "All caught up"), href: "/dashboard" },
  "stat.messages": { value: (v) => fmtNumber(n(v, "messages")), detail: (v) => (n(v, "messages") ? "Unread messages" : "All caught up"), href: "/dashboard/direct-messages" },
  "stat.alerts": { value: (v) => fmtNumber(n(v, "alerts")), detail: (v) => (n(v, "alerts") ? "Need attention" : "Nothing failing"), href: "/dashboard", tone: (v) => (n(v, "alerts") ? "bad" : undefined) },
  "stat.emails": { value: (v) => fmtNumber(n(v, "emails")), detail: (_v, r) => `Received, ${RANGE_TEXT[r]}`, href: "/dashboard/email-inbox" },
  "stat.files": { value: (v) => fmtNumber(n(v, "files")), detail: (v) => `${fmtBytes(n(v, "filesBytes"))} · ${fmtNumber(n(v, "filesNew"))} new`, href: "/dashboard/media-studio" },
  "stat.checkins": { value: (v) => fmtNumber(n(v, "checkins")), detail: (_v, r) => `Created for More, ${RANGE_TEXT[r]}`, href: "/dashboard/check-in-results" },
  "stat.leads": { value: (v) => fmtNumber(n(v, "leads")), detail: (_v, r) => `Added, ${RANGE_TEXT[r]}`, href: "/dashboard/contacts/leads" },
  "stat.signups": { value: (v) => fmtNumber(n(v, "signups")), detail: (_v, r) => `New accounts, ${RANGE_TEXT[r]}`, href: "/dashboard/user-management" },
  "stat.revenue": { value: (v) => (n(v, "revenue") === null ? "—" : fmtMoney((n(v, "revenue") ?? 0) / 100)), detail: (_v, r) => `Paid, ${RANGE_TEXT[r]}`, href: "/dashboard/stripe" },
};

export function makeStatTile(icon: LucideIcon) {
  return function StatTileWidget({ card, def }: WidgetProps) {
    const { layout } = useOverview();
    const state = useWidgetData<StatsPayload>("stats", { range: layout.statRange }, def.refreshMs);
    const tile = STAT_TILES[card.widget];
    const Icon = icon;
    const v = state.data?.values ?? {};
    const bad = tile?.tone?.(v) === "bad";
    return (
      <Link
        href={tile?.href ?? "/dashboard"}
        className="group flex h-full min-h-[118px] flex-col justify-between rounded-2xl border bg-card p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-[#b88a4a]/50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none motion-reduce:hover:translate-y-0"
      >
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium text-muted-foreground">{def.title}</p>
          <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", bad ? "bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-300" : "bg-[#b88a4a]/15 text-[#9a7038] dark:text-[#d9b27a]")}>
            <Icon className="h-4 w-4" aria-hidden />
          </span>
        </div>
        {state.data ? (
          <div>
            <p className={cn("text-3xl font-semibold tabular-nums tracking-tight", bad && "text-red-600 dark:text-red-400")}>{tile ? tile.value(v) : "—"}</p>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">{tile ? tile.detail(v, state.data.range) : ""}</p>
          </div>
        ) : state.error ? (
          <p className="text-xs text-red-600">{state.error}</p>
        ) : (
          <div className="space-y-1.5">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-24" />
          </div>
        )}
      </Link>
    );
  };
}
