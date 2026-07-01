"use client";

import * as React from "react";
import Link from "next/link";
import {
  AlignCenter, AlignLeft, AlignRight, ArrowLeft, Bold, Bot, Check, ChevronsUpDown, Code, Columns2, Copy,
  CaseUpper, Download, ExternalLink, Eye, EyeOff, GripVertical, Heading1, Heading2, Image as ImageIcon,
  Italic, LayoutGrid, Layers, ListChecks, ListMusic, Loader2, Megaphone, Menu, Minus, MousePointerClick, Monitor,
  Music, Pause, Play, Plus, Quote as QuoteIcon, RotateCcw, RotateCw, Rows3, Save, Search, Settings2, Shapes,
  Smartphone, Sparkles, Square, Star, Tablet, Trash2, Type, Upload, Video, Volume2, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FieldSelect } from "@/components/ui/field-select";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { AgentChat } from "@/components/ai-agent/agent-chat";
import { cn } from "@/lib/utils";
import { useDashboardActionToken } from "@/components/layout/dashboard-action-token";
import { mdToHtml, sanitizeHtml, typoStyle, videoEmbedSrc } from "@/lib/cms/md";
import {
  blockPad, CMS_BLOCK_LABELS, cloneBlock, containsId, dropBlock, duplicateBlock, extractBlock, findBlock,
  insertInColumn, insertRelative, moveBlock, patchBlock, setColumnCount,
  type CmsBlock, type CmsBlockItem, type CmsBlockType, type CmsColumn,
} from "@/lib/cms/types";
import { FONT_OPTIONS, fontWeights, fontHasItalic, CMS_FONTS, fontHref } from "@/lib/cms/fonts";
import { BLOCK_CATEGORIES, BLOCK_PRESETS, type CmsPreset } from "@/lib/cms/presets";
import { CMS_ICONS, ICON_STYLES, wrapIcon, DEFAULT_ICON, ICON_BODIES_URL, type IconBodies, type IconStyle } from "@/lib/cms/icons";

let _uid = 0;
const uid = () => `b${Date.now().toString(36)}${(_uid++).toString(36)}`;

// Solar icon bodies are a static asset (kept out of the JS bundle) — fetch once,
// cache at module scope, and notify subscribed components when they arrive.
let _iconBodies: IconBodies | null = null;
let _iconLoading = false;
const _iconSubs = new Set<() => void>();
function ensureIconBodies() {
  if (_iconBodies || _iconLoading) return;
  _iconLoading = true;
  fetch(ICON_BODIES_URL).then((r) => r.json()).then((d: IconBodies) => { _iconBodies = d; _iconSubs.forEach((f) => f()); }).catch(() => { _iconLoading = false; });
}
function useIconBodies(): IconBodies | null {
  const [, force] = React.useReducer((x) => x + 1, 0);
  React.useEffect(() => {
    if (_iconBodies) return;
    _iconSubs.add(force); ensureIconBodies();
    return () => { _iconSubs.delete(force); };
  }, []);
  return _iconBodies;
}

// Renders a single Solar glyph (loads bodies lazily; shows a sized placeholder until ready).
function IconGlyph({ id, style, color, size, salt }: { id?: string; style: IconStyle; color?: string; size: number; salt?: string }) {
  const bodies = useIconBodies();
  const body = bodies?.[id || DEFAULT_ICON]?.[style] ?? bodies?.[DEFAULT_ICON]?.[style];
  if (!body) return <span style={{ display: "inline-block", width: size, height: size }} aria-hidden="true" />;
  return <span style={{ display: "inline-flex", lineHeight: 0 }} dangerouslySetInnerHTML={{ __html: wrapIcon(body, { color, size, salt }) }} />;
}

const ICONS: Partial<Record<CmsBlockType, React.ElementType>> = {
  heading: Heading1, subheading: Heading2, paragraph: Type, richtext: Columns2, list: ListChecks, quote: QuoteIcon,
  scripture: Star, image: ImageIcon, video: Video, gallery: LayoutGrid, embed: Code, hero: Layers, cta: Megaphone,
  cardgrid: LayoutGrid, statgrid: Columns2, divider: Minus, spacer: Square, accordion: ChevronsUpDown,
  form: ListChecks, alert: Sparkles, resource: Download, button: MousePointerClick, html: Code,
  audio: Music, icon: Shapes, row: Rows3,
};

function defaultBlock(type: CmsBlockType): CmsBlock {
  const base: CmsBlock = { id: uid(), type, align: "left", padTop: 24, padBottom: 24 };
  switch (type) {
    case "heading": return { ...base, text: "Your heading" };
    case "subheading": return { ...base, text: "A supporting subheading", padTop: 12, padBottom: 12 };
    case "paragraph": return { ...base, text: "Write your content here…", padTop: 12, padBottom: 12 };
    case "richtext": return { ...base, text: "Rich text supports **bold**, *italic*, [links](https://example.com), and\n- bullet lists", padTop: 12, padBottom: 12 };
    case "list": return { ...base, variant: "check", padTop: 16, padBottom: 16, items: [{ title: "First item" }, { title: "Second item" }, { title: "Third item" }] };
    case "quote": return { ...base, align: "center", padTop: 48, padBottom: 48, text: "A short, memorable line worth quoting.", author: "Name", role: "Title" };
    case "scripture": return { ...base, padTop: 40, padBottom: 40, author: "Reference", role: "", text: "Scripture text goes here.", subtext: "" };
    case "image": return { ...base, url: "", alt: "", align: "center" };
    case "video": return { ...base, padTop: 24, padBottom: 24, maxWidth: 900, url: "", aspect: "16/9" };
    case "gallery": return { ...base, columns: 3, padTop: 24, padBottom: 24, items: [{ imageUrl: "", title: "" }, { imageUrl: "", title: "" }, { imageUrl: "", title: "" }] };
    case "embed": return { ...base, padTop: 16, padBottom: 16, url: "", height: 480 };
    case "hero": return { ...base, align: "center", padTop: 80, padBottom: 80, minHeight: 440, bgColor: "#315f43", overlay: "#0b1f14", overlayOpacity: 55, eyebrow: "Eyebrow", text: "Your hero headline", subtext: "A supporting sentence for the hero.", label: "Primary", url: "#", label2: "", url2: "" };
    case "cta": return { ...base, align: "center", padTop: 56, padBottom: 56, bgColor: "#f1ede3", eyebrow: "Get started", text: "Ready to take the next step?", subtext: "A short line that motivates the click.", label: "Get started", url: "https://", label2: "", url2: "" };
    case "cardgrid": return { ...base, padTop: 32, padBottom: 32, columns: 3, items: [{ title: "Card one", body: "A short description." }, { title: "Card two", body: "A short description." }, { title: "Card three", body: "A short description." }] };
    case "statgrid": return { ...base, align: "center", columns: 3, padTop: 40, padBottom: 40, items: [{ title: "100+", body: "Label" }, { title: "24", body: "Label" }, { title: "98%", body: "Label" }] };
    case "accordion": return { ...base, padTop: 24, padBottom: 24, maxWidth: 820, items: [{ q: "First question?", a: "The answer to the first question." }, { q: "Second question?", a: "The answer to the second question." }] };
    case "form": return { ...base, padTop: 48, padBottom: 48, maxWidth: 560, text: "Form title", eyebrow: "Optional description.", label: "Submit", items: [{ title: "Name", fieldType: "text", placeholder: "Your name", required: true }, { title: "Email", fieldType: "email", placeholder: "you@example.com", required: true }, { title: "Message", fieldType: "textarea", placeholder: "How can we help?" }] };
    case "alert": return { ...base, variant: "info", text: "Heads up", subtext: "This is an informational message.", padTop: 16, padBottom: 16, radius: 10 };
    case "resource": return { ...base, padTop: 32, padBottom: 32, role: "PDF", text: "Resource title", subtext: "Short description.", label: "Download", url: "" };
    case "button": return { ...base, label: "Learn more", url: "" };
    case "audio": return { ...base, align: "center", padTop: 48, padBottom: 48, url: "", text: "The Stewardship Blueprint", author: "Michael J. Gauthier", role: "Life Design · Stewardship · Faith", accent: "#c9a46e", barColor: "#1b1a17", textColor: "#6a7a6f" };
    case "icon": return { ...base, align: "center", padTop: 32, padBottom: 32, icon: "star", variant: "line", iconShape: "circle", iconBg: "#f1ede3", iconOutline: "", accent: "#315f43", iconSize: 30, text: "", subtext: "" };
    case "html": return { ...base, padTop: 16, padBottom: 16, html: "<!-- Your custom HTML here -->" };
    case "divider": return { ...base, padTop: 8, padBottom: 8 };
    case "spacer": return { id: uid(), type, height: 40 };
    case "row": return { ...base, padTop: 24, padBottom: 24, gap: 24, valign: "stretch", stackMobile: true, cols: [{ id: uid(), blocks: [] }, { id: uid(), blocks: [] }] };
    default: return base;
  }
}

const ALIGN_OPTS = [{ value: "left", label: "Left" }, { value: "center", label: "Center" }, { value: "right", label: "Right" }];
const SWATCHES = ["", "#ffffff", "#fbfaf7", "#f1ede3", "#315f43", "#c9a46e", "#10110f", "#070807"];
const DEVICES: { key: string; icon: React.ElementType; w: number }[] = [
  { key: "desktop", icon: Monitor, w: 0 }, { key: "tablet", icon: Tablet, w: 768 }, { key: "mobile", icon: Smartphone, w: 390 },
];
const BOX_SHADOWS = [{ value: "", label: "None" }, { value: "0 2px 8px rgba(0,0,0,.08)", label: "Soft" }, { value: "0 8px 24px rgba(0,0,0,.12)", label: "Medium" }, { value: "0 18px 40px rgba(0,0,0,.18)", label: "Strong" }];
const TEXT_SHADOWS = [{ value: "", label: "None" }, { value: "0 1px 2px rgba(0,0,0,.25)", label: "Soft" }, { value: "0 3px 6px rgba(0,0,0,.45)", label: "Bold" }, { value: "0 0 14px rgba(255,255,255,.65)", label: "Glow" }];
const CANVAS_VARS = {
  "--font-display": "'DM Serif Display', Georgia, serif",
  "--font-body": "'Roboto', system-ui, sans-serif",
  "--green": "#315f43", "--line": "#e4ded2", "--gold": "#c9a46e", "--paper": "#fbfaf7", "--ink": "#070807", "--muted": "#5f6d66", "--card": "#ffffff",
} as React.CSSProperties;

const isTextType = (t: CmsBlockType) => t === "heading" || t === "subheading" || t === "paragraph" || t === "richtext" || t === "quote" || t === "scripture" || t === "list" || t === "cta" || t === "hero";

// Load every editor font once so previews + pickers render.
function useEditorFonts() {
  React.useEffect(() => {
    for (const f of CMS_FONTS) {
      const id = `cmsfont-${f.name.replace(/\s/g, "")}`;
      if (document.getElementById(id)) continue;
      const link = document.createElement("link");
      link.id = id; link.rel = "stylesheet"; link.href = fontHref(f.name);
      document.head.appendChild(link);
    }
  }, []);
}

// Where a dragged block should land: relative to another block, or into a column.
type DropTarget = { kind: "block"; id: string; pos: "before" | "after" } | { kind: "column"; rowId: string; colId: string };

// Canvas drag-and-drop wiring passed down to BlockView (mirrors the tree DnD).
type CanvasDnd = {
  hint: DropTarget | null;
  start: (id: string) => void;
  overBlock: (e: React.DragEvent, id: string) => void;
  dropBlock: (e: React.DragEvent, id: string) => void;
  overCol: (e: React.DragEvent, rowId: string, colId: string) => void;
  dropCol: (e: React.DragEvent, rowId: string, colId: string) => void;
  end: () => void;
};

export function CmsEditor({ page, initialBlocks }: {
  page: { id: string; title: string; slug: string; status: string };
  initialBlocks: CmsBlock[];
}) {
  useEditorFonts();
  const token = useDashboardActionToken();
  const [blocks, setBlocks] = React.useState<CmsBlock[]>(initialBlocks.length ? initialBlocks : [defaultBlock("heading"), defaultBlock("paragraph")]);
  const [selectedId, setSelectedId] = React.useState<string | null>(initialBlocks[0]?.id ?? null);
  const [busy, setBusy] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [dirty, setDirty] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [device, setDevice] = React.useState("desktop");
  const [panelW, setPanelW] = React.useState(232);
  const [templates, setTemplates] = React.useState<{ id: string; name: string; content: CmsBlock[] }[]>([]);
  const [stewardOpen, setStewardOpen] = React.useState(false);
  const dragId = React.useRef<string | null>(null);
  const [dropHint, setDropHint] = React.useState<DropTarget | null>(null);
  const canvasRef = React.useRef<HTMLDivElement>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const selected = findBlock(blocks, selectedId ?? "") ?? null;
  const mutate = (fn: (prev: CmsBlock[]) => CmsBlock[]) => { setBlocks(fn); setDirty(true); };
  const update = (id: string, patch: Partial<CmsBlock>) => mutate((prev) => patchBlock(prev, id, patch));
  const add = (type: CmsBlockType) => { const b = defaultBlock(type); mutate((prev) => [...prev, b]); setSelectedId(b.id); };
  const addIcon = (iconId: string) => { const b = { ...defaultBlock("icon"), icon: iconId }; mutate((prev) => [...prev, b]); setSelectedId(b.id); };
  const addToColumn = (rowId: string, colId: string, type: CmsBlockType) => { const b = defaultBlock(type); mutate((prev) => insertInColumn(prev, rowId, colId, b)); setSelectedId(b.id); };
  const remove = (id: string) => { mutate((prev) => dropBlock(prev, id)); setSelectedId((cur) => (cur === id ? null : cur)); };
  const moveNested = (id: string, dir: -1 | 1) => mutate((prev) => moveBlock(prev, id, dir));
  const duplicate = (b: CmsBlock) => {
    let created: string | undefined;
    mutate((prev) => { const r = duplicateBlock(prev, b.id, uid); created = r.newId; return r.blocks; });
    if (created) setSelectedId(created);
  };
  const insertBlocks = (presets: (CmsPreset | CmsBlock)[]) => {
    const withIds = presets.map((p) => cloneBlock(p as CmsBlock, uid));
    mutate((prev) => [...prev, ...withIds]);
    setSelectedId(withIds[0]?.id ?? null);
  };

  // Drag any block to anywhere: before/after another block, or into a column.
  const moveTo = (drag: string, target: DropTarget) => {
    if (target.kind === "block" && target.id === drag) return;
    mutate((prev) => {
      const dragged = findBlock(prev, drag);
      if (!dragged) return prev;
      if (target.kind === "block" && containsId(dragged, target.id)) return prev; // no drop into own subtree
      if (target.kind === "column" && (dragged.id === target.rowId || containsId(dragged, target.rowId) || containsId(dragged, target.colId))) return prev;
      const { block, blocks: pruned } = extractBlock(prev, drag);
      if (!block) return prev;
      return target.kind === "block"
        ? insertRelative(pruned, target.id, block, target.pos)
        : insertInColumn(pruned, target.rowId, target.colId, block);
    });
  };
  const endDrag = () => { dragId.current = null; setDropHint(null); };
  const dropOnBlock = (e: React.DragEvent, id: string) => {
    e.preventDefault(); e.stopPropagation();
    const r = e.currentTarget.getBoundingClientRect();
    const pos = e.clientY - r.top < r.height / 2 ? "before" : "after";
    if (dragId.current) moveTo(dragId.current, { kind: "block", id, pos });
    endDrag();
  };
  const dropInColumn = (e: React.DragEvent, rowId: string, colId: string) => {
    e.preventDefault(); e.stopPropagation();
    if (dragId.current) moveTo(dragId.current, { kind: "column", rowId, colId });
    endDrag();
  };
  const canvasDnd: CanvasDnd = {
    hint: dropHint,
    start: (id) => { dragId.current = id; },
    overBlock: (e, id) => { e.preventDefault(); e.stopPropagation(); const r = e.currentTarget.getBoundingClientRect(); setDropHint({ kind: "block", id, pos: e.clientY - r.top < r.height / 2 ? "before" : "after" }); },
    dropBlock: dropOnBlock,
    overCol: (e, rowId, colId) => { e.preventDefault(); e.stopPropagation(); setDropHint({ kind: "column", rowId, colId }); },
    dropCol: dropInColumn,
    end: endDrag,
  };

  // Recursive, drag-and-droppable "Page blocks" tree. Any block can be dragged
  // before/after any other block, or into any column (including empty columns).
  const renderTree = (list: CmsBlock[], depth: number): React.ReactNode =>
    list.map((b) => {
      const hintB = dropHint?.kind === "block" && dropHint.id === b.id ? dropHint.pos : null;
      return (
        <div key={b.id}>
          <div draggable onDragStart={(e) => { e.stopPropagation(); dragId.current = b.id; e.dataTransfer.effectAllowed = "move"; try { e.dataTransfer.setData("text/plain", b.id); } catch { /* ignore */ } }}
            onDragEnd={endDrag}
            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); const r = e.currentTarget.getBoundingClientRect(); setDropHint({ kind: "block", id: b.id, pos: e.clientY - r.top < r.height / 2 ? "before" : "after" }); }}
            onDrop={(e) => dropOnBlock(e, b.id)}
            onClick={(e) => { e.stopPropagation(); setSelectedId(b.id); }} style={{ marginLeft: depth * 10 }}
            className={cn("group flex items-center gap-1.5 rounded-lg border px-2 py-1.5 text-xs", selectedId === b.id ? "border-primary bg-primary/5" : "border-transparent hover:bg-muted", b.hidden && "opacity-50", hintB === "before" && "shadow-[inset_0_2px_0_0_#c9a46e]", hintB === "after" && "shadow-[inset_0_-2px_0_0_#c9a46e]")}>
            <GripVertical className="h-3.5 w-3.5 shrink-0 cursor-grab text-muted-foreground" />
            {b.type === "row" && <Rows3 className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />}
            <span className="min-w-0 flex-1 truncate">{CMS_BLOCK_LABELS[b.type]}{b.text ? <span className="text-muted-foreground"> · {b.text.slice(0, 16)}</span> : null}</span>
            <button onClick={(e) => { e.stopPropagation(); update(b.id, { hidden: !b.hidden }); }} className="text-muted-foreground opacity-0 hover:text-foreground group-hover:opacity-100" title={b.hidden ? "Show" : "Hide"}>{b.hidden ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}</button>
            <button onClick={(e) => { e.stopPropagation(); duplicate(b); }} className="text-muted-foreground opacity-0 hover:text-primary group-hover:opacity-100" title="Duplicate"><Copy className="h-3.5 w-3.5" /></button>
            <button onClick={(e) => { e.stopPropagation(); remove(b.id); }} className="text-muted-foreground opacity-0 hover:text-destructive group-hover:opacity-100" title="Delete"><Trash2 className="h-3.5 w-3.5" /></button>
          </div>
          {b.type === "row" && b.cols && (
            <div className="mt-1 space-y-1">
              {b.cols.map((c, ci) => {
                const colActive = dropHint?.kind === "column" && dropHint.colId === c.id;
                return (
                  <div key={c.id} style={{ marginLeft: (depth + 1) * 10 }}
                    onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setDropHint({ kind: "column", rowId: b.id, colId: c.id }); }}
                    onDrop={(e) => dropInColumn(e, b.id, c.id)}
                    className={cn("rounded-md border border-transparent", colActive && "border-dashed border-primary bg-primary/5")}>
                    <div className="px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground/80">Column {ci + 1}</div>
                    {c.blocks.length === 0
                      ? <div className="mx-1 mb-1 rounded border border-dashed border-border px-2 py-1.5 text-[10px] italic text-muted-foreground/60">drop blocks here</div>
                      : renderTree(c.blocks, depth + 2)}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      );
    });

  // Resizable left panel.
  function startResize(e: React.MouseEvent) {
    e.preventDefault();
    const startX = e.clientX, startW = panelW;
    const move = (ev: MouseEvent) => setPanelW(Math.max(180, Math.min(460, startW + (ev.clientX - startX))));
    const up = () => { window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up); document.body.style.userSelect = ""; };
    document.body.style.userSelect = "none";
    window.addEventListener("mousemove", move); window.addEventListener("mouseup", up);
  }

  React.useEffect(() => {
    if (!selectedId) return;
    canvasRef.current?.querySelector(`[data-cms-block="${selectedId}"]`)?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [selectedId]);

  const loadTemplates = React.useCallback(async () => {
    try {
      const r = await fetch("/api/admin/cms/block-templates", { headers: { "x-mjg-action-token": token } }).then((x) => x.json());
      if (Array.isArray(r.templates)) setTemplates(r.templates);
    } catch { /* ignore */ }
  }, [token]);
  React.useEffect(() => { loadTemplates(); }, [loadTemplates]);

  async function saveAsTemplate() {
    if (!selected) return;
    const name = window.prompt("Save this block as a reusable component. Name:", CMS_BLOCK_LABELS[selected.type]);
    if (!name) return;
    setBusy(true); setError(null);
    try {
      const content = { ...selected }; delete (content as { id?: string }).id;
      const res = await fetch("/api/admin/cms/block-templates", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name, content: [content], actionToken: token }) });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Save failed.");
      await loadTemplates();
    } catch (e) { setError(e instanceof Error ? e.message : "Save failed."); }
    finally { setBusy(false); }
  }

  async function save() {
    setBusy(true); setError(null);
    try {
      const res = await fetch(`/api/admin/cms/pages/${page.id}/draft`, {
        method: "PUT", headers: { "content-type": "application/json" },
        body: JSON.stringify({ content: { version: 1, blocks }, actionToken: token }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Save failed.");
      setSaved(true); setDirty(false); setTimeout(() => setSaved(false), 2000);
    } catch (e) { setError(e instanceof Error ? e.message : "Save failed."); }
    finally { setBusy(false); }
  }

  function pickUpload(onDone: (url: string) => void, accept = "image/*") {
    const input = document.createElement("input");
    input.type = "file"; input.accept = accept;
    input.onchange = async () => {
      const file = input.files?.[0]; if (!file) return;
      setBusy(true); setError(null);
      try {
        const fd = new FormData(); fd.append("file", file); fd.append("folder", "cms");
        const up = await fetch("/api/admin/uploads", { method: "POST", headers: { "x-mjg-action-token": token }, body: fd });
        const uj = await up.json().catch(() => ({}));
        if (!up.ok) throw new Error(uj.error || "Upload failed.");
        onDone(uj.url);
      } catch (e) { setError(e instanceof Error ? e.message : "Upload failed."); }
      finally { setBusy(false); }
    };
    input.click();
  }

  async function openPreview() {
    if (dirty) await save();
    window.open(`/dashboard/cms/preview/${page.id}?v=${Date.now()}`, "_blank");
  }

  const deviceW = DEVICES.find((d) => d.key === device)?.w ?? 0;
  const compactNav = device !== "desktop";
  const paletteCols = panelW < 252 ? 1 : 2;

  return (
    <div className="flex h-[calc(100vh-120px)] min-h-[560px] flex-col">
      {/* Top bar */}
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <Button asChild variant="ghost" size="sm"><Link href="/dashboard/cms"><ArrowLeft className="h-4 w-4" /> CMS</Link></Button>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="truncate font-semibold">{page.title}</span>
            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium capitalize text-muted-foreground">{page.status}</span>
            {dirty && <span className="text-[10px] text-amber-600 dark:text-amber-400">• unsaved</span>}
          </div>
          <div className="text-[11px] text-muted-foreground">/p/{page.slug}</div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setStewardOpen(true)}><Bot className="h-3.5 w-3.5" /> Steward AI</Button>
          <Button variant="outline" size="sm" onClick={openPreview} disabled={busy}><ExternalLink className="h-3.5 w-3.5" /> Open preview</Button>
          <Button size="sm" onClick={save} disabled={busy || !dirty}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />} {saved ? "Saved" : "Save draft"}</Button>
        </div>
      </div>

      {error && <div className="mb-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>}

      <div className="grid min-h-0 flex-1 gap-0" style={{ gridTemplateColumns: `${panelW}px 8px minmax(0,1fr) 300px` }}>
        {/* Left: palette (accordion) + templates + block list */}
        <div className="flex min-h-0 flex-col gap-3 overflow-y-auto pr-1">
          <div className="rounded-xl border border-border bg-card">
            <div className="px-3 pt-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Add block</div>
            <Accordion type="multiple" defaultValue={["Text", "Layout"]} className="px-1 pb-1">
              {BLOCK_CATEGORIES.map((cat) => (
                <React.Fragment key={cat.label}>
                  <AccordionItem value={cat.label} className="border-b-0">
                    <AccordionTrigger className="px-2 py-2 text-xs hover:no-underline">{cat.label}</AccordionTrigger>
                    <AccordionContent className="pb-2">
                      <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${paletteCols},minmax(0,1fr))` }}>
                        {cat.types.map((t) => {
                          const Icon = ICONS[t] ?? Square;
                          return (
                            <button key={t} onClick={() => add(t)} title={`Add ${CMS_BLOCK_LABELS[t]}`}
                              className="flex min-h-[2rem] items-center gap-2 rounded-lg border border-border/60 bg-background px-2.5 py-2 text-left text-xs transition-colors hover:border-primary/50 hover:bg-muted">
                              <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" /> <span className="truncate">{CMS_BLOCK_LABELS[t]}</span>
                            </button>
                          );
                        })}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  {cat.label === "Media" && (
                    <AccordionItem value="Icons" className="border-b-0">
                      <AccordionTrigger className="px-2 py-2 text-xs hover:no-underline">
                        <span className="flex items-center gap-2"><Shapes className="h-3.5 w-3.5 text-muted-foreground" /> Icons</span>
                      </AccordionTrigger>
                      <AccordionContent className="pb-2">
                        <PaletteIconGrid onPick={addIcon} />
                      </AccordionContent>
                    </AccordionItem>
                  )}
                </React.Fragment>
              ))}
              <AccordionItem value="Templates" className="border-b-0">
                <AccordionTrigger className="px-2 py-2 text-xs hover:no-underline">Templates & components</AccordionTrigger>
                <AccordionContent className="space-y-2 pb-2">
                  <div className="px-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Pre-made sections</div>
                  <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${paletteCols},minmax(0,1fr))` }}>
                    {BLOCK_PRESETS.map((p) => (
                      <button key={p.name} onClick={() => insertBlocks(p.blocks)} title={p.description}
                        className="flex min-h-[2rem] items-center gap-2 rounded-lg border border-border/60 bg-background px-2.5 py-2 text-left text-xs transition-colors hover:border-primary/50 hover:bg-muted">
                        <LayoutGrid className="h-3.5 w-3.5 shrink-0 text-muted-foreground" /> <span className="truncate">{p.name}</span>
                      </button>
                    ))}
                  </div>
                  <div className="px-1 pt-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Saved components</div>
                  {templates.length === 0 ? (
                    <p className="px-1 text-[11px] text-muted-foreground">Select a block, then “Save as component” to reuse it here.</p>
                  ) : (
                    <div className="space-y-1">
                      {templates.map((t) => (
                        <button key={t.id} onClick={() => insertBlocks(t.content)}
                          className="flex w-full min-h-[2rem] items-center gap-2 rounded-lg border border-border/60 bg-background px-2.5 py-2 text-left text-xs transition-colors hover:border-primary/50 hover:bg-muted">
                          <Star className="h-3.5 w-3.5 shrink-0 text-amber-500" /> <span className="truncate">{t.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          <div className="rounded-xl border border-border bg-card p-2">
            <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Page blocks</div>
            {blocks.length === 0 && <p className="px-2 py-2 text-xs text-muted-foreground">No blocks yet.</p>}
            <div className="space-y-1">
              {renderTree(blocks, 0)}
            </div>
          </div>
        </div>

        {/* Resize handle */}
        <div onMouseDown={startResize} className="group flex cursor-col-resize items-center justify-center" title="Drag to resize">
          <div className="h-10 w-1 rounded-full bg-border transition-colors group-hover:bg-primary" />
        </div>

        {/* Center: LIVE canvas */}
        <div className="flex min-h-0 flex-col rounded-xl border border-border bg-muted/40">
          <div className="flex items-center gap-2 border-b border-border px-3 py-1.5">
            <span className="text-[11px] text-muted-foreground">Live preview · click a block to style it</span>
            <div className="ml-auto flex items-center rounded-lg border border-border bg-card p-0.5">
              {DEVICES.map((d) => (
                <button key={d.key} onClick={() => setDevice(d.key)} className={cn("rounded-md p-1", device === d.key ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground")} title={d.key}><d.icon className="h-3.5 w-3.5" /></button>
              ))}
            </div>
          </div>
          <div ref={scrollRef} className="relative flex-1 overflow-auto p-3">
            <div ref={canvasRef} className="mx-auto overflow-hidden rounded-md border border-border shadow-sm" style={{ ...CANVAS_VARS, background: "var(--paper)", color: "var(--ink)", fontFamily: "var(--font-body)", maxWidth: deviceW || "100%", width: deviceW || "100%" }}>
              <CanvasHeader compact={compactNav} />
              {blocks.length === 0 ? (
                <div style={{ padding: "80px 20px", textAlign: "center", color: "var(--muted)" }}>This page has no content blocks yet. Add one from the left.</div>
              ) : (
                blocks.map((b) => <BlockView key={b.id} block={b} selectedId={selectedId} onSelect={setSelectedId} dnd={canvasDnd} />)
              )}
            </div>
            {selected && (
              <CanvasFab block={selected} update={(p) => update(selected.id, p)} upload={pickUpload}
                canvasRef={canvasRef} scrollRef={scrollRef} blocksSig={blocks.length} onSaveTemplate={saveAsTemplate} />
            )}
          </div>
        </div>

        {/* Right: full inspector */}
        <div className="min-h-0 overflow-y-auto rounded-xl border border-border bg-card p-3">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Block settings</div>
            {selected && <button onClick={saveAsTemplate} className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary" title="Save as reusable component"><Star className="h-3 w-3" /> Save</button>}
          </div>
          {!selected ? <p className="text-xs text-muted-foreground">Select a block to edit it.</p> : (
            <Inspector block={selected} update={(p) => update(selected.id, p)} upload={pickUpload}
              onAddToColumn={addToColumn} onMove={moveNested} onRemove={remove} onSelect={setSelectedId} />
          )}
        </div>
      </div>

      {stewardOpen && <StewardEditorModal page={page} blocks={blocks} onClose={() => setStewardOpen(false)} />}
    </div>
  );
}

// ── Steward AI, scoped to THIS page ───────────────────────────────────────────
function StewardEditorModal({ page, blocks, onClose }: { page: { id: string; title: string }; blocks: CmsBlock[]; onClose: () => void }) {
  const stripped = blocks.map((b) => { const c = { ...b }; delete (c as { id?: string }).id; return c; });
  const context = `You are editing the EXISTING CMS page titled "${page.title}" with pageId "${page.id}". To change it, call update_cms_draft_page with pageId "${page.id}" and the FULL new block array. Current blocks (JSON):\n${JSON.stringify(stripped)}`;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => { onClose(); window.location.reload(); }} aria-hidden="true" />
      <div className="relative z-10 w-full max-w-2xl">
        <button onClick={() => { onClose(); window.location.reload(); }} aria-label="Close" className="absolute -right-3 -top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card shadow hover:bg-muted"><X className="h-4 w-4" /></button>
        <AgentChat title="Steward AI" subtitle={`Editing “${page.title}”`} audio extraContext={context}
          suggestions={["Add a hero section to the top of this page.", "Add a 3-column card grid explaining the benefits.", "Rewrite the copy to be warmer and more concise.", "Add an FAQ accordion and a closing call-to-action."]}
          placeholder="Tell Steward how to change this page…" heightClassName="h-[68vh] min-h-[420px]"
          emptyTitle="Edit this page with Steward" emptyHint="I can add, rewrite, and restructure this page's blocks. Changes save as a draft — reopen after I finish to see them. Close this window to refresh the editor." />
      </div>
    </div>
  );
}

// ── Live canvas rendering (mirrors lib/cms/render.ts) ─────────────────────────
function CanvasHeader({ compact }: { compact: boolean }) {
  return (
    <nav style={{ background: "#fff", borderBottom: "1px solid #e8e6e0", position: "sticky", top: 0, zIndex: 10 }}>
      <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", minHeight: 58 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://michaeljgauthier.com/wp-content/uploads/2025/03/MJG_Logo_Black-1.svg" alt="MJG" style={{ height: 30 }} />
          <span style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 14, color: "#111" }}>Michael <span style={{ color: "#c9a46e" }}>J.</span> Gauthier</span>
        </div>
        {compact ? (
          <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 40, height: 40, borderRadius: 12, background: "rgba(17,17,17,0.06)", border: "1px solid rgba(17,17,17,0.16)", color: "#111" }}><Menu size={18} /></span>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 13.5 }}>
            {["Home", "About", "Mission", "Listen", "Resources", "Contact"].map((l) => <span key={l} style={{ color: "#111" }}>{l}</span>)}
            <span style={{ background: "#111", color: "#fff", padding: "8px 16px", borderRadius: 4, fontWeight: 500 }}>Join the Journey</span>
          </div>
        )}
      </div>
    </nav>
  );
}

const ALERT_UI: Record<string, { bg: string; border: string; fg: string }> = {
  info: { bg: "#eef4fb", border: "#b7d3f0", fg: "#1e4e79" }, success: { bg: "#edf7ef", border: "#b7e0bf", fg: "#1e6b34" },
  warning: { bg: "#fdf6e8", border: "#efd9a3", fg: "#8a6212" }, error: { bg: "#fcecec", border: "#f0b7b7", fg: "#8a1e1e" },
};
function overlayRgba(b: CmsBlock): string {
  const hex = (b.overlay || "#000000").replace("#", "");
  const s = hex.length === 3 ? hex.split("").map((c) => c + c).join("") : hex;
  const n = parseInt(s || "000000", 16);
  const a = Math.max(0, Math.min(100, b.overlayOpacity ?? 40)) / 100;
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

function sectionStyle(b: CmsBlock, nested = false): React.CSSProperties {
  return {
    background: b.bgColor || undefined,
    backgroundImage: b.bgImage ? `url('${b.bgImage}')` : undefined, backgroundSize: b.bgImage ? "cover" : undefined, backgroundPosition: b.bgImage ? "center" : undefined,
    paddingTop: blockPad(b, "top"), paddingBottom: blockPad(b, "bottom"),
    paddingLeft: b.padX ?? (nested ? 0 : 20), paddingRight: b.padX ?? (nested ? 0 : 20),
    marginTop: b.marginTop || undefined, marginBottom: b.marginBottom || undefined,
    minHeight: b.minHeight || undefined,
    border: b.borderWidth ? `${b.borderWidth}px ${b.borderStyle || "solid"} ${b.borderColor || "#e4ded2"}` : undefined,
    borderRadius: (b.borderWidth || b.boxShadow) ? b.radius || undefined : undefined,
    boxShadow: b.boxShadow || undefined,
    cursor: "pointer",
  };
}
function innerStyle(b: CmsBlock, nested = false): React.CSSProperties {
  return {
    width: nested ? "100%" : "min(1180px, calc(100% - 40px))", margin: nested ? undefined : "0 auto",
    maxWidth: b.maxWidth && b.maxWidth > 0 ? b.maxWidth : undefined,
    textAlign: b.align, color: b.textColor || undefined,
  };
}

function BlockView({ block: b, selectedId, onSelect, nested = false, dnd }: { block: CmsBlock; selectedId: string | null; onSelect: (id: string) => void; nested?: boolean; dnd: CanvasDnd }) {
  if (b.hidden) return null;
  const selected = b.id === selectedId;
  const pick = (e: React.MouseEvent) => { e.stopPropagation(); onSelect(b.id); };
  // Drag any block on the canvas; a drag starting on an interactive control (a
  // slider, input, link…) is cancelled so those keep working in the preview.
  const dragStart = (e: React.DragEvent) => {
    if ((e.target as HTMLElement).closest('input,textarea,select,button,a,[contenteditable="true"]')) { e.preventDefault(); return; }
    e.stopPropagation(); dnd.start(b.id); e.dataTransfer.effectAllowed = "move"; try { e.dataTransfer.setData("text/plain", b.id); } catch { /* ignore */ }
  };
  const hintPos = dnd.hint?.kind === "block" && dnd.hint.id === b.id ? dnd.hint.pos : null;
  const dropShadow = hintPos === "before" ? "inset 0 3px 0 0 #c9a46e" : hintPos === "after" ? "inset 0 -3px 0 0 #c9a46e" : undefined;
  const dragProps = { draggable: true, onDragStart: dragStart, onDragEnd: dnd.end, onDragOver: (e: React.DragEvent) => dnd.overBlock(e, b.id), onDrop: (e: React.DragEvent) => dnd.dropBlock(e, b.id) };
  const wrap = (children: React.ReactNode) => {
    const ss = sectionStyle(b, nested);
    return (
      <section data-cms-block={b.id} {...dragProps} onClick={pick} style={{ ...ss, outline: selected ? "2px solid #c9a46e" : "none", outlineOffset: -2, boxShadow: dropShadow || ss.boxShadow }}>
        <div style={innerStyle(b, nested)}>{children}</div>
      </section>
    );
  };
  const fs = b.fontSize ? `${b.fontSize}px` : undefined;
  const T = typoStyle(b) as React.CSSProperties;
  const btn = (label: string | undefined, primary = true) => (label ? <span key={primary ? "p" : "s"} style={{ display: "inline-block", margin: 6, background: primary ? (b.buttonColor || "var(--green)") : "transparent", color: primary ? "#fff" : "currentColor", border: primary ? "none" : "2px solid currentColor", padding: "13px 26px", borderRadius: b.radius ?? 6, fontWeight: 700 }}>{label}</span> : null);
  switch (b.type) {
    case "heading": return wrap(<h1 style={{ fontFamily: "var(--font-display)", fontSize: fs || "clamp(34px,5vw,58px)", lineHeight: 1.05, margin: 0, ...T }}>{b.text}</h1>);
    case "subheading": return wrap(<h2 style={{ fontFamily: "var(--font-display)", fontSize: fs || "clamp(22px,3.5vw,32px)", lineHeight: 1.15, margin: 0, ...T }}>{b.text}</h2>);
    case "paragraph": return wrap(<p style={{ fontSize: fs || 18, lineHeight: 1.7, margin: 0, whiteSpace: "pre-wrap", ...T }}>{b.text}</p>);
    case "richtext": return wrap(<div className="cms-rt" style={{ fontSize: fs || 18, lineHeight: 1.75, ...T }} dangerouslySetInnerHTML={{ __html: mdToHtml(b.text || "") }} />);
    case "list": {
      const style = b.variant || "check"; const Tag = style === "number" ? "ol" : "ul";
      return wrap(<Tag style={{ margin: 0, padding: style === "check" ? 0 : "0 0 0 1.2em", ...T }}>{(b.items || []).map((it, i) => (
        <li key={i} style={{ listStyle: style === "check" ? "none" : undefined, margin: "0 0 10px", lineHeight: 1.6, fontSize: fs || 17 }}>{style === "check" && <span style={{ color: "var(--green)", marginRight: 10, fontWeight: 800 }}>✓</span>}{it.title}</li>
      ))}</Tag>);
    }
    case "image": return wrap(b.url
      // eslint-disable-next-line @next/next/no-img-element
      ? <img src={b.url} alt={b.alt || ""} style={{ maxWidth: b.maxWidth ? b.maxWidth : "100%", maxHeight: b.height || undefined, borderRadius: b.radius ?? 8, display: "inline-block" }} />
      : <span style={{ display: "inline-block", padding: "28px 40px", border: "1px dashed #c9b98f", borderRadius: 8, color: "#8a7b52", fontSize: 13 }}>Add an image URL →</span>);
    case "button": return wrap(<span style={{ display: "inline-block", background: b.buttonColor || "var(--green)", color: b.textColor || "#fff", padding: "14px 26px", borderRadius: b.radius ?? 6, fontSize: fs || 16, fontWeight: 700 }}>{b.label || "Learn more"}</span>);
    case "divider": return wrap(<hr style={{ border: "none", borderTop: `${b.borderWidth ?? 1}px ${b.borderStyle || "solid"} ${b.borderColor || b.textColor || "var(--line)"}`, margin: 0 }} />);
    case "spacer": return <div data-cms-block={b.id} {...dragProps} onClick={pick} style={{ height: b.height ?? 40, cursor: "pointer", outline: selected ? "2px solid #c9a46e" : "none", outlineOffset: -2, boxShadow: dropShadow }} />;
    case "cta":
      return wrap(<>{b.eyebrow && <div style={{ color: "var(--gold)", fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase", fontSize: 13, marginBottom: 12 }}>{b.eyebrow}</div>}<h2 style={{ fontFamily: "var(--font-display)", fontSize: fs || "clamp(28px,4vw,44px)", lineHeight: 1.1, margin: "0 0 12px", ...T }}>{b.text}</h2>{b.subtext && <p style={{ fontSize: 18, lineHeight: 1.6, color: "var(--muted)", margin: "0 0 20px" }}>{b.subtext}</p>}<div>{btn(b.label, true)}{btn(b.label2, false)}</div></>);
    case "hero": {
      const fg = b.textColor || "#ffffff";
      const bgLayer: React.CSSProperties = b.bgImage
        ? { backgroundImage: `linear-gradient(${overlayRgba(b)},${overlayRgba(b)}),url('${b.bgImage}')`, backgroundSize: "cover", backgroundPosition: "center" }
        : { background: b.bgColor || "var(--green)" };
      return (
        <section data-cms-block={b.id} {...dragProps} onClick={pick} style={{ ...bgLayer, padding: `${blockPad(b, "top")}px 20px ${blockPad(b, "bottom")}px`, minHeight: b.minHeight ?? 420, display: "flex", alignItems: "center", marginTop: b.marginTop || undefined, marginBottom: b.marginBottom || undefined, outline: selected ? "2px solid #c9a46e" : "none", outlineOffset: -2, cursor: "pointer", boxShadow: dropShadow }}>
          <div style={{ width: "min(1180px, calc(100% - 40px))", margin: "0 auto", color: fg, textAlign: b.align || "center", maxWidth: b.maxWidth && b.maxWidth > 0 ? b.maxWidth : undefined }}>
            {b.eyebrow && <div style={{ fontWeight: 800, letterSpacing: ".16em", textTransform: "uppercase", fontSize: 13, marginBottom: 16, opacity: 0.9 }}>{b.eyebrow}</div>}
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: fs || "clamp(38px,6vw,72px)", lineHeight: 1.03, margin: "0 0 16px", ...T }}>{b.text}</h1>
            {b.subtext && <p style={{ fontSize: "clamp(17px,2vw,21px)", lineHeight: 1.6, margin: "0 auto 26px", maxWidth: 640, opacity: 0.95 }}>{b.subtext}</p>}
            <div>{btn(b.label, true)}{btn(b.label2, false)}</div>
          </div>
        </section>
      );
    }
    case "quote":
      return wrap(<><blockquote style={{ fontFamily: "var(--font-display)", fontSize: fs || "clamp(22px,3vw,32px)", lineHeight: 1.35, margin: 0, ...T }}>“{b.text}”</blockquote>{(b.author || b.role) && <div style={{ marginTop: 16, fontSize: 15, color: "var(--muted)" }}>{b.author}{b.role ? ` · ${b.role}` : ""}</div>}</>);
    case "scripture":
      return wrap(<div style={{ borderLeft: `3px solid ${b.buttonColor || "var(--gold)"}`, paddingLeft: 22, textAlign: "left" }}>{b.author && <div style={{ fontWeight: 800, letterSpacing: ".12em", textTransform: "uppercase", fontSize: 12, color: "var(--gold)", marginBottom: 10 }}>{b.author}{b.role ? ` · ${b.role}` : ""}</div>}<p style={{ fontFamily: "var(--font-display)", fontSize: fs || "clamp(20px,3vw,30px)", lineHeight: 1.4, margin: 0, ...T }}>{b.text}</p>{b.subtext && <p style={{ fontSize: 16, lineHeight: 1.7, color: "var(--muted)", margin: "16px 0 0" }}>{b.subtext}</p>}</div>);
    case "alert": {
      const c = ALERT_UI[b.variant || "info"] || ALERT_UI.info;
      return wrap(<div style={{ background: b.bgColor || c.bg, border: `1px solid ${c.border}`, borderLeft: `4px solid ${c.fg}`, borderRadius: b.radius ?? 10, padding: "16px 18px", textAlign: "left" }}>{b.text && <div style={{ fontWeight: 700, color: c.fg, marginBottom: 4 }}>{b.text}</div>}{b.subtext && <div style={{ fontSize: 15, lineHeight: 1.6, color: "#3a3a3a" }}>{b.subtext}</div>}</div>);
    }
    case "statgrid": {
      const cols = Math.max(1, Math.min(4, b.columns || 3));
      return wrap(<div style={{ display: "grid", gridTemplateColumns: `repeat(${cols},1fr)`, gap: b.gap ?? 24 }}>{(b.items || []).map((it, i) => (
        <div key={i} style={{ textAlign: "center" }}><div style={{ fontFamily: "var(--font-display)", fontSize: "clamp(32px,5vw,52px)", lineHeight: 1, color: b.textColor || "var(--green)" }}>{it.title}</div><div style={{ fontSize: 14, letterSpacing: ".04em", textTransform: "uppercase", color: "var(--muted)", marginTop: 8 }}>{it.body}</div></div>
      ))}</div>);
    }
    case "gallery": {
      const cols = Math.max(1, Math.min(4, b.columns || 3));
      return wrap(<div style={{ display: "grid", gridTemplateColumns: `repeat(${cols},1fr)`, gap: b.gap ?? 12 }}>{(b.items || []).map((it, i) => (
        <figure key={i} style={{ margin: 0 }}>{it.imageUrl
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={it.imageUrl} alt={it.title || ""} style={{ width: "100%", aspectRatio: "1/1", objectFit: "cover", borderRadius: b.radius ?? 10, display: "block" }} />
          : <div style={{ aspectRatio: "1/1", background: "#efece4", borderRadius: b.radius ?? 10, display: "flex", alignItems: "center", justifyContent: "center", color: "#8a7b52", fontSize: 12 }}>Image</div>}{it.title && <figcaption style={{ fontSize: 13, color: "var(--muted)", marginTop: 6 }}>{it.title}</figcaption>}</figure>
      ))}</div>);
    }
    case "cardgrid": {
      const cols = Math.max(1, Math.min(4, b.columns || 3));
      return wrap(<div style={{ display: "grid", gridTemplateColumns: `repeat(${cols},1fr)`, gap: b.gap ?? 16 }}>{(b.items || []).map((it, i) => (
        <div key={i} style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: b.radius ?? 12, overflow: "hidden", textAlign: "left" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {it.imageUrl && <img src={it.imageUrl} alt="" style={{ width: "100%", aspectRatio: "16/9", objectFit: "cover", display: "block" }} />}
          <div style={{ padding: 18 }}>{it.title && <div style={{ fontFamily: "var(--font-display)", fontSize: 20, marginBottom: 6 }}>{it.title}</div>}{it.body && <p style={{ fontSize: 15, lineHeight: 1.6, color: "var(--muted)", margin: 0 }}>{it.body}</p>}{it.url && <span style={{ display: "inline-block", marginTop: 12, color: "var(--green)", fontWeight: 700 }}>Learn more →</span>}</div>
        </div>
      ))}</div>);
    }
    case "resource":
      return wrap(<div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap", background: "var(--card)", border: "1px solid var(--line)", borderRadius: b.radius ?? 12, padding: 20, textAlign: "left" }}><div style={{ flex: 1, minWidth: 220 }}>{b.role && <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 6 }}>{b.role}</div>}<div style={{ fontFamily: "var(--font-display)", fontSize: 22, marginBottom: 4 }}>{b.text}</div>{b.subtext && <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--muted)", margin: 0 }}>{b.subtext}</p>}</div><span style={{ display: "inline-block", background: b.buttonColor || "var(--green)", color: "#fff", padding: "12px 22px", borderRadius: 6, fontWeight: 700 }}>{b.label || "Download"}</span></div>);
    case "accordion":
      return wrap(<div>{(b.items || []).map((it, i) => (
        <details key={i} style={{ border: "1px solid var(--line)", borderRadius: 10, marginBottom: 8, background: "var(--card)" }}>
          <summary style={{ cursor: "pointer", padding: "14px 16px", fontWeight: 600 }}>{it.q}</summary>
          <div style={{ padding: "0 16px 16px", color: "var(--muted)", lineHeight: 1.6 }}>{it.a}</div>
        </details>
      ))}</div>);
    case "form":
      return wrap(<div style={{ textAlign: "left", maxWidth: b.maxWidth || 560, margin: "0 auto" }}>{b.text && <h2 style={{ fontFamily: "var(--font-display)", fontSize: 28, margin: "0 0 6px" }}>{b.text}</h2>}{b.eyebrow && <p style={{ color: "var(--muted)", margin: "0 0 20px" }}>{b.eyebrow}</p>}{(b.items || []).map((it, i) => (
        <div key={i} style={{ marginBottom: 16 }}>
          {it.fieldType !== "checkbox" && <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>{it.title}{it.required ? " *" : ""}</label>}
          {it.fieldType === "textarea" ? <textarea placeholder={it.placeholder} rows={4} readOnly style={fieldStyle} />
            : it.fieldType === "select" ? <select style={fieldStyle}>{(it.options || "").split(",").map((o, k) => <option key={k}>{o.trim()}</option>)}</select>
            : it.fieldType === "checkbox" ? <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 15 }}><input type="checkbox" readOnly /> {it.placeholder || it.title}</label>
            : <input type="text" placeholder={it.placeholder} readOnly style={fieldStyle} />}
        </div>
      ))}<span style={{ display: "inline-block", background: b.buttonColor || "var(--green)", color: "#fff", padding: "13px 26px", borderRadius: 6, fontWeight: 700 }}>{b.label || "Submit"}</span></div>);
    case "video": {
      const src = b.url ? videoEmbedSrc(b.url) : "";
      const [aw, ah] = (b.aspect || "16/9").split("/").map(Number);
      const pb = ah && aw ? (ah / aw) * 100 : 56.25;
      return wrap(src
        ? <div style={{ position: "relative", width: "100%", paddingBottom: `${pb}%`, borderRadius: b.radius ?? 10, overflow: "hidden" }}><iframe title="video" src={src} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }} allowFullScreen /></div>
        : <span style={{ display: "inline-block", padding: "28px 40px", border: "1px dashed #c9b98f", borderRadius: 8, color: "#8a7b52", fontSize: 13 }}>Paste a YouTube / Vimeo / video URL →</span>);
    }
    case "embed":
      return wrap(b.html
        ? <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(b.html) }} />
        : b.url ? <iframe title="embed" src={b.url} style={{ width: "100%", height: b.height ?? 480, border: 0, borderRadius: b.radius ?? 10 }} />
        : <span style={{ display: "inline-block", padding: "28px 40px", border: "1px dashed #c9b98f", borderRadius: 8, color: "#8a7b52", fontSize: 13 }}>Add an embed URL or code →</span>);
    case "html":
      return wrap(<div dangerouslySetInnerHTML={{ __html: sanitizeHtml(b.html || "") || '<span style="color:#8a7b52">Empty HTML block</span>' }} />);
    case "audio":
      return wrap(<AudioPlayer b={b} />);
    case "icon": {
      const gs = Math.max(12, b.iconSize || 30);
      const shape = b.iconShape || "circle";
      const pad = Math.round(gs * 0.62);
      const box: React.CSSProperties = shape === "none"
        ? { display: "inline-flex", lineHeight: 0 }
        : { display: "inline-flex", alignItems: "center", justifyContent: "center", lineHeight: 0, width: gs + pad * 2, height: gs + pad * 2, background: b.iconBg || undefined, borderRadius: shape === "circle" ? 999 : (b.radius ?? 16), border: b.iconOutline ? `2px solid ${b.iconOutline}` : undefined };
      return wrap(<div>
        <span style={box}><IconGlyph id={b.icon} style={(b.variant as IconStyle) || "line"} color={b.accent || b.buttonColor || "#315f43"} size={gs} salt={b.id} /></span>
        {b.text && <div style={{ fontFamily: "var(--font-display)", fontSize: b.fontSize || 20, marginTop: 14, ...T }}>{b.text}</div>}
        {b.subtext && <p style={{ fontSize: 15, lineHeight: 1.6, color: "var(--muted)", margin: "6px 0 0" }}>{b.subtext}</p>}
      </div>);
    }
    case "row": {
      const cols = b.cols ?? [];
      const tmpl = cols.map((c) => (c.span && c.span > 0 ? `${c.span}fr` : "1fr")).join(" ");
      const valign = b.valign === "center" ? "center" : b.valign === "bottom" ? "end" : b.valign === "top" ? "start" : "stretch";
      return wrap(
        <div style={{ display: "grid", gridTemplateColumns: tmpl || "1fr", gap: b.gap ?? 24, alignItems: valign }}>
          {cols.map((c) => {
            const colActive = dnd.hint?.kind === "column" && dnd.hint.colId === c.id;
            return (
              <div key={c.id} style={{ minWidth: 0, outline: colActive ? "2px dashed #c9a46e" : "none", outlineOffset: 2, borderRadius: 6 }} onClick={pick}
                onDragOver={(e) => dnd.overCol(e, b.id, c.id)} onDrop={(e) => dnd.dropCol(e, b.id, c.id)}>
                {c.blocks.length === 0
                  ? <div style={{ minHeight: 60, border: "1px dashed #c9b98f", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#8a7b52", fontSize: 12, padding: 12, textAlign: "center" }}>Empty column · drop blocks here</div>
                  : c.blocks.map((child) => <BlockView key={child.id} block={child} selectedId={selectedId} onSelect={onSelect} nested dnd={dnd} />)}
              </div>
            );
          })}
        </div>,
      );
    }
    default: return null;
  }
}

const fieldStyle: React.CSSProperties = { width: "100%", padding: "11px 13px", border: "1px solid var(--line)", borderRadius: 8, fontSize: 15, background: "#fff" };

// Live, interactive audio player for the canvas (mirrors audioPlayerHtml in render.ts).
function AudioPlayer({ b }: { b: CmsBlock }) {
  const accent = b.accent || b.buttonColor || "#c9a46e";
  const bar = b.barColor || "#1b1a17";
  const titleColor = b.textColor || "#6a7a6f";
  const ref = React.useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = React.useState(false);
  const [cur, setCur] = React.useState(0);
  const [dur, setDur] = React.useState(0);
  const [vol, setVol] = React.useState(0.8);
  React.useEffect(() => { if (ref.current) ref.current.volume = vol; }, [vol]);
  const fmt = (t: number) => { t = Math.max(0, Math.floor(t)); const m = Math.floor(t / 60), s = t % 60; return `${m}:${s < 10 ? "0" : ""}${s}`; };
  const toggle = () => { const a = ref.current; if (!a) return; if (a.paused) a.play(); else a.pause(); };
  const skip = (d: number) => { const a = ref.current; if (a) a.currentTime = Math.max(0, Math.min(a.duration || 0, a.currentTime + d)); };
  const restart = () => { const a = ref.current; if (a) { a.currentTime = 0; a.play(); } };
  const ctrl: React.CSSProperties = { background: "transparent", border: "none", color: "inherit", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", padding: 9, borderRadius: "50%" };
  return (
    <div style={{ maxWidth: 660, margin: "0 auto" }}>
      {b.text && <div style={{ fontFamily: "var(--font-display)", fontSize: b.fontSize || 22, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: titleColor }}>{b.text}</div>}
      {b.url ? (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "16px auto 20px", maxWidth: 560, fontSize: 13, color: "var(--muted)" }}>
            <span>{fmt(cur)}</span>
            <input type="range" min={0} max={dur || 0} step={0.1} value={cur} onChange={(e) => { const v = +e.target.value; setCur(v); if (ref.current) ref.current.currentTime = v; }} style={{ flex: 1, accentColor: accent }} />
            <span>{fmt(dur)}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: bar, borderRadius: 999, padding: "10px 16px", maxWidth: 440, margin: "0 auto", color: "#ece8df" }}>
            <span style={{ opacity: 0.55, padding: 9, display: "inline-flex" }} aria-hidden="true"><ListMusic size={20} /></span>
            <button type="button" onClick={() => skip(-10)} style={ctrl} title="Back 10s"><RotateCcw size={20} /></button>
            <button type="button" onClick={toggle} style={{ border: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", width: 56, height: 56, borderRadius: "50%", color: "#fff", background: accent, boxShadow: "0 8px 20px rgba(0,0,0,.28)" }} title="Play / pause">{playing ? <Pause size={24} /> : <Play size={24} style={{ marginLeft: 2 }} />}</button>
            <button type="button" onClick={() => skip(10)} style={ctrl} title="Forward 10s"><RotateCw size={20} /></button>
            <button type="button" onClick={restart} style={ctrl} title="Restart"><RotateCcw size={18} /></button>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8, margin: "18px auto 0", maxWidth: 560, color: "var(--muted)" }}>
            <Volume2 size={17} />
            <input type="range" min={0} max={1} step={0.01} value={vol} onChange={(e) => setVol(+e.target.value)} style={{ width: 120, accentColor: accent }} />
          </div>
          <audio ref={ref} src={b.url} preload="metadata"
            onLoadedMetadata={(e) => setDur(e.currentTarget.duration || 0)}
            onTimeUpdate={(e) => setCur(e.currentTarget.currentTime)}
            onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)} />
        </>
      ) : (
        <div style={{ padding: 28, border: "1px dashed #c9b98f", borderRadius: 14, color: "#8a7b52", fontSize: 14 }}>Add an audio file URL to enable the player.</div>
      )}
      {(b.author || b.role) && <div style={{ marginTop: 22, fontSize: 15, color: "var(--muted)" }}>{b.author ? `By ${b.author}` : ""}{b.author && b.role ? <span style={{ color: accent }}> • </span> : null}{b.role || ""}</div>}
    </div>
  );
}

// Dedicated "Icons" palette section — browse the Solar library and click to insert
// an icon block pre-set to that glyph (restyle it afterward in the inspector).
function PaletteIconGrid({ onPick }: { onPick: (id: string) => void }) {
  const [q, setQ] = React.useState("");
  const needle = q.trim().toLowerCase();
  const list = CMS_ICONS.filter((i) => !needle || i.label.toLowerCase().includes(needle) || i.id.includes(needle));
  return (
    <div className="space-y-2 px-1">
      <div className="relative">
        <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input className="h-8 pl-7" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search icons…" />
      </div>
      <div className="grid max-h-[300px] gap-1 overflow-y-auto pr-1" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(34px,1fr))" }}>
        {list.map((ic) => (
          <button key={ic.id} type="button" onClick={() => onPick(ic.id)} title={`Add ${ic.label}`}
            className="flex aspect-square items-center justify-center rounded-md border border-border/60 bg-background text-foreground transition-colors hover:border-primary/50 hover:bg-muted">
            <IconGlyph id={ic.id} style="line" size={20} salt={`pal-${ic.id}`} />
          </button>
        ))}
        {list.length === 0 && <p className="col-span-full py-3 text-center text-[11px] text-muted-foreground">No icons match “{q}”.</p>}
      </div>
      <p className="text-[10px] text-muted-foreground">{CMS_ICONS.length} Solar icons · click to add, then set style &amp; colors in the inspector.</p>
    </div>
  );
}

// Searchable icon picker for the inspector (renders live SVG previews).
function IconPicker({ value, onChange, style, color }: { value?: string; onChange: (id: string) => void; style: IconStyle; color: string }) {
  const [q, setQ] = React.useState("");
  const needle = q.trim().toLowerCase();
  const list = CMS_ICONS.filter((i) => !needle || i.label.toLowerCase().includes(needle) || i.id.includes(needle));
  return (
    <div>
      <L>Icon</L>
      <div className="relative mb-2">
        <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input className="h-8 pl-7" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search icons…" />
      </div>
      <div className="grid max-h-[188px] grid-cols-6 gap-1.5 overflow-y-auto rounded-lg border border-border p-2">
        {list.map((ic) => (
          <button key={ic.id} type="button" onClick={() => onChange(ic.id)} title={ic.label}
            className={cn("flex aspect-square items-center justify-center rounded-md border text-foreground", value === ic.id ? "border-primary bg-primary/10" : "border-transparent hover:bg-muted")}>
            <IconGlyph id={ic.id} style={style} color={color} size={22} salt={`pick-${ic.id}`} />
          </button>
        ))}
        {list.length === 0 && <p className="col-span-6 py-3 text-center text-[11px] text-muted-foreground">No icons match “{q}”.</p>}
      </div>
    </div>
  );
}

// ── Canvas FAB (floating quick-style toolbar anchored to the selected block) ───
function CanvasFab({ block, update, upload, canvasRef, scrollRef, blocksSig, onSaveTemplate }: {
  block: CmsBlock; update: (p: Partial<CmsBlock>) => void; upload: (cb: (url: string) => void) => void;
  canvasRef: React.RefObject<HTMLDivElement | null>; scrollRef: React.RefObject<HTMLDivElement | null>; blocksSig: number; onSaveTemplate: () => void;
}) {
  const [pos, setPos] = React.useState<{ top: number; left: number } | null>(null);
  const [open, setOpen] = React.useState(false);

  const measure = React.useCallback(() => {
    const el = canvasRef.current?.querySelector(`[data-cms-block="${block.id}"]`) as HTMLElement | null;
    const scroller = scrollRef.current;
    if (!el || !scroller) { setPos(null); return; }
    const r = el.getBoundingClientRect(); const sr = scroller.getBoundingClientRect();
    if (r.bottom < sr.top + 8 || r.top > sr.bottom - 8) { setPos(null); return; }
    const top = Math.max(sr.top + 6, r.top - 46);
    const left = Math.min(Math.max(r.left, sr.left + 6), Math.max(sr.left + 6, sr.right - 356));
    setPos({ top, left });
  }, [block.id, canvasRef, scrollRef]);

  React.useEffect(() => { const id = requestAnimationFrame(measure); return () => cancelAnimationFrame(id); }, [measure, block, blocksSig]);
  React.useEffect(() => {
    const scroller = scrollRef.current;
    const h = () => measure();
    scroller?.addEventListener("scroll", h); window.addEventListener("resize", h);
    return () => { scroller?.removeEventListener("scroll", h); window.removeEventListener("resize", h); };
  }, [measure, scrollRef]);
  React.useEffect(() => { setOpen(false); }, [block.id]);

  if (!pos) return null;
  const text = isTextType(block.type);
  const toggle = (k: keyof CmsBlock, on: unknown, off: unknown, cur: unknown) => update({ [k]: cur === on ? off : on } as Partial<CmsBlock>);
  const size = (d: number) => update({ fontSize: Math.max(10, (block.fontSize || 18) + d) });

  return (
    <div style={{ position: "fixed", top: pos.top, left: pos.left, zIndex: 40 }} onMouseDown={(e) => e.stopPropagation()}>
      <div className="flex items-center gap-0.5 rounded-lg border border-border bg-card p-1 shadow-lg">
        {text && (["left", "center", "right"] as const).map((a) => {
          const Icon = a === "left" ? AlignLeft : a === "center" ? AlignCenter : AlignRight;
          return <FabBtn key={a} active={block.align === a} onClick={() => update({ align: a })} title={`Align ${a}`}><Icon className="h-3.5 w-3.5" /></FabBtn>;
        })}
        {text && <FabBtn active={block.fontWeight === 700} onClick={() => toggle("fontWeight", 700, 400, block.fontWeight)} title="Bold"><Bold className="h-3.5 w-3.5" /></FabBtn>}
        {text && <FabBtn active={block.fontStyle === "italic"} onClick={() => toggle("fontStyle", "italic", "normal", block.fontStyle)} title="Italic"><Italic className="h-3.5 w-3.5" /></FabBtn>}
        {text && <FabBtn active={block.textTransform === "uppercase"} onClick={() => toggle("textTransform", "uppercase", "none", block.textTransform)} title="Uppercase"><CaseUpper className="h-4 w-4" /></FabBtn>}
        {text && <><FabBtn onClick={() => size(-1)} title="Smaller"><span className="text-[11px] font-bold">A-</span></FabBtn><FabBtn onClick={() => size(1)} title="Larger"><span className="text-[13px] font-bold">A+</span></FabBtn></>}
        {text && <label className="relative flex h-7 w-7 cursor-pointer items-center justify-center rounded-md hover:bg-muted" title="Text color"><Type className="h-3.5 w-3.5" style={{ color: block.textColor || undefined }} /><input type="color" value={block.textColor || "#000000"} onChange={(e) => update({ textColor: e.target.value })} className="absolute inset-0 cursor-pointer opacity-0" /></label>}
        <label className="relative flex h-7 w-7 cursor-pointer items-center justify-center rounded-md hover:bg-muted" title="Background"><Square className="h-3.5 w-3.5" style={{ fill: block.bgColor || "transparent" }} /><input type="color" value={block.bgColor || "#ffffff"} onChange={(e) => update({ bgColor: e.target.value })} className="absolute inset-0 cursor-pointer opacity-0" /></label>
        <div className="mx-0.5 h-5 w-px bg-border" />
        <FabBtn active={open} onClick={() => setOpen((o) => !o)} title="More options"><Settings2 className="h-3.5 w-3.5" /></FabBtn>
      </div>
      {open && (
        <div className="mt-1.5 max-h-[52vh] w-[340px] space-y-3 overflow-y-auto rounded-xl border border-border bg-card p-3 shadow-xl">
          {text && <TypographyFields block={block} update={update} />}
          <SpacingFields block={block} update={update} />
          <EffectsFields block={block} update={update} upload={upload} />
          <button onClick={onSaveTemplate} className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-border py-1.5 text-xs text-muted-foreground hover:text-primary"><Star className="h-3.5 w-3.5" /> Save as component</button>
        </div>
      )}
    </div>
  );
}
function FabBtn({ children, active, onClick, title }: { children: React.ReactNode; active?: boolean; onClick: () => void; title: string }) {
  return <button onClick={onClick} title={title} className={cn("flex h-7 w-7 items-center justify-center rounded-md", active ? "bg-primary/15 text-primary" : "text-foreground hover:bg-muted")}>{children}</button>;
}

// ── Shared small controls ─────────────────────────────────────────────────────
function L({ children }: { children: React.ReactNode }) { return <label className="mb-1 block text-xs font-medium text-muted-foreground">{children}</label>; }
function Num({ label, value, onChange, placeholder }: { label: string; value: number | undefined; onChange: (v: number | undefined) => void; placeholder?: string }) {
  return <div><L>{label}</L><Input type="number" value={value ?? ""} onChange={(e) => onChange(e.target.value === "" ? undefined : Number(e.target.value))} placeholder={placeholder} className="h-8" /></div>;
}
function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <L>{label}</L>
      <div className="flex flex-wrap items-center gap-1.5">
        {SWATCHES.map((c) => (
          <button key={c || "none"} type="button" onClick={() => onChange(c)} title={c || "None"}
            className={cn("h-6 w-6 rounded-full border", value === c ? "ring-2 ring-primary ring-offset-1" : "border-border", !c && "bg-[repeating-conic-gradient(#ccc_0_25%,#fff_0_50%)] bg-[length:8px_8px]")}
            style={c ? { background: c } : undefined} />
        ))}
        <input type="color" value={value || "#000000"} onChange={(e) => onChange(e.target.value)} className="h-6 w-8 cursor-pointer rounded border border-input bg-background" />
      </div>
    </div>
  );
}

function TypographyFields({ block, update }: { block: CmsBlock; update: (p: Partial<CmsBlock>) => void }) {
  const weights = fontWeights(block.fontFamily);
  return (
    <div className="space-y-2">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Typography</div>
      <div><L>Font family</L><FieldSelect value={block.fontFamily ?? ""} onChange={(v) => update({ fontFamily: v || undefined })} options={FONT_OPTIONS} className="h-8" /></div>
      <div className="grid grid-cols-2 gap-2">
        <div><L>Weight</L><FieldSelect value={String(block.fontWeight ?? "")} onChange={(v) => update({ fontWeight: v ? Number(v) : undefined })} options={[{ value: "", label: "Default" }, ...weights.map((w) => ({ value: String(w), label: String(w) }))]} className="h-8" /></div>
        <div><L>Style</L><FieldSelect value={block.fontStyle ?? "normal"} onChange={(v) => update({ fontStyle: v as CmsBlock["fontStyle"] })} options={[{ value: "normal", label: "Normal" }, { value: "italic", label: fontHasItalic(block.fontFamily) || !block.fontFamily ? "Italic" : "Italic (synth)" }]} className="h-8" /></div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Num label="Size" value={block.fontSize} onChange={(v) => update({ fontSize: v })} placeholder="auto" />
        <Num label="Letter sp." value={block.letterSpacing} onChange={(v) => update({ letterSpacing: v })} placeholder="0" />
        <Num label="Line ht." value={block.lineHeight} onChange={(v) => update({ lineHeight: v })} placeholder="auto" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div><L>Case</L><FieldSelect value={block.textTransform ?? "none"} onChange={(v) => update({ textTransform: v as CmsBlock["textTransform"] })} options={[{ value: "none", label: "Normal" }, { value: "uppercase", label: "UPPERCASE" }, { value: "lowercase", label: "lowercase" }, { value: "capitalize", label: "Capitalize" }]} className="h-8" /></div>
        <div><L>Align</L><FieldSelect value={block.align ?? "left"} onChange={(v) => update({ align: v as CmsBlock["align"] })} options={ALIGN_OPTS} className="h-8" /></div>
      </div>
      <ColorField label="Text color" value={block.textColor ?? ""} onChange={(v) => update({ textColor: v })} />
      <div><L>Text shadow</L><FieldSelect value={block.textShadow ?? ""} onChange={(v) => update({ textShadow: v || undefined })} options={TEXT_SHADOWS} className="h-8" /></div>
    </div>
  );
}
function SpacingFields({ block, update }: { block: CmsBlock; update: (p: Partial<CmsBlock>) => void }) {
  return (
    <div className="space-y-2 border-t border-border pt-3">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Spacing</div>
      <div className="grid grid-cols-2 gap-2">
        <Num label="Margin top" value={block.marginTop} onChange={(v) => update({ marginTop: v })} placeholder="0" />
        <Num label="Margin bottom" value={block.marginBottom} onChange={(v) => update({ marginBottom: v })} placeholder="0" />
      </div>
      {block.type !== "spacer" && (
        <div className="grid grid-cols-3 gap-2">
          <Num label="Pad top" value={block.padTop} onChange={(v) => update({ padTop: v })} placeholder="24" />
          <Num label="Pad bottom" value={block.padBottom} onChange={(v) => update({ padBottom: v })} placeholder="24" />
          <Num label="Pad X" value={block.padX} onChange={(v) => update({ padX: v })} placeholder="20" />
        </div>
      )}
      {block.type !== "spacer" && block.type !== "divider" && <Num label="Content width (px)" value={block.maxWidth} onChange={(v) => update({ maxWidth: v })} placeholder="full" />}
      {block.type === "spacer" && <Num label="Height (px)" value={block.height} onChange={(v) => update({ height: v ?? 0 })} placeholder="40" />}
    </div>
  );
}
function EffectsFields({ block, update, upload }: { block: CmsBlock; update: (p: Partial<CmsBlock>) => void; upload?: (cb: (url: string) => void) => void }) {
  return (
    <div className="space-y-2 border-t border-border pt-3">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Background & effects</div>
      {block.type !== "spacer" && <ColorField label="Background" value={block.bgColor ?? ""} onChange={(v) => update({ bgColor: v })} />}
      {(block.type === "hero") && upload && (
        <div><L>Background image</L><div className="flex gap-2"><Input className="h-8" value={block.bgImage ?? ""} onChange={(e) => update({ bgImage: e.target.value })} placeholder="https://…" /><Button type="button" variant="outline" size="sm" className="h-8 shrink-0 px-2" onClick={() => upload((url) => update({ bgImage: url }))}><Upload className="h-3.5 w-3.5" /></Button></div>
          <div className="mt-2 grid grid-cols-2 gap-2"><ColorField label="Overlay" value={block.overlay ?? ""} onChange={(v) => update({ overlay: v })} /><Num label="Overlay %" value={block.overlayOpacity} onChange={(v) => update({ overlayOpacity: v })} placeholder="40" /></div>
        </div>
      )}
      <div className="grid grid-cols-3 gap-2">
        <Num label="Border w." value={block.borderWidth} onChange={(v) => update({ borderWidth: v })} placeholder="0" />
        <div><L>Border</L><FieldSelect value={block.borderStyle ?? "solid"} onChange={(v) => update({ borderStyle: v as CmsBlock["borderStyle"] })} options={[{ value: "solid", label: "Solid" }, { value: "dashed", label: "Dashed" }, { value: "dotted", label: "Dotted" }]} className="h-8" /></div>
        <Num label="Radius" value={block.radius} onChange={(v) => update({ radius: v })} placeholder="0" />
      </div>
      <ColorField label="Border color" value={block.borderColor ?? ""} onChange={(v) => update({ borderColor: v })} />
      <div><L>Box shadow</L><FieldSelect value={block.boxShadow ?? ""} onChange={(v) => update({ boxShadow: v || undefined })} options={BOX_SHADOWS} className="h-8" /></div>
    </div>
  );
}

// ── Right inspector (content + full styling) ──────────────────────────────────
// Block types that can be inserted into a row column (everything except a row).
const ROW_ADD_TYPES: CmsBlockType[] = [
  "heading", "subheading", "paragraph", "richtext", "list", "quote", "scripture",
  "image", "video", "audio", "icon", "gallery", "button", "cta", "cardgrid", "statgrid",
  "alert", "accordion", "form", "resource", "divider", "spacer", "embed", "html",
];

// Row / Columns settings — column count, gap, alignment, and per-column contents.
function RowInspector({ block, update, onAddToColumn, onMove, onRemove, onSelect }: {
  block: CmsBlock; update: (p: Partial<CmsBlock>) => void;
  onAddToColumn?: (rowId: string, colId: string, type: CmsBlockType) => void;
  onMove?: (id: string, dir: -1 | 1) => void; onRemove?: (id: string) => void; onSelect?: (id: string) => void;
}) {
  const cols = block.cols ?? [];
  const setSpan = (colId: string, span: number | undefined) => update({ cols: cols.map((c) => (c.id === colId ? { ...c, span } : c)) });
  return (
    <div className="space-y-2 rounded-lg border border-border p-2">
      <div className="grid grid-cols-2 gap-2">
        <div><L>Columns</L><FieldSelect value={String(cols.length || 2)} onChange={(v) => update({ cols: setColumnCount(block, Number(v), uid) })} options={[{ value: "1", label: "1" }, { value: "2", label: "2" }, { value: "3", label: "3" }, { value: "4", label: "4" }]} className="h-8" /></div>
        <Num label="Gap (px)" value={block.gap} onChange={(v) => update({ gap: v })} placeholder="24" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div><L>Vertical align</L><FieldSelect value={block.valign ?? "stretch"} onChange={(v) => update({ valign: v as CmsBlock["valign"] })} options={[{ value: "stretch", label: "Stretch" }, { value: "top", label: "Top" }, { value: "center", label: "Center" }, { value: "bottom", label: "Bottom" }]} className="h-8" /></div>
        <label className="flex items-end gap-1.5 pb-1.5 text-[11px] text-muted-foreground"><input type="checkbox" checked={block.stackMobile !== false} onChange={(e) => update({ stackMobile: e.target.checked })} /> Stack on mobile</label>
      </div>
      {cols.map((c, ci) => (
        <div key={c.id} className="rounded-lg border border-border/70 bg-muted/30 p-2">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-[11px] font-semibold text-muted-foreground">Column {ci + 1}</span>
            <div className="flex items-center gap-1"><span className="text-[10px] text-muted-foreground">width</span>
              <Input type="number" value={c.span ?? ""} onChange={(e) => setSpan(c.id, e.target.value === "" ? undefined : Number(e.target.value))} placeholder="1" className="h-7 w-12" /></div>
          </div>
          <div className="space-y-1">
            {c.blocks.length === 0 && <p className="px-1 text-[10px] italic text-muted-foreground/70">No blocks yet.</p>}
            {c.blocks.map((child, bi) => (
              <div key={child.id} className="flex items-center gap-1 rounded-md border border-border bg-background px-1.5 py-1 text-[11px]">
                <button className="min-w-0 flex-1 truncate text-left hover:text-primary" onClick={() => onSelect?.(child.id)}>{CMS_BLOCK_LABELS[child.type]}{child.text ? <span className="text-muted-foreground"> · {child.text.slice(0, 14)}</span> : null}</button>
                <button className="text-muted-foreground hover:text-foreground disabled:opacity-30" disabled={bi === 0} onClick={() => onMove?.(child.id, -1)} title="Move up">↑</button>
                <button className="text-muted-foreground hover:text-foreground disabled:opacity-30" disabled={bi === c.blocks.length - 1} onClick={() => onMove?.(child.id, 1)} title="Move down">↓</button>
                <button className="text-muted-foreground hover:text-destructive" onClick={() => onRemove?.(child.id)} title="Delete"><Trash2 className="h-3 w-3" /></button>
              </div>
            ))}
          </div>
          <FieldSelect value="" onChange={(v) => v && onAddToColumn?.(block.id, c.id, v as CmsBlockType)} options={[{ value: "", label: "+ Add block…" }, ...ROW_ADD_TYPES.map((t) => ({ value: t, label: CMS_BLOCK_LABELS[t] }))]} className="mt-1.5 h-8" />
        </div>
      ))}
      <p className="text-[10px] text-muted-foreground">Add blocks into each column, then click a block to style it.</p>
    </div>
  );
}

function Inspector({ block, update, upload, onAddToColumn, onMove, onRemove, onSelect }: {
  block: CmsBlock; update: (p: Partial<CmsBlock>) => void; upload: (onDone: (url: string) => void, accept?: string) => void;
  onAddToColumn?: (rowId: string, colId: string, type: CmsBlockType) => void; onMove?: (id: string, dir: -1 | 1) => void;
  onRemove?: (id: string) => void; onSelect?: (id: string) => void;
}) {
  const isText = block.type === "heading" || block.type === "subheading" || block.type === "paragraph" || block.type === "richtext";
  const setItem = (i: number, patch: Partial<CmsBlockItem>) => update({ items: (block.items ?? []).map((it, k) => (k === i ? { ...it, ...patch } : it)) });
  const addItem = (blank: CmsBlockItem) => update({ items: [...(block.items ?? []), blank] });
  const removeItem = (i: number) => update({ items: (block.items ?? []).filter((_, k) => k !== i) });
  const moveItem = (i: number, d: number) => { const arr = [...(block.items ?? [])]; const j = i + d; if (j < 0 || j >= arr.length) return; [arr[i], arr[j]] = [arr[j], arr[i]]; update({ items: arr }); };
  return (
    <div className="space-y-3">
      <div className="text-xs font-semibold capitalize">{CMS_BLOCK_LABELS[block.type]}</div>

      {block.type === "row" && (
        <RowInspector block={block} update={update} onAddToColumn={onAddToColumn} onMove={onMove} onRemove={onRemove} onSelect={onSelect} />
      )}

      {isText && (
        <div>
          <L>Text</L>
          <Textarea value={block.text ?? ""} onChange={(e) => update({ text: e.target.value })} className={block.type === "richtext" || block.type === "paragraph" ? "min-h-[120px]" : "min-h-[60px]"} />
          {block.type === "richtext" && <p className="mt-1 text-[10px] text-muted-foreground">Supports **bold**, *italic*, [links](url), and “- ” bullet lists.</p>}
        </div>
      )}

      {(block.type === "hero" || block.type === "cta") && (
        <div className="space-y-2">
          <div><L>Eyebrow</L><Input value={block.eyebrow ?? ""} onChange={(e) => update({ eyebrow: e.target.value })} placeholder="small label" /></div>
          <div><L>Heading</L><Input value={block.text ?? ""} onChange={(e) => update({ text: e.target.value })} /></div>
          <div><L>Subheading</L><Textarea className="min-h-[52px]" value={block.subtext ?? ""} onChange={(e) => update({ subtext: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-2"><div><L>Button label</L><Input value={block.label ?? ""} onChange={(e) => update({ label: e.target.value })} /></div><div><L>Button URL</L><Input value={block.url ?? ""} onChange={(e) => update({ url: e.target.value })} /></div></div>
          <div className="grid grid-cols-2 gap-2"><div><L>2nd label</L><Input value={block.label2 ?? ""} onChange={(e) => update({ label2: e.target.value })} placeholder="optional" /></div><div><L>2nd URL</L><Input value={block.url2 ?? ""} onChange={(e) => update({ url2: e.target.value })} /></div></div>
          {block.type === "hero" && <Num label="Min height (px)" value={block.minHeight} onChange={(v) => update({ minHeight: v })} placeholder="440" />}
          <ColorField label="Button color" value={block.buttonColor ?? ""} onChange={(v) => update({ buttonColor: v })} />
        </div>
      )}

      {(block.type === "quote" || block.type === "scripture") && (
        <div className="space-y-2">
          {block.type === "scripture" && <div className="grid grid-cols-2 gap-2"><div><L>Reference</L><Input value={block.author ?? ""} onChange={(e) => update({ author: e.target.value })} placeholder="John 3:16" /></div><div><L>Version</L><Input value={block.role ?? ""} onChange={(e) => update({ role: e.target.value })} placeholder="ESV" /></div></div>}
          <div><L>{block.type === "scripture" ? "Verse" : "Quote"}</L><Textarea className="min-h-[70px]" value={block.text ?? ""} onChange={(e) => update({ text: e.target.value })} /></div>
          {block.type === "quote" && <div className="grid grid-cols-2 gap-2"><div><L>Author</L><Input value={block.author ?? ""} onChange={(e) => update({ author: e.target.value })} /></div><div><L>Role</L><Input value={block.role ?? ""} onChange={(e) => update({ role: e.target.value })} /></div></div>}
          {block.type === "scripture" && <div><L>Reflection</L><Textarea className="min-h-[52px]" value={block.subtext ?? ""} onChange={(e) => update({ subtext: e.target.value })} /></div>}
        </div>
      )}

      {block.type === "alert" && (
        <div className="space-y-2">
          <div><L>Type</L><FieldSelect value={block.variant ?? "info"} onChange={(v) => update({ variant: v })} options={[{ value: "info", label: "Info" }, { value: "success", label: "Success" }, { value: "warning", label: "Warning" }, { value: "error", label: "Error" }]} className="h-8" /></div>
          <div><L>Title</L><Input value={block.text ?? ""} onChange={(e) => update({ text: e.target.value })} /></div>
          <div><L>Message</L><Textarea className="min-h-[52px]" value={block.subtext ?? ""} onChange={(e) => update({ subtext: e.target.value })} /></div>
        </div>
      )}

      {block.type === "list" && (
        <div className="space-y-2">
          <div><L>Style</L><FieldSelect value={block.variant ?? "check"} onChange={(v) => update({ variant: v })} options={[{ value: "check", label: "Checkmarks" }, { value: "bullet", label: "Bullets" }, { value: "number", label: "Numbered" }]} className="h-8" /></div>
          {(block.items ?? []).map((it, i) => (
            <div key={i} className="flex items-center gap-1"><Input className="h-8" value={it.title ?? ""} onChange={(e) => setItem(i, { title: e.target.value })} placeholder={`Item ${i + 1}`} /><button onClick={() => removeItem(i)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button></div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => addItem({ title: "New item" })}><Plus className="h-3.5 w-3.5" /> Add item</Button>
        </div>
      )}

      {(block.type === "cardgrid" || block.type === "statgrid" || block.type === "gallery") && (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div><L>Columns</L><FieldSelect value={String(block.columns ?? 3)} onChange={(v) => update({ columns: Number(v) })} options={[{ value: "2", label: "2" }, { value: "3", label: "3" }, { value: "4", label: "4" }]} className="h-8" /></div>
            <Num label="Gap (px)" value={block.gap} onChange={(v) => update({ gap: v })} placeholder={block.type === "gallery" ? "12" : "16"} />
          </div>
          {(block.items ?? []).map((it, i) => (
            <div key={i} className="rounded-lg border border-border p-2">
              <div className="mb-1 flex items-center justify-between"><span className="text-[11px] font-medium text-muted-foreground">#{i + 1}</span><div className="flex gap-1"><button onClick={() => moveItem(i, -1)} className="text-muted-foreground hover:text-foreground text-[11px]">↑</button><button onClick={() => moveItem(i, 1)} className="text-muted-foreground hover:text-foreground text-[11px]">↓</button><button onClick={() => removeItem(i)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button></div></div>
              {block.type === "statgrid" ? (
                <div className="grid grid-cols-2 gap-1"><Input className="h-8" value={it.title ?? ""} onChange={(e) => setItem(i, { title: e.target.value })} placeholder="100+" /><Input className="h-8" value={it.body ?? ""} onChange={(e) => setItem(i, { body: e.target.value })} placeholder="Label" /></div>
              ) : block.type === "gallery" ? (
                <div className="flex gap-1"><Input className="h-8" value={it.imageUrl ?? ""} onChange={(e) => setItem(i, { imageUrl: e.target.value })} placeholder="Image URL" /><Button type="button" variant="outline" size="sm" className="h-8 shrink-0 px-2" onClick={() => upload((url) => setItem(i, { imageUrl: url }))}><Upload className="h-3.5 w-3.5" /></Button></div>
              ) : (
                <>
                  <Input className="mb-1 h-8" value={it.title ?? ""} onChange={(e) => setItem(i, { title: e.target.value })} placeholder="Title" />
                  <Textarea className="mb-1 min-h-[44px]" value={it.body ?? ""} onChange={(e) => setItem(i, { body: e.target.value })} placeholder="Body" />
                  <div className="mb-1 flex gap-1"><Input className="h-8" value={it.imageUrl ?? ""} onChange={(e) => setItem(i, { imageUrl: e.target.value })} placeholder="Image URL" /><Button type="button" variant="outline" size="sm" className="h-8 shrink-0 px-2" onClick={() => upload((url) => setItem(i, { imageUrl: url }))}><Upload className="h-3.5 w-3.5" /></Button></div>
                  <Input className="h-8" value={it.url ?? ""} onChange={(e) => setItem(i, { url: e.target.value })} placeholder="Link URL (optional)" />
                </>
              )}
              {block.type === "gallery" && <Input className="mt-1 h-8" value={it.title ?? ""} onChange={(e) => setItem(i, { title: e.target.value })} placeholder="Caption (optional)" />}
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => addItem(block.type === "statgrid" ? { title: "0", body: "Label" } : block.type === "gallery" ? { imageUrl: "", title: "" } : { title: "New card", body: "" })}><Plus className="h-3.5 w-3.5" /> Add</Button>
        </div>
      )}

      {block.type === "accordion" && (
        <div className="space-y-2">
          {(block.items ?? []).map((it, i) => (
            <div key={i} className="rounded-lg border border-border p-2">
              <div className="mb-1 flex items-center justify-between"><span className="text-[11px] font-medium text-muted-foreground">Item {i + 1}</span><button onClick={() => removeItem(i)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button></div>
              <Input className="mb-1 h-8" value={it.q ?? ""} onChange={(e) => setItem(i, { q: e.target.value })} placeholder="Question / title" />
              <Textarea className="min-h-[52px]" value={it.a ?? ""} onChange={(e) => setItem(i, { a: e.target.value })} placeholder="Answer / body" />
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => addItem({ q: "New question?", a: "" })}><Plus className="h-3.5 w-3.5" /> Add item</Button>
        </div>
      )}

      {block.type === "form" && (
        <div className="space-y-2">
          <div><L>Form title</L><Input value={block.text ?? ""} onChange={(e) => update({ text: e.target.value })} /></div>
          <div><L>Description</L><Input value={block.eyebrow ?? ""} onChange={(e) => update({ eyebrow: e.target.value })} /></div>
          <div><L>Submit label</L><Input value={block.label ?? ""} onChange={(e) => update({ label: e.target.value })} placeholder="Submit" /></div>
          <p className="text-[10px] text-amber-600 dark:text-amber-400">Form submission handling is a fast-follow; fields render for layout now.</p>
          {(block.items ?? []).map((it, i) => (
            <div key={i} className="rounded-lg border border-border p-2">
              <div className="mb-1 flex items-center justify-between"><span className="text-[11px] font-medium text-muted-foreground">Field {i + 1}</span><div className="flex gap-1"><button onClick={() => moveItem(i, -1)} className="text-[11px] text-muted-foreground hover:text-foreground">↑</button><button onClick={() => moveItem(i, 1)} className="text-[11px] text-muted-foreground hover:text-foreground">↓</button><button onClick={() => removeItem(i)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button></div></div>
              <div className="mb-1 grid grid-cols-2 gap-1"><Input className="h-8" value={it.title ?? ""} onChange={(e) => setItem(i, { title: e.target.value })} placeholder="Label" /><FieldSelect value={it.fieldType ?? "text"} onChange={(v) => setItem(i, { fieldType: v })} options={[{ value: "text", label: "Text" }, { value: "email", label: "Email" }, { value: "phone", label: "Phone" }, { value: "number", label: "Number" }, { value: "date", label: "Date" }, { value: "textarea", label: "Textarea" }, { value: "select", label: "Select" }, { value: "checkbox", label: "Checkbox" }]} className="h-8" /></div>
              <Input className="mb-1 h-8" value={it.placeholder ?? ""} onChange={(e) => setItem(i, { placeholder: e.target.value })} placeholder="Placeholder" />
              {it.fieldType === "select" && <Input className="mb-1 h-8" value={it.options ?? ""} onChange={(e) => setItem(i, { options: e.target.value })} placeholder="Option A, Option B, Option C" />}
              <label className="flex items-center gap-1.5 text-[11px] text-muted-foreground"><input type="checkbox" checked={Boolean(it.required)} onChange={(e) => setItem(i, { required: e.target.checked })} /> Required</label>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => addItem({ title: "New field", fieldType: "text" })}><Plus className="h-3.5 w-3.5" /> Add field</Button>
        </div>
      )}

      {block.type === "resource" && (
        <div className="space-y-2">
          <div><L>File type label</L><Input value={block.role ?? ""} onChange={(e) => update({ role: e.target.value })} placeholder="PDF · 2.4 MB" /></div>
          <div><L>Title</L><Input value={block.text ?? ""} onChange={(e) => update({ text: e.target.value })} /></div>
          <div><L>Description</L><Textarea className="min-h-[44px]" value={block.subtext ?? ""} onChange={(e) => update({ subtext: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-2"><div><L>Button label</L><Input value={block.label ?? ""} onChange={(e) => update({ label: e.target.value })} /></div><div><L>File URL</L><div className="flex gap-1"><Input className="h-9" value={block.url ?? ""} onChange={(e) => update({ url: e.target.value })} placeholder="https://…" /><Button type="button" variant="outline" size="sm" className="shrink-0 px-2" onClick={() => upload((url) => update({ url }))}><Upload className="h-3.5 w-3.5" /></Button></div></div></div>
          <label className="flex items-center gap-1.5 text-[11px] text-muted-foreground"><input type="checkbox" checked={Boolean(block.newTab)} onChange={(e) => update({ newTab: e.target.checked })} /> Open in new tab</label>
        </div>
      )}

      {block.type === "video" && (
        <div className="space-y-2">
          <div><L>Video URL (YouTube / Vimeo / MP4)</L><Input value={block.url ?? ""} onChange={(e) => update({ url: e.target.value })} placeholder="https://youtube.com/watch?v=…" /></div>
          <div><L>Aspect ratio</L><FieldSelect value={block.aspect ?? "16/9"} onChange={(v) => update({ aspect: v })} options={[{ value: "16/9", label: "16:9" }, { value: "4/3", label: "4:3" }, { value: "1/1", label: "1:1" }]} className="h-8" /></div>
        </div>
      )}

      {block.type === "embed" && (
        <div className="space-y-2">
          <div><L>Embed URL</L><Input value={block.url ?? ""} onChange={(e) => update({ url: e.target.value })} placeholder="https://…" /></div>
          <Num label="Height (px)" value={block.height} onChange={(v) => update({ height: v })} placeholder="480" />
          <div><L>Or embed code (HTML)</L><Textarea value={block.html ?? ""} onChange={(e) => update({ html: e.target.value })} className="min-h-[80px] font-mono text-xs" placeholder="<iframe …></iframe>" /></div>
        </div>
      )}

      {block.type === "audio" && (
        <div className="space-y-2">
          <div><L>Audio file (MP3 / M4A / WAV)</L><div className="flex gap-2"><Input value={block.url ?? ""} onChange={(e) => update({ url: e.target.value })} placeholder="https://….mp3" /><Button type="button" variant="outline" size="sm" className="shrink-0" onClick={() => upload((url) => update({ url }), "audio/*")}><Upload className="h-3.5 w-3.5" /></Button></div></div>
          <div><L>Title</L><Input value={block.text ?? ""} onChange={(e) => update({ text: e.target.value })} placeholder="The Stewardship Blueprint" /></div>
          <div className="grid grid-cols-2 gap-2">
            <div><L>Byline</L><Input value={block.author ?? ""} onChange={(e) => update({ author: e.target.value })} placeholder="Michael J. Gauthier" /></div>
            <div><L>Tags / subtitle</L><Input value={block.role ?? ""} onChange={(e) => update({ role: e.target.value })} placeholder="Faith · Stewardship" /></div>
          </div>
          <ColorField label="Accent color" value={block.accent ?? ""} onChange={(v) => update({ accent: v })} />
          <ColorField label="Control bar color" value={block.barColor ?? ""} onChange={(v) => update({ barColor: v })} />
          <ColorField label="Title color" value={block.textColor ?? ""} onChange={(v) => update({ textColor: v })} />
        </div>
      )}

      {block.type === "icon" && (
        <div className="space-y-2">
          <IconPicker value={block.icon} onChange={(id) => update({ icon: id })} style={(block.variant as IconStyle) || "line"} color={block.accent || block.buttonColor || "#315f43"} />
          <div className="grid grid-cols-2 gap-2">
            <div><L>Style</L><FieldSelect value={block.variant ?? "line"} onChange={(v) => update({ variant: v })} options={ICON_STYLES.map((s) => ({ value: s.value, label: s.label }))} className="h-8" /></div>
            <div><L>Container</L><FieldSelect value={block.iconShape ?? "circle"} onChange={(v) => update({ iconShape: v as CmsBlock["iconShape"] })} options={[{ value: "none", label: "None" }, { value: "square", label: "Square" }, { value: "circle", label: "Circle" }]} className="h-8" /></div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Num label="Icon size (px)" value={block.iconSize} onChange={(v) => update({ iconSize: v })} placeholder="30" />
            {block.iconShape === "square" && <Num label="Corner radius" value={block.radius} onChange={(v) => update({ radius: v })} placeholder="16" />}
          </div>
          <ColorField label="Icon color" value={block.accent ?? ""} onChange={(v) => update({ accent: v })} />
          <ColorField label="Container fill" value={block.iconBg ?? ""} onChange={(v) => update({ iconBg: v })} />
          <ColorField label="Outline color" value={block.iconOutline ?? ""} onChange={(v) => update({ iconOutline: v })} />
          <div><L>Label (optional)</L><Input value={block.text ?? ""} onChange={(e) => update({ text: e.target.value })} placeholder="Short label" /></div>
          <div><L>Caption (optional)</L><Textarea className="min-h-[44px]" value={block.subtext ?? ""} onChange={(e) => update({ subtext: e.target.value })} /></div>
        </div>
      )}

      {block.type === "html" && (
        <div className="space-y-1">
          <L>HTML</L>
          <Textarea value={block.html ?? ""} onChange={(e) => update({ html: e.target.value })} className="min-h-[140px] font-mono text-xs" />
          <p className="text-[10px] text-amber-600 dark:text-amber-400">Super-Admin only. Scripts and inline event handlers are stripped for safety.</p>
        </div>
      )}

      {block.type === "image" && (
        <div className="space-y-2">
          <div><L>Image URL</L><div className="flex gap-2"><Input value={block.url ?? ""} onChange={(e) => update({ url: e.target.value })} placeholder="https://…" /><Button type="button" variant="outline" size="sm" className="shrink-0" onClick={() => upload((url) => update({ url }))}><Upload className="h-3.5 w-3.5" /></Button></div></div>
          <div><L>Alt text</L><Input value={block.alt ?? ""} onChange={(e) => update({ alt: e.target.value })} /></div>
          <div className="grid grid-cols-3 gap-2">
            <Num label="Max width" value={block.maxWidth} onChange={(v) => update({ maxWidth: v })} placeholder="full" />
            <Num label="Max height" value={block.height} onChange={(v) => update({ height: v })} placeholder="auto" />
            <Num label="Radius" value={block.radius} onChange={(v) => update({ radius: v })} placeholder="8" />
          </div>
        </div>
      )}

      {block.type === "button" && (
        <div className="space-y-2">
          <div><L>Label</L><Input value={block.label ?? ""} onChange={(e) => update({ label: e.target.value })} /></div>
          <div><L>Link URL</L><Input value={block.url ?? ""} onChange={(e) => update({ url: e.target.value })} placeholder="https://…" /></div>
          <div className="grid grid-cols-2 gap-2"><Num label="Font size" value={block.fontSize} onChange={(v) => update({ fontSize: v })} placeholder="16" /><Num label="Radius" value={block.radius} onChange={(v) => update({ radius: v })} placeholder="6" /></div>
          <ColorField label="Button color" value={block.buttonColor ?? ""} onChange={(v) => update({ buttonColor: v })} />
          <ColorField label="Label color" value={block.textColor ?? ""} onChange={(v) => update({ textColor: v })} />
          <label className="flex items-center gap-1.5 text-[11px] text-muted-foreground"><input type="checkbox" checked={Boolean(block.newTab)} onChange={(e) => update({ newTab: e.target.checked })} /> Open in new tab</label>
        </div>
      )}

      {block.type === "divider" && (
        <div className="grid grid-cols-2 gap-2"><Num label="Thickness" value={block.borderWidth} onChange={(v) => update({ borderWidth: v })} placeholder="1" /><div><L>Style</L><FieldSelect value={block.borderStyle ?? "solid"} onChange={(v) => update({ borderStyle: v as CmsBlock["borderStyle"] })} options={[{ value: "solid", label: "Solid" }, { value: "dashed", label: "Dashed" }, { value: "dotted", label: "Dotted" }]} className="h-8" /></div></div>
      )}
      {block.type === "divider" && <ColorField label="Line color" value={block.borderColor ?? block.textColor ?? ""} onChange={(v) => update({ borderColor: v })} />}

      {(block.type === "image" || block.type === "button" || block.type === "video" || block.type === "audio" || block.type === "icon") && (
        <div><L>Alignment</L><FieldSelect value={block.align ?? "left"} onChange={(v) => update({ align: v as CmsBlock["align"] })} options={ALIGN_OPTS} className="h-8" /></div>
      )}

      {isTextType(block.type) && <TypographyFields block={block} update={update} />}
      <SpacingFields block={block} update={update} />
      {block.type !== "spacer" && <EffectsFields block={block} update={update} upload={upload} />}
    </div>
  );
}
