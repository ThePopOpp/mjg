"use client";

import * as React from "react";
import {
  Monitor, Tablet, Smartphone, RefreshCw, MousePointerClick, Crosshair, ListTree, Trash2, Loader2, Check, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FieldSelect } from "@/components/ui/field-select";
import { cn } from "@/lib/utils";
import { useDashboardActionToken } from "@/components/layout/dashboard-action-token";
import { installOverlay, type ElementDescriptor, type OverlayController, type OutlineItem, type SelectionMode } from "@/components/cms/frontend-overlay";
import type { PageNote } from "@/lib/cms/page-notes";

export type FrontendPage = { slug: string; label: string; url: string };

const DEVICES: { key: string; icon: React.ElementType; w: number; label: string }[] = [
  { key: "desktop", icon: Monitor, w: 0, label: "Desktop" },
  { key: "tablet", icon: Tablet, w: 820, label: "Tablet" },
  { key: "mobile", icon: Smartphone, w: 390, label: "Mobile" },
];
const MODES: { value: SelectionMode; label: string }[] = [
  { value: "auto", label: "Auto Detect" }, { value: "sections", label: "Sections" }, { value: "containers", label: "Containers" },
  { value: "rows", label: "Rows" }, { value: "columns", label: "Columns" }, { value: "cards", label: "Cards" },
  { value: "components", label: "Components" }, { value: "headings", label: "Headings only" },
];
const CHANGE_TYPES = ["edit", "add", "remove", "move", "style", "copy", "bug", "question"].map((v) => ({ value: v, label: v[0].toUpperCase() + v.slice(1) }));
const PRIORITIES = ["low", "medium", "high", "urgent"].map((v) => ({ value: v, label: v[0].toUpperCase() + v.slice(1) }));
const STATUSES = [{ value: "open", label: "Open" }, { value: "in_progress", label: "In progress" }, { value: "done", label: "Done" }, { value: "archived", label: "Archived" }];

const PRIORITY_COLOR: Record<string, string> = {
  low: "text-muted-foreground", medium: "text-foreground", high: "text-amber-600 dark:text-amber-400", urgent: "text-destructive",
};

export function FrontendEdits({ pages }: { pages: FrontendPage[] }) {
  const token = useDashboardActionToken();
  const [page, setPage] = React.useState<FrontendPage | null>(pages[0] ?? null);
  const [device, setDevice] = React.useState("desktop");
  const [mode, setMode] = React.useState<SelectionMode>("auto");
  const [selecting, setSelecting] = React.useState(true);
  const [nonce, setNonce] = React.useState(0);
  const [selected, setSelected] = React.useState<ElementDescriptor | null>(null);
  const [outline, setOutline] = React.useState<OutlineItem[]>([]);
  const [picker, setPicker] = React.useState<{ items: ElementDescriptor[]; x: number; y: number } | null>(null);
  const [notes, setNotes] = React.useState<PageNote[]>([]);
  const [frameOk, setFrameOk] = React.useState(true);

  // Note form
  const [noteText, setNoteText] = React.useState("");
  const [changeType, setChangeType] = React.useState("edit");
  const [priority, setPriority] = React.useState("medium");
  const [busy, setBusy] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const iframeRef = React.useRef<HTMLIFrameElement>(null);
  const controllerRef = React.useRef<OverlayController | null>(null);
  const wrapRef = React.useRef<HTMLDivElement>(null);

  const deviceW = DEVICES.find((d) => d.key === device)?.w ?? 0;

  const loadNotes = React.useCallback(async () => {
    if (!page) return;
    try {
      const r = await fetch(`/api/admin/cms/page-notes?page=${encodeURIComponent(page.slug)}`, { headers: { "x-mjg-action-token": token } }).then((x) => x.json());
      if (Array.isArray(r.notes)) setNotes(r.notes);
    } catch { /* ignore */ }
  }, [page, token]);
  React.useEffect(() => { loadNotes(); }, [loadNotes]);

  // (Re)install the overlay whenever the iframe finishes loading.
  const onFrameLoad = React.useCallback(() => {
    controllerRef.current?.destroy();
    controllerRef.current = null;
    const iframe = iframeRef.current; if (!iframe || !page) return;
    let doc: Document | null = null;
    try { doc = iframe.contentDocument; } catch { doc = null; }
    const win = iframe.contentWindow;
    if (!doc || !win) { setFrameOk(false); return; }
    setFrameOk(true);
    controllerRef.current = installOverlay(doc, win, {
      slug: page.slug, mode, active: selecting,
      onSelect: (d) => { setSelected(d); setPicker(null); },
      onOverlap: (cands, x, y) => {
        const rect = iframe.getBoundingClientRect();
        const wrapRect = wrapRef.current?.getBoundingClientRect();
        setPicker({ items: cands, x: rect.left - (wrapRect?.left ?? 0) + x, y: rect.top - (wrapRect?.top ?? 0) + y });
      },
      onOutline: (items) => setOutline(items),
    });
    controllerRef.current.scanOutline();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, nonce]);

  React.useEffect(() => () => controllerRef.current?.destroy(), []);
  React.useEffect(() => { controllerRef.current?.setMode(mode); }, [mode]);
  React.useEffect(() => { controllerRef.current?.setActive(selecting); }, [selecting]);

  function pickCandidate(d: ElementDescriptor) {
    setPicker(null);
    const re = controllerRef.current?.selectByRef(d.element_ref);
    setSelected(re ?? d);
  }
  function jumpTo(ref: string) {
    const d = controllerRef.current?.selectByRef(ref);
    if (d) setSelected(d);
  }

  async function saveNote() {
    if (!selected || !page || !noteText.trim()) return;
    setBusy(true); setError(null);
    try {
      const res = await fetch("/api/admin/cms/page-notes", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ pageSlug: page.slug, pageLabel: page.label, pageUrl: page.url, descriptor: selected, note: noteText.trim(), changeType, priority, actionToken: token }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Save failed.");
      setNoteText(""); setSaved(true); setTimeout(() => setSaved(false), 1800);
      await loadNotes();
    } catch (e) { setError(e instanceof Error ? e.message : "Save failed."); }
    finally { setBusy(false); }
  }

  async function setNoteStatus(id: string, status: string) {
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, status: status as PageNote["status"] } : n)));
    await fetch("/api/admin/cms/page-notes", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ id, status, actionToken: token }) }).catch(() => {});
  }
  async function removeNote(id: string) {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    await fetch(`/api/admin/cms/page-notes?id=${id}`, { method: "DELETE", headers: { "x-mjg-action-token": token } }).catch(() => {});
  }

  const notesByRef = React.useMemo(() => {
    const m: Record<string, number> = {};
    for (const n of notes) if (n.status !== "archived") m[n.element_ref] = (m[n.element_ref] ?? 0) + 1;
    return m;
  }, [notes]);

  if (!page) return <p className="text-sm text-muted-foreground">No frontend pages available to review yet.</p>;

  return (
    <div className="flex h-[calc(100vh-190px)] min-h-[560px] flex-col gap-3">
      {/* Top bar */}
      <div className="flex flex-wrap items-center gap-2">
        <FieldSelect value={page.slug} onChange={(v) => { const p = pages.find((x) => x.slug === v); if (p) { setPage(p); setSelected(null); setOutline([]); } }}
          options={pages.map((p) => ({ value: p.slug, label: p.label }))} className="h-9 w-56" />
        <span className="hidden truncate text-xs text-muted-foreground sm:inline">{page.url}</span>
        <div className="ml-auto flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-muted-foreground">Select:</span>
            <FieldSelect value={mode} onChange={(v) => setMode(v as SelectionMode)} options={MODES} className="h-9 w-40" />
          </div>
          <Button variant={selecting ? "default" : "outline"} size="sm" onClick={() => setSelecting((s) => !s)} title="Toggle click-to-select">
            {selecting ? <Crosshair className="h-4 w-4" /> : <MousePointerClick className="h-4 w-4" />} {selecting ? "Selecting" : "Browse"}
          </Button>
          <div className="flex items-center rounded-lg border border-border bg-card p-0.5">
            {DEVICES.map((d) => (
              <button key={d.key} onClick={() => setDevice(d.key)} title={d.label} className={cn("rounded-md p-1.5", device === d.key ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground")}><d.icon className="h-4 w-4" /></button>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={() => { setNonce((n) => n + 1); }} title="Reload preview"><RefreshCw className="h-4 w-4" /></Button>
        </div>
      </div>

      {error && <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>}

      <div className="grid min-h-0 flex-1 gap-3" style={{ gridTemplateColumns: "minmax(0,1fr) 340px" }}>
        {/* Preview */}
        <div ref={wrapRef} className="relative min-h-0 overflow-auto rounded-xl border border-border bg-muted/40 p-3">
          {!frameOk && (
            <div className="mb-2 rounded-lg border border-amber-300/50 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
              Couldn’t read the previewed page (cross-origin or blocked framing). Same-origin pages with <code>X-Frame-Options: SAMEORIGIN</code> are required.
            </div>
          )}
          <iframe ref={iframeRef} onLoad={onFrameLoad} title="Frontend preview"
            src={`${page.url}${page.url.includes("?") ? "&" : "?"}_n=${nonce}`}
            className="mx-auto block rounded-md border border-border bg-white shadow-sm"
            style={{ width: deviceW || "100%", height: "calc(100% - 4px)", minHeight: 520 }} />
          {picker && (
            <div className="absolute z-30 w-56 overflow-hidden rounded-lg border border-border bg-card shadow-xl" style={{ left: Math.max(8, picker.x), top: Math.max(8, picker.y) }}>
              <div className="flex items-center justify-between border-b border-border px-2.5 py-1.5 text-[11px] font-semibold text-muted-foreground">Pick a level<button onClick={() => setPicker(null)}><X className="h-3.5 w-3.5" /></button></div>
              {picker.items.map((d) => (
                <button key={d.element_ref} onClick={() => pickCandidate(d)} className="flex w-full items-center gap-2 px-2.5 py-2 text-left text-xs hover:bg-muted">
                  <span className="rounded bg-primary/10 px-1.5 py-0.5 font-mono text-[10px] uppercase text-primary">{d.element_type}</span>
                  <span className="min-w-0 flex-1 truncate">{d.element_label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Inspector + notes */}
        <div className="flex min-h-0 flex-col gap-3 overflow-y-auto">
          {/* Selected element + note form */}
          <div className="rounded-xl border border-border bg-card p-3">
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Selected element</div>
            {!selected ? (
              <p className="text-xs text-muted-foreground">Click an element in the preview to attach an edit request. Use the mode dropdown to target sections, rows, cards, headings, etc.</p>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-primary/10 px-1.5 py-0.5 font-mono text-[10px] uppercase text-primary">{selected.element_type}</span>
                  <span className="min-w-0 flex-1 truncate text-xs font-medium">{selected.element_label}</span>
                </div>
                {selected.content_summary && <p className="line-clamp-2 text-[11px] text-muted-foreground">{selected.content_summary}</p>}
                <p className="truncate font-mono text-[10px] text-muted-foreground/70" title={selected.element_ref}>{selected.element_ref}</p>
                <Textarea value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="Describe the edit you want here…" className="min-h-[80px]" />
                <div className="grid grid-cols-2 gap-2">
                  <div><label className="mb-1 block text-[11px] text-muted-foreground">Change</label><FieldSelect value={changeType} onChange={setChangeType} options={CHANGE_TYPES} className="h-8" /></div>
                  <div><label className="mb-1 block text-[11px] text-muted-foreground">Priority</label><FieldSelect value={priority} onChange={setPriority} options={PRIORITIES} className="h-8" /></div>
                </div>
                <Button size="sm" className="w-full" onClick={saveNote} disabled={busy || !noteText.trim()}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <Check className="h-4 w-4" /> : null} {saved ? "Saved" : "Add edit request"}</Button>
              </div>
            )}
          </div>

          {/* Outline */}
          <div className="rounded-xl border border-border bg-card p-2">
            <div className="flex items-center gap-1.5 px-1 py-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground"><ListTree className="h-3.5 w-3.5" /> Page outline</div>
            <div className="max-h-40 space-y-0.5 overflow-y-auto">
              {outline.length === 0 && <p className="px-1 py-1 text-[11px] text-muted-foreground">Outline appears once the page loads.</p>}
              {outline.map((o) => (
                <button key={o.element_ref} onClick={() => jumpTo(o.element_ref)} className="flex w-full items-center gap-2 rounded px-1.5 py-1 text-left text-[11px] hover:bg-muted" style={{ paddingLeft: o.level ? o.level * 8 + 6 : 6 }}>
                  <span className="text-muted-foreground/70">{o.level ? `H${o.level}` : "§"}</span>
                  <span className="min-w-0 flex-1 truncate">{o.label}</span>
                  {notesByRef[o.element_ref] ? <span className="rounded-full bg-primary/15 px-1.5 text-[9px] font-bold text-primary">{notesByRef[o.element_ref]}</span> : null}
                </button>
              ))}
            </div>
          </div>

          {/* Requests for this page */}
          <div className="rounded-xl border border-border bg-card p-2">
            <div className="px-1 py-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Edit requests · {notes.length}</div>
            <div className="space-y-1.5">
              {notes.length === 0 && <p className="px-1 py-1 text-[11px] text-muted-foreground">No requests on this page yet.</p>}
              {notes.map((n) => (
                <div key={n.id} className={cn("group rounded-lg border border-border p-2", n.status === "done" && "opacity-60", n.status === "archived" && "opacity-40")}>
                  <div className="mb-1 flex items-center gap-1.5">
                    <button onClick={() => jumpTo(n.element_ref)} className="min-w-0 flex-1 truncate text-left text-[11px] font-medium hover:text-primary" title="Jump to element">
                      <span className="mr-1 rounded bg-muted px-1 font-mono text-[9px] uppercase text-muted-foreground">{n.element_type}</span>{n.element_label || n.element_ref}
                    </button>
                    <span className={cn("text-[9px] font-bold uppercase", PRIORITY_COLOR[n.priority])}>{n.priority}</span>
                    <button onClick={() => removeNote(n.id)} className="text-muted-foreground opacity-0 hover:text-destructive group-hover:opacity-100" title="Delete"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                  <p className="mb-1.5 whitespace-pre-wrap text-[11px] leading-snug">{n.note}</p>
                  <div className="flex items-center gap-1.5">
                    <span className="rounded bg-muted px-1.5 py-0.5 text-[9px] uppercase text-muted-foreground">{n.change_type}</span>
                    <FieldSelect value={n.status} onChange={(v) => setNoteStatus(n.id, v)} options={STATUSES} className="ml-auto h-7 w-28 text-[11px]" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
