"use client";

// Shared building blocks for the two edit-request surfaces:
//   Edit Requests   — the open queue (open · in progress · archived)
//   Completed Edits — the history (done)
// Both render the same records in the same three views; only the filtering differs.

import * as React from "react";
import { LayoutGrid, List as ListIcon, Table as TableIcon, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PageNote } from "@/lib/cms/page-notes";
import type { DashboardNote } from "@/lib/dashboard-notes/data";

export type Kind = "frontend" | "dashboard";
export type Person = { email: string; name: string };

export type Req = {
  kind: Kind;
  id: string;
  note: string;
  page: string;
  route: string;
  type: string;
  priority: string;
  status: string;
  authorEmail: string;
  authorName: string;
  screenshotUrl: string | null;
  elementLabel: string | null;
  elementType: string | null;
  createdAt: string;
  completedAt: string | null;
  raw: PageNote | DashboardNote;
};

export const STATUSES = [
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In progress" },
  { value: "done", label: "Done" },
  { value: "archived", label: "Archived" },
];

export const VIEWS: { key: string; icon: React.ElementType; label: string }[] = [
  { key: "cards", icon: LayoutGrid, label: "Cards" },
  { key: "list", icon: ListIcon, label: "List" },
  { key: "table", icon: TableIcon, label: "Table" },
];

export const STATUS_PILL: Record<string, string> = {
  open: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  in_progress: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
  done: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  archived: "bg-muted text-muted-foreground",
};

export const PRIORITY_COLOR: Record<string, string> = {
  low: "text-muted-foreground",
  medium: "text-foreground",
  high: "text-amber-600 dark:text-amber-400",
  urgent: "text-destructive",
};

export function normFrontend(n: PageNote): Req {
  return {
    kind: "frontend", id: n.id, note: n.note, page: n.page_label || n.page_slug, route: n.page_url || "",
    type: n.change_type, priority: n.priority, status: n.status,
    authorEmail: n.created_by_email || "", authorName: n.created_by_email || "—",
    screenshotUrl: null, elementLabel: n.element_label, elementType: n.element_type,
    createdAt: n.created_at, completedAt: n.completed_at ?? null, raw: n,
  };
}

export function normDashboard(n: DashboardNote): Req {
  return {
    kind: "dashboard", id: n.id, note: n.note, page: n.page_title || n.route || "—", route: n.route || "",
    type: n.type, priority: n.priority, status: n.status,
    authorEmail: n.created_by_email || "", authorName: n.created_by_name || n.created_by_email || "—",
    screenshotUrl: n.screenshot_url, elementLabel: null, elementType: null,
    createdAt: n.created_at, completedAt: n.completed_at ?? null, raw: n,
  };
}

// Free-text search across everything a person might remember about a request.
export function matchesSearch(r: Req, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [r.note, r.page, r.route, r.type, r.priority, r.authorName, r.authorEmail, r.elementLabel ?? ""]
    .join(" ")
    .toLowerCase()
    .includes(q);
}

export function relativeDate(iso: string | null) {
  if (!iso) return "—";
  const then = new Date(iso).getTime();
  const days = Math.floor((Date.now() - then) / 86_400_000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function ViewToggle({ view, setView }: { view: string; setView: (v: string) => void }) {
  return (
    <div className="flex items-center rounded-lg border border-border bg-card p-0.5">
      {VIEWS.map((v) => (
        <button
          key={v.key}
          onClick={() => setView(v.key)}
          title={v.label}
          aria-label={v.label}
          aria-pressed={view === v.key}
          className={cn("rounded-md p-1.5", view === v.key ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground")}
        >
          <v.icon className="h-4 w-4" />
        </button>
      ))}
    </div>
  );
}

function Thumb({ r, className }: { r: Req; className?: string }) {
  if (r.screenshotUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={r.screenshotUrl} alt="" className={className} />;
  }
  return null;
}

export function RequestViews({
  view,
  items,
  onSelect,
  showCompleted,
}: {
  view: string;
  items: Req[];
  onSelect: (r: Req) => void;
  // Completed Edits cares when work finished; the open queue doesn't.
  showCompleted?: boolean;
}) {
  if (view === "cards") {
    return (
      <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))" }}>
        {items.map((r) => (
          <button
            key={`${r.kind}-${r.id}`}
            onClick={() => onSelect(r)}
            className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card text-left transition hover:border-primary/50 hover:shadow-md"
          >
            <div className="flex h-32 items-center justify-center overflow-hidden border-b border-border bg-muted/40">
              {r.screenshotUrl ? (
                <Thumb r={r} className="h-full w-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-1 text-muted-foreground">
                  <span className="rounded bg-primary/10 px-2 py-0.5 font-mono text-[10px] uppercase text-primary">{r.elementType || "page"}</span>
                  <span className="max-w-[200px] truncate px-2 text-[11px]">{r.elementLabel || r.page}</span>
                </div>
              )}
            </div>
            <div className="flex-1 space-y-1.5 p-2.5">
              <p className="line-clamp-2 text-xs">{r.note}</p>
              <div className="flex flex-wrap items-center gap-1 text-[10px]">
                <span className="rounded bg-muted px-1.5 py-0.5 uppercase text-muted-foreground">{r.type}</span>
                <span className={cn("font-semibold uppercase", PRIORITY_COLOR[r.priority])}>{r.priority}</span>
                <span className={cn("ml-auto rounded-full px-2 py-0.5 font-medium capitalize", STATUS_PILL[r.status])}>{r.status.replace("_", " ")}</span>
              </div>
              <div className="truncate text-[10px] text-muted-foreground">
                {showCompleted ? `Completed ${relativeDate(r.completedAt)} · ` : ""}{r.page} · {r.authorName}
              </div>
            </div>
          </button>
        ))}
      </div>
    );
  }

  if (view === "list") {
    return (
      <div className="space-y-1.5">
        {items.map((r) => (
          <button
            key={`${r.kind}-${r.id}`}
            onClick={() => onSelect(r)}
            className="flex w-full items-center gap-3 rounded-lg border border-border bg-card p-2.5 text-left hover:bg-muted/40"
          >
            {r.screenshotUrl ? (
              <Thumb r={r} className="h-12 w-16 shrink-0 rounded border border-border object-cover" />
            ) : (
              <span className="flex h-12 w-16 shrink-0 items-center justify-center rounded border border-border bg-muted text-[9px] uppercase text-muted-foreground">
                {r.elementType || "page"}
              </span>
            )}
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm">{r.note}</span>
              <span className="block truncate text-[11px] text-muted-foreground">
                {r.page} · {r.type} · {r.authorName}{showCompleted ? ` · completed ${relativeDate(r.completedAt)}` : ""}
              </span>
            </span>
            <span className={cn("shrink-0 text-[10px] font-semibold uppercase", PRIORITY_COLOR[r.priority])}>{r.priority}</span>
            <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium capitalize", STATUS_PILL[r.status])}>{r.status.replace("_", " ")}</span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-3 py-2">Request</th>
              <th className="px-3 py-2">Page</th>
              <th className="px-3 py-2">Type</th>
              <th className="px-3 py-2">Priority</th>
              <th className="px-3 py-2">By</th>
              <th className="px-3 py-2">{showCompleted ? "Completed" : "Status"}</th>
            </tr>
          </thead>
          <tbody>
            {items.map((r) => (
              <tr key={`${r.kind}-${r.id}`} onClick={() => onSelect(r)} className="cursor-pointer border-t border-border hover:bg-muted/40">
                <td className="max-w-xs px-3 py-2">
                  <span className="flex items-center gap-1.5">
                    {r.screenshotUrl && <ImageIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />}
                    <span className="truncate">{r.note}</span>
                  </span>
                </td>
                <td className="px-3 py-2 text-xs text-muted-foreground"><span className="line-clamp-1">{r.page}</span></td>
                <td className="px-3 py-2 text-xs uppercase text-muted-foreground">{r.type}</td>
                <td className={cn("px-3 py-2 text-xs font-semibold uppercase", PRIORITY_COLOR[r.priority])}>{r.priority}</td>
                <td className="px-3 py-2 text-xs text-muted-foreground">{r.authorName}</td>
                <td className="px-3 py-2">
                  {showCompleted ? (
                    <span className="whitespace-nowrap text-xs text-muted-foreground">{relativeDate(r.completedAt)}</span>
                  ) : (
                    <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium capitalize", STATUS_PILL[r.status])}>{r.status.replace("_", " ")}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
