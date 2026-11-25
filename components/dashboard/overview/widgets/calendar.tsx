"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CalendarDays, CalendarRange, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWidgetData } from "../use-widget-data";
import { Empty, Load, WidgetCard, relTime, type WidgetProps } from "./kit";

type Entry = { id: string; kind: "booking" | "event" | "reminder" | "task"; title: string; at: string; href: string };

const DOT: Record<Entry["kind"], string> = { booking: "bg-[#b88a4a]", event: "bg-[#141211] dark:bg-[#f4f1ea]", reminder: "bg-sky-500", task: "bg-red-500" };
const KIND_LABEL: Record<Entry["kind"], string> = { booking: "Booking", event: "Event", reminder: "Reminder", task: "Task due" };
const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

export function CalendarMonthWidget() {
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const month = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}`;
  const state = useWidgetData<{ entries: Entry[] }>("calendar", { month });
  const [selected, setSelected] = useState<string>(() => dayKey(new Date()));

  const byDay = useMemo(() => {
    const m = new Map<string, Entry[]>();
    for (const e of state.data?.entries ?? []) {
      const k = dayKey(new Date(e.at));
      m.set(k, [...(m.get(k) ?? []), e]);
    }
    return m;
  }, [state.data]);

  const cells = useMemo(() => {
    const first = new Date(cursor);
    const start = new Date(first);
    start.setDate(1 - first.getDay());
    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, [cursor]);

  const todayKey = dayKey(new Date());
  const selectedEntries = byDay.get(selected) ?? [];
  const shift = (n: number) => setCursor((c) => new Date(c.getFullYear(), c.getMonth() + n, 1));

  return (
    <WidgetCard
      icon={CalendarDays}
      title={cursor.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
      action={
        <div className="flex items-center gap-0.5">
          <button type="button" onClick={() => shift(-1)} className="rounded-md p-1 hover:bg-muted" aria-label="Previous month">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              const d = new Date();
              setCursor(new Date(d.getFullYear(), d.getMonth(), 1));
              setSelected(todayKey);
            }}
            className="rounded-md px-2 py-1 text-xs font-medium hover:bg-muted"
          >
            Today
          </button>
          <button type="button" onClick={() => shift(1)} className="rounded-md p-1 hover:bg-muted" aria-label="Next month">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      }
    >
      <div className="grid grid-cols-7 text-center text-[11px] font-medium text-muted-foreground">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <span key={i} className="py-1">
            {d}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5" role="grid" aria-label="Month">
        {cells.map((d) => {
          const k = dayKey(d);
          const list = byDay.get(k) ?? [];
          const inMonth = d.getMonth() === cursor.getMonth();
          return (
            <button
              key={k}
              type="button"
              onClick={() => setSelected(k)}
              aria-pressed={selected === k}
              aria-label={`${d.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}${list.length ? `, ${list.length} item${list.length === 1 ? "" : "s"}` : ""}`}
              className={cn(
                "flex aspect-square flex-col items-center justify-center gap-0.5 rounded-lg text-xs tabular-nums transition",
                !inMonth && "text-muted-foreground/50",
                selected === k ? "bg-[#141211] text-[#f4f1ea] dark:bg-[#f4f1ea] dark:text-[#141211]" : "hover:bg-muted",
                k === todayKey && selected !== k && "font-bold text-[#9a7038] ring-1 ring-[#b88a4a]/60 dark:text-[#d9b27a]",
              )}
            >
              {d.getDate()}
              <span className="flex h-1.5 gap-0.5">
                {[...new Set(list.map((e) => e.kind))].slice(0, 3).map((kind) => (
                  <span key={kind} className={cn("h-1.5 w-1.5 rounded-full", DOT[kind])} />
                ))}
              </span>
            </button>
          );
        })}
      </div>
      <div className="mt-3 border-t pt-3">
        <Load state={state} rows={2}>
          {() =>
            selectedEntries.length ? (
              <ul className="max-h-40 space-y-1 overflow-y-auto">
                {selectedEntries.map((e) => (
                  <li key={e.id}>
                    <Link href={e.href.startsWith("#") ? "/dashboard" : e.href} className="flex items-center gap-2 rounded-md px-1.5 py-1 text-sm hover:bg-muted/60">
                      <span className={cn("h-2 w-2 shrink-0 rounded-full", DOT[e.kind])} aria-hidden />
                      <span className="w-14 shrink-0 text-xs tabular-nums text-muted-foreground">{new Date(e.at).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}</span>
                      <span className="min-w-0 flex-1 truncate">{e.title}</span>
                      <span className="sr-only">{KIND_LABEL[e.kind]}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-xs text-muted-foreground">Nothing on this day.</p>
            )
          }
        </Load>
        <div className="mt-2 flex flex-wrap justify-center gap-3 text-[10px] text-muted-foreground">
          {(Object.keys(DOT) as Entry["kind"][]).map((k) => (
            <span key={k} className="inline-flex items-center gap-1">
              <span className={cn("h-1.5 w-1.5 rounded-full", DOT[k])} /> {KIND_LABEL[k]}
            </span>
          ))}
        </div>
      </div>
    </WidgetCard>
  );
}

export function UpcomingWidget({ def }: WidgetProps) {
  const state = useWidgetData<{ entries: Entry[] }>("calendar", undefined, def.refreshMs);
  return (
    <WidgetCard icon={CalendarRange} title="Upcoming" href="/dashboard/bookings">
      <Load state={state}>
        {(d) => {
          const now = Date.now();
          const list = d.entries.filter((e) => new Date(e.at).getTime() >= now - 3_600_000).slice(0, 7);
          return list.length ? (
            <ul className="space-y-1.5">
              {list.map((e) => {
                const dt = new Date(e.at);
                return (
                  <li key={e.id} className="flex items-center gap-3">
                    <span className="flex w-11 shrink-0 flex-col items-center rounded-lg border bg-muted/40 py-1 leading-none">
                      <span className="text-[10px] uppercase text-muted-foreground">{dt.toLocaleDateString(undefined, { month: "short" })}</span>
                      <span className="text-base font-semibold tabular-nums">{dt.getDate()}</span>
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{e.title}</span>
                      <span className="block text-xs text-muted-foreground">
                        {KIND_LABEL[e.kind]} · {dt.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })} · {relTime(e.at)}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <Empty>Nothing coming up.</Empty>
          );
        }}
      </Load>
    </WidgetCard>
  );
}
