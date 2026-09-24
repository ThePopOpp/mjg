"use client";

// The visual page editor (spec §11, §40, §49).
//
//   left   — page structure: add, reorder, duplicate, hide, remove
//   centre — live preview in a real iframe at desktop / tablet / phone widths
//   right  — Content · Design · SEO · History · Steward
//
// Editing is local-first with a 1.5s debounced autosave to the DRAFT. The
// published page is never touched by autosave; publishing is always a deliberate
// click. An unsaved session is mirrored into localStorage so a browser crash
// does not lose work.

import * as React from "react";
import Link from "next/link";
import {
  AlertTriangle, ArrowLeft, Bot, Check, ChevronLeft, ChevronRight, Cloud, ExternalLink, Eye, History,
  Loader2, Monitor, MoreHorizontal, Search, Settings2, Share2, Smartphone, Tablet, Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useDashboardActionToken } from "@/components/layout/dashboard-action-token";
import { addBlock, duplicateBlock, moveBlock, removeBlock, reorderBlocks, updateBlock } from "@/lib/website/blocks";
import { diffContent } from "@/lib/website/diff";
import { pagePath, type WebsiteContent, type WebsitePage } from "@/lib/website/types";
import { websiteApi, type PageContext } from "./api";
import { AddBlockDialog } from "./add-block-dialog";
import { BlockSettings } from "./block-settings";
import { BlockTree } from "./block-tree";
import { ChangeReview } from "./change-review";
import { PageSettings } from "./page-settings";
import { StewardPanel } from "./steward-panel";
import { VersionHistory } from "./version-history";
import { STATUS_PILL, relativeTime } from "./constants";

type RightTab = "block" | "page" | "history" | "steward";
type Device = "desktop" | "tablet" | "mobile";

const DEVICE_WIDTH: Record<Device, string> = { desktop: "100%", tablet: "834px", mobile: "390px" };
const AUTOSAVE_MS = 1500;
const RECOVERY_KEY = (id: string) => `mjg.website.draft.${id}`;

export function PageEditor({ initial }: { initial: PageContext }) {
  const token = useDashboardActionToken();

  const [page, setPage] = React.useState<WebsitePage>(initial.page);
  const [versions, setVersions] = React.useState(initial.versions);
  const [dependencies, setDependencies] = React.useState(initial.dependencies);
  const [changeSets, setChangeSets] = React.useState(initial.changeSets);

  const [content, setContent] = React.useState<WebsiteContent>(initial.page.draft_content);
  const [selectedId, setSelectedId] = React.useState<string | null>(initial.page.draft_content.blocks[0]?.id ?? null);
  const [tab, setTab] = React.useState<RightTab>("block");
  const [device, setDevice] = React.useState<Device>("desktop");

  const [saveState, setSaveState] = React.useState<"idle" | "saving" | "saved" | "error">("idle");
  const [issues, setIssues] = React.useState<{ path: string; message: string }[]>([]);
  const [error, setError] = React.useState("");
  const [addOpen, setAddOpen] = React.useState(false);
  const [publishOpen, setPublishOpen] = React.useState(false);
  const [moreOpen, setMoreOpen] = React.useState(false);
  const [previewLink, setPreviewLink] = React.useState<string | null>(null);
  const [leftOpen, setLeftOpen] = React.useState(true);
  const [recovery, setRecovery] = React.useState<WebsiteContent | null>(null);

  const iframeRef = React.useRef<HTMLIFrameElement>(null);
  const savedRef = React.useRef(JSON.stringify(initial.page.draft_content));
  const [previewNonce, setPreviewNonce] = React.useState(0);

  const selected = content.blocks.find((b) => b.id === selectedId) ?? null;
  const dirty = JSON.stringify(content) !== savedRef.current;

  // ── Unsaved-session recovery (spec §40) ────────────────────────────────────
  React.useEffect(() => {
    try {
      const stored = window.localStorage.getItem(RECOVERY_KEY(initial.page.id));
      if (!stored) return;
      const parsed = JSON.parse(stored) as { savedAt: number; content: WebsiteContent };
      const serverAt = new Date(initial.page.updated_at).getTime();
      if (parsed.savedAt > serverAt + 2000 && JSON.stringify(parsed.content) !== savedRef.current) {
        setRecovery(parsed.content);
      } else {
        window.localStorage.removeItem(RECOVERY_KEY(initial.page.id));
      }
    } catch {
      /* recovery is best-effort; never block the editor on it */
    }
    // Only on mount, against the version the server handed us.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Autosave ───────────────────────────────────────────────────────────────
  React.useEffect(() => {
    if (!dirty) return;
    try {
      window.localStorage.setItem(RECOVERY_KEY(page.id), JSON.stringify({ savedAt: Date.now(), content }));
    } catch {
      /* storage may be full or blocked; the debounced save is the real path */
    }

    const timer = window.setTimeout(async () => {
      setSaveState("saving");
      try {
        const result = await websiteApi.saveDraft(token, page.id, content);
        savedRef.current = JSON.stringify(content);
        setPage(result.page);
        setIssues(result.issues);
        setSaveState("saved");
        setPreviewNonce((n) => n + 1);
        try { window.localStorage.removeItem(RECOVERY_KEY(page.id)); } catch { /* ignore */ }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not save your draft.");
        setSaveState("error");
      }
    }, AUTOSAVE_MS);

    return () => window.clearTimeout(timer);
  }, [content, dirty, page.id, token]);

  // Warn before closing with work that has not reached the server yet.
  React.useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const reload = React.useCallback(async () => {
    const fresh = await websiteApi.getPage(token, page.id);
    setPage(fresh.page);
    setVersions(fresh.versions);
    setDependencies(fresh.dependencies);
    setChangeSets(fresh.changeSets);
    setContent(fresh.page.draft_content);
    savedRef.current = JSON.stringify(fresh.page.draft_content);
    setPreviewNonce((n) => n + 1);
  }, [token, page.id]);

  // ── Block operations (local; autosave persists them) ───────────────────────
  const apply = (next: WebsiteContent) => { setContent(next); setError(""); };

  const onAdd = (type: string) => {
    try {
      const result = addBlock(content, { type, afterBlockId: selectedId ?? undefined });
      apply(result.content);
      setSelectedId(result.block.id);
      setTab("block");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add that section.");
    }
  };

  const guard = (fn: () => WebsiteContent) => {
    try { apply(fn()); } catch (err) { setError(err instanceof Error ? err.message : "Could not update that section."); }
  };

  async function saveSettings(patch: Record<string, unknown>) {
    const { page: updated } = await websiteApi.updatePage(token, page.id, patch);
    setPage(updated);
    setPreviewNonce((n) => n + 1);
  }

  async function runAction(body: Record<string, unknown>) {
    setError("");
    try {
      await websiteApi.pageAction(token, page.id, body);
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "That action could not be completed.");
    }
  }

  async function createPreviewLink() {
    try {
      const result = await websiteApi.pageAction<{ preview: { url: string; expiresAt: string } }>(token, page.id, {
        action: "createPreviewLink",
      });
      setPreviewLink(`${window.location.origin}${result.preview.url}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create a preview link.");
    }
  }

  const publishedDiff = React.useMemo(
    () => diffContent(page.published_content ?? { version: 1, blocks: [] }, content),
    [page.published_content, content],
  );

  return (
    <div className="flex h-[calc(100vh-var(--dashboard-header,64px))] flex-col">
      {/* ── Toolbar ─────────────────────────────────────────────────────── */}
      <header className="flex flex-wrap items-center gap-2 border-b border-border px-3 py-2">
        <Link href="/dashboard/cms/editor" className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Pages
        </Link>

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{page.title}</p>
          <p className="truncate text-xs text-muted-foreground">/{page.slug}</p>
        </div>

        <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide", STATUS_PILL[page.status])}>
          {page.status}
        </span>
        {page.has_unpublished_changes && page.status === "published" ? (
          <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700 dark:text-amber-400">
            Unpublished changes
          </span>
        ) : null}

        <span className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
          {saveState === "saving" ? <><Loader2 className="h-3 w-3 animate-spin" /> Saving…</> : null}
          {saveState === "saved" && !dirty ? <><Cloud className="h-3 w-3" /> Draft saved {relativeTime(page.updated_at)}</> : null}
          {saveState === "error" ? <span className="text-destructive">Not saved</span> : null}
        </span>

        {/* Device switcher */}
        <div className="flex items-center rounded-md border border-border p-0.5">
          {([["desktop", Monitor], ["tablet", Tablet], ["mobile", Smartphone]] as const).map(([key, Icon]) => (
            <button
              key={key}
              onClick={() => setDevice(key)}
              aria-label={`Preview at ${key} width`}
              aria-pressed={device === key}
              className={cn("rounded p-1.5", device === key ? "bg-[#b88a4a]/15 text-[#b88a4a]" : "text-muted-foreground hover:text-foreground")}
            >
              <Icon className="h-4 w-4" />
            </button>
          ))}
        </div>

        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => window.open(`/website-preview/draft/${page.id}`, "_blank")}>
          <Eye className="h-3.5 w-3.5" /> Preview
        </Button>
        <Button size="sm" className="gap-1.5" onClick={() => setPublishOpen(true)}>
          <Upload className="h-3.5 w-3.5" /> Publish
        </Button>

        <div className="relative">
          <Button variant="ghost" size="icon" aria-label="More actions" onClick={() => setMoreOpen((v) => !v)}>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
          {moreOpen ? (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMoreOpen(false)} aria-hidden />
              <div className="absolute right-0 z-20 mt-1 w-56 rounded-lg border border-border bg-card py-1 shadow-lg">
                <MenuItem onClick={() => { setMoreOpen(false); void createPreviewLink(); }} icon={Share2}>Share a preview link</MenuItem>
                {page.status === "published" ? (
                  <MenuItem onClick={() => { setMoreOpen(false); window.open(pagePath(page.slug), "_blank"); }} icon={ExternalLink}>
                    Open the live page
                  </MenuItem>
                ) : null}
                <MenuItem onClick={() => { setMoreOpen(false); void runAction({ action: "duplicate" }); }} icon={Check}>Duplicate this page</MenuItem>
                {page.status === "published" ? (
                  <MenuItem onClick={() => { setMoreOpen(false); void runAction({ action: "unpublish" }); }} icon={AlertTriangle}>
                    Take off the live site
                  </MenuItem>
                ) : null}
                {!page.is_protected ? (
                  <MenuItem onClick={() => { setMoreOpen(false); void runAction({ action: "archive" }); }} icon={AlertTriangle} danger>
                    Archive this page
                  </MenuItem>
                ) : null}
              </div>
            </>
          ) : null}
        </div>
      </header>

      {recovery ? (
        <div className="flex flex-wrap items-center gap-3 border-b border-amber-300 bg-amber-50 px-4 py-2 text-sm dark:border-amber-800 dark:bg-amber-950/40">
          <AlertTriangle className="h-4 w-4 text-amber-700 dark:text-amber-400" />
          <span>Unsaved work from a previous session was found for this page.</span>
          <Button size="sm" className="h-7" onClick={() => { setContent(recovery); setRecovery(null); }}>Restore it</Button>
          <Button
            size="sm" variant="ghost" className="h-7"
            onClick={() => { try { window.localStorage.removeItem(RECOVERY_KEY(page.id)); } catch { /* ignore */ } setRecovery(null); }}
          >
            Discard
          </Button>
        </div>
      ) : null}

      {error ? (
        <div className="border-b border-border bg-destructive/10 px-4 py-2 text-sm text-destructive">{error}</div>
      ) : null}
      {issues.length ? (
        <div className="border-b border-border bg-amber-50 px-4 py-2 text-xs text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
          {issues.length} field{issues.length === 1 ? "" : "s"} could not be saved as entered: {issues.slice(0, 3).map((i) => i.message).join(" ")}
        </div>
      ) : null}

      {previewLink ? (
        <div className="flex flex-wrap items-center gap-2 border-b border-border bg-muted px-4 py-2 text-sm">
          <Share2 className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Preview link (expires in 24 hours):</span>
          <code className="truncate rounded bg-background px-2 py-0.5 text-xs">{previewLink}</code>
          <Button size="sm" variant="outline" className="h-7" onClick={() => void navigator.clipboard.writeText(previewLink)}>Copy</Button>
          <Button size="sm" variant="ghost" className="h-7" onClick={() => setPreviewLink(null)}>Done</Button>
        </div>
      ) : null}

      {/* ── Three panels ─────────────────────────────────────────────────── */}
      <div className="flex min-h-0 flex-1">
        <aside className={cn("shrink-0 border-r border-border bg-card transition-all", leftOpen ? "w-64" : "w-0 overflow-hidden")}>
          <BlockTree
            blocks={content.blocks}
            selectedId={selectedId}
            onSelect={(id) => { setSelectedId(id); setTab("block"); }}
            onAdd={() => setAddOpen(true)}
            onMove={(id, direction) => guard(() => moveBlock(content, id, { direction }))}
            onReorder={(ids) => guard(() => reorderBlocks(content, ids))}
            onDuplicate={(id) => guard(() => { const r = duplicateBlock(content, id); setSelectedId(r.block.id); return r.content; })}
            onToggleHidden={(id, hidden) => guard(() => updateBlock(content, id, { hidden }))}
            onRemove={(id) => guard(() => { if (selectedId === id) setSelectedId(null); return removeBlock(content, id); })}
          />
        </aside>

        <button
          onClick={() => setLeftOpen((v) => !v)}
          aria-label={leftOpen ? "Hide the page structure" : "Show the page structure"}
          className="w-3 shrink-0 border-r border-border bg-muted/50 text-muted-foreground hover:bg-muted"
        >
          {leftOpen ? <ChevronLeft className="mx-auto h-3 w-3" /> : <ChevronRight className="mx-auto h-3 w-3" />}
        </button>

        <main className="min-w-0 flex-1 overflow-auto bg-muted/40 p-4">
          <div
            className="mx-auto h-full overflow-hidden rounded-lg border border-border bg-background shadow-sm transition-all"
            style={{ width: DEVICE_WIDTH[device], maxWidth: "100%" }}
          >
            <iframe
              ref={iframeRef}
              key={previewNonce}
              src={`/website-preview/draft/${page.id}?v=${previewNonce}`}
              title={`Preview of ${page.title}`}
              className="h-full w-full"
            />
          </div>
        </main>

        <aside className="flex w-[380px] shrink-0 flex-col border-l border-border bg-card">
          <div className="flex gap-1 border-b border-border px-2 pt-2">
            <TabButton active={tab === "block"} onClick={() => setTab("block")} icon={Settings2}>Section</TabButton>
            <TabButton active={tab === "page"} onClick={() => setTab("page")} icon={Search}>Page &amp; SEO</TabButton>
            <TabButton active={tab === "history"} onClick={() => setTab("history")} icon={History}>History</TabButton>
            <TabButton active={tab === "steward"} onClick={() => setTab("steward")} icon={Bot}>
              Steward
              {changeSets.some((c) => c.status === "proposed" || c.status === "draft_applied") ? (
                <span className="ml-1 h-1.5 w-1.5 rounded-full bg-[#b88a4a]" aria-label="Steward has proposals waiting" />
              ) : null}
            </TabButton>
          </div>

          <div className="min-h-0 flex-1 overflow-hidden">
            {tab === "block" ? (
              selected ? (
                <BlockSettings
                  block={selected}
                  pageTitle={page.title}
                  onChange={(props) => guard(() => updateBlock(content, selected.id, { props }))}
                />
              ) : (
                <p className="p-4 text-sm text-muted-foreground">
                  Choose a section on the left to edit it, or add a new one.
                </p>
              )
            ) : null}
            {tab === "page" ? <PageSettings page={page} dependencies={dependencies} onSave={saveSettings} /> : null}
            {tab === "history" ? (
              <VersionHistory
                versions={versions}
                currentDraft={content}
                onRestore={async (versionId) => { await runAction({ action: "restoreVersion", versionId }); }}
              />
            ) : null}
            {tab === "steward" ? <StewardPanel page={page} changeSets={changeSets} onChanged={reload} /> : null}
          </div>
        </aside>
      </div>

      <AddBlockDialog open={addOpen} onClose={() => setAddOpen(false)} onPick={onAdd} />

      {publishOpen ? (
        <PublishDialog
          page={page}
          diff={publishedDiff}
          dirty={dirty}
          onClose={() => setPublishOpen(false)}
          onPublish={async () => {
            if (dirty) await websiteApi.saveDraft(token, page.id, content, false);
            await runAction({ action: "publish", summary: publishedDiff.summary });
            setPublishOpen(false);
          }}
        />
      ) : null}
    </div>
  );
}

function TabButton({
  active, onClick, icon: Icon, children,
}: {
  active: boolean; onClick: () => void; icon: React.ElementType; children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "-mb-px flex items-center gap-1 rounded-t-md px-2.5 py-2 text-xs font-medium",
        active ? "border-b-2 border-[#b88a4a] text-[#b88a4a]" : "border-b-2 border-transparent text-muted-foreground hover:text-foreground",
      )}
    >
      <Icon className="h-3.5 w-3.5" /> {children}
    </button>
  );
}

function MenuItem({
  onClick, icon: Icon, danger, children,
}: {
  onClick: () => void; icon: React.ElementType; danger?: boolean; children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted",
        danger && "text-destructive",
      )}
    >
      <Icon className="h-3.5 w-3.5" /> {children}
    </button>
  );
}

function PublishDialog({
  page, diff, dirty, onClose, onPublish,
}: {
  page: WebsitePage;
  diff: ReturnType<typeof diffContent>;
  dirty: boolean;
  onClose: () => void;
  onPublish: () => Promise<void>;
}) {
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div className="relative z-10 flex max-h-[80vh] w-full max-w-2xl flex-col rounded-xl border border-border bg-card shadow-xl">
        <div className="border-b border-border p-4">
          <h2 className="font-semibold">Publish &ldquo;{page.title}&rdquo;</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            This puts your draft on the live site at <code className="rounded bg-muted px-1">{pagePath(page.slug)}</code>.
            The current version is saved first, so you can always go back.
          </p>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {page.is_legal ? (
            <p className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
              This is a legal page. Changes here may have compliance implications — please be sure the wording has been reviewed.
            </p>
          ) : null}
          {dirty ? <p className="text-xs text-muted-foreground">Your latest edits will be saved before publishing.</p> : null}
          <ChangeReview diff={diff} />
        </div>

        <div className="flex items-center gap-2 border-t border-border p-4">
          {error ? <p className="mr-auto text-sm text-destructive">{error}</p> : <span className="mr-auto" />}
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button
            disabled={busy}
            className="gap-1.5"
            onClick={async () => {
              setBusy(true);
              setError("");
              try { await onPublish(); } catch (err) { setError(err instanceof Error ? err.message : "Could not publish."); } finally { setBusy(false); }
            }}
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Publish now
          </Button>
        </div>
      </div>
    </div>
  );
}
