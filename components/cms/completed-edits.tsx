"use client";

// Completed Edits — history of finished requests from both sources, kept out of the
// open queue and the Review FAB. Same three views as Edit Requests, plus filters for
// source / type / priority / when, free-text search, and sorting.
//
// Opening this tab stamps a per-user "reviewed" watermark, which clears the badge on
// the tab (see lib/cms/completed-edits.ts). Items completed since the last visit are
// flagged "New" so a review still surfaces them after the count resets.

import * as React from "react";
import { RefreshCw, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FieldSelect } from "@/components/ui/field-select";
import { useDashboardActionToken } from "@/components/layout/dashboard-action-token";
import { RequestDetailModal } from "@/components/cms/request-detail-modal";
import {
  RequestViews, ViewToggle, matchesSearch, normDashboard, normFrontend, relativeDate,
  type Person, type Req,
} from "@/components/cms/request-shared";
import type { PageNote } from "@/lib/cms/page-notes";
import type { DashboardNote } from "@/lib/dashboard-notes/data";

const SOURCES = [
  { value: "all", label: "All sources" },
  { value: "frontend", label: "Frontend Edits" },
  { value: "dashboard", label: "Dashboard Edits" },
];
const WHEN = [
  { value: "all", label: "Any time" },
  { value: "7", label: "Last 7 days" },
  { value: "30", label: "Last 30 days" },
  { value: "90", label: "Last 90 days" },
];
const SORTS = [
  { value: "recent", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "page", label: "By page" },
];
const ANY_TYPE = { value: "all", label: "All types" };
const ANY_PRIORITY = { value: "all", label: "All priorities" };

export function CompletedEdits({ onReviewed }: { onReviewed?: () => void }) {
  const token = useDashboardActionToken();
  const [items, setItems] = React.useState<Req[]>([]);
  const [people, setPeople] = React.useState<Person[]>([]);
  const [reviewedAt, setReviewedAt] = React.useState<string | null>(null);
  const [view, setView] = React.useState("cards");
  const [source, setSource] = React.useState("all");
  const [type, setType] = React.useState("all");
  const [priority, setPriority] = React.useState("all");
  const [when, setWhen] = React.useState("all");
  const [sort, setSort] = React.useState("recent");
  const [search, setSearch] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [active, setActive] = React.useState<Req | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const [completed, recipients] = await Promise.all([
        fetch("/api/admin/cms/completed-edits", { headers: { "x-mjg-action-token": token } }).then((r) => r.json()),
        fetch("/api/dashboard-notes?scope=all", { headers: { "x-mjg-action-token": token } }).then((r) => r.json()),
      ]);
      const merged: Req[] = [
        ...(completed.frontend ?? []).map((n: PageNote) => normFrontend(n)),
        ...(completed.dashboard ?? []).map((n: DashboardNote) => normDashboard(n)),
      ];
      setItems(merged);
      setReviewedAt(completed.reviewedAt ?? null);
      if (Array.isArray(recipients.recipients)) setPeople(recipients.recipients);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [token]);

  React.useEffect(() => { load(); }, [load]);

  // Stamp the watermark once on mount — the tab is only rendered when opened, so
  // this is exactly "the user reviewed it". Runs after load() so `reviewedAt`
  // still reflects the PREVIOUS visit and the "New" flags remain visible.
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await fetch("/api/admin/cms/completed-edits", {
          method: "POST",
          headers: { "content-type": "application/json", "x-mjg-action-token": token },
          body: JSON.stringify({ action: "mark_reviewed", actionToken: token }),
        });
        if (!cancelled) onReviewed?.();
      } catch { /* the badge just stays until next load */ }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isNew = React.useCallback(
    (r: Req) => Boolean(r.completedAt) && (!reviewedAt || (r.completedAt as string) > reviewedAt),
    [reviewedAt],
  );

  const types = React.useMemo(
    () => [ANY_TYPE, ...Array.from(new Set(items.map((i) => i.type))).sort().map((t) => ({ value: t, label: t[0].toUpperCase() + t.slice(1) }))],
    [items],
  );
  const priorities = React.useMemo(
    () => [ANY_PRIORITY, ...Array.from(new Set(items.map((i) => i.priority))).map((p) => ({ value: p, label: p[0].toUpperCase() + p.slice(1) }))],
    [items],
  );

  const shown = React.useMemo(() => {
    const cutoff = when === "all" ? 0 : Date.now() - Number(when) * 86_400_000;
    const list = items
      .filter((i) => (source === "all" ? true : i.kind === source))
      .filter((i) => (type === "all" ? true : i.type === type))
      .filter((i) => (priority === "all" ? true : i.priority === priority))
      .filter((i) => (!cutoff ? true : i.completedAt && new Date(i.completedAt).getTime() >= cutoff))
      .filter((i) => matchesSearch(i, search));

    return list.sort((a, b) => {
      if (sort === "page") return a.page.localeCompare(b.page);
      const at = a.completedAt ? new Date(a.completedAt).getTime() : 0;
      const bt = b.completedAt ? new Date(b.completedAt).getTime() : 0;
      return sort === "oldest" ? at - bt : bt - at;
    });
  }, [items, source, type, priority, when, search, sort]);

  const newCount = items.filter(isNew).length;
  const filtersOn = source !== "all" || type !== "all" || priority !== "all" || when !== "all" || search.trim() !== "";

  function clearFilters() {
    setSource("all"); setType("all"); setPriority("all"); setWhen("all"); setSearch("");
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <FieldSelect value={source} onChange={setSource} options={SOURCES} className="h-9 w-36" />
        <FieldSelect value={type} onChange={setType} options={types} className="h-9 w-32" />
        <FieldSelect value={priority} onChange={setPriority} options={priorities} className="h-9 w-32" />
        <FieldSelect value={when} onChange={setWhen} options={WHEN} className="h-9 w-32" />
        <FieldSelect value={sort} onChange={setSort} options={SORTS} className="h-9 w-32" />
        <div className="relative min-w-44 flex-1 sm:max-w-64">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search completed…" aria-label="Search completed edits" className="h-9 pl-8 text-xs" />
        </div>
        {filtersOn && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1"><X className="h-3.5 w-3.5" /> Clear</Button>
        )}
        <div className="ml-auto flex items-center gap-2">
          <ViewToggle view={view} setView={setView} />
          <Button variant="outline" size="sm" onClick={load} aria-label="Refresh"><RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} /></Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span>{shown.length} completed edit{shown.length === 1 ? "" : "s"}{filtersOn && items.length !== shown.length ? ` of ${items.length}` : ""}</span>
        {newCount > 0 && (
          <span className="rounded-full bg-primary/10 px-2 py-0.5 font-medium text-primary">{newCount} completed since your last visit</span>
        )}
        {reviewedAt && <span>· last reviewed {relativeDate(reviewedAt)}</span>}
      </div>

      {loading && items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-muted/30 p-10 text-center text-sm text-muted-foreground">Loading completed edits…</div>
      ) : shown.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-muted/30 p-10 text-center text-sm text-muted-foreground">
          {items.length === 0
            ? "Nothing completed yet. Requests marked done will collect here."
            : filtersOn
              ? "No completed edits match these filters."
              : "No completed edits."}
        </div>
      ) : (
        <RequestViews view={view} items={shown} onSelect={setActive} showCompleted />
      )}

      {active && <RequestDetailModal req={active} people={people} onClose={() => setActive(null)} onChanged={load} />}
    </div>
  );
}
