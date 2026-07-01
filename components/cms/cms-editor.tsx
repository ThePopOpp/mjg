"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft, Check, Columns2, Copy, ExternalLink, Eye, EyeOff, GripVertical, Heading1, Heading2,
  Image as ImageIcon, Loader2, Menu, Minus, MousePointerClick, Monitor, Save, Smartphone, Square,
  Tablet, Trash2, Type, Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FieldSelect } from "@/components/ui/field-select";
import { cn } from "@/lib/utils";
import { useDashboardActionToken } from "@/components/layout/dashboard-action-token";
import { mdToHtml } from "@/lib/cms/md";
import { blockPad, CMS_BLOCK_LABELS, type CmsBlock, type CmsBlockType } from "@/lib/cms/types";

let _uid = 0;
const uid = () => `b${Date.now().toString(36)}${(_uid++).toString(36)}`;

const PALETTE: { type: CmsBlockType; icon: React.ElementType }[] = [
  { type: "heading", icon: Heading1 }, { type: "subheading", icon: Heading2 },
  { type: "paragraph", icon: Type }, { type: "richtext", icon: Columns2 },
  { type: "image", icon: ImageIcon }, { type: "button", icon: MousePointerClick },
  { type: "divider", icon: Minus }, { type: "spacer", icon: Square },
];

function defaultBlock(type: CmsBlockType): CmsBlock {
  const base: CmsBlock = { id: uid(), type, align: "left", padTop: 24, padBottom: 24 };
  switch (type) {
    case "heading": return { ...base, text: "Your heading" };
    case "subheading": return { ...base, text: "A supporting subheading", padTop: 12, padBottom: 12 };
    case "paragraph": return { ...base, text: "Write your content here…", padTop: 12, padBottom: 12 };
    case "richtext": return { ...base, text: "Rich text supports **bold**, *italic*, [links](https://example.com), and\n- bullet lists", padTop: 12, padBottom: 12 };
    case "image": return { ...base, url: "", alt: "", align: "center" };
    case "button": return { ...base, label: "Learn more", url: "" };
    case "divider": return { ...base, padTop: 8, padBottom: 8 };
    case "spacer": return { id: uid(), type, height: 40 };
    default: return base;
  }
}

const ALIGN_OPTS = [{ value: "left", label: "Left" }, { value: "center", label: "Center" }, { value: "right", label: "Right" }];
const SWATCHES = ["", "#ffffff", "#fbfaf7", "#f1ede3", "#315f43", "#c9a46e", "#10110f", "#070807"];
const DEVICES: { key: string; icon: React.ElementType; w: number }[] = [
  { key: "desktop", icon: Monitor, w: 0 }, { key: "tablet", icon: Tablet, w: 768 }, { key: "mobile", icon: Smartphone, w: 390 },
];
const CANVAS_VARS = {
  "--font-display": "'DM Serif Display', Georgia, serif",
  "--font-body": "'Roboto', system-ui, sans-serif",
  "--green": "#315f43", "--line": "#e4ded2", "--gold": "#c9a46e", "--paper": "#fbfaf7", "--ink": "#070807", "--muted": "#5f6d66",
} as React.CSSProperties;

export function CmsEditor({ page, initialBlocks }: {
  page: { id: string; title: string; slug: string; status: string };
  initialBlocks: CmsBlock[];
}) {
  const token = useDashboardActionToken();
  const [blocks, setBlocks] = React.useState<CmsBlock[]>(initialBlocks.length ? initialBlocks : [defaultBlock("heading"), defaultBlock("paragraph")]);
  const [selectedId, setSelectedId] = React.useState<string | null>(initialBlocks[0]?.id ?? null);
  const [busy, setBusy] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [dirty, setDirty] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [device, setDevice] = React.useState("desktop");
  const dragId = React.useRef<string | null>(null);
  const canvasRef = React.useRef<HTMLDivElement>(null);

  const selected = blocks.find((b) => b.id === selectedId) ?? null;
  const mutate = (fn: (prev: CmsBlock[]) => CmsBlock[]) => { setBlocks(fn); setDirty(true); };
  const update = (id: string, patch: Partial<CmsBlock>) => mutate((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  const add = (type: CmsBlockType) => { const b = defaultBlock(type); mutate((prev) => [...prev, b]); setSelectedId(b.id); };
  const remove = (id: string) => mutate((prev) => prev.filter((b) => b.id !== id));
  const duplicate = (b: CmsBlock) => { const c = { ...b, id: uid() }; mutate((prev) => { const i = prev.findIndex((x) => x.id === b.id); const n = [...prev]; n.splice(i + 1, 0, c); return n; }); setSelectedId(c.id); };

  function onDrop(targetId: string) {
    const from = dragId.current; dragId.current = null;
    if (!from || from === targetId) return;
    mutate((prev) => { const arr = [...prev]; const fi = arr.findIndex((b) => b.id === from), ti = arr.findIndex((b) => b.id === targetId); if (fi < 0 || ti < 0) return prev; const [m] = arr.splice(fi, 1); arr.splice(ti, 0, m); return arr; });
  }

  // Scroll the selected block into view in the live canvas.
  React.useEffect(() => {
    if (!selectedId) return;
    canvasRef.current?.querySelector(`[data-cms-block="${selectedId}"]`)?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [selectedId]);

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

  async function openPreview() {
    if (dirty) await save();
    window.open(`/dashboard/cms/preview/${page.id}?v=${Date.now()}`, "_blank");
  }

  const deviceW = DEVICES.find((d) => d.key === device)?.w ?? 0;
  const compactNav = device !== "desktop";

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
          <Button variant="outline" size="sm" onClick={openPreview} disabled={busy}><ExternalLink className="h-3.5 w-3.5" /> Open preview</Button>
          <Button size="sm" onClick={save} disabled={busy || !dirty}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />} {saved ? "Saved" : "Save draft"}</Button>
        </div>
      </div>

      {error && <div className="mb-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>}

      <div className="grid min-h-0 flex-1 gap-3 lg:grid-cols-[220px_1fr_300px]">
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
                  <span className="min-w-0 flex-1 truncate">{CMS_BLOCK_LABELS[b.type]}{b.text ? <span className="text-muted-foreground"> · {b.text.slice(0, 18)}</span> : null}</span>
                  <button onClick={(e) => { e.stopPropagation(); update(b.id, { hidden: !b.hidden }); }} className="text-muted-foreground opacity-0 hover:text-foreground group-hover:opacity-100" title={b.hidden ? "Show" : "Hide"}>{b.hidden ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}</button>
                  <button onClick={(e) => { e.stopPropagation(); duplicate(b); }} className="text-muted-foreground opacity-0 hover:text-primary group-hover:opacity-100" title="Duplicate"><Copy className="h-3.5 w-3.5" /></button>
                  <button onClick={(e) => { e.stopPropagation(); remove(b.id); }} className="text-muted-foreground opacity-0 hover:text-destructive group-hover:opacity-100" title="Delete"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center: LIVE canvas (updates instantly) */}
        <div className="flex min-h-0 flex-col rounded-xl border border-border bg-muted/40">
          <div className="flex items-center gap-2 border-b border-border px-3 py-1.5">
            <span className="text-[11px] text-muted-foreground">Live preview · click a block to edit it</span>
            <div className="ml-auto flex items-center rounded-lg border border-border bg-card p-0.5">
              {DEVICES.map((d) => (
                <button key={d.key} onClick={() => setDevice(d.key)} className={cn("rounded-md p-1", device === d.key ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground")} title={d.key}><d.icon className="h-3.5 w-3.5" /></button>
              ))}
            </div>
          </div>
          <div className="flex-1 overflow-auto p-3">
            <div ref={canvasRef} className="mx-auto overflow-hidden rounded-md border border-border shadow-sm" style={{ ...CANVAS_VARS, background: "var(--paper)", color: "var(--ink)", fontFamily: "var(--font-body)", maxWidth: deviceW || "100%", width: deviceW || "100%" }}>
              <CanvasHeader compact={compactNav} />
              {blocks.length === 0 ? (
                <div style={{ padding: "80px 20px", textAlign: "center", color: "var(--muted)" }}>This page has no content blocks yet. Add one from the left.</div>
              ) : (
                blocks.map((b) => <BlockView key={b.id} block={b} selected={b.id === selectedId} onSelect={() => setSelectedId(b.id)} />)
              )}
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

function sectionStyle(b: CmsBlock): React.CSSProperties {
  return {
    background: b.bgColor || undefined,
    paddingTop: blockPad(b, "top"), paddingBottom: blockPad(b, "bottom"),
    paddingLeft: b.padX ?? 20, paddingRight: b.padX ?? 20,
    marginTop: b.marginTop || undefined, marginBottom: b.marginBottom || undefined,
    cursor: "pointer",
  };
}
function innerStyle(b: CmsBlock): React.CSSProperties {
  return {
    width: "min(1180px, calc(100% - 40px))", margin: "0 auto",
    maxWidth: b.maxWidth && b.maxWidth > 0 ? b.maxWidth : undefined,
    textAlign: b.align, color: b.textColor || undefined,
  };
}

function BlockView({ block: b, selected, onSelect }: { block: CmsBlock; selected: boolean; onSelect: () => void }) {
  if (b.hidden) return null;
  const wrap = (children: React.ReactNode) => (
    <section data-cms-block={b.id} onClick={onSelect} style={{ ...sectionStyle(b), outline: selected ? "2px solid #c9a46e" : "none", outlineOffset: -2 }}>
      <div style={innerStyle(b)}>{children}</div>
    </section>
  );
  const fs = b.fontSize ? `${b.fontSize}px` : undefined;
  switch (b.type) {
    case "heading": return wrap(<h1 style={{ fontFamily: "var(--font-display)", fontSize: fs || "clamp(34px,5vw,58px)", lineHeight: 1.05, margin: 0 }}>{b.text}</h1>);
    case "subheading": return wrap(<h2 style={{ fontFamily: "var(--font-display)", fontSize: fs || "clamp(22px,3.5vw,32px)", lineHeight: 1.15, margin: 0 }}>{b.text}</h2>);
    case "paragraph": return wrap(<p style={{ fontSize: fs || 18, lineHeight: 1.7, margin: 0, whiteSpace: "pre-wrap" }}>{b.text}</p>);
    case "richtext": return wrap(<div className="cms-rt" style={{ fontSize: fs || 18, lineHeight: 1.75 }} dangerouslySetInnerHTML={{ __html: mdToHtml(b.text || "") }} />);
    case "image": return wrap(b.url
      // eslint-disable-next-line @next/next/no-img-element
      ? <img src={b.url} alt={b.alt || ""} style={{ maxWidth: b.maxWidth ? b.maxWidth : "100%", maxHeight: b.height || undefined, borderRadius: b.radius ?? 8, display: "inline-block" }} />
      : <span style={{ display: "inline-block", padding: "28px 40px", border: "1px dashed #c9b98f", borderRadius: 8, color: "#8a7b52", fontSize: 13 }}>Add an image URL →</span>);
    case "button": return wrap(<span style={{ display: "inline-block", background: b.buttonColor || "var(--green)", color: b.textColor || "#fff", padding: "14px 26px", borderRadius: b.radius ?? 6, fontSize: fs || 16, fontWeight: 700 }}>{b.label || "Learn more"}</span>);
    case "divider": return wrap(<hr style={{ border: "none", borderTop: `1px solid ${b.textColor || "var(--line)"}`, margin: 0 }} />);
    case "spacer": return <div data-cms-block={b.id} onClick={onSelect} style={{ height: b.height ?? 40, cursor: "pointer", outline: selected ? "2px solid #c9a46e" : "none", outlineOffset: -2 }} />;
    default: return null;
  }
}

// ── Inspector ─────────────────────────────────────────────────────────────────
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
          <div className="grid grid-cols-2 gap-2">
            <Num label="Font size" value={block.fontSize} onChange={(v) => update({ fontSize: v })} placeholder="16" />
            <Num label="Radius" value={block.radius} onChange={(v) => update({ radius: v })} placeholder="6" />
          </div>
          <ColorField label="Button color" value={block.buttonColor ?? ""} onChange={(v) => update({ buttonColor: v })} />
          <ColorField label="Label color" value={block.textColor ?? ""} onChange={(v) => update({ textColor: v })} />
        </div>
      )}

      {block.type === "spacer" && <Num label="Height (px)" value={block.height} onChange={(v) => update({ height: v ?? 0 })} placeholder="40" />}

      {isText && (
        <div className="grid grid-cols-2 gap-2">
          <Num label="Font size (px)" value={block.fontSize} onChange={(v) => update({ fontSize: v })} placeholder="auto" />
          <div><L>Alignment</L><FieldSelect value={block.align ?? "left"} onChange={(v) => update({ align: v as CmsBlock["align"] })} options={ALIGN_OPTS} className="h-8" /></div>
        </div>
      )}
      {isText && <ColorField label="Text color" value={block.textColor ?? ""} onChange={(v) => update({ textColor: v })} />}
      {block.type === "divider" && <ColorField label="Line color" value={block.textColor ?? ""} onChange={(v) => update({ textColor: v })} />}
      {(block.type === "image" || block.type === "button") && (
        <div><L>Alignment</L><FieldSelect value={block.align ?? "left"} onChange={(v) => update({ align: v as CmsBlock["align"] })} options={ALIGN_OPTS} className="h-8" /></div>
      )}

      {/* Design / spacing (all block types) */}
      <div className="space-y-3 border-t border-border pt-3">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Spacing & background</div>
        {block.type !== "spacer" && <ColorField label="Background" value={block.bgColor ?? ""} onChange={(v) => update({ bgColor: v })} />}
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
      </div>
    </div>
  );
}
