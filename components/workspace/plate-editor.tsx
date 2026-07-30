"use client";

import { useMemo, useState } from "react";
import { Plate, PlateContent, PlateElement, PlateLeaf, usePlateEditor } from "platejs/react";
import {
  BoldPlugin, ItalicPlugin, UnderlinePlugin, StrikethroughPlugin, CodePlugin, HighlightPlugin,
  H1Plugin, H2Plugin, H3Plugin, BlockquotePlugin, HorizontalRulePlugin,
} from "@platejs/basic-nodes/react";
import { CodeBlockPlugin, CodeLinePlugin } from "@platejs/code-block/react";
import { LinkPlugin } from "@platejs/link/react";
import {
  Bold, Italic, Underline, Strikethrough, Code, Highlighter, Heading1, Heading2, Heading3,
  Quote, Minus, SquareCode, Link2, PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* eslint-disable @typescript-eslint/no-explicit-any */
const PLUGINS = [
  BoldPlugin, ItalicPlugin, UnderlinePlugin, StrikethroughPlugin, CodePlugin, HighlightPlugin,
  H1Plugin, H2Plugin, H3Plugin, BlockquotePlugin, HorizontalRulePlugin,
  CodeBlockPlugin, CodeLinePlugin, LinkPlugin,
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
};

const MARKS: { key: string; icon: typeof Bold; title: string }[] = [
  { key: BoldPlugin.key, icon: Bold, title: "Bold" },
  { key: ItalicPlugin.key, icon: Italic, title: "Italic" },
  { key: UnderlinePlugin.key, icon: Underline, title: "Underline" },
  { key: StrikethroughPlugin.key, icon: Strikethrough, title: "Strikethrough" },
  { key: CodePlugin.key, icon: Code, title: "Inline code" },
  { key: HighlightPlugin.key, icon: Highlighter, title: "Highlight" },
];
const BLOCKS: { key: string; icon: typeof Bold; title: string }[] = [
  { key: H1Plugin.key, icon: Heading1, title: "Heading 1" },
  { key: H2Plugin.key, icon: Heading2, title: "Heading 2" },
  { key: H3Plugin.key, icon: Heading3, title: "Heading 3" },
  { key: BlockquotePlugin.key, icon: Quote, title: "Quote" },
];

function TBtn({ icon: Icon, title, onClick }: { icon: typeof Bold; title: string; onClick: () => void }) {
  return (
    <button type="button" title={title} onMouseDown={(e) => { e.preventDefault(); onClick(); }} className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
      <Icon className="h-4 w-4" />
    </button>
  );
}
const Sep = () => <span className="mx-1 h-5 w-px shrink-0 bg-border" />;

export function WorkspaceEditorSurface({
  initialValue,
  onChange,
  titleSlot,
  statusSlot,
  left,
  right,
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
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);

  const toggle = (key: string) => { try { (editor.tf as any)?.[key]?.toggle?.(); } catch { /* no-op */ } };
  const insertLink = () => {
    const url = typeof window !== "undefined" ? window.prompt("Link URL") : null;
    if (url) { try { (editor.tf as any)?.a?.toggle?.({ url }); } catch { /* no-op */ } }
  };

  return (
    <Plate editor={editor} onChange={({ value }: any) => onChange(value)}>
      {/* Top toolbar — spans the full width of all three columns */}
      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-0.5 rounded-md border bg-card p-1">
        <TBtn icon={leftOpen ? PanelLeftClose : PanelLeftOpen} title={leftOpen ? "Hide files" : "Show files"} onClick={() => setLeftOpen((o) => !o)} />
        <Sep />
        {MARKS.map((b) => <TBtn key={b.key} icon={b.icon} title={b.title} onClick={() => toggle(b.key)} />)}
        <Sep />
        {BLOCKS.map((b) => <TBtn key={b.key} icon={b.icon} title={b.title} onClick={() => toggle(b.key)} />)}
        <Sep />
        <TBtn icon={SquareCode} title="Code block" onClick={() => toggle(CodeBlockPlugin.key)} />
        <TBtn icon={Link2} title="Insert link" onClick={insertLink} />
        <TBtn icon={Minus} title="Divider" onClick={() => { try { (editor.tf as any)?.hr?.insert?.(); } catch { /* no-op */ } }} />
        <div className="ml-auto flex items-center gap-1">
          {statusSlot}
          <TBtn icon={rightOpen ? PanelRightClose : PanelRightOpen} title={rightOpen ? "Hide panel" : "Show panel"} onClick={() => setRightOpen((o) => !o)} />
        </div>
      </div>

      {/* Three-column body */}
      <div className="mt-3 flex gap-3">
        {left && leftOpen ? <aside className="hidden w-56 shrink-0 lg:block">{left}</aside> : null}
        <div className="min-w-0 flex-1">
          {titleSlot}
          <PlateContent
            className={cn("min-h-[62vh] rounded-md border bg-background px-4 py-3 text-[15px] leading-7 focus:outline-none [&_p]:my-1.5")}
            placeholder="Start writing… (Markdown shortcuts work: # heading, > quote, ** bold, ` code)"
          />
        </div>
        {right && rightOpen ? <aside className="hidden w-72 shrink-0 xl:block">{right}</aside> : null}
      </div>
    </Plate>
  );
}
