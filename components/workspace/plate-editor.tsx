"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Plate, PlateContent, PlateElement, PlateLeaf, usePlateEditor } from "platejs/react";
import { toggleList } from "@platejs/list";
import {
  BoldPlugin, ItalicPlugin, UnderlinePlugin, StrikethroughPlugin, CodePlugin, HighlightPlugin,
  H1Plugin, H2Plugin, H3Plugin, BlockquotePlugin, HorizontalRulePlugin,
} from "@platejs/basic-nodes/react";
import { CodeBlockPlugin, CodeLinePlugin } from "@platejs/code-block/react";
import { LinkPlugin } from "@platejs/link/react";
import { ListPlugin, useListToolbarButton, useListToolbarButtonState, useIndentTodoToolBarButton, useIndentTodoToolBarButtonState } from "@platejs/list/react";
import { FontColorPlugin, FontBackgroundColorPlugin, FontSizePlugin, TextAlignPlugin } from "@platejs/basic-styles/react";
import { TablePlugin, TableRowPlugin, TableCellPlugin, TableCellHeaderPlugin } from "@platejs/table/react";
import { insertTable, insertTableRow, insertTableColumn, deleteTable } from "@platejs/table";
import { insertLink } from "@platejs/link";
import { ImagePlugin, VideoPlugin, AudioPlugin, FilePlugin } from "@platejs/media/react";
import { useDashboardActionToken } from "@/components/layout/dashboard-action-token";
import {
  Bold, Italic, Underline, Strikethrough, Code, Highlighter, Heading1, Heading2, Heading3,
  Quote, Minus, SquareCode, Link2, List, ListOrdered, ListChecks, AlignLeft, AlignCenter, AlignRight,
  Baseline, PaintBucket, Type, Table as TableIcon, Rows3, Columns3, Trash2, Plus,
  Image as ImageIcon, Video, Music, Paperclip, PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* eslint-disable @typescript-eslint/no-explicit-any */
const PLUGINS = [
  BoldPlugin, ItalicPlugin, UnderlinePlugin, StrikethroughPlugin, CodePlugin, HighlightPlugin,
  H1Plugin, H2Plugin, H3Plugin, BlockquotePlugin, HorizontalRulePlugin,
  CodeBlockPlugin, CodeLinePlugin, LinkPlugin, ListPlugin,
  FontColorPlugin, FontBackgroundColorPlugin, FontSizePlugin, TextAlignPlugin,
  TablePlugin, TableRowPlugin, TableCellPlugin, TableCellHeaderPlugin,
  ImagePlugin, VideoPlugin, AudioPlugin, FilePlugin,
];

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
    <a {...attributes} href={element?.url} target="_blank" rel="noreferrer" className="text-primary underline underline-offset-2">{children}</a>
  ),
  // Tables render as real HTML tables.
  [TablePlugin.key]: (p: any) => <PlateElement {...p} as="table" className="my-3 w-full table-fixed border-collapse overflow-hidden rounded-md border border-border text-sm" />,
  [TableRowPlugin.key]: (p: any) => <PlateElement {...p} as="tr" />,
  [TableCellPlugin.key]: (p: any) => <PlateElement {...p} as="td" className="border border-border px-2 py-1 align-top" />,
  [TableCellHeaderPlugin.key]: (p: any) => <PlateElement {...p} as="th" className="border border-border bg-muted px-2 py-1 text-left font-semibold" />,
  // Media (void nodes).
  [ImagePlugin.key]: (p: any) => <PlateElement {...p}><div contentEditable={false} className="my-2">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={p.element?.url} alt={p.element?.name || ""} className="max-h-[28rem] max-w-full rounded-md border" /></div>{p.children}</PlateElement>,
  [VideoPlugin.key]: (p: any) => <PlateElement {...p}><div contentEditable={false} className="my-2"><video controls src={p.element?.url} className="max-h-[28rem] max-w-full rounded-md border" /></div>{p.children}</PlateElement>,
  [AudioPlugin.key]: (p: any) => <PlateElement {...p}><div contentEditable={false} className="my-2"><audio controls src={p.element?.url} className="w-full" /></div>{p.children}</PlateElement>,
  [FilePlugin.key]: (p: any) => <PlateElement {...p}><div contentEditable={false} className="my-2"><a href={p.element?.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-md border bg-card px-3 py-2 text-sm text-primary hover:underline">📎 {p.element?.name || "Download file"}</a></div>{p.children}</PlateElement>,
};

const TEXT_COLORS = ["inherit", "#1a1a1a", "#b45309", "#c2410c", "#dc2626", "#2563eb", "#6b7280"];
const HIGHLIGHT_COLORS = ["transparent", "#fef08a", "#fde68a", "#fed7aa", "#fbcfe8", "#bfdbfe", "#e5e7eb"];
const FONT_SIZES = [{ label: "S", value: "13px" }, { label: "M", value: "16px" }, { label: "L", value: "20px" }, { label: "XL", value: "28px" }];

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
function TodoBtn() {
  const state = useIndentTodoToolBarButtonState();
  const btn: any = useIndentTodoToolBarButton(state);
  const props = btn?.props ?? btn ?? {};
  return <button type="button" title="Checklist" {...props} className={cn("rounded p-1.5 transition-colors hover:bg-accent hover:text-foreground", props?.pressed ? "bg-accent text-foreground" : "text-muted-foreground")}><ListChecks className="h-4 w-4" /></button>;
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

export function WorkspaceEditorSurface({
  initialValue, onChange, titleSlot, statusSlot, left, right,
}: {
  initialValue: any;
  onChange: (value: any) => void;
  titleSlot?: React.ReactNode;
  statusSlot?: React.ReactNode;
  left?: React.ReactNode;
  right?: React.ReactNode;
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
  const doInsertLink = () => { const url = typeof window !== "undefined" ? window.prompt("Link URL (https://…)") : null; if (url) { try { insertLink(e, { url }); } catch { /* no-op */ } } };
  const doInsertTable = () => { try { insertTable(e, { rowCount: 3, colCount: 3 }); } catch { /* no-op */ } };
  const doAddRow = () => { try { insertTableRow(e); } catch { /* no-op */ } };
  const doAddCol = () => { try { insertTableColumn(e); } catch { /* no-op */ } };
  const doDeleteTable = () => { try { deleteTable(e); } catch { /* no-op */ } };
  const insertCodeBlock = () => { try { e.tf?.insertNodes?.({ type: CodeBlockPlugin.key, children: [{ type: CodeLinePlugin.key, children: [{ text: "" }] }] }); } catch { /* no-op */ } };
  const insertDivider = () => { try { e.tf?.insertNodes?.({ type: HorizontalRulePlugin.key, children: [{ text: "" }] }); } catch { /* no-op */ } };

  const [menu, setMenu] = useState<{ open: boolean; top: number; left: number }>({ open: false, top: 0, left: 0 });
  const openMenu = (top: number, left: number) => setMenu({ open: true, top, left });
  const closeMenu = () => setMenu((m) => ({ ...m, open: false }));
  const list = (listStyleType: string) => { try { toggleList(editor as any, { listStyleType } as any); } catch { /* no-op */ } };
  const commands: Cmd[] = [
    { label: "Text", keywords: "paragraph body", icon: Type, run: () => { try { (editor.tf as any)?.setNodes?.({ type: "p" }, { match: (n: any) => !!n?.type }); } catch { /* no-op */ } } },
    { label: "Heading 1", keywords: "h1 title", icon: Heading1, run: () => toggle(H1Plugin.key) },
    { label: "Heading 2", keywords: "h2", icon: Heading2, run: () => toggle(H2Plugin.key) },
    { label: "Heading 3", keywords: "h3", icon: Heading3, run: () => toggle(H3Plugin.key) },
    { label: "Bulleted list", keywords: "ul unordered", icon: List, run: () => list("disc") },
    { label: "Numbered list", keywords: "ol ordered", icon: ListOrdered, run: () => list("decimal") },
    { label: "Checklist", keywords: "todo task", icon: ListChecks, run: () => list("todo") },
    { label: "Quote", keywords: "blockquote", icon: Quote, run: () => toggle(BlockquotePlugin.key) },
    { label: "Code block", keywords: "code snippet", icon: SquareCode, run: insertCodeBlock },
    { label: "Table", keywords: "grid", icon: TableIcon, run: doInsertTable },
    { label: "Divider", keywords: "hr line separator", icon: Minus, run: insertDivider },
  ];

  return (
    <Plate editor={editor} onChange={({ value }: any) => onChange(value)}>
      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-0.5 rounded-md border bg-card p-1">
        <TBtn icon={leftOpen ? PanelLeftClose : PanelLeftOpen} title={leftOpen ? "Hide files" : "Show files"} onClick={() => setLeftOpen((o) => !o)} />
        <Sep />
        <button type="button" title="Insert block" onMouseDown={(e) => { e.preventDefault(); const r = (e.currentTarget as HTMLElement).getBoundingClientRect(); openMenu(r.bottom + 4, r.left); }} className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"><Plus className="h-4 w-4" /></button>
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
        <TodoBtn />
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
        {left && leftOpen ? <aside className="hidden w-56 shrink-0 lg:block">{left}</aside> : null}
        <div className="min-w-0 flex-1">
          {titleSlot}
          <PlateContent
            className={cn("min-h-[62vh] rounded-md border bg-background px-4 py-3 text-[15px] leading-7 focus:outline-none [&_p]:my-1.5")}
            placeholder="Start writing… type / for blocks, or use Markdown (# heading, > quote, ** bold, ` code)"
            onKeyDown={(e: any) => {
              if (e.key === "/") {
                const sel = typeof window !== "undefined" ? window.getSelection() : null;
                const lineEmpty = (sel?.anchorNode?.textContent ?? "") === "";
                if (sel && sel.isCollapsed && lineEmpty) {
                  e.preventDefault();
                  const rect = sel.rangeCount ? sel.getRangeAt(0).getBoundingClientRect() : null;
                  openMenu((rect?.bottom ?? 220) + 4, rect?.left ?? 240);
                }
              }
            }}
          />
        </div>
        {right && rightOpen ? <aside className="hidden w-72 shrink-0 xl:block">{right}</aside> : null}
      </div>
      <CommandMenu open={menu.open} pos={{ top: menu.top, left: menu.left }} commands={commands} onClose={closeMenu} />
    </Plate>
  );
}
