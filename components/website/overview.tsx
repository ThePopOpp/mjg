"use client";

// The Overview screen (spec §6.1): what is live, what is waiting, what needs
// attention, and the quick actions that start the common jobs.

import * as React from "react";
import Link from "next/link";
import {
  AlertTriangle, Bot, Check, FileEdit, FilePlus2, Globe, ImageIcon, Link2, Loader2, Search,
  Upload, User, Wand2, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { StatCardRow } from "@/components/dashboard/stat-card-row";
import { useDashboardActionToken } from "@/components/layout/dashboard-action-token";
import { websiteApi } from "./api";
import { RISK_PILL, STATUS_PILL, relativeTime } from "./constants";
import type { OverviewStats, SearchHit } from "@/lib/website/data";
import type { WebsiteChangeSet } from "@/lib/website/types";

export type OverviewNav = {
  editPage: () => void;
  pages: () => void;
  navigation: () => void;
  media: () => void;
  steward: () => void;
  newPage: () => void;
};

export function WebsiteOverview({ nav }: { nav: OverviewNav }) {
  const token = useDashboardActionToken();
  const [stats, setStats] = React.useState<OverviewStats | null>(null);
  const [pending, setPending] = React.useState<(WebsiteChangeSet & { page_title: string | null })[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  const [query, setQuery] = React.useState("");
  const [hits, setHits] = React.useState<SearchHit[] | null>(null);
  const [searching, setSearching] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await websiteApi.overview(token);
      setStats(data.stats);
      setPending(data.pending);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load the overview.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  React.useEffect(() => { void load(); }, [load]);

  async function runSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) { setHits(null); return; }
    setSearching(true);
    try {
      const { hits: results } = await websiteApi.search(token, query);
      setHits(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not search the site.");
    } finally {
      setSearching(false);
    }
  }

  async function decide(id: string, action: "apply" | "approve" | "reject") {
    try {
      await websiteApi.changeSetAction(token, id, action);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not act on that change.");
    }
  }

  return (
    <div className="space-y-6">
      {error ? <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p> : null}

      <StatCardRow className="grid gap-4 md:grid-cols-4">
        <Stat label="Published" value={stats?.published} icon={Globe} onClick={nav.pages} />
        <Stat label="Drafts" value={stats?.drafts} icon={FileEdit} onClick={nav.pages} />
        <Stat label="Unpublished changes" value={stats?.unpublishedChanges} icon={Upload} tone={stats?.unpublishedChanges ? "amber" : undefined} onClick={nav.pages} />
        <Stat label="Waiting for approval" value={stats?.pendingChangeSets} icon={Bot} tone={stats?.pendingChangeSets ? "amber" : undefined} />
      </StatCardRow>

      <div className="flex flex-wrap gap-2">
        <Button onClick={nav.editPage} className="gap-1.5"><Wand2 className="h-4 w-4" /> Edit a page</Button>
        <Button onClick={nav.newPage} variant="outline" className="gap-1.5"><FilePlus2 className="h-4 w-4" /> Create a page</Button>
        <Button onClick={nav.steward} variant="outline" className="gap-1.5"><Bot className="h-4 w-4" /> Ask Steward</Button>
        <Button onClick={nav.navigation} variant="outline" className="gap-1.5"><Link2 className="h-4 w-4" /> Manage navigation</Button>
        <Button onClick={nav.media} variant="outline" className="gap-1.5"><ImageIcon className="h-4 w-4" /> Media</Button>
      </div>

      {/* Search the whole site (spec §36) */}
      <section>
        <form onSubmit={runSearch} className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); if (!e.target.value.trim()) setHits(null); }}
            placeholder="Search every page — titles, addresses, body copy, buttons and SEO…"
            className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </form>
        {searching ? <p className="mt-2 text-sm text-muted-foreground">Searching…</p> : null}
        {hits ? (
          <div className="mt-3 space-y-2">
            {hits.length ? (
              hits.map((hit) => (
                <Link
                  key={hit.pageId}
                  href={`/dashboard/cms/editor/pages/${hit.pageId}`}
                  className="block rounded-lg border border-border p-3 no-underline transition-colors hover:border-[#b88a4a]"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{hit.title}</span>
                    <span className="text-xs text-muted-foreground">/{hit.slug}</span>
                    <span className={cn("ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold uppercase", STATUS_PILL[hit.status])}>{hit.status}</span>
                  </div>
                  <ul className="mt-1.5 space-y-0.5">
                    {hit.matches.map((m, i) => (
                      <li key={i} className="text-xs text-muted-foreground"><span className="font-semibold">{m.where}:</span> {m.excerpt}</li>
                    ))}
                  </ul>
                </Link>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Nothing on the site matches that.</p>
            )}
          </div>
        ) : null}
      </section>

      {/* Waiting for approval (spec §14) */}
      {pending.length ? (
        <section>
          <h2 className="mb-2 font-semibold">Waiting for you</h2>
          <ul className="space-y-2">
            {pending.map((cs) => (
              <li key={cs.id} className="rounded-lg border border-border p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide", RISK_PILL[cs.risk])}>{cs.risk} risk</span>
                  <span className="text-sm font-medium">{cs.page_title ?? "A page"}</span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    {cs.source === "steward" ? <Bot className="h-3 w-3" /> : <User className="h-3 w-3" />} {relativeTime(cs.created_at)}
                  </span>
                </div>
                <p className="mt-1.5 text-sm">{cs.summary}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {cs.page_id ? (
                    <Button asChild size="sm" variant="ghost" className="h-7">
                      <Link href={`/dashboard/cms/editor/pages/${cs.page_id}`}>Open the page</Link>
                    </Button>
                  ) : null}
                  {cs.status === "proposed" ? (
                    <Button size="sm" variant="outline" className="h-7 gap-1" onClick={() => decide(cs.id, "apply")}>
                      <Check className="h-3 w-3" /> Apply to draft
                    </Button>
                  ) : null}
                  <Button size="sm" className="h-7" onClick={() => decide(cs.id, "approve")}>Publish</Button>
                  <Button size="sm" variant="ghost" className="h-7 gap-1 text-muted-foreground" onClick={() => decide(cs.id, "reject")}>
                    <X className="h-3 w-3" /> Reject
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* Things worth fixing */}
      <section className="grid gap-4 md:grid-cols-3">
        <Attention label="Pages missing SEO" value={stats?.missingSeo} hint="A title and description help people find the page." onClick={nav.pages} />
        <Attention label="Images without a description" value={stats?.missingAltText} hint="Needed for screen readers and search engines." onClick={nav.media} />
        <Attention label="Broken internal links" value={stats?.brokenLinks} hint="Links pointing at a page that is not published." onClick={nav.pages} />
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section>
          <h2 className="mb-2 font-semibold">Recently edited</h2>
          <ul className="divide-y divide-border rounded-lg border border-border">
            {(stats?.recentPages ?? []).map((p) => (
              <li key={p.id}>
                <Link href={`/dashboard/cms/editor/pages/${p.id}`} className="flex items-center gap-2 px-3 py-2.5 no-underline hover:bg-muted/50">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{p.title}</span>
                    <span className="block truncate text-xs text-muted-foreground">/{p.slug}</span>
                  </span>
                  <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                    {p.source === "steward" ? <Bot className="h-3 w-3" /> : <User className="h-3 w-3" />} {relativeTime(p.updated_at)}
                  </span>
                  <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase", STATUS_PILL[p.status])}>{p.status}</span>
                </Link>
              </li>
            ))}
            {loading ? <li className="px-3 py-6 text-center text-sm text-muted-foreground"><Loader2 className="mx-auto h-4 w-4 animate-spin" /></li> : null}
            {!loading && !stats?.recentPages.length ? (
              <li className="px-3 py-6 text-center text-sm text-muted-foreground">No pages yet.</li>
            ) : null}
          </ul>
        </section>

        <section>
          <h2 className="mb-2 font-semibold">Recent activity</h2>
          <ul className="divide-y divide-border rounded-lg border border-border">
            {(stats?.recentActivity ?? []).map((log) => (
              <li key={log.id} className="flex gap-2 px-3 py-2.5">
                {log.actor_type === "steward" ? <Bot className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#b88a4a]" /> : <User className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />}
                <span className="min-w-0 flex-1">
                  <span className="block text-sm">{log.summary || log.action}</span>
                  <span className="block text-xs text-muted-foreground">{relativeTime(log.created_at)}</span>
                </span>
              </li>
            ))}
            {!loading && !stats?.recentActivity.length ? (
              <li className="px-3 py-6 text-center text-sm text-muted-foreground">Nothing has happened yet.</li>
            ) : null}
          </ul>
        </section>
      </div>

      {stats?.recentlyArchived.length ? (
        <section>
          <h2 className="mb-2 font-semibold">Recently archived</h2>
          <ul className="divide-y divide-border rounded-lg border border-border">
            {stats.recentlyArchived.map((p) => (
              <li key={p.id} className="flex items-center gap-2 px-3 py-2.5 text-sm">
                <span className="flex-1 truncate">{p.title}</span>
                <span className="text-xs text-muted-foreground">{relativeTime(p.updated_at)}</span>
                <Button asChild size="sm" variant="ghost" className="h-7">
                  <Link href={`/dashboard/cms/editor/pages/${p.id}`}>Open</Link>
                </Button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function Stat({
  label, value, icon: Icon, tone, onClick,
}: {
  label: string; value?: number; icon: React.ElementType; tone?: "amber"; onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-lg border border-border p-4 text-left transition-colors",
        onClick && "hover:border-[#b88a4a]",
      )}
    >
      <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        <Icon className="h-3.5 w-3.5" /> {label}
      </span>
      <span className={cn("mt-2 block font-serif text-3xl font-semibold", tone === "amber" && "text-amber-600 dark:text-amber-400")}>
        {value ?? "—"}
      </span>
    </button>
  );
}

function Attention({
  label, value, hint, onClick,
}: {
  label: string; value?: number; hint: string; onClick: () => void;
}) {
  const bad = (value ?? 0) > 0;
  return (
    <button onClick={onClick} className={cn("rounded-lg border p-4 text-left", bad ? "border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30" : "border-border")}>
      <span className="flex items-center gap-1.5 text-sm font-medium">
        {bad ? <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" /> : <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />}
        {label}
      </span>
      <span className="mt-1 block text-2xl font-semibold">{value ?? "—"}</span>
      <span className="mt-1 block text-xs text-muted-foreground">{hint}</span>
    </button>
  );
}
