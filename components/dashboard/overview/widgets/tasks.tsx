"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AlarmClock, AlertTriangle, CalendarClock, CalendarDays, Check, CheckSquare, EyeOff, ListTodo, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useDashboardActionToken } from "@/components/layout/dashboard-action-token";
import { cn } from "@/lib/utils";
import type { MyTask } from "@/lib/project-manager/my-tasks";
import type { PersonalItem } from "@/lib/dashboard/overview/items";
import { useOverview } from "../overview-context";
import { Rail } from "../rail";
import { invalidateWidget, useWidgetData } from "../use-widget-data";
import { Empty, Load, Pill, Skeleton, WidgetCard, relTime, type WidgetProps } from "./kit";

// ── My Tasks: one sliding row of task cards, 3.5 visible ─────────────────────

type Bucket = "all" | "overdue" | "today" | "week" | "later";

function dayDiff(iso: string) {
  const d = new Date(iso);
  const a = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const t = new Date();
  const b = new Date(t.getFullYear(), t.getMonth(), t.getDate()).getTime();
  return Math.round((a - b) / 86_400_000);
}
const bucketOf = (iso: string): Exclude<Bucket, "all"> => {
  const d = dayDiff(iso);
  return d < 0 ? "overdue" : d === 0 ? "today" : d <= 7 ? "week" : "later";
};
const dueText = (iso: string) => {
  const d = dayDiff(iso);
  if (d === 0) return "Due today";
  if (d === 1) return "Due tomorrow";
  if (d < 0) return d === -1 ? "1 day overdue" : `${-d} days overdue`;
  return `Due ${new Date(iso).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}`;
};

const FILTERS: { key: Bucket; label: string; icon: typeof AlertTriangle }[] = [
  { key: "all", label: "All", icon: ListTodo },
  { key: "overdue", label: "Overdue", icon: AlertTriangle },
  { key: "today", label: "Today", icon: CalendarClock },
  { key: "week", label: "Next 7 days", icon: CalendarDays },
];

const PRIORITY_TONE: Record<string, "bad" | "warn" | "gold" | "neutral"> = { critical: "bad", blocking_closeout: "bad", urgent: "bad", high: "warn", normal: "gold", low: "neutral" };

export function MyTasksWidget({ card, def }: WidgetProps) {
  const { profile, hideCard, editing } = useOverview();
  const state = useWidgetData<{ tasks: MyTask[] }>("mytasks", undefined, def.refreshMs);
  const [filter, setFilter] = useState<Bucket>("all");
  const tasks = useMemo(() => [...(state.data?.tasks ?? [])].sort((a, b) => a.dueDate.localeCompare(b.dueDate)), [state.data]);
  const counts = useMemo(() => {
    const c: Record<Bucket, number> = { all: tasks.length, overdue: 0, today: 0, week: 0, later: 0 };
    for (const t of tasks) c[bucketOf(t.dueDate)]++;
    return c;
  }, [tasks]);
  const shown = filter === "all" ? tasks : tasks.filter((t) => bucketOf(t.dueDate) === filter);

  return (
    <section aria-label="My Tasks" className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 sm:pr-20">
        <h2 className="mr-1 text-lg font-semibold tracking-tight">{profile.firstName ? `${profile.firstName}'s Tasks` : "My Tasks"}</h2>
        <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Filter tasks">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              role="tab"
              aria-selected={filter === f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition",
                filter === f.key ? "border-[#141211] bg-[#141211] text-[#f4f1ea] dark:border-[#f4f1ea] dark:bg-[#f4f1ea] dark:text-[#141211]" : "bg-card hover:bg-muted",
              )}
            >
              <f.icon className={cn("h-3.5 w-3.5", f.key === "overdue" && counts.overdue && filter !== f.key && "text-red-600")} aria-hidden />
              {f.label}
              <span className="tabular-nums opacity-70">{counts[f.key]}</span>
            </button>
          ))}
        </div>
        {!editing ? (
          <button type="button" onClick={() => hideCard(card.uid)} className="ml-auto rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="Hide My Tasks" title="Hide this section">
            <EyeOff className="h-4 w-4" />
          </button>
        ) : null}
      </div>
      {!state.data ? (
        <div className="flex gap-4 overflow-hidden">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[132px] w-[27%] shrink-0 rounded-2xl" />
          ))}
        </div>
      ) : !shown.length ? (
        <div className="rounded-2xl border border-dashed bg-card/50 p-6 text-center text-sm text-muted-foreground">
          {filter === "all" ? "No open tasks assigned to you." : `Nothing ${FILTERS.find((f) => f.key === filter)?.label.toLowerCase()}.`}{" "}
          <Link href="/dashboard/project-manager" className="font-medium text-foreground underline-offset-2 hover:underline">
            Open Project Manager
          </Link>
        </div>
      ) : (
        <Rail visible={3.5} label="tasks">
          {shown.map((t) => {
            const b = bucketOf(t.dueDate);
            return (
              <Link
                key={t.id}
                href="/dashboard/project-manager"
                className={cn(
                  "group flex min-h-[132px] flex-col justify-between rounded-2xl border bg-card p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md motion-reduce:hover:translate-y-0",
                  b === "overdue" && "border-l-4 border-l-red-500",
                  b === "today" && "border-l-4 border-l-[#b88a4a]",
                )}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-xs text-muted-foreground">{t.project ?? t.type}</span>
                    {t.priority ? <Pill tone={PRIORITY_TONE[t.priority] ?? "neutral"}>{t.priority.replace(/_/g, " ")}</Pill> : null}
                  </div>
                  <p className="mt-1.5 line-clamp-2 font-medium leading-snug">{t.title}</p>
                </div>
                <p className={cn("mt-3 text-xs font-medium", b === "overdue" ? "text-red-600 dark:text-red-400" : "text-muted-foreground")}>{dueText(t.dueDate)}</p>
              </Link>
            );
          })}
        </Rail>
      )}
    </section>
  );
}

// ── Personal To-Do list and Reminders ────────────────────────────────────────

function useItems(kind: "todo" | "reminder") {
  const token = useDashboardActionToken();
  const state = useWidgetData<{ items: PersonalItem[] }>("items");
  const [local, setLocal] = useState<PersonalItem[] | null>(null);
  const items = (local ?? state.data?.items ?? []).filter((i) => i.kind === kind);

  const call = async (method: string, body?: unknown, query = "") => {
    const res = await fetch(`/api/me/dashboard-items${query}`, { method, headers: { "Content-Type": "application/json" }, body: body ? JSON.stringify({ ...(body as object), actionToken: token }) : undefined });
    const j = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error((j as { error?: string }).error || "Couldn't save.");
    invalidateWidget("items");
    invalidateWidget("alerts");
    invalidateWidget("calendar");
    return j as { item?: PersonalItem };
  };
  const all = () => local ?? state.data?.items ?? [];

  return {
    state,
    items,
    add: async (input: Record<string, unknown>) => {
      const { item } = await call("POST", { kind, ...input });
      if (item) setLocal([item, ...all()]);
    },
    update: async (id: string, patch: Record<string, unknown>) => {
      setLocal(all().map((i) => (i.id === id ? { ...i, ...(patch.done !== undefined ? { doneAt: patch.done ? new Date().toISOString() : null } : {}), ...(patch.title !== undefined ? { title: String(patch.title) } : {}) } : i)));
      await call("PATCH", { id, ...patch });
    },
    remove: async (id: string) => {
      setLocal(all().filter((i) => i.id !== id));
      await call("DELETE", undefined, `?id=${encodeURIComponent(id)}`);
    },
  };
}

export function TodoWidget() {
  const t = useItems("todo");
  const [title, setTitle] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const open = t.items.filter((i) => !i.doneAt);
  const done = t.items.filter((i) => i.doneAt).slice(0, 5);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setErr(null);
    try {
      await t.add({ title: title.trim() });
      setTitle("");
    } catch (x) {
      setErr((x as Error).message);
    }
  };
  return (
    <WidgetCard icon={CheckSquare} title="To-Do List" action={<Pill tone="gold">{open.length} open</Pill>}>
      <form onSubmit={submit} className="mb-3 flex gap-2">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Add a to-do…" className="h-9" aria-label="New to-do" maxLength={300} />
        <Button type="submit" size="sm" className="h-9 px-3" aria-label="Add to-do">
          <Plus className="h-4 w-4" />
        </Button>
      </form>
      {err ? <p className="mb-2 text-xs text-red-600">{err}</p> : null}
      <Load state={t.state}>
        {() =>
          t.items.length ? (
            <ul className="max-h-64 space-y-1 overflow-y-auto pr-1">
              {[...open, ...done].map((i) => (
                <li key={i.id} className="group flex items-center gap-2.5 rounded-lg px-1.5 py-1.5 hover:bg-muted/60">
                  <Checkbox checked={!!i.doneAt} onCheckedChange={(v) => t.update(i.id, { done: v === true })} aria-label={`Mark ${i.title} ${i.doneAt ? "not done" : "done"}`} />
                  <span className={cn("min-w-0 flex-1 truncate text-sm", i.doneAt && "text-muted-foreground line-through")}>{i.title}</span>
                  <button type="button" onClick={() => t.remove(i.id)} className="rounded p-1 text-muted-foreground opacity-0 transition hover:text-red-600 focus:opacity-100 group-hover:opacity-100" aria-label={`Delete ${i.title}`}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <Empty>Nothing on your list.</Empty>
          )
        }
      </Load>
    </WidgetCard>
  );
}

function localInputValue(d: Date) {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

export function RemindersWidget() {
  const r = useItems("reminder");
  const [title, setTitle] = useState("");
  const [when, setWhen] = useState(() => localInputValue(new Date(Date.now() + 60 * 60_000)));
  const [err, setErr] = useState<string | null>(null);
  const upcoming = [...r.items].filter((i) => !i.doneAt).sort((a, b) => (a.dueAt ?? "").localeCompare(b.dueAt ?? ""));
  const quick = (mins: number) => setWhen(localInputValue(new Date(Date.now() + mins * 60_000)));
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !when) return;
    setErr(null);
    try {
      await r.add({ title: title.trim(), dueAt: new Date(when).toISOString() });
      setTitle("");
    } catch (x) {
      setErr((x as Error).message);
    }
  };
  return (
    <WidgetCard id="reminders" icon={AlarmClock} title="Reminders">
      <form onSubmit={submit} className="mb-3 space-y-2">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Remind me to…" className="h-9" aria-label="Reminder" maxLength={300} />
        <div className="flex gap-2">
          <Input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} className="h-9 min-w-0 flex-1" aria-label="When" />
          <Button type="submit" size="sm" className="h-9">
            Set
          </Button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {[
            ["15 min", 15],
            ["1 hour", 60],
            ["Tomorrow 9am", -1],
          ].map(([label, mins]) => (
            <button
              key={label}
              type="button"
              onClick={() => {
                if (mins === -1) {
                  const d = new Date();
                  d.setDate(d.getDate() + 1);
                  d.setHours(9, 0, 0, 0);
                  setWhen(localInputValue(d));
                } else quick(mins as number);
              }}
              className="rounded-full border px-2.5 py-0.5 text-[11px] font-medium hover:bg-muted"
            >
              {label}
            </button>
          ))}
        </div>
      </form>
      {err ? <p className="mb-2 text-xs text-red-600">{err}</p> : null}
      <Load state={r.state}>
        {() =>
          upcoming.length ? (
            <ul className="max-h-56 space-y-1 overflow-y-auto pr-1">
              {upcoming.map((i) => {
                const due = i.dueAt ? new Date(i.dueAt) : null;
                const past = due ? due.getTime() < Date.now() : false;
                return (
                  <li key={i.id} className="group flex items-center gap-2 rounded-lg px-1.5 py-1.5 hover:bg-muted/60">
                    <AlarmClock className={cn("h-4 w-4 shrink-0", past ? "text-red-600" : "text-[#b88a4a]")} aria-hidden />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm">{i.title}</span>
                      <span className={cn("block text-[11px]", past ? "text-red-600" : "text-muted-foreground")}>
                        {due ? `${due.toLocaleString(undefined, { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })} · ${relTime(i.dueAt)}` : ""}
                      </span>
                    </span>
                    <button type="button" onClick={() => r.update(i.id, { done: true })} className="rounded p-1 text-muted-foreground hover:text-foreground" aria-label={`Done: ${i.title}`}>
                      <Check className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => r.remove(i.id)} className="rounded p-1 text-muted-foreground opacity-0 hover:text-red-600 focus:opacity-100 group-hover:opacity-100" aria-label={`Delete ${i.title}`}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <Empty>No reminders set. They arrive as notifications when due.</Empty>
          )
        }
      </Load>
    </WidgetCard>
  );
}
