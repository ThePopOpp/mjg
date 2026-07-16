"use client";

// Edit Requests — the OPEN queue. Browse & triage requests from both sources.
//   sub-tabs: Frontend Edits (cms_page_notes) · Dashboard Edits (dashboard_notes)
//   each with 3 views: Cards (screenshots) · List · Table
//   every item is clickable → reassign requester, change status, archive, delete.
//
// Completed requests deliberately do NOT appear here — they live in the
// "Completed Edits" tab (components/cms/completed-edits.tsx) so this stays a
// to-do list rather than a mix of finished and outstanding work.

import * as React from "react";
import { RefreshCw, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FieldSelect } from "@/components/ui/field-select";
import { useDashboardActionToken } from "@/components/layout/dashboard-action-token";
import { RequestDetailModal } from "@/components/cms/request-detail-modal";
import {
  RequestViews, ViewToggle, matchesSearch, normDashboard, normFrontend,
  type Kind, type Person, type Req,
} from "@/components/cms/request-shared";
import type { PageNote } from "@/lib/cms/page-notes";
import type { DashboardNote } from "@/lib/dashboard-notes/data";

const KINDS: { key: Kind; label: string }[] = [
  { key: "frontend", label: "Frontend Edits" },
  { key: "dashboard", label: "Dashboard Edits" },
];

// 'done' is intentionally absent — completed work has its own tab.
const FILTERS = [
  { value: "active", label: "Active" },
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In progress" },
  { value: "archived", label: "Archived" },
  { value: "all", label: "All open" },
];

export function EditRequests() {
  const token = useDashboardActionToken();
  const [kind, setKind] = React.useState<Kind>("frontend");
  const [items, setItems] = React.useState<Req[]>([]);
  const [people, setPeople] = React.useState<Person[]>([]);
  const [view, setView] = React.useState("cards");
  const [statusFilter, setStatusFilter] = React.useState("active");
  const [search, setSearch] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [active, setActive] = React.useState<Req | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const url = kind === "frontend" ? "/api/admin/cms/page-notes" : "/api/dashboard-notes?scope=all";
      const r = await fetch(url, { headers: { "x-mjg-action-token": token } }).then((x) => x.json());
      const notes: Req[] = (r.notes ?? []).map((n: PageNote | DashboardNote) =>
        kind === "frontend" ? normFrontend(n as PageNote) : normDashboard(n as DashboardNote),
      );
      setItems(notes);
      if (Array.isArray(r.recipients)) setPeople(r.recipients);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [kind, token]);
  React.useEffect(() => { load(); }, [load]);

  const shown = items
    // Completed work is excluded from every filter on this tab, including "All open".
    .filter((i) => i.status !== "done")
    .filter((i) =>
      statusFilter === "all" ? true
      : statusFilter === "active" ? i.status !== "archived"
      : i.status === statusFilter,
    )
    .filter((i) => matchesSearch(i, search));

  return (
    <div className="space-y-4">
      {/* Single control row: sub-tabs · status filter · search · count · views · refresh */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center rounded-lg border border-border bg-card p-0.5">
          {KINDS.map((k) => (
            <button
              key={k.key}
              onClick={() => setKind(k.key)}
              className={cn("rounded-md px-3 py-1.5 text-xs font-medium transition-colors", kind === k.key ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground")}
            >
              {k.label}
            </button>
          ))}
        </div>
        <FieldSelect value={statusFilter} onChange={setStatusFilter} options={FILTERS} className="h-9 w-36" />
        <div className="relative min-w-44 flex-1 sm:max-w-64">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search requests…" aria-label="Search requests" className="h-9 pl-8 text-xs" />
        </div>
        <span className="text-xs text-muted-foreground">{shown.length} request{shown.length === 1 ? "" : "s"}</span>
        <div className="ml-auto flex items-center gap-2">
          <ViewToggle view={view} setView={setView} />
          <Button variant="outline" size="sm" onClick={load} aria-label="Refresh"><RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} /></Button>
        </div>
      </div>

      {shown.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-muted/30 p-10 text-center text-sm text-muted-foreground">
          {search.trim()
            ? `No open requests match “${search.trim()}”.`
            : `No ${kind === "frontend" ? "frontend" : "dashboard"} edit requests ${statusFilter === "active" ? "open" : ""} yet.`}
        </div>
      ) : (
        <RequestViews view={view} items={shown} onSelect={setActive} />
      )}

      {active && <RequestDetailModal req={active} people={people} onClose={() => setActive(null)} onChanged={load} />}
    </div>
  );
}
