"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft, Check, Columns2, Copy, ExternalLink, Eye, EyeOff, GripVertical, Heading1, Heading2,
  Image as ImageIcon, Loader2, Minus, MousePointerClick, Monitor, Save, Smartphone, Square,
  Tablet, Trash2, Type, Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FieldSelect } from "@/components/ui/field-select";
import { cn } from "@/lib/utils";
import { useDashboardActionToken } from "@/components/layout/dashboard-action-token";
import { CMS_BLOCK_LABELS, type CmsBlock, type CmsBlockType } from "@/lib/cms/types";

let _uid = 0;
const uid = () => `b${Date.now().toString(36)}${(_uid++).toString(36)}`;

const PALETTE: { type: CmsBlockType; icon: React.ElementType }[] = [
  { type: "heading", icon: Heading1 }, { type: "subheading", icon: Heading2 },
  { type: "paragraph", icon: Type }, { type: "richtext", icon: Columns2 },
  { type: "image", icon: ImageIcon }, { type: "button", icon: MousePointerClick },
  { type: "divider", icon: Minus }, { type: "spacer", icon: Square },
];

function defaultBlock(type: CmsBlockType): CmsBlock {
  const base: CmsBlock = { id: uid(), type, align: "left", padY: 20 };
  switch (type) {
    case "heading": return { ...base, text: "Your heading", padY: 24 };
    case "subheading": return { ...base, text: "A supporting subheading" };
    case "paragraph": return { ...base, text: "Write your content here…" };
    case "richtext": return { ...base, text: "Rich text supports **bold**, *italic*, [links](https://example.com), and\n- bullet lists" };
    case "image": return { ...base, url: "", alt: "", align: "center" };
    case "button": return { ...base, label: "Learn more", url: "" };
    case "divider": return { ...base, padY: 8 };
    case "spacer": return { ...base, height: 40 };
    default: return base;
  }
}

const ALIGN_OPTS = [{ value: "left", label: "Left" }, { value: "center", label: "Center" }, { value: "right", label: "Right" }];
const SWATCHES = ["", "#ffffff", "#fbfaf7", "#315f43", "#c9a46e", "#10110f", "#070807"];
const DEVICES: { key: string; icon: React.ElementType; w: number }[] = [
  { key: "desktop", icon: Monitor, w: 0 }, { key: "tablet", icon: Tablet, w: 834 }, { key: "mobile", icon: Smartphone, w: 390 },
];

export function CmsEditor({ page, initialBlocks }: {
  page: { id: string; title: string; slug: string; status: string };
  initialBlocks: CmsBlock[];
}) {
  const token = useDashboardActionToken();
  const [blocks, setBlocks] = React.useState<CmsBlock[]>(initialBlocks.length ? initialBlocks : [defaultBlock("heading"), defaultBlock("paragraph")]);
  const [selectedId, setSelectedId] = React.useState<string | null>(initialBlocks[0]?.id ?? null);
  const [busy, setBusy] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [device, setDevice] = React.useState("desktop");
  const [reloadToken, setReloadToken] = React.useState(0);
  const dragId = React.useRef<string | null>(null);

  const selected = blocks.find((b) => b.id === selectedId) ?? null;
  const update = (id: string, patch: Partial<CmsBlock>) => setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  const add = (type: CmsBlockType) => { const b = defaultBlock(type); setBlocks((prev) => [...prev, b]); setSelectedId(b.id); };
  const remove = (id: string) => setBlocks((prev) => prev.filter((b) => b.id !== id));
  const duplicate = (b: CmsBlock) => { const c = { ...b, id: uid() }; setBlocks((prev) => { const i = prev.findIndex((x) => x.id === b.id); const next = [...prev]; next.splice(i + 1, 0, c); return next; }); setSelectedId(c.id); };

  function onDrop(targetId: string) {
    const from = dragId.current; dragId.current = null;
    if (!from || from === targetId) return;
    setBlocks((prev) => { const arr = [...prev]; const fi = arr.findIndex((b) => b.id === from), ti = arr.findIndex((b) => b.id === targetId); if (fi < 0 || ti < 0) return prev; const [m] = arr.splice(fi, 1); arr.splice(ti, 0, m); return arr; });
  }

  async function save() {
    setBusy(true); setError(null);
    try {
      const res = await fetch(`/api/admin/cms/pages/${page.id}/draft`, {
        method: "PUT", headers: { "content-type": "application/json" },
        body: JSON.stringify({ content: { version: 1, blocks }, actionToken: token }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Save failed.");
      setSaved(true); setTimeout(() => setSaved(false), 2000);
      setReloadToken((t) => t + 1); // refresh preview iframe
    } catch (e) { setError(e instanceof Error ? e.message : "Save failed."); }
    finally { setBusy(false); }
  }

  function uploadImage(id: string) {
    const input = document.createElement("input");
    input.type = "file"; input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files?.[0]; if (!file) return;
      setBusy(true); setError(null);
      try {
        const fd = new FormData(); fd.append("file", file); fd.append("folder", "cms");
        const up = await fetch("/api/admin/uploads", { method: "POST", headers: { "x-mjg-action-token": token }, body: fd });
        const uj = await up.json().catch(() => ({}));
        if (!up.ok) throw new Error(uj.error || "Upload failed.");
        update(id, { url: uj.url });
      } catch (e) { setError(e instanceof Error ? e.message : "Upload failed."); }
      finally { setBusy(false); }
    };
    input.click();
  }

  const deviceW = DEVICES.find((d) => d.key === device)?.w ?? 0;

  return (
    <div className="flex h-[calc(100vh-120px)] min-h-[560px] flex-col">
      {/* Top bar */}
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <Button asChild variant="ghost" size="sm"><Link href="/dashboard/cms"><ArrowLeft className="h-4 w-4" /> CMS</Link></Button>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="truncate font-semibold">{page.title}</span>
            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium capitalize text-muted-foreground">{page.status}</span>
          </div>
          <div className="text-[11px] text-muted-foreground">/p/{page.slug}</div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => window.open(`/dashboard/cms/preview/${page.id}?v=${reloadToken}`, "_blank")}><ExternalLink className="h-3.5 w-3.5" /> Open preview</Button>
          <Button size="sm" onClick={save} disabled={busy}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />} {saved ? "Saved" : "Save draft"}</Button>
        </div>
      </div>

      {error && <div className="mb-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>}

      <div className="grid min-h-0 flex-1 gap-3 lg:grid-cols-[230px_1fr_300px]">
        {/* Left: palette + block list */}
        <div className="flex min-h-0 flex-col gap-3 overflow-y-auto">
          <div className="rounded-xl border border-border bg-card p-2">
            <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Add block</div>
            <div className="grid grid-cols-2 gap-1">
              {PALETTE.map((p) => (
                <button key={p.type} onClick={() => add(p.type)} className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-left text-xs hover:bg-muted">
                  <p.icon className="h-3.5 w-3.5 text-muted-foreground" /> {CMS_BLOCK_LABELS[p.type]}
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-2">
            <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Page blocks</div>
            {blocks.length === 0 && <p className="px-2 py-2 text-xs text-muted-foreground">No blocks yet.</p>}
            <div className="space-y-1">
              {blocks.map((b) => (
                <div key={b.id} draggable onDragStart={() => (dragId.current = b.id)} onDragOver={(e) => e.preventDefault()} onDrop={() => onDrop(b.id)}
                  onClick={() => setSelectedId(b.id)}
                  className={cn("group flex items-center gap-1.5 rounded-lg border px-2 py-1.5 text-xs", selectedId === b.id ? "border-primary bg-primary/5" : "border-transparent hover:bg-muted", b.hidden && "opacity-50")}>
                  <GripVertical className="h-3.5 w-3.5 shrink-0 cursor-grab text-muted-foreground" />
                  <span className="min-w-0 flex-1 truncate">{CMS_BLOCK_LABELS[b.type]}{b.text ? <span className="text-muted-foreground"> · {b.text.slice(0, 20)}</span> : null}</span>
                  <button onClick={(e) => { e.stopPropagation(); update(b.id, { hidden: !b.hidden }); }} className="text-muted-foreground opacity-0 hover:text-foreground group-hover:opacity-100" title={b.hidden ? "Show" : "Hide"}>{b.hidden ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}</button>
                  <button onClick={(e) => { e.stopPropagation(); duplicate(b); }} className="text-muted-foreground opacity-0 hover:text-primary group-hover:opacity-100" title="Duplicate"><Copy className="h-3.5 w-3.5" /></button>
                  <button onClick={(e) => { e.stopPropagation(); remove(b.id); }} className="text-muted-foreground opacity-0 hover:text-destructive group-hover:opacity-100" title="Delete"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center: live preview iframe */}
        <div className="flex min-h-0 flex-col rounded-xl border border-border bg-muted/30">
          <div className="flex items-center gap-2 border-b border-border px-3 py-1.5">
            <span className="text-[11px] text-muted-foreground">Preview updates when you Save draft</span>
            <div className="ml-auto flex items-center rounded-lg border border-border bg-card p-0.5">
              {DEVICES.map((d) => (
                <button key={d.key} onClick={() => setDevice(d.key)} className={cn("rounded-md p-1", device === d.key ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground")} title={d.key}><d.icon className="h-3.5 w-3.5" /></button>
              ))}
              <button onClick={() => setReloadToken((t) => t + 1)} className="ml-1 rounded-md p-1 text-muted-foreground hover:text-foreground" title="Refresh preview"><Loader2 className="h-3.5 w-3.5" /></button>
            </div>
          </div>
          <div className="flex-1 overflow-auto p-3">
            <div className="mx-auto h-full bg-background shadow-sm" style={{ maxWidth: deviceW ? deviceW : "100%", width: deviceW ? deviceW : "100%" }}>
              <iframe key={reloadToken} title="CMS preview" src={`/dashboard/cms/preview/${page.id}?v=${reloadToken}`} className="h-full w-full rounded-md border border-border" />
            </div>
          </div>
        </div>

        {/* Right: inspector */}
        <div className="min-h-0 overflow-y-auto rounded-xl border border-border bg-card p-3">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Block settings</div>
          {!selected ? <p className="text-xs text-muted-foreground">Select a block to edit it.</p> : (
            <Inspector block={selected} update={(p) => update(selected.id, p)} onUpload={() => uploadImage(selected.id)} />
          )}
        </div>
      </div>
    </div>
  );
}

function L({ children }: { children: React.ReactNode }) { return <label className="mb-1 block text-xs font-medium text-muted-foreground">{children}</label>; }

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

function Inspector({ block, update, onUpload }: { block: CmsBlock; update: (p: Partial<CmsBlock>) => void; onUpload: () => void }) {
  const isText = block.type === "heading" || block.type === "subheading" || block.type === "paragraph" || block.type === "richtext";
  return (
    <div className="space-y-3">
      <div className="text-xs font-semibold capitalize">{CMS_BLOCK_LABELS[block.type]}</div>

      {isText && (
        <div>
          <L>Text</L>
          <Textarea value={block.text ?? ""} onChange={(e) => update({ text: e.target.value })} className={block.type === "richtext" || block.type === "paragraph" ? "min-h-[120px]" : "min-h-[60px]"} />
          {block.type === "richtext" && <p className="mt-1 text-[10px] text-muted-foreground">Supports **bold**, *italic*, [links](url), and “- ” bullet lists.</p>}
        </div>
      )}

      {block.type === "image" && (
        <div className="space-y-2">
          <div><L>Image URL</L><div className="flex gap-2"><Input value={block.url ?? ""} onChange={(e) => update({ url: e.target.value })} placeholder="https://…" /><Button type="button" variant="outline" size="sm" className="shrink-0" onClick={onUpload}><Upload className="h-3.5 w-3.5" /></Button></div></div>
          <div><L>Alt text</L><Input value={block.alt ?? ""} onChange={(e) => update({ alt: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-2">
            <div><L>Max width (px)</L><Input type="number" value={block.maxWidth ?? ""} onChange={(e) => update({ maxWidth: e.target.value ? Number(e.target.value) : undefined })} placeholder="full" /></div>
            <div><L>Max height (px)</L><Input type="number" value={block.height ?? ""} onChange={(e) => update({ height: e.target.value ? Number(e.target.value) : undefined })} placeholder="auto" /></div>
          </div>
        </div>
      )}

      {block.type === "button" && (
        <div className="space-y-2">
          <div><L>Label</L><Input value={block.label ?? ""} onChange={(e) => update({ label: e.target.value })} /></div>
          <div><L>Link URL</L><Input value={block.url ?? ""} onChange={(e) => update({ url: e.target.value })} placeholder="https://…" /></div>
        </div>
      )}

      {block.type === "spacer" && (
        <div><L>Height (px)</L><Input type="number" value={block.height ?? 40} onChange={(e) => update({ height: Number(e.target.value) || 0 })} /></div>
      )}

      {/* Design controls (not for spacer) */}
      {block.type !== "spacer" && (
        <div className="space-y-3 border-t border-border pt-3">
          {block.type !== "divider" && <div><L>Alignment</L><FieldSelect value={block.align ?? "left"} onChange={(v) => update({ align: v as CmsBlock["align"] })} options={ALIGN_OPTS} /></div>}
          {isText && <ColorField label="Text color" value={block.textColor ?? ""} onChange={(v) => update({ textColor: v })} />}
          <ColorField label="Background" value={block.bgColor ?? ""} onChange={(v) => update({ bgColor: v })} />
          <div className="grid grid-cols-2 gap-2">
            <div><L>Padding Y (px)</L><Input type="number" value={block.padY ?? 0} onChange={(e) => update({ padY: Number(e.target.value) || 0 })} /></div>
            {block.type !== "divider" && <div><L>Content width (px)</L><Input type="number" value={block.maxWidth ?? ""} onChange={(e) => update({ maxWidth: e.target.value ? Number(e.target.value) : undefined })} placeholder="full" /></div>}
          </div>
        </div>
      )}
    </div>
  );
}
