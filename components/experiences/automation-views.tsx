"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { AutomationStep } from "@/lib/experiences/automation";
import { cn } from "@/lib/utils";

// Experiences are anchored to Arizona time and Arizona has no DST, so every date renders in
// that zone rather than the viewer's local time.
export const TZ = "America/Phoenix";

export function fmt(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", {
    timeZone: TZ,
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function relative(iso: string | null) {
  if (!iso) return "";
  const diff = new Date(iso).getTime() - Date.now();
  const days = Math.round(Math.abs(diff) / 86_400_000);
  const hours = Math.round(Math.abs(diff) / 3_600_000);
  const amount = days >= 1 ? `${days} day${days === 1 ? "" : "s"}` : `${hours} hour${hours === 1 ? "" : "s"}`;
  return diff >= 0 ? `in ${amount}` : `${amount} ago`;
}

/**
 * Arizona calendar day ("2026-09-15"). Bucketing by the send's local date rather than UTC
 * keeps an evening send from landing on the following day in the calendar grid.
 */
export function azDayKey(iso: string) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));
}

/**
 * What to show as "the date" for a step.
 *
 * A step sent in more than one batch (late-added recipients get caught up separately) has no
 * single date — lead with the first send and say how many batches, rather than silently
 * showing the last one as if everyone received it then.
 */
export function SendDate({ step }: { step: AutomationStep }) {
  const primary = step.waves > 1 ? step.firstSentAt : step.date;
  return (
    <>
      <span className="whitespace-nowrap">{fmt(primary)}</span>
      <span className="block text-xs text-muted-foreground">
        {step.waves > 1 ? `+${step.waves - 1} later batch${step.waves > 2 ? "es" : ""} · last ${fmt(step.date)}` : relative(step.date)}
      </span>
    </>
  );
}

export function StatusBadge({ step }: { step: AutomationStep }) {
  if (step.status === "sent") return <Badge className="bg-[#b88a4a] text-white hover:bg-[#b88a4a]">Sent</Badge>;
  if (step.status === "partial") {
    return <Badge variant="outline" className="border-[#b88a4a]">Partial {step.sent}/{step.total}</Badge>;
  }
  if (step.status === "failed") return <Badge variant="destructive">Failed</Badge>;
  if (step.status === "none") return <Badge variant="outline" className="text-muted-foreground">Not queued</Badge>;
  return <Badge variant="secondary">Scheduled</Badge>;
}

/* ─────────────────────────────── Table ─────────────────────────────── */

export function ScheduleTable({ steps }: { steps: AutomationStep[] }) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">#</TableHead>
            <TableHead>Email template</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Recipients</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {steps.map((s) => (
            <TableRow key={s.stepNumber} className={s.status === "failed" ? "bg-destructive/5" : undefined}>
              <TableCell className="text-muted-foreground">{s.stepNumber}</TableCell>
              <TableCell>
                <p className="font-medium">{s.templateName ?? "(no template)"}</p>
                {s.subject ? <p className="max-w-md truncate text-xs text-muted-foreground">{s.subject}</p> : null}
                {s.errors.length ? <p className="mt-1 text-xs text-destructive">{s.errors.join(" · ")}</p> : null}
              </TableCell>
              <TableCell><StatusBadge step={s} /></TableCell>
              <TableCell className="text-sm"><SendDate step={s} /></TableCell>
              <TableCell className="text-right text-sm tabular-nums">
                {s.status === "sent" || s.status === "partial" ? `${s.sent}/${s.total}` : s.total}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

/* ─────────────────────────────── Cards ─────────────────────────────── */

export function CardsView({ steps }: { steps: AutomationStep[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {steps.map((s) => (
        <div
          key={s.stepNumber}
          className={cn(
            "flex flex-col gap-2 rounded-lg border p-4",
            s.status === "sent" && "border-[#b88a4a]/40 bg-[#b88a4a]/[0.04]",
            (s.status === "failed" || s.status === "partial") && "border-destructive/50 bg-destructive/5",
          )}
        >
          <div className="flex items-start justify-between gap-2">
            <span className="text-xs font-semibold text-muted-foreground">Email {s.stepNumber}</span>
            <StatusBadge step={s} />
          </div>
          <p className="font-medium leading-snug">{s.templateName ?? "(no template)"}</p>
          {s.subject ? <p className="line-clamp-2 text-xs text-muted-foreground">{s.subject}</p> : null}
          <div className="mt-auto space-y-0.5 border-t pt-2 text-xs">
            <p className="font-medium">{fmt(s.waves > 1 ? s.firstSentAt : s.date)}</p>
            <p className="text-muted-foreground">
              {s.waves > 1 ? `sent in ${s.waves} batches` : relative(s.date)} ·{" "}
              {s.status === "sent" || s.status === "partial" ? `${s.sent}/${s.total}` : s.total}{" "}
              recipient{s.total === 1 ? "" : "s"}
            </p>
            {s.errors.length ? <p className="text-destructive">{s.errors.join(" · ")}</p> : null}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────── Kanban ────────────────────────────── */

export function KanbanView({ steps }: { steps: AutomationStep[] }) {
  // Grouped by what you would act on rather than by raw status: what is done, what is
  // coming, and what needs a human (failed outright, or only some recipients received it).
  const columns = [
    { key: "sent", title: "Sent", items: steps.filter((s) => s.status === "sent") },
    { key: "upcoming", title: "Scheduled", items: steps.filter((s) => s.status === "scheduled" || s.status === "none") },
    { key: "attention", title: "Needs attention", items: steps.filter((s) => s.status === "failed" || s.status === "partial") },
  ];

  return (
    <div className="grid gap-3 md:grid-cols-3">
      {columns.map((col) => (
        <div key={col.key} className="rounded-lg border bg-muted/30">
          <div className="flex items-center justify-between border-b px-3 py-2">
            <span className="text-sm font-semibold">{col.title}</span>
            <span className="rounded-full bg-background px-2 py-0.5 text-xs tabular-nums text-muted-foreground">
              {col.items.length}
            </span>
          </div>
          <div className="space-y-2 p-2">
            {col.items.map((s) => (
              <div
                key={s.stepNumber}
                className={cn("rounded-md border bg-background p-3", col.key === "attention" && "border-destructive/50")}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-xs font-semibold text-muted-foreground">#{s.stepNumber}</span>
                  <span className="text-xs text-muted-foreground">{relative(s.date)}</span>
                </div>
                <p className="mt-1 text-sm font-medium leading-snug">{s.templateName ?? "(no template)"}</p>
                <p className="mt-1 text-xs text-muted-foreground">{fmt(s.waves > 1 ? s.firstSentAt : s.date)}</p>
                {s.waves > 1 ? (
                  <p className="text-xs text-muted-foreground">sent in {s.waves} batches</p>
                ) : null}
                {s.status === "partial" ? (
                  <p className="mt-1 text-xs text-destructive">Only {s.sent} of {s.total} recipients</p>
                ) : null}
                {s.errors.length ? <p className="mt-1 text-xs text-destructive">{s.errors.join(" · ")}</p> : null}
              </div>
            ))}
            {!col.items.length ? (
              <p className="px-1 py-6 text-center text-xs text-muted-foreground">Nothing here</p>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ────────────────────────────── Calendar ───────────────────────────── */

export function CalendarView({ steps, nextSendAt }: { steps: AutomationStep[]; nextSendAt: string | null }) {
  // Open on the month of the next send — the month someone actually wants to look at.
  const [cursor, setCursor] = useState(() => {
    const anchor = nextSendAt ?? new Date().toISOString();
    const [y, m] = azDayKey(anchor).split("-").map(Number);
    return { year: y, month: m - 1 };
  });

  const byDay = useMemo(() => {
    const map = new Map<string, AutomationStep[]>();
    for (const s of steps) {
      if (!s.date) continue;
      const key = azDayKey(s.date);
      map.set(key, [...(map.get(key) ?? []), s]);
    }
    return map;
  }, [steps]);

  const first = new Date(Date.UTC(cursor.year, cursor.month, 1));
  const gridStart = new Date(first);
  gridStart.setUTCDate(1 - first.getUTCDay());
  const cells = Array.from({ length: 42 }, (_, k) => {
    const d = new Date(gridStart);
    d.setUTCDate(gridStart.getUTCDate() + k);
    return d;
  });
  const monthLabel = first.toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
  const todayKey = azDayKey(new Date().toISOString());

  function shift(delta: number) {
    setCursor((c) => {
      const m = c.month + delta;
      return { year: c.year + Math.floor(m / 12), month: ((m % 12) + 12) % 12 };
    });
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold">{monthLabel}</h3>
        <div className="flex gap-1">
          <button type="button" aria-label="Previous month" onClick={() => shift(-1)} className="rounded border p-1 hover:bg-accent">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button type="button" aria-label="Next month" onClick={() => shift(1)} className="rounded border p-1 hover:bg-accent">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 text-center text-xs text-muted-foreground">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((d) => {
          const key = d.toISOString().slice(0, 10);
          const inMonth = d.getUTCMonth() === cursor.month;
          const items = byDay.get(key) ?? [];
          return (
            <div
              key={key}
              className={cn(
                "min-h-[78px] rounded border p-1",
                inMonth ? "bg-background" : "bg-muted/30 text-muted-foreground/60",
                key === todayKey && "border-[#b88a4a] ring-1 ring-[#b88a4a]/40",
              )}
            >
              <div className="text-xs">{d.getUTCDate()}</div>
              <div className="mt-0.5 space-y-0.5">
                {items.map((s) => (
                  <div
                    key={s.stepNumber}
                    title={`${s.templateName ?? ""} — ${s.status} — ${fmt(s.date)}`}
                    className={cn(
                      "truncate rounded px-1 py-0.5 text-[11px]",
                      s.status === "sent"
                        ? "bg-[#b88a4a]/20 text-[#8a6d33] dark:text-[#e2ca9a]"
                        : s.status === "failed" || s.status === "partial"
                          ? "bg-destructive/15 text-destructive"
                          : "bg-muted text-muted-foreground",
                    )}
                  >
                    #{s.stepNumber} {shortName(s.templateName)}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** "6WC · 05 · Week 2 — See the Blueprint" → "Week 2 — See the Blueprint" for tight cells. */
function shortName(name: string | null) {
  if (!name) return "";
  const parts = name.split("·").map((p) => p.trim());
  return parts.length > 2 ? parts.slice(2).join(" · ") : name;
}
