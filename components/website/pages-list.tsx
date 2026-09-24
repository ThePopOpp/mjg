"use client";

// The page manager (spec §7). Table of every editable page with the status,
// SEO and navigation signals Mike needs to decide what to work on, plus the
// lifecycle actions. Archiving is the default "remove"; permanent deletion sits
// behind a confirmation that checks dependencies first.

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle, Bot, Copy, ExternalLink, Eye, FilePlus2, Loader2, MoreHorizontal, RotateCcw,
  Search, Trash2, Upload, User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useDashboardActionToken } from "@/components/layout/dashboard-action-token";
import { PAGE_TEMPLATES } from "@/lib/website/templates";
import { slugProblem } from "@/lib/website/protected";
import { pagePath, type WebsitePageSummary } from "@/lib/website/types";
import { websiteApi } from "./api";
import { CMS_LIKE_PAGE_TYPES, STATUS_PILL, formatDate, relativeTime } from "./constants";
import type { PageDependencies } from "@/lib/website/data";

const FILTERS = [
  { value: "all", label: "All" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Drafts" },
  { value: "scheduled", label: "Scheduled" },
  { value: "archived", label: "Archived" },
] as const;

const SOURCE_FILTERS = [
  { value: "any", label: "Anyone" },
  { value: "steward", label: "Edited by Steward" },
  { value: "manual", label: "Edited manually" },
] as const;

export function PagesList({ initialPages }: { initialPages: WebsitePageSummary[] }) {
  const token = useDashboardActionToken();
  const router = useRouter();

  const [pages, setPages] = React.useState(initialPages);
  const [status, setStatus] = React.useState<string>("all");
  const [source, setSource] = React.useState<string>("any");
  const [pageType, setPageType] = React.useState<string>("all");
  const [query, setQuery] = React.useState("");
  const [busy, setBusy] = React.useState<string | null>(null);
  const [error, setError] = React.useState("");
  const [createOpen, setCreateOpen] = React.useState(false);
  const [deleting, setDeleting] = React.useState<WebsitePageSummary | null>(null);

  const refresh = React.useCallback(async () => {
    try {
      const { pages: fresh } = await websiteApi.listPages(token, {});
      setPages(fresh);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not refresh the page list.");
    }
  }, [token]);

  async function act(id: string, body: Record<string, unknown>) {
    setBusy(id);
    setError("");
    try {
      await websiteApi.pageAction(token, id, body);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "That action could not be completed.");
    } finally {
      setBusy(null);
    }
  }

  const term = query.trim().toLowerCase();
  const visible = pages.filter((p) => {
    if (status !== "all" && p.status !== status) return false;
    if (pageType !== "all" && p.page_type !== pageType) return false;
    if (source !== "any" && p.last_edited_source !== source) return false;
    if (!term) return true;
    return `${p.title} ${p.slug} ${p.seo_title ?? ""} ${p.seo_description ?? ""}`.toLowerCase().includes(term);
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, address or SEO…"
            className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="h-9 rounded-md border border-input bg-background px-2 text-sm">
          {FILTERS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
        </select>
        <select value={pageType} onChange={(e) => setPageType(e.target.value)} className="h-9 rounded-md border border-input bg-background px-2 text-sm">
          <option value="all">Every type</option>
          {CMS_LIKE_PAGE_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        <select value={source} onChange={(e) => setSource(e.target.value)} className="h-9 rounded-md border border-input bg-background px-2 text-sm">
          {SOURCE_FILTERS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
        </select>
        <Button onClick={() => setCreateOpen(true)} className="gap-1.5">
          <FilePlus2 className="h-4 w-4" /> New page
        </Button>
      </div>

      {error ? <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p> : null}

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-3 py-2.5 text-left font-semibold">Page</th>
              <th className="px-3 py-2.5 text-left font-semibold">Status</th>
              <th className="px-3 py-2.5 text-left font-semibold">SEO</th>
              <th className="px-3 py-2.5 text-left font-semibold">Last edited</th>
              <th className="px-3 py-2.5 text-left font-semibold">Versions</th>
              <th className="px-3 py-2.5 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {visible.map((page) => {
              const seoMissing = !page.seo_title?.trim() || !page.seo_description?.trim();
              return (
                <tr key={page.id} className="hover:bg-muted/40">
                  <td className="px-3 py-2.5">
                    <button onClick={() => router.push(`/dashboard/cms/editor/pages/${page.id}`)} className="text-left">
                      <span className="block font-medium">{page.title}</span>
                      <span className="block text-xs text-muted-foreground">/{page.slug}</span>
                    </button>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {page.is_protected ? <Pill tone="muted">Protected</Pill> : null}
                      {page.is_legal ? <Pill tone="amber">Legal</Pill> : null}
                      {page.navigation_visibility ? <Pill tone="muted">In navigation</Pill> : null}
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide", STATUS_PILL[page.status])}>
                      {page.status}
                    </span>
                    {page.has_unpublished_changes && page.status === "published" ? (
                      <span className="mt-1 block text-[10px] font-semibold uppercase text-amber-700 dark:text-amber-400">Unpublished changes</span>
                    ) : null}
                    {page.published_at ? <span className="mt-1 block text-xs text-muted-foreground">{formatDate(page.published_at)}</span> : null}
                  </td>
                  <td className="px-3 py-2.5">
                    {seoMissing ? (
                      <span className="inline-flex items-center gap-1 text-xs text-amber-700 dark:text-amber-400">
                        <AlertTriangle className="h-3 w-3" /> Incomplete
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">Complete</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      {page.last_edited_source === "steward" ? <Bot className="h-3 w-3" /> : <User className="h-3 w-3" />}
                      {relativeTime(page.updated_at)}
                    </span>
                    {page.updated_by_label ? <span className="block text-xs text-muted-foreground">{page.updated_by_label}</span> : null}
                  </td>
                  <td className="px-3 py-2.5 text-xs text-muted-foreground">{page.version_count}</td>
                  <td className="px-3 py-2.5">
                    <RowActions
                      page={page}
                      busy={busy === page.id}
                      onEdit={() => router.push(`/dashboard/cms/editor/pages/${page.id}`)}
                      onAction={(body) => act(page.id, body)}
                      onDelete={() => setDeleting(page)}
                    />
                  </td>
                </tr>
              );
            })}
            {!visible.length ? (
              <tr>
                <td colSpan={6} className="px-3 py-10 text-center text-sm text-muted-foreground">
                  No pages match those filters yet. Create one, or ask Steward to draft one for you.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {createOpen ? <CreatePageDialog onClose={() => setCreateOpen(false)} onCreated={(id) => router.push(`/dashboard/cms/editor/pages/${id}`)} /> : null}
      {deleting ? <DeleteDialog page={deleting} onClose={() => setDeleting(null)} onDone={refresh} /> : null}
    </div>
  );
}

function Pill({ tone, children }: { tone: "muted" | "amber"; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        tone === "amber" ? "bg-amber-500/15 text-amber-700 dark:text-amber-400" : "bg-muted text-muted-foreground",
      )}
    >
      {children}
    </span>
  );
}

function RowActions({
  page, busy, onEdit, onAction, onDelete,
}: {
  page: WebsitePageSummary;
  busy: boolean;
  onEdit: () => void;
  onAction: (body: Record<string, unknown>) => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = React.useState(false);
  const item = "flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted";

  return (
    <div className="flex items-center justify-end gap-1">
      <Button size="sm" variant="ghost" className="h-7" onClick={onEdit}>Edit</Button>
      <div className="relative">
        <button
          aria-label={`More actions for ${page.title}`}
          onClick={() => setOpen((v) => !v)}
          className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
        </button>
        {open ? (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} aria-hidden />
            <div className="absolute right-0 z-20 mt-1 w-56 rounded-lg border border-border bg-card py-1 text-left shadow-lg">
              <button className={item} onClick={() => { setOpen(false); window.open(`/website-preview/draft/${page.id}`, "_blank"); }}>
                <Eye className="h-3.5 w-3.5" /> Preview the draft
              </button>
              {page.status === "published" ? (
                <button className={item} onClick={() => { setOpen(false); window.open(pagePath(page.slug), "_blank"); }}>
                  <ExternalLink className="h-3.5 w-3.5" /> Open the live page
                </button>
              ) : null}
              <button className={item} onClick={() => { setOpen(false); onAction({ action: "publish" }); }}>
                <Upload className="h-3.5 w-3.5" /> Publish
              </button>
              {page.status === "published" ? (
                <button className={item} onClick={() => { setOpen(false); onAction({ action: "unpublish" }); }}>
                  <RotateCcw className="h-3.5 w-3.5" /> Take off the live site
                </button>
              ) : null}
              <button className={item} onClick={() => { setOpen(false); onAction({ action: "duplicate" }); }}>
                <Copy className="h-3.5 w-3.5" /> Duplicate
              </button>
              {page.status === "archived" ? (
                <button className={item} onClick={() => { setOpen(false); onAction({ action: "restore" }); }}>
                  <RotateCcw className="h-3.5 w-3.5" /> Restore as a draft
                </button>
              ) : !page.is_protected ? (
                <button className={item} onClick={() => { setOpen(false); onAction({ action: "archive" }); }}>
                  <AlertTriangle className="h-3.5 w-3.5" /> Archive
                </button>
              ) : null}
              {!page.is_protected ? (
                <button className={cn(item, "text-destructive")} onClick={() => { setOpen(false); onDelete(); }}>
                  <Trash2 className="h-3.5 w-3.5" /> Delete permanently…
                </button>
              ) : null}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

function CreatePageDialog({ onClose, onCreated }: { onClose: () => void; onCreated: (id: string) => void }) {
  const token = useDashboardActionToken();
  const [title, setTitle] = React.useState("");
  const [slug, setSlug] = React.useState("");
  const [template, setTemplate] = React.useState("standard");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");

  const chosen = PAGE_TEMPLATES.find((t) => t.key === template);
  const effectiveSlug = slug.trim() || title.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  const issue = effectiveSlug ? slugProblem(effectiveSlug) : null;

  async function create() {
    setBusy(true);
    setError("");
    try {
      const { page } = await websiteApi.createPage(token, {
        title, slug: slug.trim() || undefined, template, page_type: chosen?.pageType ?? "page",
      });
      onCreated(page.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create that page.");
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div className="relative z-10 w-full max-w-lg rounded-xl border border-border bg-card shadow-xl">
        <div className="border-b border-border p-4">
          <h2 className="font-semibold">New page</h2>
          <p className="mt-1 text-sm text-muted-foreground">It starts as a draft. Nothing goes live until you publish it.</p>
        </div>
        <div className="space-y-4 p-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Title</label>
            <input
              autoFocus value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="Kingdom Stewardship"
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Address</label>
            <div className="flex items-center gap-1">
              <span className="text-sm text-muted-foreground">/</span>
              <input
                value={slug} onChange={(e) => setSlug(e.target.value)} placeholder={effectiveSlug || "kingdom-stewardship"}
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            {issue ? <p className="mt-1 text-xs text-destructive">{issue}</p> : null}
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Start from</label>
            <select value={template} onChange={(e) => setTemplate(e.target.value)} className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm">
              {PAGE_TEMPLATES.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
            </select>
            {chosen ? <p className="mt-1 text-xs text-muted-foreground">{chosen.description}</p> : null}
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>
        <div className="flex justify-end gap-2 border-t border-border p-4">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button disabled={busy || !title.trim() || Boolean(issue)} onClick={create} className="gap-1.5">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Create draft
          </Button>
        </div>
      </div>
    </div>
  );
}

function DeleteDialog({
  page, onClose, onDone,
}: {
  page: WebsitePageSummary;
  onClose: () => void;
  onDone: () => void;
}) {
  const token = useDashboardActionToken();
  const [dependencies, setDependencies] = React.useState<PageDependencies | null>(null);
  const [confirmTitle, setConfirmTitle] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    websiteApi
      .pageAction<{ dependencies: PageDependencies }>(token, page.id, { action: "dependencies" })
      .then((r) => setDependencies(r.dependencies))
      .catch(() => setDependencies(null));
  }, [token, page.id]);

  async function run(hard: boolean) {
    setBusy(true);
    setError("");
    try {
      if (hard) await websiteApi.deletePage(token, page.id, { hard: true, confirmTitle });
      else await websiteApi.pageAction(token, page.id, { action: "archive" });
      onDone();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete that page.");
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div className="relative z-10 w-full max-w-lg rounded-xl border border-border bg-card shadow-xl">
        <div className="border-b border-border p-4">
          <h2 className="font-semibold">Delete &ldquo;{page.title}&rdquo;?</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Archiving is almost always the better choice — it takes the page off the site and out of the navigation but
            keeps everything recoverable.
          </p>
        </div>

        <div className="space-y-3 p-4">
          {dependencies?.warnings.length ? (
            <ul className="space-y-1.5 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
              {dependencies.warnings.map((w, i) => (
                <li key={i} className="flex gap-2"><AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />{w}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              {dependencies ? "Nothing else on the site links to this page." : "Checking what links to this page…"}
            </p>
          )}

          <div className="rounded-lg border border-border p-3">
            <p className="text-sm font-medium">To delete permanently, type the page title exactly:</p>
            <p className="mt-1 text-xs text-muted-foreground">{page.title}</p>
            <input
              value={confirmTitle}
              onChange={(e) => setConfirmTitle(e.target.value)}
              className="mt-2 h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>

        <div className="flex flex-wrap justify-end gap-2 border-t border-border p-4">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="outline" disabled={busy} onClick={() => run(false)}>Archive instead</Button>
          <Button
            variant="destructive"
            disabled={busy || confirmTitle !== page.title}
            onClick={() => run(true)}
            className="gap-1.5"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />} Delete permanently
          </Button>
        </div>
      </div>
    </div>
  );
}
