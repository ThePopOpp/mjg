"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, CalendarClock, CalendarDays, CheckCircle2, ListTodo } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MyTask } from "@/lib/project-manager/my-tasks";

type Bucket = "overdue" | "today" | "next7";

const TABS: { key: Bucket; label: string; icon: typeof AlertTriangle; tone: string }[] = [
  { key: "overdue", label: "Overdue", icon: AlertTriangle, tone: "text-red-600 dark:text-red-400" },
  { key: "today", label: "Today", icon: CalendarClock, tone: "text-amber-600 dark:text-amber-400" },
  { key: "next7", label: "Next 7 days", icon: CalendarDays, tone: "text-emerald-600 dark:text-emerald-400" },
];

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending", scheduled: "Scheduled", in_progress: "In progress", waiting: "Waiting",
  delayed: "Delayed", blocked: "Blocked", needs_approval: "Needs approval",
};

const PRIORITY_STYLES: Record<string, string> = {
  low: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  normal: "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300",
  high: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  urgent: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
  critical: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
  blocking_closeout: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
};

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

// Days from today (0 = today, <0 = overdue, >0 = upcoming). Uses local time.
function daysFromToday(dueISO: string) {
  const due = new Date(dueISO);
  const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate());
  return Math.round((dueDay.getTime() - startOfToday().getTime()) / 86_400_000);
}

function bucketOf(dueISO: string): Bucket | null {
  const diff = daysFromToday(dueISO);
  if (diff < 0) return "overdue";
  if (diff === 0) return "today";
  if (diff >= 1 && diff <= 7) return "next7";
  return null;
}

function dueLabel(dueISO: string) {
  const diff = daysFromToday(dueISO);
  if (diff === 0) return "Due today";
  if (diff === 1) return "Due tomorrow";
  if (diff === -1) return "1 day overdue";
  if (diff < 0) return `${Math.abs(diff)} days overdue`;
  const dt = new Date(dueISO);
  return `Due ${dt.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}`;
}

export function MyTasksCard({ tasks, name }: { tasks: MyTask[]; name?: string }) {
  const grouped = useMemo(() => {
    const g: Record<Bucket, MyTask[]> = { overdue: [], today: [], next7: [] };
    for (const t of tasks) {
      const b = bucketOf(t.dueDate);
      if (b) g[b].push(t);
    }
    return g;
  }, [tasks]);

  // Open on the first non-empty bucket so the card lands on something useful.
  const firstWithItems = (TABS.find((t) => grouped[t.key].length)?.key ?? "overdue") as Bucket;
  const [active, setActive] = useState<Bucket>(firstWithItems);
  const rows = grouped[active];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
        <CardTitle className="flex items-center gap-2">
          <ListTodo className="h-5 w-5 text-primary" aria-hidden />
          My tasks
          {name ? <span className="text-sm font-normal text-muted-foreground">· {name}</span> : null}
        </CardTitle>
        <Link
          href="/dashboard/project-manager"
          className="text-xs font-medium text-primary hover:underline"
        >
          Open Project Manager
        </Link>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-2">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const count = grouped[tab.key].length;
            const isActive = active === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActive(tab.key)}
                className={`flex flex-col items-center gap-1 rounded-lg border px-2 py-3 text-center transition ${
                  isActive
                    ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                    : "border-border hover:bg-muted/50"
                }`}
                aria-pressed={isActive}
              >
                <Icon className={`h-4 w-4 ${tab.tone}`} aria-hidden />
                <span className="text-xl font-semibold tabular-nums">{count}</span>
                <span className="text-[11px] font-medium text-muted-foreground">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-8 text-center">
            <CheckCircle2 className="h-6 w-6 text-emerald-500" aria-hidden />
            <p className="text-sm text-muted-foreground">
              Nothing {active === "overdue" ? "overdue" : active === "today" ? "due today" : "due in the next 7 days"}.
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {rows.map((t) => (
              <li key={t.id}>
                <Link
                  href="/dashboard/project-manager"
                  className="flex items-start justify-between gap-3 rounded-lg border border-border px-3 py-2.5 transition hover:bg-muted/50"
                >
                  <div className="min-w-0 space-y-1">
                    <p className="truncate text-sm font-medium">{t.title}</p>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                      {t.project ? <span className="truncate">{t.project}</span> : null}
                      {t.project ? <span aria-hidden>·</span> : null}
                      <span className={active === "overdue" ? "text-red-600 dark:text-red-400" : ""}>
                        {dueLabel(t.dueDate)}
                      </span>
                      <span aria-hidden>·</span>
                      <span>{STATUS_LABELS[t.status] ?? t.status}</span>
                    </div>
                  </div>
                  {t.priority && t.priority !== "normal" ? (
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${
                        PRIORITY_STYLES[t.priority] ?? "bg-muted text-muted-foreground"
                      }`}
                    >
                      {t.priority.replace(/_/g, " ")}
                    </span>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
