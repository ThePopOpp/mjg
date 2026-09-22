"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  AlertTriangle, CalendarClock, CalendarDays, CheckCircle2, Clock,
  Columns3, History, LayoutGrid, Mail, Table as TableIcon, Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatCarousel } from "@/components/experiences/stat-carousel";
import {
  CalendarView, CardsView, KanbanView, ScheduleTable, fmt, relative,
} from "@/components/experiences/automation-views";
import type { AutomationStatus, GroupOption } from "@/lib/experiences/automation";
import { cn } from "@/lib/utils";

type View = "table" | "cards" | "kanban" | "calendar";

const VIEWS: { key: View; label: string; icon: typeof TableIcon }[] = [
  { key: "table", label: "Table", icon: TableIcon },
  { key: "cards", label: "Cards", icon: LayoutGrid },
  { key: "kanban", label: "Kanban", icon: Columns3 },
  { key: "calendar", label: "Calendar", icon: CalendarDays },
];

export function AutomationStatusView({
  groups,
  status,
}: {
  groups: GroupOption[];
  status: AutomationStatus | null;
}) {
  const router = useRouter();
  const [view, setView] = useState<View>("table");

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1 space-y-1.5">
            <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Group</label>
            <Select
              value={status?.group.id ?? ""}
              onValueChange={(id) => router.push(`/dashboard/experiences/automation?group=${id}`)}
            >
              <SelectTrigger className="w-full sm:max-w-md"><SelectValue placeholder="Select a group…" /></SelectTrigger>
              <SelectContent>
                {groups.map((g) => (
                  <SelectItem key={g.id} value={g.id}>
                    {g.name} · {g.attendees} {g.attendees === 1 ? "person" : "people"}
                    {g.typeName ? ` · ${g.typeName}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {status ? (
            <Button asChild variant="outline" className="shrink-0">
              <Link href={`/dashboard/experiences/${status.group.id}`}>Open group</Link>
            </Button>
          ) : null}
        </CardContent>
      </Card>

      {!status ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            {groups.length ? "Choose a group to see where its email automation stands." : "No groups yet."}
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Anything that needs attention goes first. */}
          {status.totals.overdue > 0 || status.totals.failedEvents > 0 ? (
            <Card className="border-destructive/50">
              <CardContent className="flex items-start gap-3 p-4">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
                <div className="text-sm">
                  {status.totals.overdue > 0 ? (
                    <p>
                      <span className="font-semibold text-destructive">{status.totals.overdue} email(s) are past their send time</span>{" "}
                      and still queued — the scheduler may not be running.
                    </p>
                  ) : null}
                  {status.totals.failedEvents > 0 ? (
                    <p className="mt-1">
                      <span className="font-semibold text-destructive">{status.totals.failedEvents} send(s) failed.</span> See the
                      rows marked failed below.
                    </p>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ) : null}

          <StatCarousel
            items={[
              {
                key: "progress",
                icon: CheckCircle2,
                label: "Progress",
                value: `${status.totals.sentSteps} of ${status.totals.steps}`,
                detail: "Emails sent",
              },
              {
                key: "recipients",
                icon: Users,
                label: "Recipients",
                value: String(status.totals.recipients),
                detail: "On every email",
              },
              {
                key: "last-relative",
                icon: Mail,
                label: "Last sent",
                value: status.lastSentAt ? relative(status.lastSentAt) : "—",
                detail: status.lastSentAt ? "Most recent email" : "Nothing sent yet",
              },
              {
                key: "next-relative",
                icon: Clock,
                label: "Next email",
                value: status.nextSendAt ? relative(status.nextSendAt) : "All sent",
                detail: status.nextStep?.templateName ?? "Sequence complete",
              },
              {
                key: "next-datetime",
                icon: CalendarClock,
                label: "Next email date & time",
                value: status.nextSendAt ? fmt(status.nextSendAt) : "—",
                detail: status.nextSendAt ? "Arizona time" : "Nothing scheduled",
              },
              {
                key: "last-datetime",
                icon: History,
                label: "Last email date & time",
                value: status.lastSentAt ? fmt(status.lastSentAt) : "—",
                detail: status.lastSentAt ? "Arizona time" : "Nothing sent yet",
              },
            ]}
          />

          {/* Progress bar across the sequence */}
          <Card>
            <CardContent className="p-4">
              <div className="mb-2 flex items-baseline justify-between text-sm">
                <span className="font-medium">{status.group.name}</span>
                <span className="text-muted-foreground">
                  {Math.round((status.totals.sentSteps / Math.max(status.totals.steps, 1)) * 100)}% complete
                </span>
              </div>
              <div className="flex gap-0.5">
                {status.steps.map((s) => (
                  <div
                    key={s.stepNumber}
                    title={`${s.stepNumber}. ${s.templateName ?? ""} — ${s.status}`}
                    className={cn(
                      "h-2 flex-1 rounded-sm",
                      s.status === "sent" ? "bg-[#b88a4a]"
                        : s.status === "partial" ? "bg-[#b88a4a]/50"
                        : s.status === "failed" ? "bg-destructive"
                        : "bg-muted",
                    )}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-col items-stretch gap-3 space-y-0 pb-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-base">Email schedule</CardTitle>
                <p className="text-sm text-muted-foreground">All times Arizona (Phoenix).</p>
              </div>
              <div className="inline-flex shrink-0 rounded-md border bg-card p-0.5">
                {VIEWS.map((v) => (
                  <button
                    key={v.key}
                    type="button"
                    onClick={() => setView(v.key)}
                    aria-pressed={view === v.key}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-sm font-medium transition-colors",
                      view === v.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <v.icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{v.label}</span>
                  </button>
                ))}
              </div>
            </CardHeader>
            <CardContent className={view === "table" ? "p-0" : "pt-0"}>
              {!status.steps.length ? (
                <p className="py-10 text-center text-sm text-muted-foreground">
                  This group has no email sequence configured.
                </p>
              ) : view === "table" ? (
                <ScheduleTable steps={status.steps} />
              ) : view === "cards" ? (
                <CardsView steps={status.steps} />
              ) : view === "kanban" ? (
                <KanbanView steps={status.steps} />
              ) : (
                <CalendarView steps={status.steps} nextSendAt={status.nextSendAt} />
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
