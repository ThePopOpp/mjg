"use client";

import * as React from "react";
import {
  Monitor, Tablet, Smartphone, RefreshCw, MousePointerClick, Crosshair, ListTree, Trash2, Loader2, Check, X, Plus,
  ArrowLeft, Download, Bot, Bookmark,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FieldSelect } from "@/components/ui/field-select";
import { cn } from "@/lib/utils";
import { useDashboardActionToken } from "@/components/layout/dashboard-action-token";
import { AgentChat } from "@/components/ai-agent/agent-chat";
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
  { value: "components", label: "Components" }, { value: "headings", label: "Headings" }, { value: "icons", label: "Icons (SVG)" },
  { value: "content", label: "Content / Text" }, { value: "eyebrows", label: "Eyebrows" }, { value: "buttons", label: "Buttons" },
  { value: "links", label: "Links" }, { value: "images", label: "Images" },
];
// Insert-content request options (the "+ Insert Section" flow).
const ADD_TYPES = [
  { value: "section", label: "Section" }, { value: "row", label: "Row" }, { value: "column", label: "Column" },
  { value: "card", label: "Card" }, { value: "content", label: "Content" }, { value: "component", label: "Component (ShadCN UI)" },
];
const SHADCN_COMPONENTS = [
  "Accordion", "Alert", "Avatar", "Badge", "Button", "Card", "Carousel", "Dialog", "Tabs", "Table", "Tooltip",
  "Popover", "Sheet", "Select", "Input", "Textarea", "Form", "Navigation Menu", "Breadcrumb", "Pagination",
  "Dropdown Menu", "Command", "Calendar", "Checkbox", "Radio Group", "Switch", "Slider", "Progress", "Skeleton", "Toast",
].map((c) => ({ value: c, label: c }));
const CHANGE_TYPES = ["edit", "add", "remove", "move", "style", "copy", "bug", "question"].map((v) => ({ value: v, label: v[0].toUpperCase() + v.slice(1) }));
const PRIORITIES = ["low", "medium", "high", "urgent"].map((v) => ({ value: v, label: v[0].toUpperCase() + v.slice(1) }));
const STATUSES = [{ value: "open", label: "Open" }, { value: "in_progress", label: "In progress" }, { value: "done", label: "Done" }, { value: "archived", label: "Archived" }];

const PRIORITY_COLOR: Record<string, string> = {
  low: "text-muted-foreground", medium: "text-foreground", high: "text-amber-600 dark:text-amber-400", urgent: "text-destructive",
};

export function FrontendEdits({ pages, onBack, onOpenRequests }: { pages: FrontendPage[]; onBack?: () => void; onOpenRequests?: () => void }) {
  const token = useDashboardActionToken();
  const [origin, setOrigin] = React.useState("");
  const [stewardOpen, setStewardOpen] = React.useState(false);
  React.useEffect(() => { setOrigin(window.location.origin); }, []);
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

  const [insertMode, setInsertMode] = React.useState(false);

  // Note form
  const [noteText, setNoteText] = React.useState("");
  const [changeType, setChangeType] = React.useState("edit");
  const [priority, setPriority] = React.useState("medium");
  const [addType, setAddType] = React.useState("section");
  const [shadcnComp, setShadcnComp] = React.useState("Accordion");
  const [busy, setBusy] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const isInsert = selected?.element_type === "section_insert";

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

  // Keep latest control state in refs so a fresh overlay (after any iframe load)
  // starts in the right mode without re-installing on every state change.
  const modeRef = React.useRef(mode); modeRef.current = mode;
  const selectingRef = React.useRef(selecting); selectingRef.current = selecting;
  const insertRef = React.useRef(insertMode); insertRef.current = insertMode;

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
    const c = installOverlay(doc, win, {
      slug: page.slug, mode: modeRef.current, active: selectingRef.current,
      onSelect: (d) => { setSelected(d); setPicker(null); },
      onOverlap: (cands, x, y) => {
        const rect = iframe.getBoundingClientRect();
        const wrapRect = wrapRef.current?.getBoundingClientRect();
        setPicker({ items: cands, x: rect.left - (wrapRect?.left ?? 0) + x, y: rect.top - (wrapRect?.top ?? 0) + y });
      },
      onOutline: (items) => setOutline(items),
    });
    controllerRef.current = c;
    c.scanOutline();
    if (insertRef.current) c.setInsertMode(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, nonce]);

  React.useEffect(() => () => controllerRef.current?.destroy(), []);
  React.useEffect(() => { controllerRef.current?.setMode(mode); }, [mode]);
  React.useEffect(() => { controllerRef.current?.setActive(selecting); }, [selecting]);
  React.useEffect(() => { controllerRef.current?.setInsertMode(insertMode); }, [insertMode]);

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
      // For insert requests, augment the descriptor + change type with what to add.
      const descriptor = isInsert ? { ...selected, addType, shadcnComponent: addType === "component" ? shadcnComp : undefined } : selected;
      const ct = isInsert ? (addType === "component" ? `add:component:${shadcnComp}` : `add:${addType}`) : changeType;
      const res = await fetch("/api/admin/cms/page-notes", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ pageSlug: page.slug, pageLabel: page.label, pageUrl: page.url, descriptor, note: noteText.trim(), changeType: ct, priority, actionToken: token }),
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

  const fullUrl = page ? `${origin}${page.url}` : "";

  // Export this page's edit requests as a Markdown brief (hand off to a dev / AI).
  function exportNotes() {
    if (!page) return;
    const lines = [`# Edit requests — ${page.label}`, `Page: ${fullUrl}`, `Generated: ${new Date().toLocaleString()}`, "", `${notes.length} request(s).`, ""];
    for (const n of notes) {
      lines.push(`## ${n.element_label || n.element_ref}  \`${n.element_type}\``);
      lines.push(`- Change: ${n.change_type} · Priority: ${n.priority} · Status: ${n.status}`);
      if (n.dom_selector) lines.push(`- Selector: \`${n.dom_selector}\``);
      lines.push(`- Ref: \`${n.element_ref}\``);
      lines.push("", n.note, "");
    }
    const blob = new Blob([lines.join("\n")], { type: "text/markdown" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = `edit-requests-${page.slug}.md`; a.click(); URL.revokeObjectURL(a.href);
  }

  const stewardContext = page
    ? `You are reviewing the public page "${page.label}" (${fullUrl}). Its ${notes.length} saved edit request(s):\n${notes.map((n) => `- [${n.change_type}/${n.priority}/${n.status}] ${n.element_label} (${n.element_type}): ${n.note}`).join("\n") || "(none yet)"}\nHelp draft the changes as CMS drafts — never publish or edit the live site.`
    : "";

  if (!page) return <p className="text-sm text-muted-foreground">No frontend pages available to review yet.</p>;

  return (
    <div className="flex h-[calc(100vh-120px)] min-h-[560px] flex-col gap-2">
      {/* Breadcrumb */}
      <div className="text-[11px] text-muted-foreground">
        <button onClick={onBack} className="hover:text-foreground hover:underline">CMS</button>
        <span className="mx-1.5 opacity-50">|</span>
        <span className="text-foreground">Frontend Live Page Editor &amp; Element Inspector</span>
      </div>
      {/* Top bar */}
      <div className="flex flex-wrap items-center gap-2">
        {onBack && <Button variant="outline" size="sm" onClick={onBack}><ArrowLeft className="h-4 w-4" /> Back to CMS</Button>}
        <FieldSelect value={page.slug} onChange={(v) => { const p = pages.find((x) => x.slug === v); if (p) { setPage(p); setSelected(null); setOutline([]); } }}
          options={pages.map((p) => ({ value: p.slug, label: p.label }))} className="h-9 w-48" />
        <span className="text-muted-foreground">/</span>
        <Input readOnly value={fullUrl} className="h-9 w-64 bg-muted/40 text-xs text-muted-foreground" onFocus={(e) => e.currentTarget.select()} title={fullUrl} />
        <div className="flex items-center rounded-lg border border-border bg-card p-0.5">
          {DEVICES.map((d) => (
            <button key={d.key} onClick={() => setDevice(d.key)} title={d.label} className={cn("rounded-md p-1.5", device === d.key ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground")}><d.icon className="h-4 w-4" /></button>
          ))}
        </div>
        <FieldSelect value={mode} onChange={(v) => setMode(v as SelectionMode)} options={MODES} className="h-9 w-36" />
        <Button variant={selecting ? "default" : "outline"} size="sm" onClick={() => setSelecting((s) => !s)} title="Toggle click-to-select">
          {selecting ? <Crosshair className="h-4 w-4" /> : <MousePointerClick className="h-4 w-4" />} {selecting ? "Selecting" : "Browse"}
        </Button>
        <Button variant={insertMode ? "default" : "outline"} size="sm" onClick={() => { setInsertMode((v) => !v); setSelected(null); }} title="Insert content between sections">
          <Plus className="h-4 w-4" /> Insert Section
        </Button>
        <div className="ml-auto flex items-center gap-2">
          {onOpenRequests && <Button variant="outline" size="sm" onClick={onOpenRequests} title="Saved edit requests"><Bookmark className="h-4 w-4" /> Saved Reviews</Button>}
          <Button variant="outline" size="sm" onClick={exportNotes} disabled={notes.length === 0} title="Export this page's requests as Markdown"><Download className="h-4 w-4" /> Export</Button>
          <Button variant="outline" size="sm" onClick={() => setStewardOpen(true)} title="Ask Steward to draft the changes"><Bot className="h-4 w-4" /> Send to Steward AI</Button>
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
          {/* Element Inspector — normal edit request OR insert-content request */}
          <div className="rounded-xl border border-border bg-card p-3">
            <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{isInsert ? "Request new content" : "Element inspector"}</div>
            {!isInsert && <p className="mb-2 text-[10px] text-muted-foreground">Review-only. Click page elements to attach notes — nothing here edits the live site.</p>}
            {!selected ? (
              <p className="text-xs text-muted-foreground">{insertMode ? "Click a “+ Add content here” marker in the preview to request new content." : "Click an element in the preview to attach an edit request. Use the mode dropdown to target sections, rows, cards, headings, icons, buttons, etc."}</p>
            ) : isInsert ? (
              <div className="space-y-2">
                <div className="rounded-lg border border-primary/40 bg-primary/5 px-2.5 py-2">
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-primary">Insert point selected</div>
                  <div className="mt-0.5 text-xs">{selected.element_label}</div>
                </div>
                <div><label className="mb-1 block text-[11px] text-muted-foreground">Add</label><FieldSelect value={addType} onChange={setAddType} options={ADD_TYPES} className="h-8" /></div>
                {addType === "component" && (
                  <div><label className="mb-1 block text-[11px] text-muted-foreground">ShadCN component</label><FieldSelect value={shadcnComp} onChange={setShadcnComp} options={SHADCN_COMPONENTS} className="h-8" /></div>
                )}
                <Textarea value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="Describe the new content: title, subtitle, eyebrow, body copy, icons, images, links, buttons…" className="min-h-[84px]" />
                <div><label className="mb-1 block text-[11px] text-muted-foreground">Priority</label><FieldSelect value={priority} onChange={setPriority} options={PRIORITIES} className="h-8" /></div>
                <Button size="sm" className="w-full" onClick={saveNote} disabled={busy || !noteText.trim()}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <Check className="h-4 w-4" /> : null} {saved ? "Saved" : "Save new-content request"}</Button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-primary/10 px-1.5 py-0.5 font-mono text-[10px] uppercase text-primary">{selected.element_type}</span>
                  <span className="min-w-0 flex-1 truncate text-xs font-medium">{selected.element_label}</span>
                </div>
                {selected.parent_section_label && <p className="text-[11px] text-muted-foreground">Section: {selected.parent_section_label}</p>}
                {selected.dom_selector && <p className="truncate rounded bg-muted px-1.5 py-1 font-mono text-[10px] text-muted-foreground" title={selected.dom_selector}>{selected.dom_selector}</p>}
                <Textarea value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="Describe the change you want for this element…" className="min-h-[80px]" />
                <div className="grid grid-cols-2 gap-2">
                  <div><label className="mb-1 block text-[11px] text-muted-foreground">Change</label><FieldSelect value={changeType} onChange={setChangeType} options={CHANGE_TYPES} className="h-8" /></div>
                  <div><label className="mb-1 block text-[11px] text-muted-foreground">Priority</label><FieldSelect value={priority} onChange={setPriority} options={PRIORITIES} className="h-8" /></div>
                </div>
                <Button size="sm" className="w-full" onClick={saveNote} disabled={busy || !noteText.trim()}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <Check className="h-4 w-4" /> : null} {saved ? "Saved" : "Save note"}</Button>
              </div>
            )}
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

      {/* Page outline — full-width strip below the canvas; click scrolls to + selects the element */}
      <div className="rounded-xl border border-border bg-card p-2">
        <div className="mb-1 flex items-center gap-1.5 px-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground"><ListTree className="h-3.5 w-3.5" /> Page outline{outline.length ? ` · ${outline.length} detected` : ""}</div>
        <div className="flex max-h-24 flex-wrap gap-1.5 overflow-y-auto">
          {outline.length === 0 && <p className="px-1 py-1 text-[11px] text-muted-foreground">Outline appears once the page loads.</p>}
          {outline.map((o) => (
            <button key={o.element_ref} onClick={() => jumpTo(o.element_ref)} title="Scroll to & select"
              className={cn("flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] hover:border-primary/50 hover:bg-muted", selected?.element_ref === o.element_ref ? "border-primary bg-primary/10" : "border-border")}>
              <span className="font-semibold uppercase text-muted-foreground/70">{o.level ? `H${o.level}` : o.type === "section" ? "§" : o.type}</span>
              <span className="max-w-[220px] truncate">{o.label}</span>
              {notesByRef[o.element_ref] ? <span className="rounded-full bg-primary/15 px-1.5 text-[9px] font-bold text-primary">{notesByRef[o.element_ref]}</span> : null}
            </button>
          ))}
        </div>
      </div>

      {stewardOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setStewardOpen(false)} />
          <div className="relative z-10 w-full max-w-2xl">
            <button onClick={() => setStewardOpen(false)} className="absolute -right-3 -top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card shadow hover:bg-muted"><X className="h-4 w-4" /></button>
            <AgentChat title="Steward AI" subtitle={`Drafting edits for ${page.label}`} audio extraContext={stewardContext}
              placeholder="Ask Steward to draft these edit requests…" heightClassName="h-[68vh] min-h-[420px]"
              emptyTitle="Draft these edits with Steward" emptyHint="I can turn this page's saved edit requests into CMS draft changes for review — I won't publish or touch the live site." />
          </div>
        </div>
      )}
    </div>
  );
}
