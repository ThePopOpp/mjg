"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, CalendarClock, CalendarDays, CheckCircle2 } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import type { MyTask } from "@/lib/project-manager/my-tasks";

type Bucket = "overdue" | "today" | "next7";

const TABS: { key: Bucket; label: string; icon: typeof AlertTriangle; tone: string; ring: string }[] = [
  { key: "overdue", label: "Overdue", icon: AlertTriangle, tone: "text-red-600 dark:text-red-400", ring: "hover:border-red-300 dark:hover:border-red-800" },
  { key: "today", label: "Today", icon: CalendarClock, tone: "text-amber-600 dark:text-amber-400", ring: "hover:border-amber-300 dark:hover:border-amber-800" },
  { key: "next7", label: "Next 7 days", icon: CalendarDays, tone: "text-emerald-600 dark:text-emerald-400", ring: "hover:border-emerald-300 dark:hover:border-emerald-800" },
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

const EMPTY_COPY: Record<Bucket, string> = {
  overdue: "Nothing overdue.",
  today: "Nothing due today.",
  next7: "Nothing due in the next 7 days.",
};

function TaskRow({ task, bucket }: { task: MyTask; bucket: Bucket }) {
  return (
    <Link
      href="/dashboard/project-manager"
      className="flex items-start justify-between gap-3 rounded-lg border border-border px-3 py-2.5 transition hover:bg-muted/50"
    >
      <div className="min-w-0 space-y-1">
        <p className="truncate text-sm font-medium">{task.title}</p>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          {task.project ? <span className="truncate">{task.project}</span> : null}
          {task.project ? <span aria-hidden>·</span> : null}
          <span className={bucket === "overdue" ? "text-red-600 dark:text-red-400" : ""}>
            {dueLabel(task.dueDate)}
          </span>
          <span aria-hidden>·</span>
          <span>{STATUS_LABELS[task.status] ?? task.status}</span>
        </div>
      </div>
      {task.priority && task.priority !== "normal" ? (
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${
            PRIORITY_STYLES[task.priority] ?? "bg-muted text-muted-foreground"
          }`}
        >
          {task.priority.replace(/_/g, " ")}
        </span>
      ) : null}
    </Link>
  );
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

  const [open, setOpen] = useState<Bucket | null>(null);
  const activeTab = open ? TABS.find((t) => t.key === open)! : null;
  const rows = open ? grouped[open] : [];

  return (
    <section aria-label="My tasks" className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
          My tasks
          {name ? <span className="text-sm font-normal text-muted-foreground">· {name}</span> : null}
        </h2>
        <Link href="/dashboard/project-manager" className="text-xs font-medium text-primary hover:underline">
          Open Project Manager
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const count = grouped[tab.key].length;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setOpen(tab.key)}
              className={`flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-5 py-4 text-left shadow-sm transition hover:shadow ${tab.ring}`}
              aria-label={`${tab.label}: ${count} task${count === 1 ? "" : "s"}`}
            >
              <div className="space-y-0.5">
                <p className="text-sm font-medium text-muted-foreground">{tab.label}</p>
                <p className="text-3xl font-semibold tabular-nums">{count}</p>
                <p className="text-xs text-muted-foreground">
                  {count === 0 ? "All clear" : `${count} task${count === 1 ? "" : "s"} · view`}
                </p>
              </div>
              <span className={`flex h-10 w-10 items-center justify-center rounded-lg bg-muted ${tab.tone}`}>
                <Icon className="h-5 w-5" aria-hidden />
              </span>
            </button>
          );
        })}
      </div>

      <Dialog open={open !== null} onOpenChange={(v) => !v && setOpen(null)}>
        <DialogContent className="max-h-[80vh] overflow-hidden sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {activeTab ? <activeTab.icon className={`h-5 w-5 ${activeTab.tone}`} aria-hidden /> : null}
              {activeTab?.label}
              <span className="text-sm font-normal text-muted-foreground">({rows.length})</span>
            </DialogTitle>
            <DialogDescription>
              {name ? `${name}'s tasks ` : "Tasks "}
              {open === "overdue" ? "past their due date." : open === "today" ? "due today." : "due within the next 7 days."}
            </DialogDescription>
          </DialogHeader>

          {rows.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
              <CheckCircle2 className="h-7 w-7 text-emerald-500" aria-hidden />
              <p className="text-sm text-muted-foreground">{open ? EMPTY_COPY[open] : ""}</p>
            </div>
          ) : (
            <ul className="-mr-2 max-h-[55vh] space-y-2 overflow-y-auto pr-2">
              {rows.map((t) => (
                <li key={t.id}>
                  <TaskRow task={t} bucket={open as Bucket} />
                </li>
              ))}
            </ul>
          )}

          <div className="pt-1">
            <Link
              href="/dashboard/project-manager"
              className="text-xs font-medium text-primary hover:underline"
            >
              Open Project Manager →
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
