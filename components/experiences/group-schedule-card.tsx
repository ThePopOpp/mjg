"use client";

// A group's email sequence with bulk selection — the switcher, the four views,
// the select-all control and the slide-up action bar in one drop-in block.
//
// Used by the facilitator's own experience view. The admin Email Automation page
// composes the same pieces inline because it wraps them in extra context
// (progress bar, overdue warnings) that a facilitator does not need.

import * as React from "react";
import { CalendarDays, Columns3, LayoutGrid, Loader2, Table as TableIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { CalendarView, CardsView, KanbanView, ScheduleTable } from "@/components/experiences/automation-views";
import {
  ScheduleActionBar, SelectAllCheckbox, useScheduleSelection,
} from "@/components/experiences/schedule-selection";
import type { AutomationStep } from "@/lib/experiences/automation";

type View = "table" | "cards" | "kanban" | "calendar";

const VIEWS: { key: View; label: string; icon: typeof TableIcon }[] = [
  { key: "table", label: "Table", icon: TableIcon },
  { key: "cards", label: "Cards", icon: LayoutGrid },
  { key: "kanban", label: "Kanban", icon: Columns3 },
  { key: "calendar", label: "Calendar", icon: CalendarDays },
];

export function GroupScheduleCard({
  experienceId,
  steps,
  nextSendAt,
  loading,
  onChanged,
}: {
  experienceId: string;
  steps: AutomationStep[];
  nextSendAt: string | null;
  loading?: boolean;
  onChanged: () => void;
}) {
  const [view, setView] = React.useState<View>("table");
  const selection = useScheduleSelection();

  // A different group means a different sequence — never carry ticks across.
  React.useEffect(() => { selection.clear(); }, [experienceId]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading the email schedule…
      </div>
    );
  }

  if (!steps.length) {
    return <p className="py-10 text-center text-sm text-muted-foreground">This group has no email sequence yet.</p>;
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <label className="mr-auto flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
          <SelectAllCheckbox steps={steps} selection={selection} />
          <span>Select all emails</span>
        </label>
        <div className="inline-flex rounded-md border bg-card p-0.5">
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
      </div>

      <p className="text-xs text-muted-foreground">
        All times Arizona (Phoenix). Tick emails to pause, resend or move them together.
      </p>

      {view === "table" ? <ScheduleTable steps={steps} selection={selection} /> : null}
      {view === "cards" ? <CardsView steps={steps} selection={selection} /> : null}
      {view === "kanban" ? <KanbanView steps={steps} selection={selection} /> : null}
      {view === "calendar" ? <CalendarView steps={steps} selection={selection} nextSendAt={nextSendAt} /> : null}

      <ScheduleActionBar
        experienceId={experienceId}
        steps={steps}
        selection={selection}
        onDone={() => { selection.clear(); onChanged(); }}
      />
    </div>
  );
}
