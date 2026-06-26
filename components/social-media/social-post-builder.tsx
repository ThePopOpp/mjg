"use client";

import * as React from "react";
import {
  GripVertical, Hash, Heading1, Image as ImageIcon, Link2, Loader2, Minus, MousePointerClick,
  Quote, Save, Trash2, Type, Video, Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FieldSelect } from "@/components/ui/field-select";
import { cn } from "@/lib/utils";
import { useDashboardActionToken } from "@/components/layout/dashboard-action-token";
import { renderSchema, composePostText, normalizeHashtag } from "@/lib/social-media/render";
import { PLATFORMS, PLATFORM_MAP } from "@/lib/social-media/constants";
import type { SocialBlock, SocialBlockType, SocialTemplate } from "@/lib/social-media/types";

let _uid = 0;
const uid = () => `b${Date.now().toString(36)}${(_uid++).toString(36)}`;

const PALETTE: { type: SocialBlockType; label: string; icon: React.ElementType }[] = [
  { type: "heading", label: "Heading", icon: Heading1 },
  { type: "text", label: "Text", icon: Type },
  { type: "quote", label: "Quote", icon: Quote },
  { type: "image", label: "Image", icon: ImageIcon },
  { type: "video", label: "Video", icon: Video },
  { type: "link", label: "Link", icon: Link2 },
  { type: "cta", label: "Call to action", icon: MousePointerClick },
  { type: "hashtags", label: "Hashtags", icon: Hash },
  { type: "divider", label: "Divider", icon: Minus },
];

function defaultBlock(type: SocialBlockType): SocialBlock {
  const base: SocialBlock = { id: uid(), type };
  switch (type) {
    case "heading": return { ...base, text: "Your headline", level: "h1" };
    case "text": return { ...base, text: "Write your post copy here…" };
    case "quote": return { ...base, text: "A short, quotable line." };
    case "image": return { ...base, url: "", alt: "" };
    case "video": return { ...base, url: "" };
    case "link": return { ...base, label: "Read more", url: "" };
    case "cta": return { ...base, label: "Join the journey", url: "" };
    case "hashtags": return { ...base, items: ["#Stewardship"] };
    default: return base;
  }
}

const CATEGORY_OPTS = ["general", "Stewardship", "Events", "Marketing", "Announcement", "Encouragement"].map((c) => ({ value: c, label: c }));
const STATUS_OPTS = [{ value: "draft", label: "Draft" }, { value: "active", label: "Active" }, { value: "archived", label: "Archived" }];

export function SocialPostBuilder({ initialTemplate }: { initialTemplate: SocialTemplate | null }) {
  const token = useDashboardActionToken();
  const init = initialTemplate;
  const initialBlocks: SocialBlock[] =
    init && Array.isArray((init.builder_schema as { blocks?: SocialBlock[] })?.blocks) && (init.builder_schema as { blocks: SocialBlock[] }).blocks.length
      ? (init.builder_schema as { blocks: SocialBlock[] }).blocks
      : init?.body_text
        ? [{ id: uid(), type: "text", text: init.body_text }, ...(init.hashtags?.length ? [{ id: uid(), type: "hashtags" as const, items: init.hashtags }] : [])]
        : [defaultBlock("heading"), defaultBlock("text")];

  const [blocks, setBlocks] = React.useState<SocialBlock[]>(initialBlocks);
  const [selectedId, setSelectedId] = React.useState<string | null>(initialBlocks[0]?.id ?? null);
  const [name, setName] = React.useState(init?.name ?? "");
  const [description, setDescription] = React.useState(init?.description ?? "");
  const [category, setCategory] = React.useState(init?.category ?? "general");
  const [status, setStatus] = React.useState(init?.status ?? "draft");
  const [platforms, setPlatforms] = React.useState<string[]>(init?.platforms ?? ["facebook", "linkedin"]);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [savedId, setSavedId] = React.useState<string | null>(init?.id ?? null);
  const [justSaved, setJustSaved] = React.useState(false);
  const dragId = React.useRef<string | null>(null);

  const selected = blocks.find((b) => b.id === selectedId) ?? null;
  const update = (id: string, patch: Partial<SocialBlock>) => setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  const remove = (id: string) => setBlocks((prev) => prev.filter((b) => b.id !== id));
  const add = (type: SocialBlockType) => { const b = defaultBlock(type); setBlocks((prev) => [...prev, b]); setSelectedId(b.id); };

  function onDrop(targetId: string) {
    const from = dragId.current; dragId.current = null;
    if (!from || from === targetId) return;
    setBlocks((prev) => {
      const arr = [...prev];
      const fi = arr.findIndex((b) => b.id === from), ti = arr.findIndex((b) => b.id === targetId);
      if (fi < 0 || ti < 0) return prev;
      const [moved] = arr.splice(fi, 1); arr.splice(ti, 0, moved);
      return arr;
    });
  }

  const rendered = React.useMemo(() => renderSchema({ version: 1, blocks }), [blocks]);
  const previewText = composePostText(rendered.body_text, rendered.hashtags);
  const charCount = previewText.length;
  const minLimit = platforms.length ? Math.min(...platforms.map((p) => PLATFORM_MAP[p]?.charLimit ?? 99999)) : null;
  const overLimit = minLimit != null && charCount > minLimit;

  const togglePlatform = (id: string) => setPlatforms((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));

  async function save() {
    setBusy(true); setError(null);
    try {
      const res = await fetch("/api/admin/social-media/templates", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({
          id: savedId ?? undefined, name, description, category, status, platforms,
          builderSchema: { version: 1, blocks }, bodyText: rendered.body_text,
          mediaUrls: rendered.media_urls, hashtags: rendered.hashtags, linkUrl: rendered.link_url,
          actionToken: token,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Save failed.");
      setSavedId(json.template?.id ?? savedId);
      setJustSaved(true); setTimeout(() => setJustSaved(false), 2000);
    } catch (e) { setError(e instanceof Error ? e.message : "Save failed."); }
    finally { setBusy(false); }
  }

  return (
    <div>
      {/* meta bar */}
      <div className="mb-4 grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2"><label className="mb-1 block text-xs font-medium text-muted-foreground">Template name</label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Daily Stewardship Encouragement" /></div>
        <div><label className="mb-1 block text-xs font-medium text-muted-foreground">Category</label><FieldSelect value={category} onChange={setCategory} options={CATEGORY_OPTS} /></div>
        <div><label className="mb-1 block text-xs font-medium text-muted-foreground">Status</label><FieldSelect value={status} onChange={(v) => setStatus(v as typeof status)} options={STATUS_OPTS} /></div>
        <div className="sm:col-span-2"><label className="mb-1 block text-xs font-medium text-muted-foreground">Description</label><Input value={description} onChange={(e) => setDescription(e.target.value)} /></div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Platforms</label>
          <div className="flex flex-wrap gap-1.5">
            {PLATFORMS.filter((p) => p.primary).concat(PLATFORMS.filter((p) => !p.primary)).map((p) => (
              <button key={p.id} type="button" onClick={() => togglePlatform(p.id)}
                className={cn("rounded-full border px-2.5 py-1 text-xs font-medium transition-colors", platforms.includes(p.id) ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-muted")}>
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[180px_1fr_320px]">
        {/* Palette */}
        <div className="rounded-xl border border-border bg-card p-2">
          <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Blocks</div>
          <div className="space-y-1">
            {PALETTE.map((p) => (
              <button key={p.type} onClick={() => add(p.type)} className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-muted">
                <p.icon className="h-4 w-4 text-muted-foreground" /> {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Canvas */}
        <div className="rounded-xl border border-border bg-card p-3">
          {blocks.length === 0 && <div className="py-16 text-center text-sm text-muted-foreground">Add blocks from the left to build your post.</div>}
          <div className="space-y-2">
            {blocks.map((b) => (
              <div key={b.id} draggable onDragStart={() => (dragId.current = b.id)} onDragOver={(e) => e.preventDefault()} onDrop={() => onDrop(b.id)}
                onClick={() => setSelectedId(b.id)}
                className={cn("group flex items-start gap-2 rounded-lg border p-2.5", selectedId === b.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/40")}>
                <GripVertical className="mt-0.5 h-4 w-4 shrink-0 cursor-grab text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{b.type}</div>
                  <BlockPreview block={b} />
                </div>
                <button onClick={(e) => { e.stopPropagation(); remove(b.id); }} className="text-muted-foreground opacity-0 hover:text-destructive group-hover:opacity-100"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            ))}
          </div>
        </div>

        {/* Inspector + preview */}
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-3">
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Block settings</div>
            {!selected ? <p className="text-xs text-muted-foreground">Select a block to edit it.</p> : <BlockSettings block={selected} update={(patch) => update(selected.id, patch)} />}
          </div>

          <div className="rounded-xl border border-border bg-card p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Preview</span>
              <span className={cn("text-[11px]", overLimit ? "font-semibold text-destructive" : "text-muted-foreground")}>{charCount}{minLimit != null ? ` / ${minLimit}` : ""}</span>
            </div>
            <div className="rounded-lg border border-border bg-background p-3">
              <div className="mb-2 flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-primary/15" />
                <div><div className="text-xs font-semibold leading-none">Michael J. Gauthier</div><div className="text-[10px] text-muted-foreground">{platforms.map((p) => PLATFORM_MAP[p]?.label).filter(Boolean).join(" · ") || "No platform"}</div></div>
              </div>
              <div className="whitespace-pre-wrap text-sm leading-relaxed">{previewText || <span className="text-muted-foreground">Your post preview appears here.</span>}</div>
              {rendered.media_urls.length > 0 && (
                <div className="mt-2 grid grid-cols-2 gap-1">
                  {rendered.media_urls.slice(0, 4).map((u, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={i} src={u} alt="" className="aspect-square w-full rounded object-cover" onError={(e) => ((e.target as HTMLImageElement).style.display = "none")} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {error && <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>}
      <div className="mt-4 flex items-center justify-end gap-2">
        {overLimit && <span className="text-xs text-destructive">Over the {minLimit}-character limit for a selected platform.</span>}
        <Button onClick={save} disabled={busy || !name.trim()}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : justSaved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          {justSaved ? "Saved" : savedId ? "Update template" : "Save template"}
        </Button>
      </div>
    </div>
  );
}

function BlockPreview({ block }: { block: SocialBlock }) {
  switch (block.type) {
    case "heading": return <div className="truncate text-sm font-semibold">{block.text || "—"}</div>;
    case "text": return <div className="line-clamp-2 text-sm">{block.text || "—"}</div>;
    case "quote": return <div className="line-clamp-2 text-sm italic">“{block.text || "—"}”</div>;
    case "image": return <div className="truncate text-xs text-muted-foreground">{block.url || "No image URL"}</div>;
    case "video": return <div className="truncate text-xs text-muted-foreground">{block.url || "No video URL"}</div>;
    case "link": return <div className="truncate text-xs text-primary">{block.label} → {block.url || "No URL"}</div>;
    case "cta": return <div className="truncate text-xs"><span className="rounded bg-primary px-1.5 py-0.5 text-[10px] text-primary-foreground">{block.label}</span> {block.url}</div>;
    case "hashtags": return <div className="truncate text-xs text-primary">{(block.items ?? []).join(" ") || "No hashtags"}</div>;
    case "divider": return <div className="border-t border-dashed border-border" />;
    default: return null;
  }
}

function BlockSettings({ block, update }: { block: SocialBlock; update: (patch: Partial<SocialBlock>) => void }) {
  const L = (s: string) => <label className="mb-1 block text-xs font-medium text-muted-foreground">{s}</label>;
  if (block.type === "divider") return <p className="text-xs text-muted-foreground">A blank line / spacer. No settings.</p>;
  if (block.type === "hashtags") {
    return (
      <div>
        {L("Hashtags (comma or space separated)")}
        <Textarea value={(block.items ?? []).join(" ")} onChange={(e) => update({ items: e.target.value.split(/[\s,]+/).map(normalizeHashtag).filter(Boolean) })} className="min-h-[60px]" />
      </div>
    );
  }
  if (block.type === "image" || block.type === "video") {
    return (
      <div className="space-y-2">
        <div>{L(`${block.type === "image" ? "Image" : "Video"} URL`)}<Input value={block.url ?? ""} onChange={(e) => update({ url: e.target.value })} placeholder="https://…" /></div>
        {block.type === "image" && <div>{L("Alt text")}<Input value={block.alt ?? ""} onChange={(e) => update({ alt: e.target.value })} /></div>}
      </div>
    );
  }
  if (block.type === "link" || block.type === "cta") {
    return (
      <div className="space-y-2">
        <div>{L("Label")}<Input value={block.label ?? ""} onChange={(e) => update({ label: e.target.value })} /></div>
        <div>{L("URL")}<Input value={block.url ?? ""} onChange={(e) => update({ url: e.target.value })} placeholder="https://…" /></div>
      </div>
    );
  }
  // heading / text / quote
  return (
    <div className="space-y-2">
      {block.type === "heading" && (
        <div>{L("Level")}<FieldSelect value={block.level ?? "h1"} onChange={(v) => update({ level: v as "h1" | "h2" })} options={[{ value: "h1", label: "Large" }, { value: "h2", label: "Medium" }]} /></div>
      )}
      <div>{L("Text")}<Textarea value={block.text ?? ""} onChange={(e) => update({ text: e.target.value })} className="min-h-[120px]" /></div>
      <p className="text-[11px] text-muted-foreground">Tip: use {"{{merge_fields}}"} like {"{{event_title}}"}, {"{{event_url}}"}, {"{{site_url}}"}.</p>
    </div>
  );
}
