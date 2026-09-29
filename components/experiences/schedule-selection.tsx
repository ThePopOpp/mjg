"use client";

// Bulk selection for a group's email sequence: the shared checkbox, the
// select-all control, and the action bar that slides up from the bottom of the
// viewport once something is ticked.
//
// One selection lives above all four views (table, cards, kanban, calendar), so
// ticking Week 3 in the calendar and switching to the table keeps it ticked.
// Selection is by STEP NUMBER, which is what every view already keys on.

import * as React from "react";
import { createPortal } from "react-dom";
import { CalendarClock, Loader2, Pause, Play, RotateCcw, Send, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useDashboardActionToken } from "@/components/layout/dashboard-action-token";
import type { AutomationStep } from "@/lib/experiences/automation";
import { TZ, fmt } from "@/components/experiences/automation-views";

// ── Selection state ──────────────────────────────────────────────────────────

export type Selection = {
  selected: Set<number>;
  toggle: (step: number) => void;
  set: (steps: number[]) => void;
  clear: () => void;
  isSelected: (step: number) => boolean;
};

export function useScheduleSelection(): Selection {
  const [selected, setSelected] = React.useState<Set<number>>(() => new Set());

  const toggle = React.useCallback((step: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(step)) next.delete(step);
      else next.add(step);
      return next;
    });
  }, []);

  const set = React.useCallback((steps: number[]) => setSelected(new Set(steps)), []);
  const clear = React.useCallback(() => setSelected(new Set()), []);
  const isSelected = React.useCallback((step: number) => selected.has(step), [selected]);

  return { selected, toggle, set, clear, isSelected };
}

// ── Checkboxes ───────────────────────────────────────────────────────────────

/** The per-row checkbox. `stopPropagation` keeps it from triggering row clicks. */
export function StepCheckbox({
  step,
  selection,
  label,
  className,
}: {
  step: AutomationStep;
  selection: Selection;
  label?: string;
  className?: string;
}) {
  return (
    <input
      type="checkbox"
      checked={selection.isSelected(step.stepNumber)}
      onChange={() => selection.toggle(step.stepNumber)}
      onClick={(e) => e.stopPropagation()}
      aria-label={label ?? `Select email ${step.stepNumber}${step.templateName ? ` — ${step.templateName}` : ""}`}
      className={cn("h-4 w-4 shrink-0 cursor-pointer rounded border-input accent-[#b88a4a]", className)}
    />
  );
}

/** Header checkbox: all / none, with an indeterminate state for a partial pick. */
export function SelectAllCheckbox({
  steps,
  selection,
  className,
}: {
  steps: AutomationStep[];
  selection: Selection;
  className?: string;
}) {
  const ref = React.useRef<HTMLInputElement>(null);
  const all = steps.map((s) => s.stepNumber);
  const chosen = all.filter((n) => selection.isSelected(n)).length;

  React.useEffect(() => {
    if (ref.current) ref.current.indeterminate = chosen > 0 && chosen < all.length;
  }, [chosen, all.length]);

  return (
    <input
      ref={ref}
      type="checkbox"
      checked={all.length > 0 && chosen === all.length}
      onChange={() => (chosen === all.length ? selection.clear() : selection.set(all))}
      aria-label={chosen === all.length ? "Clear selection" : "Select every email"}
      className={cn("h-4 w-4 shrink-0 cursor-pointer rounded border-input accent-[#b88a4a]", className)}
    />
  );
}

// ── Date helpers ─────────────────────────────────────────────────────────────

// The programme runs on Arizona time, which has no DST, so a wall-clock time
// entered here is -07:00 all year. Converting through the browser's own zone
// would silently shift a send by an hour for anyone outside Arizona.
const AZ_OFFSET = "-07:00";

function toAzIsoString(date: string, time: string): string {
  const t = /^\d{2}:\d{2}$/.test(time) ? `${time}:00` : "08:00:00";
  return `${date}T${t}.000${AZ_OFFSET}`;
}

/** Today in Arizona, for the date input's default and minimum. */
function azToday(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

// ── The slide-up action bar ──────────────────────────────────────────────────

type Mode = null | "reanchor" | "resend";

export function ScheduleActionBar({
  experienceId,
  steps,
  selection,
  onDone,
}: {
  experienceId: string;
  steps: AutomationStep[];
  selection: Selection;
  onDone: () => void;
}) {
  const token = useDashboardActionToken();
  const [busy, setBusy] = React.useState<string | null>(null);
  const [mode, setMode] = React.useState<Mode>(null);
  const [error, setError] = React.useState("");
  const [result, setResult] = React.useState("");
  const [date, setDate] = React.useState(azToday);
  const [time, setTime] = React.useState("08:00");
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  const chosen = steps.filter((s) => selection.isSelected(s.stepNumber));
  const chosenNumbers = chosen.map((s) => s.stepNumber);
  const earliest = chosen
    .filter((s) => s.date)
    .sort((a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime())[0];

  const sentCount = chosen.filter((s) => s.status === "sent" || s.status === "partial").length;
  const queuedCount = chosen.filter((s) => s.status === "scheduled" || s.status === "none").length;

  // Close the panel whenever the selection empties.
  React.useEffect(() => {
    if (!chosen.length) { setMode(null); setError(""); setResult(""); }
  }, [chosen.length]);

  async function run(body: Record<string, unknown>) {
    setBusy(String(body.action));
    setError("");
    setResult("");
    try {
      const res = await fetch(`/api/admin/experiences/${experienceId}/schedule-bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-mjg-action-token": token },
        body: JSON.stringify({ actionToken: token, steps: chosenNumbers, ...body }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || "That action could not be completed.");
      setResult(json.message ?? "Done.");
      setMode(null);
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "That action could not be completed.");
    } finally {
      setBusy(null);
    }
  }

  if (!mounted || !chosen.length) return null;

  const bar = (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[95] flex justify-center p-3 print:hidden">
      <div className="pointer-events-auto w-full max-w-4xl overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
        {/* Summary + primary actions */}
        <div className="flex flex-wrap items-center gap-2 p-3">
          <span className="flex items-center gap-2 text-sm font-semibold">
            <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-[#b88a4a] px-1.5 text-xs text-white tabular-nums">
              {chosen.length}
            </span>
            {chosen.length === 1 ? "email selected" : "emails selected"}
          </span>
          <span className="hidden text-xs text-muted-foreground sm:inline">
            {queuedCount ? `${queuedCount} queued` : ""}
            {queuedCount && sentCount ? " · " : ""}
            {sentCount ? `${sentCount} already sent` : ""}
          </span>

          <div className="ml-auto flex flex-wrap items-center gap-1.5">
            <Button size="sm" variant="outline" className="gap-1.5" disabled={Boolean(busy)} onClick={() => run({ action: "pause" })}>
              {busy === "pause" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Pause className="h-3.5 w-3.5" />} Pause
            </Button>
            <Button size="sm" variant="outline" className="gap-1.5" disabled={Boolean(busy)} onClick={() => run({ action: "resume" })}>
              {busy === "resume" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />} Resume
            </Button>
            <Button
              size="sm"
              variant={mode === "reanchor" ? "default" : "outline"}
              className="gap-1.5"
              disabled={Boolean(busy)}
              onClick={() => { setMode(mode === "reanchor" ? null : "reanchor"); setError(""); }}
            >
              <CalendarClock className="h-3.5 w-3.5" /> Start on…
            </Button>
            <Button
              size="sm"
              variant={mode === "resend" ? "default" : "outline"}
              className="gap-1.5"
              disabled={Boolean(busy) || !sentCount}
              title={sentCount ? undefined : "None of the selected emails have been sent yet"}
              onClick={() => { setMode(mode === "resend" ? null : "resend"); setError(""); }}
            >
              <RotateCcw className="h-3.5 w-3.5" /> Resend
            </Button>
            <button
              onClick={() => { selection.clear(); setMode(null); }}
              aria-label="Clear selection"
              className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Re-anchor: move the earliest selected email and carry the rest with it */}
        {mode === "reanchor" ? (
          <div className="border-t border-border bg-muted/40 p-3">
            <p className="text-sm font-medium">Start this selection on a new date</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {earliest ? (
                <>
                  <span className="font-medium text-foreground">{earliest.templateName ?? `Email ${earliest.stepNumber}`}</span>{" "}
                  moves from {fmt(earliest.date)} to the date below. Every other selected email shifts by the same amount, so the
                  gaps between them stay exactly as they are.
                </>
              ) : (
                "Pick the new date and time for the first selected email."
              )}
            </p>
            <div className="mt-2.5 flex flex-wrap items-end gap-2">
              <label className="text-xs">
                <span className="mb-1 block font-medium text-muted-foreground">Date</span>
                <input type="date" value={date} min={azToday()} onChange={(e) => setDate(e.target.value)}
                  className="h-9 rounded-md border border-input bg-background px-2 text-sm" />
              </label>
              <label className="text-xs">
                <span className="mb-1 block font-medium text-muted-foreground">Time (Arizona)</span>
                <input type="time" value={time} onChange={(e) => setTime(e.target.value)}
                  className="h-9 rounded-md border border-input bg-background px-2 text-sm" />
              </label>
              <Button
                size="sm"
                className="h-9 gap-1.5"
                disabled={Boolean(busy) || !date}
                onClick={() => run({ action: "reschedule", mode: "anchor", at: toAzIsoString(date, time), updateDefinition: true })}
              >
                {busy === "reschedule" ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarClock className="h-4 w-4" />}
                Move the sequence
              </Button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Anyone added to this group later will get the new dates too.
            </p>
          </div>
        ) : null}

        {/* Resend: re-open already-sent emails on a chosen date */}
        {mode === "resend" ? (
          <div className="border-t border-border bg-muted/40 p-3">
            <p className="text-sm font-medium">Send again</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {sentCount === 1 ? "1 selected email has" : `${sentCount} selected emails have`} already gone out. Everyone who
              received {sentCount === 1 ? "it" : "them"} will receive {sentCount === 1 ? "it" : "them"} a second time on the date below.
              {queuedCount ? ` The ${queuedCount} still queued won't be touched.` : ""}
            </p>
            <div className="mt-2.5 flex flex-wrap items-end gap-2">
              <label className="text-xs">
                <span className="mb-1 block font-medium text-muted-foreground">Date</span>
                <input type="date" value={date} min={azToday()} onChange={(e) => setDate(e.target.value)}
                  className="h-9 rounded-md border border-input bg-background px-2 text-sm" />
              </label>
              <label className="text-xs">
                <span className="mb-1 block font-medium text-muted-foreground">Time (Arizona)</span>
                <input type="time" value={time} onChange={(e) => setTime(e.target.value)}
                  className="h-9 rounded-md border border-input bg-background px-2 text-sm" />
              </label>
              <Button size="sm" className="h-9 gap-1.5" disabled={Boolean(busy) || !date}
                onClick={() => run({ action: "resend", at: toAzIsoString(date, time) })}>
                {busy === "resend" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Queue the resend
              </Button>
            </div>
          </div>
        ) : null}

        {error ? <p className="border-t border-border bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p> : null}
        {result ? <p className="border-t border-border bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-400">{result}</p> : null}
      </div>
    </div>
  );

  // Portalled to the body so the bar is pinned to the viewport regardless of any
  // transformed or overflow-hidden ancestor it happens to be rendered inside.
  return createPortal(bar, document.body);
}
