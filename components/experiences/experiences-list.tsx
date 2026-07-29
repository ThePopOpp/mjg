"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { LayoutGrid, Table as TableIcon, CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { ExperienceActions } from "@/components/experiences/experience-actions";
import { FREQUENCY_LABELS, type EmailEvent, type ExperienceStatus } from "@/lib/experiences/types";

type ExperienceRow = {
  id: string;
  name: string;
  start_date: string;
  start_time?: string | null;
  frequency: "weekly" | "biweekly";
  duration_weeks: number;
  status: ExperienceStatus;
  attendee_count: number;
  experience_types?: { name: string | null } | null;
  profiles?: { id?: string; full_name: string | null; first_name: string | null; last_name: string | null } | null;
  experience_previews?: PreviewShape | null;
};

type PreviewShape = { id: string; title: string; content: string | null; image_url: string | null; video_url: string | null; audio_url: string | null; document_url: string | null; frequency_label: string | null };
type Facilitator = { id: string; name: string };
const toEditable = (exp: ExperienceRow) => ({ id: exp.id, name: exp.name, start_date: exp.start_date, start_time: exp.start_time ?? null, status: exp.status, facilitator_id: exp.profiles?.id ?? null, preview: exp.experience_previews ?? null });

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

export function ExperiencesList({ experiences, emailEvents = [], facilitators = [] }: { experiences: ExperienceRow[]; emailEvents?: EmailEvent[]; facilitators?: Facilitator[] }) {
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
        <CardsView experiences={experiences} facilitators={facilitators} />
      ) : view === "table" ? (
        <TableView experiences={experiences} facilitators={facilitators} />
      ) : (
        <EmailCalendar events={emailEvents} />
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: ExperienceStatus }) {
  return <span className={cn("inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize", STATUS_TONE[status])}>{status}</span>;
}

function CardsView({ experiences, facilitators }: { experiences: ExperienceRow[]; facilitators: Facilitator[] }) {
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
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Facilitator: <span className="text-foreground">{facilitatorName(exp)}</span></p>
                <ExperienceActions experience={toEditable(exp)} facilitators={facilitators} variant="overlay" />
              </div>
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

function TableView({ experiences, facilitators }: { experiences: ExperienceRow[]; facilitators: Facilitator[] }) {
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
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {experiences.map((exp) => (
              <TableRow key={exp.id}>
                <TableCell className="font-medium"><Link href={`/dashboard/experiences/${exp.id}`} className="hover:underline">{exp.name}</Link></TableCell>
                <TableCell>{exp.experience_types?.name ?? "-"}</TableCell>
                <TableCell>{facilitatorName(exp)}</TableCell>
                <TableCell>{fmtDate(exp.start_date)}</TableCell>
                <TableCell>{FREQUENCY_LABELS[exp.frequency]}</TableCell>
                <TableCell>{exp.duration_weeks}</TableCell>
                <TableCell>{exp.attendee_count}</TableCell>
                <TableCell><StatusBadge status={exp.status} /></TableCell>
                <TableCell><ExperienceActions experience={toEditable(exp)} facilitators={facilitators} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// ── Email calendar (plots every scheduled email; Day/Week/Month/Year). No external lib.
type CalMode = "day" | "week" | "month" | "year";
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function dayKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function startOfDay(d: Date) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
function addDays(d: Date, n: number) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }
function fmtTime(iso: string) { return new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }); }

function EventChip({ e }: { e: EmailEvent }) {
  return (
    <Link
      href={`/dashboard/experiences/${e.experienceId}`}
      className="block truncate rounded bg-primary/15 px-1 py-0.5 text-[11px] text-primary hover:bg-primary/25"
      title={`${e.experienceName} · Week/step ${e.stepNumber}${e.templateName ? ` · ${e.templateName}` : ""} · ${e.recipients} recipient${e.recipients === 1 ? "" : "s"} · ${fmtTime(e.scheduledAt)}`}
    >
      {fmtTime(e.scheduledAt)} {e.experienceName} · #{e.stepNumber}
    </Link>
  );
}

export function EmailCalendar({ events }: { events: EmailEvent[] }) {
  const [mode, setMode] = useState<CalMode>("month");
  const [cursor, setCursor] = useState<Date>(() => startOfDay(new Date()));

  const byDay = useMemo(() => {
    const map = new Map<string, EmailEvent[]>();
    for (const e of events) {
      const k = dayKey(new Date(e.scheduledAt));
      map.set(k, [...(map.get(k) ?? []), e]);
    }
    for (const arr of map.values()) arr.sort((a, b) => +new Date(a.scheduledAt) - +new Date(b.scheduledAt));
    return map;
  }, [events]);

  function shift(dir: number) {
    setCursor((c) => {
      if (mode === "day") return addDays(c, dir);
      if (mode === "week") return addDays(c, dir * 7);
      if (mode === "month") return new Date(c.getFullYear(), c.getMonth() + dir, 1);
      return new Date(c.getFullYear() + dir, 0, 1);
    });
  }

  const label = (() => {
    if (mode === "day") return cursor.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric", year: "numeric" });
    if (mode === "week") {
      const s = addDays(cursor, -cursor.getDay());
      const e = addDays(s, 6);
      return `${s.toLocaleDateString([], { month: "short", day: "numeric" })} – ${e.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}`;
    }
    if (mode === "month") return cursor.toLocaleDateString([], { month: "long", year: "numeric" });
    return String(cursor.getFullYear());
  })();

  const MODES: { key: CalMode; label: string }[] = [
    { key: "day", label: "Today" },
    { key: "week", label: "Week" },
    { key: "month", label: "Month" },
    { key: "year", label: "Year" },
  ];

  return (
    <Card>
      <CardContent className="p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => shift(-1)} className="rounded border p-1 hover:bg-accent"><ChevronLeft className="h-4 w-4" /></button>
            <button type="button" onClick={() => shift(1)} className="rounded border p-1 hover:bg-accent"><ChevronRight className="h-4 w-4" /></button>
            <h3 className="ml-1 font-semibold">{label}</h3>
          </div>
          <div className="inline-flex rounded-md border bg-card p-0.5">
            {MODES.map((m) => (
              <button
                key={m.key}
                type="button"
                onClick={() => { setMode(m.key); if (m.key === "day") setCursor(startOfDay(new Date())); }}
                className={cn("rounded px-3 py-1 text-sm font-medium transition-colors", mode === m.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {!events.length ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No scheduled emails yet. Create an experience to populate the calendar.</p>
        ) : mode === "month" ? (
          <MonthGrid cursor={cursor} byDay={byDay} />
        ) : mode === "week" ? (
          <WeekGrid cursor={cursor} byDay={byDay} />
        ) : mode === "day" ? (
          <DayAgenda cursor={cursor} byDay={byDay} />
        ) : (
          <YearGrid cursor={cursor} byDay={byDay} onPickDay={(d) => { setCursor(d); setMode("day"); }} />
        )}
      </CardContent>
    </Card>
  );
}

function MonthGrid({ cursor, byDay }: { cursor: Date; byDay: Map<string, EmailEvent[]> }) {
  const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const gridStart = addDays(first, -first.getDay());
  const cells = Array.from({ length: 42 }, (_, k) => addDays(gridStart, k));
  const todayKey = dayKey(new Date());
  return (
    <>
      <div className="grid grid-cols-7 text-center text-xs text-muted-foreground">
        {WEEKDAYS.map((d) => <div key={d} className="py-1">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((d) => {
          const key = dayKey(d);
          const inMonth = d.getMonth() === cursor.getMonth();
          const items = byDay.get(key) ?? [];
          return (
            <div key={key} className={cn("min-h-[84px] rounded border p-1 text-left", inMonth ? "bg-background" : "bg-muted/30 text-muted-foreground/60", key === todayKey && "ring-1 ring-primary")}>
              <div className="text-xs">{d.getDate()}</div>
              <div className="mt-0.5 space-y-0.5">
                {items.slice(0, 3).map((e) => <EventChip key={e.id} e={e} />)}
                {items.length > 3 ? <div className="px-1 text-[10px] text-muted-foreground">+{items.length - 3} more</div> : null}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

function WeekGrid({ cursor, byDay }: { cursor: Date; byDay: Map<string, EmailEvent[]> }) {
  const start = addDays(cursor, -cursor.getDay());
  const days = Array.from({ length: 7 }, (_, k) => addDays(start, k));
  const todayKey = dayKey(new Date());
  return (
    <div className="grid grid-cols-7 gap-1">
      {days.map((d) => {
        const key = dayKey(d);
        const items = byDay.get(key) ?? [];
        return (
          <div key={key} className={cn("min-h-[160px] rounded border p-1", key === todayKey && "ring-1 ring-primary")}>
            <div className="mb-1 text-center text-xs font-medium">{d.toLocaleDateString([], { weekday: "short" })} {d.getDate()}</div>
            <div className="space-y-0.5">
              {items.map((e) => <EventChip key={e.id} e={e} />)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DayAgenda({ cursor, byDay }: { cursor: Date; byDay: Map<string, EmailEvent[]> }) {
  const items = byDay.get(dayKey(cursor)) ?? [];
  if (!items.length) return <p className="py-8 text-center text-sm text-muted-foreground">No emails scheduled for this day.</p>;
  return (
    <div className="space-y-2">
      {items.map((e) => (
        <Link key={e.id} href={`/dashboard/experiences/${e.experienceId}`} className="flex items-center justify-between gap-3 rounded-lg border p-3 hover:bg-muted/50">
          <div className="flex items-center gap-3">
            <span className="w-20 shrink-0 text-sm font-medium tabular-nums">{fmtTime(e.scheduledAt)}</span>
            <div>
              <p className="text-sm font-medium">{e.experienceName} · step #{e.stepNumber}</p>
              <p className="text-xs text-muted-foreground">{e.templateName ?? "No template"}</p>
            </div>
          </div>
          <span className="shrink-0 text-xs text-muted-foreground">{e.recipients} recipient{e.recipients === 1 ? "" : "s"}</span>
        </Link>
      ))}
    </div>
  );
}

function YearGrid({ cursor, byDay, onPickDay }: { cursor: Date; byDay: Map<string, EmailEvent[]>; onPickDay: (d: Date) => void }) {
  const year = cursor.getFullYear();
  const todayKey = dayKey(new Date());
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 12 }, (_, m) => {
        const first = new Date(year, m, 1);
        const gridStart = addDays(first, -first.getDay());
        const cells = Array.from({ length: 42 }, (_, k) => addDays(gridStart, k));
        return (
          <div key={m} className="rounded-lg border p-2">
            <p className="mb-1 text-center text-xs font-semibold">{first.toLocaleDateString([], { month: "long" })}</p>
            <div className="grid grid-cols-7 gap-0.5">
              {cells.map((d) => {
                const key = dayKey(d);
                const inMonth = d.getMonth() === m;
                const count = (byDay.get(key) ?? []).length;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => onPickDay(startOfDay(d))}
                    className={cn(
                      "flex h-6 items-center justify-center rounded text-[10px] transition-colors",
                      !inMonth && "text-muted-foreground/30",
                      count ? "bg-primary/20 font-semibold text-primary hover:bg-primary/30" : "hover:bg-accent",
                      key === todayKey && "ring-1 ring-primary",
                    )}
                    title={count ? `${count} email${count === 1 ? "" : "s"}` : undefined}
                  >
                    {d.getDate()}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
