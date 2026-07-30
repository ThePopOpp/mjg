"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Plate, PlateContent, PlateElement, PlateLeaf, usePlateEditor, createPlatePlugin, useEditorRef, usePath } from "platejs/react";
import { toggleList } from "@platejs/list";
import { ColumnPlugin, ColumnItemPlugin } from "@platejs/layout/react";
import { insertColumnGroup } from "@platejs/layout";
import { TocPlugin, useTocElementState, useTocElement } from "@platejs/toc/react";
import {
  BoldPlugin, ItalicPlugin, UnderlinePlugin, StrikethroughPlugin, CodePlugin, HighlightPlugin,
  H1Plugin, H2Plugin, H3Plugin, BlockquotePlugin, HorizontalRulePlugin,
} from "@platejs/basic-nodes/react";
import { CodeBlockPlugin, CodeLinePlugin } from "@platejs/code-block/react";
import { LinkPlugin } from "@platejs/link/react";
import { ListPlugin, useListToolbarButton, useListToolbarButtonState } from "@platejs/list/react";
import { FontColorPlugin, FontBackgroundColorPlugin, FontSizePlugin, TextAlignPlugin } from "@platejs/basic-styles/react";
import { TablePlugin, TableRowPlugin, TableCellPlugin, TableCellHeaderPlugin } from "@platejs/table/react";
import { insertTable, insertTableRow, insertTableColumn, deleteTable } from "@platejs/table";
import { insertLink, upsertLink } from "@platejs/link";
import { ImagePlugin, VideoPlugin, AudioPlugin, FilePlugin } from "@platejs/media/react";
import { useDashboardActionToken } from "@/components/layout/dashboard-action-token";
import { BrandAudioPlayer } from "@/components/workspace/brand-audio-player";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import {
  Bold, Italic, Underline, Strikethrough, Code, Highlighter, Heading1, Heading2, Heading3,
  Quote, Minus, SquareCode, Link2, List, ListOrdered, AlignLeft, AlignCenter, AlignRight,
  Baseline, PaintBucket, Type, Table as TableIcon, Rows3, Columns3, Columns2, Trash2, Plus,
  Image as ImageIcon, Video, Music, Mic, FileCode2, Paperclip, AtSign, Smile, ListTree,
  Check, CheckSquare, CalendarDays, Boxes, ClipboardList, UserCircle, CalendarClock, ExternalLink,
  PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen,
} from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";
import { cn } from "@/lib/utils";

// Custom void block: render pasted HTML in a sandboxed frame (distinct from a code block).
const HtmlEmbedPlugin = createPlatePlugin({ key: "html_embed", node: { isElement: true, isVoid: true } });
// Custom checkbox (todo) block + inline date field. Components are defined further down.
const TodoItemPlugin = createPlatePlugin({ key: "todo_item", node: { isElement: true } });
const DateFieldPlugin = createPlatePlugin({ key: "date_field", node: { isElement: true, isInline: true, isVoid: true } });
// Inline card linking to an MJG record (plan / participant / booking).
const RecordLinkPlugin = createPlatePlugin({ key: "record_link", node: { isElement: true, isInline: true, isVoid: true } });

/* eslint-disable @typescript-eslint/no-explicit-any */
const PLUGINS = [
  BoldPlugin, ItalicPlugin, UnderlinePlugin, StrikethroughPlugin, CodePlugin, HighlightPlugin,
  H1Plugin, H2Plugin, H3Plugin, BlockquotePlugin, HorizontalRulePlugin,
  CodeBlockPlugin, CodeLinePlugin, LinkPlugin, ListPlugin,
  FontColorPlugin, FontBackgroundColorPlugin, FontSizePlugin, TextAlignPlugin,
  TablePlugin, TableRowPlugin, TableCellPlugin, TableCellHeaderPlugin,
  ImagePlugin, VideoPlugin, AudioPlugin, FilePlugin,
  ColumnPlugin, ColumnItemPlugin, HtmlEmbedPlugin, TocPlugin, TodoItemPlugin, DateFieldPlugin, RecordLinkPlugin,
];

// TOC element: lists the document's headings with click-to-scroll (from @platejs/toc).
function TocElement() {
  const state = useTocElementState();
  const btn: any = useTocElement(state as any);
  const onClick = btn?.props?.onClick;
  const headings: any[] = (state as any)?.headingList ?? [];
  return (
    <div contentEditable={false} className="my-3 rounded-md border bg-muted/30 p-3">
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Table of contents</p>
      {headings.length ? headings.map((h: any) => (
        <a key={h.id} onClick={(ev) => onClick?.(ev, h, "smooth")} style={{ paddingLeft: Math.max(0, (h.depth ?? 1) - 1) * 14 }} className="block cursor-pointer truncate rounded px-1 py-0.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground">{h.title}</a>
      )) : <p className="text-xs text-muted-foreground">Add headings (H1–H3) to build the outline.</p>}
    </div>
  );
}

const COMPONENTS: Record<string, any> = {
  [BoldPlugin.key]: (p: any) => <PlateLeaf {...p} as="strong" />,
  [ItalicPlugin.key]: (p: any) => <PlateLeaf {...p} as="em" />,
  [UnderlinePlugin.key]: (p: any) => <PlateLeaf {...p} as="u" />,
  [StrikethroughPlugin.key]: (p: any) => <PlateLeaf {...p} as="s" />,
  [CodePlugin.key]: (p: any) => <PlateLeaf {...p} as="code" className="rounded bg-muted px-1 py-0.5 font-mono text-[0.85em]" />,
  [HighlightPlugin.key]: (p: any) => <PlateLeaf {...p} as="mark" className="rounded bg-amber-200/70 dark:bg-amber-300/30" />,
  [H1Plugin.key]: (p: any) => <PlateElement {...p} as="h1" className="mt-6 mb-2 text-3xl font-bold tracking-tight" />,
  [H2Plugin.key]: (p: any) => <PlateElement {...p} as="h2" className="mt-5 mb-2 text-2xl font-semibold tracking-tight" />,
  [H3Plugin.key]: (p: any) => <PlateElement {...p} as="h3" className="mt-4 mb-1.5 text-xl font-semibold" />,
  [BlockquotePlugin.key]: (p: any) => <PlateElement {...p} as="blockquote" className="my-2 border-l-2 border-primary/40 pl-4 italic text-muted-foreground" />,
  [HorizontalRulePlugin.key]: (p: any) => <PlateElement {...p} as="div" className="py-2"><hr className="border-border" />{p.children}</PlateElement>,
  [CodeBlockPlugin.key]: (p: any) => <PlateElement {...p} as="pre" className="my-2 overflow-x-auto rounded-md bg-muted p-3 font-mono text-sm" />,
  [CodeLinePlugin.key]: (p: any) => <PlateElement {...p} as="div" />,
  [LinkPlugin.key]: ({ element, children, attributes }: any) => (
    <a
      {...attributes}
      href={element?.url}
      target="_blank"
      rel="noreferrer"
      onClick={() => { if (element?.url && typeof window !== "undefined") window.open(element.url, "_blank", "noopener,noreferrer"); }}
      className="cursor-pointer text-primary underline underline-offset-2"
    >{children}</a>
  ),
  [TocPlugin.key]: (p: any) => <PlateElement {...p}><TocElement />{p.children}</PlateElement>,
  [TodoItemPlugin.key]: TodoItem,
  [DateFieldPlugin.key]: DateField,
  [RecordLinkPlugin.key]: (p: any) => {
    const el = p.element ?? {};
    const Icon = el.recordType === "plan" ? ClipboardList : el.recordType === "participant" ? UserCircle : CalendarClock;
    return (
      <PlateElement {...p} as="span" className="mx-0.5 inline-block align-middle">
        <span contentEditable={false} className="inline-flex items-center gap-1.5 rounded-md border bg-card px-2 py-0.5 text-sm">
          <Icon className="h-3.5 w-3.5 text-primary" />
          <span className="font-medium">{el.label}</span>
          {el.sublabel ? <span className="text-xs text-muted-foreground">· {el.sublabel}</span> : null}
          <a href={el.href} title="Open record" onClick={(ev) => { ev.preventDefault(); if (el.href && typeof window !== "undefined") window.open(el.href, "_blank", "noopener,noreferrer"); }} className="ml-0.5 text-primary hover:text-primary/80"><ExternalLink className="h-3.5 w-3.5" /></a>
        </span>{p.children}
      </PlateElement>
    );
  },
  // Tables render as real HTML tables.
  [TablePlugin.key]: (p: any) => <PlateElement {...p} as="table" className="my-3 w-full table-fixed border-collapse overflow-hidden rounded-md border border-border text-sm" />,
  [TableRowPlugin.key]: (p: any) => <PlateElement {...p} as="tr" />,
  [TableCellPlugin.key]: (p: any) => <PlateElement {...p} as="td" className="border border-border px-2 py-1 align-top" />,
  [TableCellHeaderPlugin.key]: (p: any) => <PlateElement {...p} as="th" className="border border-border bg-muted px-2 py-1 text-left font-semibold" />,
  // Media (void nodes).
  [ImagePlugin.key]: (p: any) => <PlateElement {...p}><div contentEditable={false} className="my-2">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={p.element?.url} alt={p.element?.name || ""} className="max-h-[28rem] max-w-full rounded-md border" /></div>{p.children}</PlateElement>,
  [VideoPlugin.key]: (p: any) => <PlateElement {...p}><div contentEditable={false} className="my-2"><video controls src={p.element?.url} className="max-h-[28rem] max-w-full rounded-md border" /></div>{p.children}</PlateElement>,
  [AudioPlugin.key]: (p: any) => <PlateElement {...p}><div contentEditable={false} className="my-2"><BrandAudioPlayer src={p.element?.url} /></div>{p.children}</PlateElement>,
  [FilePlugin.key]: (p: any) => <PlateElement {...p}><div contentEditable={false} className="my-2"><a href={p.element?.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-md border bg-card px-3 py-2 text-sm text-primary hover:underline">📎 {p.element?.name || "Download file"}</a></div>{p.children}</PlateElement>,
  // Columns layout.
  [ColumnPlugin.key]: (p: any) => <PlateElement {...p} as="div" className="my-3 flex flex-col gap-4 md:flex-row" />,
  [ColumnItemPlugin.key]: (p: any) => <PlateElement {...p} as="div" className="min-w-0 flex-1 rounded-md border border-dashed border-border p-2" />,
  // HTML embed (sandboxed, script-disabled).
  [HtmlEmbedPlugin.key]: (p: any) => (
    <PlateElement {...p}>
      <div contentEditable={false} className="my-2 overflow-hidden rounded-md border">
        <iframe sandbox="allow-same-origin" title="HTML embed" className="h-[36rem] w-full bg-white" srcDoc={p.element?.html || "<p style='font-family:sans-serif;color:#888;padding:12px'>Empty HTML embed</p>"} />
      </div>{p.children}
    </PlateElement>
  ),
};

const TEXT_COLORS = ["inherit", "#1a1a1a", "#b45309", "#c2410c", "#dc2626", "#2563eb", "#6b7280"];
const HIGHLIGHT_COLORS = ["transparent", "#fef08a", "#fde68a", "#fed7aa", "#fbcfe8", "#bfdbfe", "#e5e7eb"];
const FONT_SIZES = [{ label: "S", value: "13px" }, { label: "M", value: "16px" }, { label: "L", value: "20px" }, { label: "XL", value: "28px" }];
const EMOJIS = ["😀","😁","😂","🤣","😊","😍","😎","🤔","👍","👏","🙏","🔥","✅","❌","⭐","💡","📌","📎","📝","📅","🎯","🚀","💬","❤️","⚠️","✨","👉","📣","🏆","🙌"];

function TBtn({ icon: Icon, title, active, onClick }: { icon: typeof Bold; title: string; active?: boolean; onClick: () => void }) {
  return (
    <button type="button" title={title} onMouseDown={(e) => { e.preventDefault(); onClick(); }} className={cn("rounded p-1.5 transition-colors hover:bg-accent hover:text-foreground", active ? "bg-accent text-foreground" : "text-muted-foreground")}>
      <Icon className="h-4 w-4" />
    </button>
  );
}
const Sep = () => <span className="mx-1 h-5 w-px shrink-0 bg-border" />;

// Lists use the plugin hooks (correct v53 toggling + selection handling).
function ListBtn({ nodeType, icon: Icon, title }: { nodeType: string; icon: typeof List; title: string }) {
  const state = useListToolbarButtonState({ nodeType });
  const btn: any = useListToolbarButton(state);
  const props = btn?.props ?? btn ?? {};
  return <button type="button" title={title} {...props} className={cn("rounded p-1.5 transition-colors hover:bg-accent hover:text-foreground", props?.pressed ? "bg-accent text-foreground" : "text-muted-foreground")}><Icon className="h-4 w-4" /></button>;
}
// Custom checkbox item: click toggles `checked` and strikes through the text.
function TodoItem(props: any) {
  const editor = useEditorRef();
  const path = usePath();
  const checked = !!props.element?.checked;
  return (
    <PlateElement {...props} as="div" className="my-0.5 flex items-start gap-2">
      <span contentEditable={false} className="mt-1 shrink-0 select-none">
        <button
          type="button"
          onMouseDown={(ev) => { ev.preventDefault(); try { (editor as any).tf?.setNodes?.({ checked: !checked }, { at: path }); } catch { /* no-op */ } }}
          className={cn("flex h-4 w-4 items-center justify-center rounded border transition-colors", checked ? "border-primary bg-primary text-primary-foreground" : "border-input hover:border-primary")}
          aria-label={checked ? "Uncheck" : "Check"}
        >{checked ? <Check className="h-3 w-3" /> : null}</button>
      </span>
      <span className={cn("min-w-0 flex-1", checked && "text-muted-foreground line-through")}>{props.children}</span>
    </PlateElement>
  );
}

// Inline date field: click to pick a date; stored on the node.
function DateField(props: any) {
  const editor = useEditorRef();
  const path = usePath();
  const date = props.element?.date ?? "";
  return (
    <PlateElement {...props} as="span" className="mx-0.5 inline-block align-middle">
      <span contentEditable={false}>
        <DatePicker value={date} onChange={(v) => { try { (editor as any).tf?.setNodes?.({ date: v }, { at: path }); } catch { /* no-op */ } }} placeholder="Pick a date" className="h-7 w-auto min-w-[8.5rem] px-2 text-xs" />
      </span>
      {props.children}
    </PlateElement>
  );
}

// Inline swatch menu — buttons preventDefault so the editor selection is preserved.
function ColorMenu({ icon: Icon, title, colors, onPick }: { icon: typeof Baseline; title: string; colors: string[]; onPick: (c: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative">
      <TBtn icon={Icon} title={title} onClick={() => setOpen((o) => !o)} />
      {open ? (
        <div className="absolute left-0 z-20 mt-1 flex gap-1 rounded-md border bg-popover p-2 shadow-md" onMouseDown={(e) => e.preventDefault()}>
          {colors.map((c) => (
            <button key={c} type="button" title={c} onMouseDown={(e) => { e.preventDefault(); onPick(c); setOpen(false); }} className="h-5 w-5 rounded border" style={{ background: c === "inherit" || c === "transparent" ? "linear-gradient(135deg,#fff 45%,#e11d48 45% 55%,#fff 55%)" : c }} />
          ))}
        </div>
      ) : null}
    </span>
  );
}

// Upload via the shared endpoint, then insert a media (void) node with the URL.
function MediaButton({ editor, actionToken, nodeType, accept, icon, title }: { editor: any; actionToken: string; nodeType: string; accept: string; icon: typeof ImageIcon; title: string }) {
  const ref = useRef<HTMLInputElement>(null);
  async function onPick(f: File) {
    const fd = new FormData();
    fd.append("file", f);
    fd.append("folder", "workspace");
    try {
      const res = await fetch("/api/admin/uploads", { method: "POST", headers: { "x-mjg-action-token": actionToken }, body: fd });
      const data = await res.json();
      if (res.ok && data.url) editor.tf?.insertNodes?.([{ type: nodeType, url: data.url, name: f.name, children: [{ text: "" }] }]);
    } catch { /* no-op */ }
  }
  return (
    <span>
      <input ref={ref} type="file" accept={accept} className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onPick(f); e.target.value = ""; }} />
      <TBtn icon={icon} title={title} onClick={() => ref.current?.click()} />
    </span>
  );
}

type Cmd = { label: string; keywords?: string; icon: typeof Type; run: () => void };

// Self-contained insert menu (own search + keyboard nav). Opened by "/" on an empty
// line or the + button. It never inserts a slash node, so normal "/" typing is safe.
function CommandMenu({ open, pos, commands, onClose }: { open: boolean; pos: { top: number; left: number }; commands: Cmd[]; onClose: () => void }) {
  const [q, setQ] = useState("");
  const [i, setI] = useState(0);
  useEffect(() => { if (open) { setQ(""); setI(0); } }, [open]);
  const filtered = useMemo(() => commands.filter((c) => `${c.label} ${c.keywords ?? ""}`.toLowerCase().includes(q.trim().toLowerCase())), [commands, q]);
  useEffect(() => { setI(0); }, [q]);
  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 z-40" onMouseDown={(e) => { e.preventDefault(); onClose(); }} />
      <div className="fixed z-50 w-64 rounded-md border bg-popover p-1 text-popover-foreground shadow-md" style={{ top: pos.top, left: pos.left }} onMouseDown={(e) => e.preventDefault()}>
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search blocks…"
          className="mb-1 w-full rounded border bg-background px-2 py-1 text-sm focus:outline-none"
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") { e.preventDefault(); setI((x) => Math.min(x + 1, filtered.length - 1)); }
            else if (e.key === "ArrowUp") { e.preventDefault(); setI((x) => Math.max(x - 1, 0)); }
            else if (e.key === "Enter") { e.preventDefault(); filtered[i]?.run(); onClose(); }
            else if (e.key === "Escape") { e.preventDefault(); onClose(); }
          }}
        />
        <ul className="max-h-64 overflow-y-auto">
          {filtered.length ? filtered.map((c, idx) => (
            <li key={c.label}>
              <button type="button" onMouseDown={(e) => { e.preventDefault(); c.run(); onClose(); }} className={cn("flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm", idx === i ? "bg-accent text-foreground" : "hover:bg-accent")}>
                <c.icon className="h-4 w-4 text-muted-foreground" /> {c.label}
              </button>
            </li>
          )) : <li className="px-2 py-2 text-xs text-muted-foreground">No matching blocks</li>}
        </ul>
      </div>
    </>
  );
}

// Record audio in-browser, then upload + hand back a URL to insert as an audio block.
function RecorderDialog({ open, onOpenChange, actionToken, onInsert }: { open: boolean; onOpenChange: (v: boolean) => void; actionToken: string; onInsert: (url: string) => void }) {
  const [status, setStatus] = useState<"idle" | "recording" | "recorded" | "uploading">("idle");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const mr = useRef<any>(null);
  const chunks = useRef<Blob[]>([]);
  const blob = useRef<Blob | null>(null);

  function reset() { setStatus("idle"); setPreviewUrl(null); blob.current = null; chunks.current = []; }
  async function start() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new (window as any).MediaRecorder(stream);
      chunks.current = [];
      rec.ondataavailable = (e: any) => { if (e.data.size) chunks.current.push(e.data); };
      rec.onstop = () => { const b = new Blob(chunks.current, { type: "audio/webm" }); blob.current = b; setPreviewUrl(URL.createObjectURL(b)); setStatus("recorded"); stream.getTracks().forEach((t: any) => t.stop()); };
      mr.current = rec; rec.start(); setStatus("recording");
    } catch { setStatus("idle"); }
  }
  function stop() { try { mr.current?.stop(); } catch { /* no-op */ } }
  async function insert() {
    if (!blob.current) return;
    setStatus("uploading");
    try {
      const fd = new FormData();
      fd.append("file", new File([blob.current], `recording-${Date.now()}.webm`, { type: "audio/webm" }));
      fd.append("folder", "workspace");
      const res = await fetch("/api/admin/uploads", { method: "POST", headers: { "x-mjg-action-token": actionToken }, body: fd });
      const data = await res.json();
      if (res.ok && data.url) { onInsert(data.url); onOpenChange(false); reset(); } else setStatus("recorded");
    } catch { setStatus("recorded"); }
  }
  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent>
        <DialogHeader><DialogTitle>Record audio</DialogTitle><DialogDescription>Record a voice note, preview it, then insert it into the document.</DialogDescription></DialogHeader>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            {status === "recording" ? (
              <Button variant="destructive" onClick={stop}>■ Stop</Button>
            ) : (
              <Button onClick={start} disabled={status === "uploading"}><Mic className="mr-2 h-4 w-4" /> {status === "recorded" ? "Re-record" : "Record"}</Button>
            )}
            {status === "recording" ? <span className="text-sm text-muted-foreground">Recording…</span> : null}
          </div>
          {previewUrl ? <audio controls src={previewUrl} className="w-full" /> : null}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => { reset(); onOpenChange(false); }}>Cancel</Button>
          <Button onClick={insert} disabled={!blob.current || status === "uploading"}>{status === "uploading" ? "Inserting…" : "Insert"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function HtmlEmbedDialog({ open, onOpenChange, onInsert }: { open: boolean; onOpenChange: (v: boolean) => void; onInsert: (html: string) => void }) {
  const [html, setHtml] = useState("");
  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) setHtml(""); onOpenChange(v); }}>
      <DialogContent>
        <DialogHeader><DialogTitle>HTML embed</DialogTitle><DialogDescription>Paste HTML to render it in the document (scripts are disabled for safety).</DialogDescription></DialogHeader>
        <Textarea rows={8} value={html} onChange={(e) => setHtml(e.target.value)} placeholder="<div>…</div>" className="font-mono text-xs" />
        <DialogFooter>
          <Button variant="outline" onClick={() => { setHtml(""); onOpenChange(false); }}>Cancel</Button>
          <Button onClick={() => { if (html.trim()) { onInsert(html); setHtml(""); onOpenChange(false); } }} disabled={!html.trim()}>Insert</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RecordPickerDialog({ open, onOpenChange, onInsert }: { open: boolean; onOpenChange: (v: boolean) => void; onInsert: (r: any) => void }) {
  const [type, setType] = useState("plan");
  const [q, setQ] = useState("");
  const [results, setResults] = useState<any[]>([]);
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(async () => {
      try { const res = await fetch(`/api/workspace/records?type=${type}&q=${encodeURIComponent(q)}`); const data = await res.json(); setResults(res.ok ? data.results : []); } catch { setResults([]); }
    }, 250);
    return () => clearTimeout(t);
  }, [open, type, q]);
  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { setQ(""); setResults([]); } onOpenChange(v); }}>
      <DialogContent>
        <DialogHeader><DialogTitle>Link a record</DialogTitle><DialogDescription>Insert a live card linking this document to an MJG record.</DialogDescription></DialogHeader>
        <div className="flex gap-2">
          <Select value={type} onValueChange={(v) => { setType(v); setResults([]); }}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="plan">Plan</SelectItem><SelectItem value="participant">Client</SelectItem><SelectItem value="booking">Booking</SelectItem></SelectContent>
          </Select>
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" />
        </div>
        <ul className="max-h-64 divide-y overflow-y-auto rounded-md border">
          {results.length ? results.map((r) => (
            <li key={`${r.recordType}-${r.recordId}`}>
              <button type="button" onClick={() => { onInsert(r); onOpenChange(false); setQ(""); }} className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-accent">
                <span className="truncate font-medium">{r.label}</span>{r.sublabel ? <span className="shrink-0 text-xs text-muted-foreground">{r.sublabel}</span> : null}
              </button>
            </li>
          )) : <li className="px-3 py-4 text-center text-xs text-muted-foreground">No records found.</li>}
        </ul>
      </DialogContent>
    </Dialog>
  );
}

export function WorkspaceEditorSurface({
  initialValue, onChange, titleSlot, statusSlot, left, right, mentionUsers = [],
}: {
  initialValue: any;
  onChange: (value: any) => void;
  titleSlot?: React.ReactNode;
  statusSlot?: React.ReactNode;
  left?: React.ReactNode;
  right?: React.ReactNode;
  mentionUsers?: { id: string; name: string }[];
}) {
  const value = useMemo(() => (Array.isArray(initialValue) && initialValue.length ? initialValue : [{ type: "p", children: [{ text: "" }] }]), [initialValue]);
  const editor = usePlateEditor({ plugins: PLUGINS, components: COMPONENTS, value });
  const actionToken = useDashboardActionToken();
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [sizeOpen, setSizeOpen] = useState(false);

  const toggle = (key: string) => { try { (editor.tf as any)?.[key]?.toggle?.(); } catch { /* no-op */ } };
  const setMark = (key: string, val: string) => { try { (editor.tf as any)?.addMark?.(key, val); } catch { /* no-op */ } };
  const setAlign = (val: string) => { try { (editor.tf as any)?.setNodes?.({ [TextAlignPlugin.key]: val }, { match: (n: any) => !!n?.type }); } catch { /* no-op */ } };
  const e = editor as any;
  const doInsertLink = () => {
    const url = typeof window !== "undefined" ? window.prompt("Link URL (https://…)") : null;
    if (!url) return;
    // Selected text → wrap it in a link (upsertLink). No selection → insert the URL as a link.
    const sel = typeof window !== "undefined" ? window.getSelection() : null;
    const hasSelection = !!sel && !sel.isCollapsed && sel.toString().length > 0;
    try {
      if (hasSelection) upsertLink(e, { url });
      else insertLink(e, { url, text: url });
    } catch { /* no-op */ }
  };
  const doInsertTable = () => { try { insertTable(e, { rowCount: 3, colCount: 3 }); } catch { /* no-op */ } };
  const doAddRow = () => { try { insertTableRow(e); } catch { /* no-op */ } };
  const doAddCol = () => { try { insertTableColumn(e); } catch { /* no-op */ } };
  const doDeleteTable = () => { try { deleteTable(e); } catch { /* no-op */ } };
  const insertCodeBlock = () => { try { e.tf?.insertNodes?.({ type: CodeBlockPlugin.key, children: [{ type: CodeLinePlugin.key, children: [{ text: "" }] }] }); } catch { /* no-op */ } };
  const insertDivider = () => { try { e.tf?.insertNodes?.({ type: HorizontalRulePlugin.key, children: [{ text: "" }] }); } catch { /* no-op */ } };
  const insertColumns = () => { try { insertColumnGroup(e, { columns: 2 }); } catch { /* no-op */ } };
  const insertHtml = (html: string) => { try { e.tf?.insertNodes?.({ type: HtmlEmbedPlugin.key, html, children: [{ text: "" }] }); } catch { /* no-op */ } };
  const insertRecordedAudio = (url: string) => { try { e.tf?.insertNodes?.({ type: AudioPlugin.key, url, children: [{ text: "" }] }); } catch { /* no-op */ } };
  const insertToc = () => { try { e.tf?.insertNodes?.({ type: TocPlugin.key, children: [{ text: "" }] }); } catch { /* no-op */ } };
  const makeTodo = () => { try { e.tf?.setNodes?.({ type: TodoItemPlugin.key, checked: false }, { match: (n: any) => !!n?.type && !("text" in n), mode: "lowest" }); } catch { /* no-op */ } };
  const insertDate = () => { try { e.tf?.insertNodes?.({ type: DateFieldPlugin.key, date: null, children: [{ text: "" }] }); } catch { /* no-op */ } };
  const insertRecordLink = (r: any) => { try { e.tf?.insertNodes?.({ type: RecordLinkPlugin.key, recordType: r.recordType, recordId: r.recordId, label: r.label, sublabel: r.sublabel, href: r.href, children: [{ text: "" }] }); } catch { /* no-op */ } };
  const insertText = (t: string) => { try { e.tf?.insertText?.(t); } catch { /* no-op */ } };
  const [htmlOpen, setHtmlOpen] = useState(false);
  const [recorderOpen, setRecorderOpen] = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [recordOpen, setRecordOpen] = useState(false);

  const [menu, setMenu] = useState<{ open: boolean; top: number; left: number; cmds: Cmd[] }>({ open: false, top: 0, left: 0, cmds: [] });
  const openMenu = (top: number, left: number, cmds: Cmd[]) => setMenu({ open: true, top, left, cmds });
  const closeMenu = () => setMenu((m) => ({ ...m, open: false }));
  const list = (listStyleType: string) => { try { toggleList(editor as any, { listStyleType } as any); } catch { /* no-op */ } };
  const commands: Cmd[] = [
    { label: "Text", keywords: "paragraph body", icon: Type, run: () => { try { (editor.tf as any)?.setNodes?.({ type: "p" }, { match: (n: any) => !!n?.type }); } catch { /* no-op */ } } },
    { label: "Heading 1", keywords: "h1 title", icon: Heading1, run: () => toggle(H1Plugin.key) },
    { label: "Heading 2", keywords: "h2", icon: Heading2, run: () => toggle(H2Plugin.key) },
    { label: "Heading 3", keywords: "h3", icon: Heading3, run: () => toggle(H3Plugin.key) },
    { label: "Bulleted list", keywords: "ul unordered", icon: List, run: () => list("disc") },
    { label: "Numbered list", keywords: "ol ordered", icon: ListOrdered, run: () => list("decimal") },
    { label: "Checklist", keywords: "todo task checkbox", icon: CheckSquare, run: makeTodo },
    { label: "Date", keywords: "date calendar deadline due", icon: CalendarDays, run: insertDate },
    { label: "Quote", keywords: "blockquote", icon: Quote, run: () => toggle(BlockquotePlugin.key) },
    { label: "Code block", keywords: "code snippet", icon: SquareCode, run: insertCodeBlock },
    { label: "Table", keywords: "grid", icon: TableIcon, run: doInsertTable },
    { label: "Table of contents", keywords: "toc outline headings", icon: ListTree, run: insertToc },
    { label: "Link a record", keywords: "plan client booking record link mjg", icon: Boxes, run: () => setRecordOpen(true) },
    { label: "Columns", keywords: "layout two column split", icon: Columns2, run: insertColumns },
    { label: "HTML embed", keywords: "html iframe render", icon: FileCode2, run: () => setHtmlOpen(true) },
    { label: "Record audio", keywords: "voice mic recorder", icon: Mic, run: () => setRecorderOpen(true) },
    { label: "Emoji", keywords: "emoji icon smiley", icon: Smile, run: () => setEmojiOpen(true) },
    { label: "Divider", keywords: "hr line separator", icon: Minus, run: insertDivider },
  ];
  const mentionCommands: Cmd[] = mentionUsers.map((u) => ({ label: `@${u.name}`, keywords: u.name, icon: AtSign, run: () => insertText(`@${u.name} `) }));

  return (
    <Plate editor={editor} onChange={({ value }: any) => onChange(value)}>
      <div className="sticky top-16 z-20 flex flex-wrap items-center gap-0.5 rounded-md border bg-card p-1 shadow-sm">
        <TBtn icon={leftOpen ? PanelLeftClose : PanelLeftOpen} title={leftOpen ? "Hide files" : "Show files"} onClick={() => setLeftOpen((o) => !o)} />
        <Sep />
        <button type="button" title="Insert block" onMouseDown={(ev) => { ev.preventDefault(); const r = (ev.currentTarget as HTMLElement).getBoundingClientRect(); openMenu(r.bottom + 4, r.left, commands); }} className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"><Plus className="h-4 w-4" /></button>
        <Sep />
        <TBtn icon={Bold} title="Bold" onClick={() => toggle(BoldPlugin.key)} />
        <TBtn icon={Italic} title="Italic" onClick={() => toggle(ItalicPlugin.key)} />
        <TBtn icon={Underline} title="Underline" onClick={() => toggle(UnderlinePlugin.key)} />
        <TBtn icon={Strikethrough} title="Strikethrough" onClick={() => toggle(StrikethroughPlugin.key)} />
        <TBtn icon={Code} title="Inline code" onClick={() => toggle(CodePlugin.key)} />
        <TBtn icon={Highlighter} title="Highlight" onClick={() => toggle(HighlightPlugin.key)} />
        <ColorMenu icon={Baseline} title="Text color" colors={TEXT_COLORS} onPick={(c) => setMark(FontColorPlugin.key, c)} />
        <ColorMenu icon={PaintBucket} title="Background color" colors={HIGHLIGHT_COLORS} onPick={(c) => setMark(FontBackgroundColorPlugin.key, c)} />
        <span className="relative">
          <TBtn icon={Type} title="Font size" onClick={() => setSizeOpen((o) => !o)} />
          {sizeOpen ? (
            <div className="absolute left-0 z-20 mt-1 flex gap-1 rounded-md border bg-popover p-1 shadow-md" onMouseDown={(e) => e.preventDefault()}>
              {FONT_SIZES.map((s) => <button key={s.value} type="button" onMouseDown={(e) => { e.preventDefault(); setMark(FontSizePlugin.key, s.value); setSizeOpen(false); }} className="rounded px-2 py-1 text-xs hover:bg-accent">{s.label}</button>)}
            </div>
          ) : null}
        </span>
        <Sep />
        <TBtn icon={Heading1} title="Heading 1" onClick={() => toggle(H1Plugin.key)} />
        <TBtn icon={Heading2} title="Heading 2" onClick={() => toggle(H2Plugin.key)} />
        <TBtn icon={Heading3} title="Heading 3" onClick={() => toggle(H3Plugin.key)} />
        <TBtn icon={Quote} title="Quote" onClick={() => toggle(BlockquotePlugin.key)} />
        <Sep />
        <ListBtn nodeType="disc" icon={List} title="Bulleted list" />
        <ListBtn nodeType="decimal" icon={ListOrdered} title="Numbered list" />
        <TBtn icon={CheckSquare} title="Checklist (checkbox)" onClick={makeTodo} />
        <TBtn icon={CalendarDays} title="Insert date" onClick={insertDate} />
        <TBtn icon={Boxes} title="Link a record (Plan / Client / Booking)" onClick={() => setRecordOpen(true)} />
        <Sep />
        <TBtn icon={AlignLeft} title="Align left" onClick={() => setAlign("left")} />
        <TBtn icon={AlignCenter} title="Align center" onClick={() => setAlign("center")} />
        <TBtn icon={AlignRight} title="Align right" onClick={() => setAlign("right")} />
        <Sep />
        <TBtn icon={TableIcon} title="Insert table" onClick={doInsertTable} />
        <TBtn icon={Rows3} title="Add row" onClick={doAddRow} />
        <TBtn icon={Columns3} title="Add column" onClick={doAddCol} />
        <TBtn icon={Trash2} title="Delete table" onClick={doDeleteTable} />
        <Sep />
        <MediaButton editor={editor} actionToken={actionToken} nodeType={ImagePlugin.key} accept="image/*" icon={ImageIcon} title="Insert image" />
        <MediaButton editor={editor} actionToken={actionToken} nodeType={VideoPlugin.key} accept="video/*" icon={Video} title="Insert video" />
        <MediaButton editor={editor} actionToken={actionToken} nodeType={AudioPlugin.key} accept="audio/*" icon={Music} title="Insert audio" />
        <MediaButton editor={editor} actionToken={actionToken} nodeType={FilePlugin.key} accept="application/pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.csv" icon={Paperclip} title="Insert document" />
        <TBtn icon={Mic} title="Record audio" onClick={() => setRecorderOpen(true)} />
        <Sep />
        <button type="button" title="Mention someone" onMouseDown={(ev) => { ev.preventDefault(); if (!mentionCommands.length) return; const r = (ev.currentTarget as HTMLElement).getBoundingClientRect(); openMenu(r.bottom + 4, r.left, mentionCommands); }} className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"><AtSign className="h-4 w-4" /></button>
        <span className="relative">
          <TBtn icon={Smile} title="Emoji" onClick={() => setEmojiOpen((o) => !o)} />
          {emojiOpen ? (
            <div className="absolute left-0 z-20 mt-1 grid w-56 grid-cols-8 gap-0.5 rounded-md border bg-popover p-2 shadow-md" onMouseDown={(ev) => ev.preventDefault()}>
              {EMOJIS.map((em) => <button key={em} type="button" onMouseDown={(ev) => { ev.preventDefault(); insertText(em); setEmojiOpen(false); }} className="rounded p-1 text-lg hover:bg-accent">{em}</button>)}
            </div>
          ) : null}
        </span>
        <TBtn icon={ListTree} title="Table of contents" onClick={insertToc} />
        <Sep />
        <TBtn icon={Columns2} title="Columns" onClick={insertColumns} />
        <TBtn icon={FileCode2} title="HTML embed" onClick={() => setHtmlOpen(true)} />
        <Sep />
        <TBtn icon={SquareCode} title="Code block" onClick={insertCodeBlock} />
        <TBtn icon={Link2} title="Insert link" onClick={doInsertLink} />
        <TBtn icon={Minus} title="Divider" onClick={insertDivider} />
        <div className="ml-auto flex items-center gap-1">
          {statusSlot}
          <TBtn icon={rightOpen ? PanelRightClose : PanelRightOpen} title={rightOpen ? "Hide panel" : "Show panel"} onClick={() => setRightOpen((o) => !o)} />
        </div>
      </div>

      <div className="mt-3 flex gap-3">
        {left && leftOpen ? <aside className="sticky top-16 hidden max-h-[calc(100vh-6rem)] w-56 shrink-0 self-start overflow-y-auto lg:block">{left}</aside> : null}
        <div className="min-w-0 flex-1">
          {titleSlot}
          <PlateContent
            className={cn("min-h-[62vh] rounded-md border bg-background px-4 py-3 text-[15px] leading-7 focus:outline-none [&_p]:my-1.5")}
            placeholder="Start writing… type / for blocks, or use Markdown (# heading, > quote, ** bold, ` code)"
            onKeyDown={(ev: any) => {
              const sel = typeof window !== "undefined" ? window.getSelection() : null;
              if (!sel || !sel.isCollapsed) return;
              const rect = () => (sel.rangeCount ? sel.getRangeAt(0).getBoundingClientRect() : null);
              // "/" on an empty line → block insert menu.
              if (ev.key === "/") {
                if ((sel.anchorNode?.textContent ?? "") === "") {
                  ev.preventDefault();
                  const r = rect();
                  openMenu((r?.bottom ?? 220) + 4, r?.left ?? 240, commands);
                }
              } else if (ev.key === "@" && mentionCommands.length) {
                // "@" after whitespace / at line start → mention picker (emails keep typing).
                const before = (sel.anchorNode?.textContent ?? "").slice(0, sel.anchorOffset ?? 0);
                if (before === "" || /\s$/.test(before)) {
                  ev.preventDefault();
                  const r = rect();
                  openMenu((r?.bottom ?? 220) + 4, r?.left ?? 240, mentionCommands);
                }
              }
            }}
          />
        </div>
        {right && rightOpen ? <aside className="sticky top-16 hidden max-h-[calc(100vh-6rem)] w-72 shrink-0 self-start overflow-y-auto xl:block">{right}</aside> : null}
      </div>
      <CommandMenu open={menu.open} pos={{ top: menu.top, left: menu.left }} commands={menu.cmds} onClose={closeMenu} />
      <HtmlEmbedDialog open={htmlOpen} onOpenChange={setHtmlOpen} onInsert={insertHtml} />
      <RecorderDialog open={recorderOpen} onOpenChange={setRecorderOpen} actionToken={actionToken} onInsert={insertRecordedAudio} />
      <RecordPickerDialog open={recordOpen} onOpenChange={setRecordOpen} onInsert={insertRecordLink} />
    </Plate>
  );
}
