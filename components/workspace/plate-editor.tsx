"use client";

import { useMemo } from "react";
import { Plate, PlateContent, PlateElement, PlateLeaf, usePlateEditor } from "platejs/react";
import {
  BoldPlugin, ItalicPlugin, UnderlinePlugin, StrikethroughPlugin, CodePlugin,
  H1Plugin, H2Plugin, H3Plugin, BlockquotePlugin, HorizontalRulePlugin,
} from "@platejs/basic-nodes/react";
import { Bold, Italic, Underline, Strikethrough, Code, Heading1, Heading2, Heading3, Quote, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

// Baseline Notion-style editor. Lists, slash menu, tables, media & callouts are the
// next editor pass; this ships headings, marks, quotes and a divider with autosave.
const PLUGINS = [
  BoldPlugin, ItalicPlugin, UnderlinePlugin, StrikethroughPlugin, CodePlugin,
  H1Plugin, H2Plugin, H3Plugin, BlockquotePlugin, HorizontalRulePlugin,
];

/* eslint-disable @typescript-eslint/no-explicit-any */
const COMPONENTS: Record<string, any> = {
  [BoldPlugin.key]: (p: any) => <PlateLeaf {...p} as="strong" />,
  [ItalicPlugin.key]: (p: any) => <PlateLeaf {...p} as="em" />,
  [UnderlinePlugin.key]: (p: any) => <PlateLeaf {...p} as="u" />,
  [StrikethroughPlugin.key]: (p: any) => <PlateLeaf {...p} as="s" />,
  [CodePlugin.key]: (p: any) => <PlateLeaf {...p} as="code" className="rounded bg-muted px-1 py-0.5 font-mono text-[0.85em]" />,
  [H1Plugin.key]: (p: any) => <PlateElement {...p} as="h1" className="mt-6 mb-2 text-3xl font-bold tracking-tight" />,
  [H2Plugin.key]: (p: any) => <PlateElement {...p} as="h2" className="mt-5 mb-2 text-2xl font-semibold tracking-tight" />,
  [H3Plugin.key]: (p: any) => <PlateElement {...p} as="h3" className="mt-4 mb-1.5 text-xl font-semibold" />,
  [BlockquotePlugin.key]: (p: any) => <PlateElement {...p} as="blockquote" className="my-2 border-l-2 border-primary/40 pl-4 italic text-muted-foreground" />,
  [HorizontalRulePlugin.key]: (p: any) => <PlateElement {...p} as="div" className="py-2"><hr className="border-border" />{p.children}</PlateElement>,
};

const TOOLBAR: { key: string; icon: typeof Bold; title: string }[] = [
  { key: BoldPlugin.key, icon: Bold, title: "Bold" },
  { key: ItalicPlugin.key, icon: Italic, title: "Italic" },
  { key: UnderlinePlugin.key, icon: Underline, title: "Underline" },
  { key: StrikethroughPlugin.key, icon: Strikethrough, title: "Strikethrough" },
  { key: CodePlugin.key, icon: Code, title: "Code" },
  { key: H1Plugin.key, icon: Heading1, title: "Heading 1" },
  { key: H2Plugin.key, icon: Heading2, title: "Heading 2" },
  { key: H3Plugin.key, icon: Heading3, title: "Heading 3" },
  { key: BlockquotePlugin.key, icon: Quote, title: "Quote" },
];

export function PlateEditor({ initialValue, onChange }: { initialValue: any; onChange: (value: any) => void }) {
  const value = useMemo(() => (Array.isArray(initialValue) && initialValue.length ? initialValue : [{ type: "p", children: [{ text: "" }] }]), [initialValue]);
  const editor = usePlateEditor({ plugins: PLUGINS, components: COMPONENTS, value });

  const run = (key: string) => {
    try { (editor.tf as any)?.[key]?.toggle?.(); } catch { /* no-op */ }
  };

  return (
    <Plate editor={editor} onChange={({ value }: any) => onChange(value)}>
      <div className="sticky top-0 z-10 mb-3 flex flex-wrap items-center gap-0.5 rounded-md border bg-card p-1">
        {TOOLBAR.map((b, i) => (
          <button key={b.key + i} type="button" title={b.title} onMouseDown={(e) => { e.preventDefault(); run(b.key); }} className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
            <b.icon className="h-4 w-4" />
          </button>
        ))}
        <span className="mx-1 h-5 w-px bg-border" />
        <button type="button" title="Divider" onMouseDown={(e) => { e.preventDefault(); try { (editor.tf as any)?.hr?.insert?.(); } catch { /* no-op */ } }} className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
          <Minus className="h-4 w-4" />
        </button>
      </div>
      <PlateContent
        className={cn("min-h-[60vh] rounded-md border bg-background px-4 py-3 text-[15px] leading-7 focus:outline-none [&_p]:my-1.5")}
        placeholder="Start writing… (Markdown shortcuts work: # for heading, > for quote, ** for bold)"
      />
    </Plate>
  );
}
