"use client";

import * as React from "react";
import Link from "next/link";
import { Archive, ArchiveRestore, FileText, Loader2, Pencil, Plus, Save, SquarePen, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FieldSelect } from "@/components/ui/field-select";
import { cn } from "@/lib/utils";
import { useDashboardActionToken } from "@/components/layout/dashboard-action-token";
import { CMS_PAGE_TYPES, type CmsPage, type CmsPageType } from "@/lib/cms/types";
import { AskStewardCms } from "@/components/cms/ask-steward-cms";

const TYPE_OPTS = CMS_PAGE_TYPES.map((t) => ({ value: t.value, label: t.label }));
const typeLabel = (t: string) => CMS_PAGE_TYPES.find((x) => x.value === t)?.label ?? t;

const statusClass: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  published: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  archived: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
};

type Draft = { id?: string; title: string; slug: string; page_type: CmsPageType; description: string };
const blankDraft = (): Draft => ({ title: "", slug: "", page_type: "page", description: "" });
const toDraft = (p: CmsPage): Draft => ({ id: p.id, title: p.title, slug: p.slug, page_type: p.page_type, description: p.description ?? "" });

export function CmsPagesList({ initialPages }: { initialPages: CmsPage[] }) {
  const token = useDashboardActionToken();
  const [pages, setPages] = React.useState<CmsPage[]>(initialPages);
  const [editing, setEditing] = React.useState<Draft | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const reload = React.useCallback(async () => {
    const r = await fetch("/api/admin/cms/pages", { headers: { "x-mjg-action-token": token } }).then((x) => x.json());
    if (r.pages) setPages(r.pages);
  }, [token]);

  async function send(url: string, method: string, body: Record<string, unknown>) {
    const res = await fetch(url, { method, headers: { "content-type": "application/json" }, body: JSON.stringify({ ...body, actionToken: token }) });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.error || "Request failed.");
    return json;
  }

  async function save(draft: Draft) {
    setBusy(true); setError(null);
    try {
      if (draft.id) await send(`/api/admin/cms/pages/${draft.id}`, "PATCH", { title: draft.title, slug: draft.slug, page_type: draft.page_type, description: draft.description });
      else await send("/api/admin/cms/pages", "POST", { title: draft.title, slug: draft.slug || undefined, page_type: draft.page_type, description: draft.description });
      setEditing(null);
      await reload();
    } catch (e) { setError(e instanceof Error ? e.message : "Save failed."); }
    finally { setBusy(false); }
  }

  async function setStatus(p: CmsPage, status: "draft" | "archived") {
    setPages((prev) => prev.map((x) => (x.id === p.id ? { ...x, status } : x)));
    try { await send(`/api/admin/cms/pages/${p.id}`, "PATCH", { status }); } catch { reload(); }
  }

  async function remove(p: CmsPage) {
    if (!window.confirm(`Delete "${p.title}"? This removes the page and its draft blocks/versions.`)) return;
    setBusy(true);
    try { await send(`/api/admin/cms/pages/${p.id}`, "DELETE", {}); setPages((prev) => prev.filter((x) => x.id !== p.id)); }
    catch (e) { setError(e instanceof Error ? e.message : "Delete failed."); }
    finally { setBusy(false); }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{pages.length} page{pages.length === 1 ? "" : "s"}</p>
        <div className="flex items-center gap-2">
          <AskStewardCms onClose={reload} />
          <Button size="sm" variant="outline" onClick={() => setEditing(blankDraft())}><Plus className="h-3.5 w-3.5" /> New page</Button>
        </div>
      </div>

      {error && <div className="mb-3 flex items-center justify-between rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"><span>{error}</span><button onClick={() => setError(null)}><X className="h-3.5 w-3.5" /></button></div>}

      {pages.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
          <FileText className="mb-2 h-6 w-6" />
          No CMS pages yet. Create one to get started — the block editor and live preview land in the next phase.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <div className="divide-y divide-border">
            {pages.map((p) => (
              <div key={p.id} className="flex flex-wrap items-center gap-3 px-4 py-3 hover:bg-muted/30">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Link href={`/dashboard/cms/pages/${p.id}`} className="truncate font-medium hover:text-primary hover:underline">{p.title}</Link>
                    <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium capitalize", statusClass[p.status])}>{p.status}</span>
                  </div>
                  <div className="mt-0.5 text-[11px] text-muted-foreground">
                    {typeLabel(p.page_type)} · <span className="font-mono">/p/{p.slug}</span>
                    {p.description ? ` · ${p.description}` : ""}
                  </div>
                </div>
                <Button asChild size="sm" variant="outline"><Link href={`/dashboard/cms/pages/${p.id}`}><SquarePen className="h-3.5 w-3.5" /> Edit</Link></Button>
                <button onClick={() => setEditing(toDraft(p))} className="text-muted-foreground hover:text-primary" title="Edit details"><Pencil className="h-4 w-4" /></button>
                {p.status === "archived" ? (
                  <button onClick={() => setStatus(p, "draft")} className="text-muted-foreground hover:text-foreground" title="Restore to draft"><ArchiveRestore className="h-4 w-4" /></button>
                ) : (
                  <button onClick={() => setStatus(p, "archived")} className="text-muted-foreground hover:text-amber-600" title="Archive"><Archive className="h-4 w-4" /></button>
                )}
                <button onClick={() => remove(p)} className="text-muted-foreground hover:text-destructive" title="Delete"><Trash2 className="h-4 w-4" /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="mt-3 text-[11px] text-muted-foreground">
        Public pages will render at <span className="font-mono">/p/&lt;slug&gt;</span> once published (Phase 3). Existing site pages are untouched.
      </p>

      {editing && (
        <PageEditor draft={editing} setDraft={setEditing} onSave={save} onClose={() => setEditing(null)} busy={busy} />
      )}
    </div>
  );
}

function PageEditor({ draft, setDraft, onSave, onClose, busy }: {
  draft: Draft; setDraft: React.Dispatch<React.SetStateAction<Draft | null>>;
  onSave: (d: Draft) => void; onClose: () => void; busy: boolean;
}) {
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setDraft((d) => (d ? { ...d, [k]: v } : d));
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 my-10 w-full max-w-lg rounded-xl border border-border bg-card p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">{draft.id ? "Edit page details" : "New page"}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
        </div>
        <div className="space-y-3">
          <div><label className="mb-1 block text-xs font-medium text-muted-foreground">Title</label><Input value={draft.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Stewardship Blueprint Overview" /></div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Slug (public path)</label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">/p/</span>
              <Input value={draft.slug} onChange={(e) => set("slug", e.target.value)} placeholder={draft.id ? "" : "auto from title"} />
            </div>
          </div>
          <div><label className="mb-1 block text-xs font-medium text-muted-foreground">Type</label><FieldSelect value={draft.page_type} onChange={(v) => set("page_type", v as CmsPageType)} options={TYPE_OPTS} /></div>
          <div><label className="mb-1 block text-xs font-medium text-muted-foreground">Description</label><Textarea className="min-h-[60px]" value={draft.description} onChange={(e) => set("description", e.target.value)} placeholder="Internal note / SEO description" /></div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onSave(draft)} disabled={busy || !draft.title.trim()}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save</Button>
        </div>
      </div>
    </div>
  );
}
