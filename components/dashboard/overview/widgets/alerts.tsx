"use client";

import Link from "next/link";
import { useState } from "react";
import { Bell, Bot, CalendarClock, CheckCheck, CircleAlert, Siren, X } from "lucide-react";
import { useDashboardActionToken } from "@/components/layout/dashboard-action-token";
import { cn } from "@/lib/utils";
import { useWidgetData } from "../use-widget-data";
import { Empty, Load, Pill, WidgetCard, relTime, type WidgetProps } from "./kit";

type Alerts = {
  agent?: { approvals: number; openTasks: number; review: string | null; href: string | null };
  next: { kind: string; title: string; at: string; href: string }[];
  jobs?: { label: string; href: string; tone: "bad" | "warn" | "info" }[];
};

/** The tinted notification card used across the row. */
function AlertCard({ icon: Icon, tone, title, children, href, hrefLabel }: { icon: typeof Bell; tone: "gold" | "bad" | "calm"; title: string; children: React.ReactNode; href?: string | null; hrefLabel?: string }) {
  return (
    <section
      aria-label={title}
      className={cn(
        "relative flex h-full min-h-[112px] gap-3 overflow-hidden rounded-2xl border p-4 shadow-sm",
        tone === "gold" && "border-[#b88a4a]/40 bg-gradient-to-br from-[#b88a4a]/15 via-card to-card",
        tone === "bad" && "border-red-200 bg-gradient-to-br from-red-50 via-card to-card dark:border-red-900 dark:from-red-950/40",
        tone === "calm" && "bg-card",
      )}
    >
      <span
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
          tone === "bad" ? "bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-300" : "bg-[#b88a4a]/15 text-[#9a7038] dark:text-[#d9b27a]",
        )}
      >
        <Icon className="h-5 w-5" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">{title}</h3>
          {href ? (
            <Link href={href} className="text-xs font-medium text-[#9a7038] hover:underline dark:text-[#d9b27a]">
              {hrefLabel ?? "Open"}
            </Link>
          ) : null}
        </div>
        <div className="mt-1">{children}</div>
      </div>
    </section>
  );
}

export function AgentAlertWidget({ def }: WidgetProps) {
  const state = useWidgetData<Alerts>("alerts", undefined, def.refreshMs);
  const a = state.data?.agent;
  const waiting = a ? a.approvals : 0;
  return (
    <AlertCard icon={Bot} tone={waiting ? "gold" : "calm"} title="AI Agent" href={a?.href} hrefLabel={waiting ? "Review" : "Open"}>
      {!state.data ? (
        <p className="text-sm text-muted-foreground">Checking…</p>
      ) : !a ? (
        <p className="text-sm text-muted-foreground">No agent activity.</p>
      ) : waiting ? (
        <>
          <p className="text-base font-semibold leading-snug">
            {waiting} action{waiting === 1 ? "" : "s"} waiting for your approval
          </p>
          <p className="truncate text-xs text-muted-foreground">{a.openTasks} open agent task{a.openTasks === 1 ? "" : "s"}</p>
        </>
      ) : a.review ? (
        <>
          <p className="text-base font-semibold leading-snug">Ready for review</p>
          <p className="truncate text-xs text-muted-foreground">{a.review}</p>
        </>
      ) : (
        <>
          <p className="text-base font-semibold leading-snug">All clear</p>
          <p className="text-xs text-muted-foreground">{a.openTasks ? `${a.openTasks} agent task${a.openTasks === 1 ? "" : "s"} in progress` : "Ask Shepherd anything from the AI Agent page."}</p>
        </>
      )}
    </AlertCard>
  );
}

export function NextTodoWidget({ def }: WidgetProps) {
  const state = useWidgetData<Alerts>("alerts", undefined, def.refreshMs);
  const next = state.data?.next ?? [];
  const first = next[0];
  const overdue = first ? new Date(first.at).getTime() < Date.now() : false;
  return (
    <AlertCard icon={CalendarClock} tone={overdue ? "bad" : "gold"} title="Up Next" href={first?.href.startsWith("#") ? undefined : first?.href}>
      {!state.data ? (
        <p className="text-sm text-muted-foreground">Checking…</p>
      ) : !first ? (
        <>
          <p className="text-base font-semibold">Nothing scheduled</p>
          <p className="text-xs text-muted-foreground">Add a reminder or task to see it here.</p>
        </>
      ) : (
        <>
          <p className="line-clamp-2 text-base font-semibold leading-snug">{first.title}</p>
          <p className={cn("text-xs", overdue ? "text-red-600 dark:text-red-400" : "text-muted-foreground")}>
            {first.kind} · {overdue ? "was due " : ""}
            {relTime(first.at)} · {new Date(first.at).toLocaleString(undefined, { weekday: "short", hour: "numeric", minute: "2-digit" })}
          </p>
          {next.length > 1 ? <p className="mt-1 text-[11px] text-muted-foreground">then {next[1].title}</p> : null}
        </>
      )}
    </AlertCard>
  );
}

export function JobAlertWidget({ def }: WidgetProps) {
  const state = useWidgetData<Alerts>("alerts", undefined, def.refreshMs);
  const jobs = state.data?.jobs ?? [];
  const bad = jobs.some((j) => j.tone === "bad");
  return (
    <AlertCard icon={Siren} tone={bad ? "bad" : jobs.length ? "gold" : "calm"} title="Job Alerts">
      {!state.data ? (
        <p className="text-sm text-muted-foreground">Checking…</p>
      ) : !jobs.length ? (
        <>
          <p className="flex items-center gap-1.5 text-base font-semibold">
            <CheckCheck className="h-4 w-4 text-[#b88a4a]" aria-hidden /> Everything is running
          </p>
          <p className="text-xs text-muted-foreground">No failed sends or jobs this week.</p>
        </>
      ) : (
        <ul className="space-y-1">
          {jobs.slice(0, 3).map((j) => (
            <li key={j.label}>
              <Link href={j.href} className="flex items-center gap-1.5 text-sm font-medium hover:underline">
                <CircleAlert className={cn("h-3.5 w-3.5 shrink-0", j.tone === "bad" ? "text-red-600" : "text-amber-600")} aria-hidden />
                <span className="truncate">{j.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </AlertCard>
  );
}

type Notif = { id: string; type: string; title: string; message: string; href: string | null; createdAt: string };

export function NotificationsWidget({ def }: WidgetProps) {
  const token = useDashboardActionToken();
  const state = useWidgetData<{ notifications: Notif[] }>("notifications", undefined, def.refreshMs);
  const [gone, setGone] = useState<Set<string>>(new Set());
  const dismiss = async (id: string) => {
    setGone((s) => new Set(s).add(id));
    await fetch("/api/me/notifications", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, actionToken: token }) }).catch(() => undefined);
  };
  return (
    <WidgetCard icon={Bell} title="Notifications">
      <Load state={state}>
        {(d) => {
          const list = d.notifications.filter((n) => !gone.has(n.id));
          return list.length ? (
            <ul className="space-y-1.5">
              {list.map((n) => (
                <li key={n.id} className="flex items-start gap-2 rounded-lg border px-3 py-2">
                  <div className="min-w-0 flex-1">
                    {n.href ? (
                      <Link href={n.href} className="block truncate text-sm font-medium hover:underline">
                        {n.title}
                      </Link>
                    ) : (
                      <p className="truncate text-sm font-medium">{n.title}</p>
                    )}
                    <p className="line-clamp-2 text-xs text-muted-foreground">{n.message}</p>
                  </div>
                  <Pill>{relTime(n.createdAt)}</Pill>
                  <button type="button" onClick={() => dismiss(n.id)} className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label={`Dismiss ${n.title}`}>
                    <X className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <Empty>You&apos;re all caught up.</Empty>
          );
        }}
      </Load>
    </WidgetCard>
  );
}
