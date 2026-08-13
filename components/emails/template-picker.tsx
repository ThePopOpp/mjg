"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Check, LayoutTemplate, Search, X } from "lucide-react";

export type PickerTemplate = { id: string; name: string; subject: string; status: string; category?: string | null };

const NONE = "__none__";

// Humanize a category slug: "six_week_challenge" → "Six Week Challenge".
function humanizeCategory(cat: string | null | undefined): string {
  if (!cat || !cat.trim()) return "Uncategorized";
  return cat
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function TemplatePicker({
  templates,
  value,
  onSelect,
}: {
  templates: PickerTemplate[];
  value: string | null;
  onSelect: (id: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [highlight, setHighlight] = useState(0);
  const [pos, setPos] = useState<{ top: number; left: number; width: number; maxHeight: number } | null>(null);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const selected = value ? templates.find((t) => t.id === value) ?? null : null;

  // Category options with counts (only categories that actually have templates).
  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const t of templates) {
      const key = t.category && t.category.trim() ? t.category : "__uncat__";
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([key, count]) => ({ key, label: humanizeCategory(key === "__uncat__" ? null : key), count }))
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
  }, [templates]);

  // Filter by category + fuzzy-ish text match on name/subject/category.
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return templates.filter((t) => {
      if (category !== "all") {
        const key = t.category && t.category.trim() ? t.category : "__uncat__";
        if (key !== category) return false;
      }
      if (!q) return true;
      return (
        t.name.toLowerCase().includes(q) ||
        (t.subject ?? "").toLowerCase().includes(q) ||
        humanizeCategory(t.category).toLowerCase().includes(q)
      );
    });
  }, [templates, category, query]);

  // Group filtered results by category (when showing "all"); otherwise a single flat group.
  const groups = useMemo(() => {
    if (category !== "all") return [{ key: category, label: humanizeCategory(category === "__uncat__" ? null : category), items: filtered }];
    const byCat = new Map<string, PickerTemplate[]>();
    for (const t of filtered) {
      const key = t.category && t.category.trim() ? t.category : "__uncat__";
      byCat.set(key, [...(byCat.get(key) ?? []), t]);
    }
    return Array.from(byCat.entries())
      .map(([key, items]) => ({ key, label: humanizeCategory(key === "__uncat__" ? null : key), items }))
      .sort((a, b) => b.items.length - a.items.length || a.label.localeCompare(b.label));
  }, [filtered, category]);

  // Flat list (in display order) for keyboard navigation. Index 0 is the "manual" row.
  const flat = useMemo(() => [null as PickerTemplate | null, ...groups.flatMap((g) => g.items)], [groups]);

  function place() {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const width = Math.min(380, window.innerWidth - 24);
    const left = Math.max(12, Math.min(r.right - width, window.innerWidth - width - 12));
    const top = r.bottom + 6;
    const maxHeight = Math.max(220, window.innerHeight - top - 16);
    setPos({ top, left, width, maxHeight });
  }

  useLayoutEffect(() => {
    if (open) place();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onScroll = () => place();
    const onResize = () => place();
    const onDown = (e: MouseEvent) => {
      if (panelRef.current?.contains(e.target as Node) || triggerRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    };
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);
    document.addEventListener("mousedown", onDown);
    const t = setTimeout(() => searchRef.current?.focus(), 20);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("mousedown", onDown);
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Reset highlight to the first result whenever the query/category changes.
  useEffect(() => setHighlight(query || category !== "all" ? 1 : 0), [query, category]);

  function choose(id: string | null) {
    onSelect(id);
    setOpen(false);
    setQuery("");
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") { setOpen(false); triggerRef.current?.focus(); return; }
    if (e.key === "ArrowDown") { e.preventDefault(); setHighlight((h) => Math.min(h + 1, flat.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setHighlight((h) => Math.max(h - 1, 0)); }
    else if (e.key === "Enter") {
      e.preventDefault();
      const item = flat[highlight];
      choose(item ? item.id : null);
    }
  }

  // Keep the highlighted row in view.
  useEffect(() => {
    if (!open) return;
    const node = listRef.current?.querySelector<HTMLElement>(`[data-idx="${highlight}"]`);
    node?.scrollIntoView({ block: "nearest" });
  }, [highlight, open]);

  let running = 0; // running index across groups, aligned with `flat` (which has manual at 0)

  return (
    <>
      <button
        type="button"
        ref={triggerRef}
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex h-9 w-auto max-w-[220px] shrink-0 items-center gap-1.5 rounded-md border px-3 text-sm transition-colors ${
          selected ? "border-primary/60 bg-primary/5 text-primary" : "border-input bg-background text-muted-foreground hover:bg-accent"
        }`}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <LayoutTemplate className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate">{selected ? selected.name : "No template (manual)"}</span>
      </button>

      {open && pos ? (
        <div
          ref={panelRef}
          onKeyDown={onKeyDown}
          style={{ position: "fixed", top: pos.top, left: pos.left, width: pos.width, maxHeight: pos.maxHeight }}
          className="z-50 flex flex-col overflow-hidden rounded-lg border bg-popover text-popover-foreground shadow-lg"
        >
          {/* Search */}
          <div className="flex items-center gap-2 border-b px-3 py-2">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search templates…"
              className="h-6 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            {query ? (
              <button type="button" onClick={() => setQuery("")} className="rounded p-0.5 text-muted-foreground hover:text-foreground" aria-label="Clear search">
                <X className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </div>

          {/* Category filter chips */}
          {categories.length > 1 ? (
            <div className="flex flex-wrap gap-1 border-b px-2.5 py-2">
              <Chip active={category === "all"} onClick={() => setCategory("all")}>All <span className="opacity-60">{templates.length}</span></Chip>
              {categories.map((c) => (
                <Chip key={c.key} active={category === c.key} onClick={() => setCategory(c.key)}>
                  {c.label} <span className="opacity-60">{c.count}</span>
                </Chip>
              ))}
            </div>
          ) : null}

          {/* Results */}
          <div ref={listRef} className="min-h-0 flex-1 overflow-y-auto py-1">
            {/* Manual (always first, index 0) */}
            <Row
              idx={0}
              highlighted={highlight === 0}
              selected={!selected}
              onClick={() => choose(null)}
              onMouseEnter={() => setHighlight(0)}
              title="No template (manual)"
              subtitle="Compose a custom email"
            />

            {groups.map((g) => (
              <div key={g.key}>
                <div className="sticky top-0 z-10 bg-popover px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {g.label} <span className="opacity-60">· {g.items.length}</span>
                </div>
                {g.items.map((t) => {
                  running += 1;
                  const idx = running;
                  return (
                    <Row
                      key={t.id}
                      idx={idx}
                      highlighted={highlight === idx}
                      selected={selected?.id === t.id}
                      onClick={() => choose(t.id)}
                      onMouseEnter={() => setHighlight(idx)}
                      title={t.name}
                      subtitle={t.subject}
                      status={t.status}
                    />
                  );
                })}
              </div>
            ))}

            {filtered.length === 0 ? (
              <p className="px-3 py-6 text-center text-sm text-muted-foreground">No templates match &ldquo;{query}&rdquo;.</p>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
        active ? "border-primary bg-primary text-primary-foreground" : "border-input bg-background text-muted-foreground hover:bg-accent"
      }`}
    >
      {children}
    </button>
  );
}

function Row({
  idx, highlighted, selected, onClick, onMouseEnter, title, subtitle, status,
}: {
  idx: number; highlighted: boolean; selected: boolean; onClick: () => void; onMouseEnter: () => void;
  title: string; subtitle?: string; status?: string;
}) {
  return (
    <button
      type="button"
      data-idx={idx}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      className={`flex w-full items-start gap-2 px-3 py-2 text-left ${highlighted ? "bg-accent" : ""}`}
    >
      <Check className={`mt-0.5 h-4 w-4 shrink-0 ${selected ? "text-primary" : "text-transparent"}`} />
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          <span className="truncate text-sm font-medium text-foreground">{title}</span>
          {status && status !== "active" ? (
            <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] uppercase text-muted-foreground">{status}</span>
          ) : null}
        </span>
        {subtitle ? <span className="mt-0.5 block truncate text-xs text-muted-foreground">{subtitle}</span> : null}
      </span>
    </button>
  );
}
