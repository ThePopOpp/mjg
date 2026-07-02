"use client";

// CMS Overview — the gateway/dashboard landing: page + edit-request stats,
// quick-launch tiles, per-day activity (submitted / completed), recent activity,
// and who's requesting. Aggregates the frontend (cms_page_notes) and dashboard
// (dashboard_notes) request feeds. No due dates — dates shown are submission
// (created_at) and completion (updated_at of status=done).

import * as React from "react";
import {
  MousePointerClick, ClipboardList, PanelsTopLeft, Bot, Plus, FileText, CheckCircle2, Clock,
  CalendarDays, Users, Bell, HelpCircle, ArrowRight, RefreshCw, CircleDot,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useDashboardActionToken } from "@/components/layout/dashboard-action-token";
import type { CmsPage } from "@/lib/cms/types";

export type CmsNav = { pages: () => void; editor: () => void; requests: () => void; steward: () => void };
type UReq = { kind: "frontend" | "dashboard"; note: string; page: string; status: string; priority: string; type: string; authorEmail: string; authorName: string; createdAt: string; updatedAt: string };

const PRIORITY_COLOR: Record<string, string> = { low: "text-muted-foreground", medium: "text-foreground", high: "text-amber-600 dark:text-amber-400", urgent: "text-destructive" };
const STATUS_PILL: Record<string, string> = {
  open: "bg-amber-500/15 text-amber-700 dark:text-amber-400", in_progress: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
  done: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400", archived: "bg-muted text-muted-foreground",
};
const fmtDate = (iso: string) => (iso ? new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "—");
const initials = (s: string) => s.split(/[\s@.]+/).filter(Boolean).slice(0, 2).map((x) => x[0]?.toUpperCase()).join("") || "?";
const WEEK = 7 * 86400000;

export function CmsOverview({ pages, nav }: { pages: CmsPage[]; nav: CmsNav }) {
  const token = useDashboardActionToken();
  const [reqs, setReqs] = React.useState<UReq[]>([]);
  const [unread, setUnread] = React.useState(0);
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const h = { "x-mjg-action-token": token };
      const [f, d] = await Promise.all([
        fetch("/api/admin/cms/page-notes", { headers: h }).then((r) => r.json()).catch(() => ({})),
        fetch("/api/dashboard-notes?scope=all", { headers: h }).then((r) => r.json()).catch(() => ({})),
      ]);
      const fr: UReq[] = (f.notes ?? []).map((n: Record<string, string>) => ({ kind: "frontend", note: n.note, page: n.page_label || n.page_slug || "—", status: n.status, priority: n.priority, type: n.change_type, authorEmail: n.created_by_email || "", authorName: n.created_by_email || "—", createdAt: n.created_at, updatedAt: n.updated_at || n.created_at }));
      const da: UReq[] = (d.notes ?? []).map((n: Record<string, string>) => ({ kind: "dashboard", note: n.note, page: n.page_title || n.route || "—", status: n.status, priority: n.priority, type: n.type, authorEmail: n.created_by_email || "", authorName: n.created_by_name || n.created_by_email || "—", createdAt: n.created_at, updatedAt: n.updated_at || n.created_at }));
      setReqs([...fr, ...da]); setUnread(Number(d.unread) || 0);
    } finally { setLoading(false); }
  }, [token]);
  React.useEffect(() => { load(); }, [load]);

  const s = React.useMemo(() => {
    const active = reqs.filter((r) => r.status !== "archived");
    const by = (st: string) => reqs.filter((r) => r.status === st).length;
    const since = Date.now() - WEEK;
    const requesters = new Map<string, { name: string; count: number }>();
    for (const r of active) { const k = r.authorEmail || r.authorName; const e = requesters.get(k) || { name: r.authorName, count: 0 }; e.count++; requesters.set(k, e); }

    // Per-day activity for the last 7 days (submitted = created that day, completed = marked done that day).
    const perDay: { label: string; submitted: number; completed: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const day = new Date(); day.setHours(0, 0, 0, 0); day.setDate(day.getDate() - i);
      const start = day.getTime(), end = start + 86400000;
      const inDay = (iso: string) => { const t = +new Date(iso); return t >= start && t < end; };
      perDay.push({
        label: day.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" }),
        submitted: reqs.filter((r) => inDay(r.createdAt)).length,
        completed: reqs.filter((r) => r.status === "done" && inDay(r.updatedAt)).length,
      });
    }

    return {
      pagesTotal: pages.length,
      pagesDraft: pages.filter((p) => p.status === "draft").length,
      pagesPublished: pages.filter((p) => p.status === "published").length,
      open: by("open"), inProgress: by("in_progress"), done: by("done"),
      submittedWeek: reqs.filter((r) => +new Date(r.createdAt) >= since).length,
      completedWeek: reqs.filter((r) => r.status === "done" && +new Date(r.updatedAt) >= since).length,
      questions: active.filter((r) => /question/i.test(r.type)).length,
      perDay,
      requesters: [...requesters.values()].sort((a, b) => b.count - a.count).slice(0, 6),
      recent: [...active].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)).slice(0, 6),
    };
  }, [reqs, pages]);

  const tiles = [
    { label: "Frontend Editor", desc: "Review & annotate public pages", icon: MousePointerClick, onClick: nav.editor, primary: true },
    { label: "Edit Requests", desc: "Triage frontend & dashboard requests", icon: ClipboardList, onClick: nav.requests },
    { label: "Pages & Block Builder", desc: "Create & edit CMS pages", icon: PanelsTopLeft, onClick: nav.pages },
    { label: "Steward AI", desc: "Draft pages & changes with AI", icon: Bot, onClick: nav.steward },
  ];
  const stats = [
    { label: "Pages", value: s.pagesTotal, sub: `${s.pagesDraft} draft · ${s.pagesPublished} published`, icon: FileText, onClick: nav.pages },
    { label: "Open requests", value: s.open, sub: "awaiting action", icon: CircleDot, tone: "amber", onClick: nav.requests },
    { label: "In progress", value: s.inProgress, sub: "being worked", icon: Clock, tone: "blue", onClick: nav.requests },
    { label: "Completed", value: s.done, sub: "all time", icon: CheckCircle2, tone: "emerald", onClick: nav.requests },
    { label: "Submitted (7d)", value: s.submittedWeek, sub: "last 7 days", icon: CalendarDays, onClick: nav.requests },
    { label: "Completed (7d)", value: s.completedWeek, sub: "last 7 days", icon: CheckCircle2, tone: "emerald", onClick: nav.requests },
    { label: "Notifications", value: unread, sub: "shared, unread", icon: Bell, tone: unread ? "red" : undefined, onClick: nav.requests },
    { label: "Questions", value: s.questions, sub: "flagged to users", icon: HelpCircle, onClick: nav.requests },
  ];
  const tone = (t?: string) => t === "amber" ? "text-amber-600 dark:text-amber-400" : t === "blue" ? "text-blue-600 dark:text-blue-400" : t === "emerald" ? "text-emerald-600 dark:text-emerald-400" : t === "red" ? "text-destructive" : "text-primary";

  return (
    <div className="space-y-5">
      {/* Quick-launch gateway tiles */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((t) => (
          <button key={t.label} onClick={t.onClick}
            className={cn("group flex items-start gap-3 rounded-xl border p-4 text-left transition hover:shadow-md", t.primary ? "border-primary/40 bg-primary/5 hover:border-primary" : "border-border bg-card hover:border-primary/40")}>
            <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", t.primary ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary")}><t.icon className="h-5 w-5" /></span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-1 text-sm font-semibold">{t.label} <ArrowRight className="h-3.5 w-3.5 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-60" /></span>
              <span className="mt-0.5 block text-xs text-muted-foreground">{t.desc}</span>
            </span>
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-semibold text-muted-foreground">At a glance</h2>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={nav.pages}><Plus className="h-4 w-4" /> New page</Button>
          <Button variant="outline" size="sm" onClick={load}><RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} /></Button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map((st) => (
          <button key={st.label} onClick={st.onClick} className="rounded-xl border border-border bg-card p-4 text-left transition hover:border-primary/40 hover:shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{st.label}</span>
              <st.icon className={cn("h-4 w-4", tone(st.tone))} />
            </div>
            <div className="mt-1 text-2xl font-semibold tabular-nums">{st.value}</div>
            <div className="text-[11px] text-muted-foreground">{st.sub}</div>
          </button>
        ))}
      </div>

      {/* Recent activity + (activity by day, requesters) */}
      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <div className="rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
            <span className="text-sm font-semibold">Recent edit requests</span>
            <button onClick={nav.requests} className="text-xs text-primary hover:underline">View all →</button>
          </div>
          <div className="divide-y divide-border">
            {s.recent.length === 0 && <p className="px-4 py-8 text-center text-sm text-muted-foreground">{loading ? "Loading…" : "No requests yet. Capture some from the Frontend Editor or the dashboard Review button."}</p>}
            {s.recent.map((r, i) => (
              <button key={i} onClick={nav.requests} className="flex w-full items-start gap-3 px-4 py-2.5 text-left hover:bg-muted/40">
                <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", r.kind === "frontend" ? "bg-primary" : "bg-blue-500")} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm">{r.note}</span>
                  <span className="block truncate text-[11px] text-muted-foreground">{r.page} · {r.type} · {r.authorName} · submitted {fmtDate(r.createdAt)}{r.status === "done" ? ` · done ${fmtDate(r.updatedAt)}` : ""}</span>
                </span>
                <span className={cn("shrink-0 text-[10px] font-bold uppercase", PRIORITY_COLOR[r.priority])}>{r.priority}</span>
                <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium capitalize", STATUS_PILL[r.status])}>{r.status.replace("_", " ")}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {/* Activity by day */}
          <div className="rounded-xl border border-border bg-card">
            <div className="flex items-center gap-1.5 border-b border-border px-4 py-2.5 text-sm font-semibold"><CalendarDays className="h-4 w-4 text-muted-foreground" /> Activity · last 7 days</div>
            <div className="px-4 py-1.5">
              <div className="flex items-center pb-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                <span className="flex-1">Day</span><span className="w-16 text-right">Submitted</span><span className="w-16 text-right">Completed</span>
              </div>
              {s.perDay.map((d) => (
                <div key={d.label} className="flex items-center border-t border-border/60 py-1.5 text-xs">
                  <span className="flex-1 text-muted-foreground">{d.label}</span>
                  <span className="w-16 text-right font-medium tabular-nums">{d.submitted}</span>
                  <span className={cn("w-16 text-right font-medium tabular-nums", d.completed ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground")}>{d.completed}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Requesters */}
          <div className="rounded-xl border border-border bg-card">
            <div className="flex items-center gap-1.5 border-b border-border px-4 py-2.5 text-sm font-semibold"><Users className="h-4 w-4 text-muted-foreground" /> Requesters</div>
            <div className="divide-y divide-border">
              {s.requesters.length === 0 && <p className="px-4 py-8 text-center text-sm text-muted-foreground">No requesters yet.</p>}
              {s.requesters.map((u) => (
                <div key={u.name} className="flex items-center gap-2.5 px-4 py-2.5">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">{initials(u.name)}</span>
                  <span className="min-w-0 flex-1 truncate text-sm">{u.name}</span>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">{u.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
