"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { LayoutGrid, Table as TableIcon, CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { FREQUENCY_LABELS, type ExperienceStatus } from "@/lib/experiences/types";

type ExperienceRow = {
  id: string;
  name: string;
  start_date: string;
  frequency: "weekly" | "biweekly";
  duration_weeks: number;
  status: ExperienceStatus;
  attendee_count: number;
  experience_types?: { name: string | null } | null;
  profiles?: { full_name: string | null; first_name: string | null; last_name: string | null } | null;
};

const STATUS_TONE: Record<ExperienceStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  scheduled: "bg-primary/15 text-primary",
  active: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  completed: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  cancelled: "bg-destructive/15 text-destructive",
};

type View = "cards" | "table" | "calendar";

function facilitatorName(row: ExperienceRow) {
  const p = row.profiles;
  if (!p) return "Unassigned";
  return p.full_name || `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim() || "Unassigned";
}

function fmtDate(d: string) {
  return new Date(`${d}T00:00:00Z`).toLocaleDateString([], { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" });
}

export function ExperiencesList({ experiences }: { experiences: ExperienceRow[] }) {
  const [view, setView] = useState<View>("cards");

  const views: { key: View; label: string; icon: typeof LayoutGrid }[] = [
    { key: "cards", label: "Cards", icon: LayoutGrid },
    { key: "table", label: "Table", icon: TableIcon },
    { key: "calendar", label: "Calendar", icon: CalendarDays },
  ];

  return (
    <div className="space-y-4">
      <div className="inline-flex rounded-md border bg-card p-0.5">
        {views.map((v) => (
          <button
            key={v.key}
            type="button"
            onClick={() => setView(v.key)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-sm font-medium transition-colors",
              view === v.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <v.icon className="h-4 w-4" /> {v.label}
          </button>
        ))}
      </div>

      {!experiences.length ? (
        <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">No experiences yet. Create one to get started.</CardContent></Card>
      ) : view === "cards" ? (
        <CardsView experiences={experiences} />
      ) : view === "table" ? (
        <TableView experiences={experiences} />
      ) : (
        <CalendarView experiences={experiences} />
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: ExperienceStatus }) {
  return <span className={cn("inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize", STATUS_TONE[status])}>{status}</span>;
}

function CardsView({ experiences }: { experiences: ExperienceRow[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {experiences.map((exp) => (
        <Link key={exp.id} href={`/dashboard/experiences/${exp.id}`}>
          <Card className="h-full transition-colors hover:border-primary/50">
            <CardContent className="space-y-3 p-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">{exp.experience_types?.name ?? "Experience"}</p>
                  <h3 className="mt-0.5 font-semibold leading-tight">{exp.name}</h3>
                </div>
                <StatusBadge status={exp.status} />
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <Detail label="Starts" value={fmtDate(exp.start_date)} />
                <Detail label="Cadence" value={FREQUENCY_LABELS[exp.frequency]} />
                <Detail label="Weeks" value={String(exp.duration_weeks)} />
                <Detail label="Attendees" value={String(exp.attendee_count)} />
              </div>
              <p className="text-sm text-muted-foreground">Facilitator: <span className="text-foreground">{facilitatorName(exp)}</span></p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}

function TableView({ experiences }: { experiences: ExperienceRow[] }) {
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Facilitator</TableHead>
              <TableHead>Starts</TableHead>
              <TableHead>Cadence</TableHead>
              <TableHead>Weeks</TableHead>
              <TableHead>Attendees</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {experiences.map((exp) => (
              <TableRow key={exp.id} className="cursor-pointer">
                <TableCell className="font-medium"><Link href={`/dashboard/experiences/${exp.id}`} className="hover:underline">{exp.name}</Link></TableCell>
                <TableCell>{exp.experience_types?.name ?? "-"}</TableCell>
                <TableCell>{facilitatorName(exp)}</TableCell>
                <TableCell>{fmtDate(exp.start_date)}</TableCell>
                <TableCell>{FREQUENCY_LABELS[exp.frequency]}</TableCell>
                <TableCell>{exp.duration_weeks}</TableCell>
                <TableCell>{exp.attendee_count}</TableCell>
                <TableCell><StatusBadge status={exp.status} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// Hand-built month grid (matches the app's calendar convention — no external lib).
function CalendarView({ experiences }: { experiences: ExperienceRow[] }) {
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return { year: d.getUTCFullYear(), month: d.getUTCMonth() };
  });

  const byDay = useMemo(() => {
    const map = new Map<string, ExperienceRow[]>();
    for (const exp of experiences) {
      const key = exp.start_date;
      map.set(key, [...(map.get(key) ?? []), exp]);
    }
    return map;
  }, [experiences]);

  const first = new Date(Date.UTC(cursor.year, cursor.month, 1));
  const gridStart = new Date(first);
  gridStart.setUTCDate(1 - first.getUTCDay());
  const cells = Array.from({ length: 42 }, (_, k) => {
    const d = new Date(gridStart);
    d.setUTCDate(gridStart.getUTCDate() + k);
    return d;
  });
  const monthLabel = first.toLocaleDateString([], { month: "long", year: "numeric", timeZone: "UTC" });

  function shift(delta: number) {
    setCursor((c) => {
      const m = c.month + delta;
      return { year: c.year + Math.floor(m / 12), month: ((m % 12) + 12) % 12 };
    });
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-semibold">{monthLabel}</h3>
          <div className="flex gap-1">
            <button type="button" onClick={() => shift(-1)} className="rounded border p-1 hover:bg-accent"><ChevronLeft className="h-4 w-4" /></button>
            <button type="button" onClick={() => shift(1)} className="rounded border p-1 hover:bg-accent"><ChevronRight className="h-4 w-4" /></button>
          </div>
        </div>
        <div className="grid grid-cols-7 text-center text-xs text-muted-foreground">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => <div key={d} className="py-1">{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((d) => {
            const key = d.toISOString().slice(0, 10);
            const inMonth = d.getUTCMonth() === cursor.month;
            const items = byDay.get(key) ?? [];
            return (
              <div key={key} className={cn("min-h-[72px] rounded border p-1 text-left", inMonth ? "bg-background" : "bg-muted/30 text-muted-foreground/60")}>
                <div className="text-xs">{d.getUTCDate()}</div>
                <div className="mt-0.5 space-y-0.5">
                  {items.map((exp) => (
                    <Link key={exp.id} href={`/dashboard/experiences/${exp.id}`} className="block truncate rounded bg-primary/15 px-1 py-0.5 text-[11px] text-primary hover:bg-primary/25" title={exp.name}>
                      {exp.name}
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
