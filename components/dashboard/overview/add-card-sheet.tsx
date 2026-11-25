"use client";

import { useMemo, useState } from "react";
import { Check, Eye, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { CATEGORY_LABELS, widgetsFor, type WidgetCategory, type WidgetDef } from "@/lib/dashboard/overview/catalog";
import type { OverviewRow } from "@/lib/dashboard/overview/layout";
import type { AppRole } from "@/lib/rbac/roles";
import { Panel } from "./panel";
import { WIDGET_UI } from "./widgets";

export type AddTarget = "auto" | "new-top" | "new-bottom" | string;

/** Every card the role may add, by category, with search, a live preview and a target row. */
export function AddCardSheet({
  open,
  onOpenChange,
  role,
  rows,
  onAdd,
  onShow,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  role: AppRole;
  rows: OverviewRow[];
  onAdd: (widget: string, target: AddTarget) => void;
  onShow: (uid: string) => void;
}) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<WidgetCategory | "all">("all");
  const [target, setTarget] = useState<AddTarget>("auto");
  const [preview, setPreview] = useState<string | null>(null);
  const [justAdded, setJustAdded] = useState<string | null>(null);

  const all = useMemo(() => widgetsFor(role), [role]);
  const placed = useMemo(() => {
    const m = new Map<string, { uid: string; hidden: boolean }>();
    for (const r of rows) for (const c of r.cards) m.set(c.widget, { uid: c.uid, hidden: !!c.hidden || !!r.hidden });
    return m;
  }, [rows]);
  const categories = useMemo(() => [...new Set(all.map((w) => w.category))], [all]);
  const needle = q.trim().toLowerCase();
  const list = all.filter(
    (w) => (cat === "all" || w.category === cat) && (!needle || `${w.title} ${w.description} ${w.keywords ?? ""} ${CATEGORY_LABELS[w.category]}`.toLowerCase().includes(needle)),
  );
  const byCat = categories.map((c) => ({ c, items: list.filter((w) => w.category === c) })).filter((g) => g.items.length);

  const add = (w: WidgetDef) => {
    onAdd(w.id, target);
    setJustAdded(w.id);
    window.setTimeout(() => setJustAdded((x) => (x === w.id ? null : x)), 1600);
  };

  return (
    <Panel open={open} onOpenChange={onOpenChange} title="Add Card" description={`${all.length} cards available to you. Add as many as you like; drag them into place after.`} width="sm:max-w-2xl">
      <div className="sticky top-0 z-10 space-y-3 border-b bg-background/95 px-6 py-3 backdrop-blur">
        <div className="flex flex-col gap-2 sm:flex-row">
          <label className="relative block flex-1">
            <span className="sr-only">Search cards</span>
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search cards: calendar, dialpad, revenue…" className="pl-9" />
          </label>
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="shrink-0">Add to</span>
            <select value={target} onChange={(e) => setTarget(e.target.value)} className="h-9 min-w-0 flex-1 rounded-md border bg-background px-2 text-sm text-foreground sm:w-44">
              <option value="auto">Best spot</option>
              <option value="new-top">New row at top</option>
              <option value="new-bottom">New row at bottom</option>
              {rows.map((r, i) => (
                <option key={r.id} value={r.id}>
                  {r.title || `Row ${i + 1}`}
                  {r.kind === "rail" ? " (sliding)" : ""}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1" role="tablist" aria-label="Card categories">
          {(["all", ...categories] as const).map((c) => (
            <button
              key={c}
              type="button"
              role="tab"
              aria-selected={cat === c}
              onClick={() => setCat(c)}
              className={cn(
                "shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition",
                cat === c ? "border-[#141211] bg-[#141211] text-[#f4f1ea] dark:border-[#f4f1ea] dark:bg-[#f4f1ea] dark:text-[#141211]" : "hover:bg-muted",
              )}
            >
              {c === "all" ? "All" : CATEGORY_LABELS[c]}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-6 px-6 py-5">
        {byCat.map(({ c, items }) => (
          <section key={c} aria-label={CATEGORY_LABELS[c]}>
            <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{CATEGORY_LABELS[c]}</h3>
            <ul className="grid gap-2.5 sm:grid-cols-2">
              {items.map((w) => {
                const ui = WIDGET_UI[w.id];
                const Icon = ui?.icon;
                const there = placed.get(w.id);
                const isPreview = preview === w.id;
                return (
                  <li key={w.id} className={cn("rounded-xl border bg-card p-3 transition", isPreview && "sm:col-span-2", justAdded === w.id && "border-[#b88a4a] ring-2 ring-[#b88a4a]/30")}>
                    <div className="flex items-start gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#b88a4a]/25 to-[#b88a4a]/5 text-[#9a7038] dark:text-[#d9b27a]">
                        {Icon ? <Icon className="h-5 w-5" aria-hidden /> : null}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold">{w.title}</p>
                        <p className="line-clamp-2 text-xs text-muted-foreground">{w.description}</p>
                      </div>
                    </div>
                    <div className="mt-2.5 flex items-center justify-end gap-1.5">
                      <Button type="button" size="sm" variant="ghost" className="h-8 gap-1 text-xs" onClick={() => setPreview(isPreview ? null : w.id)} aria-expanded={isPreview}>
                        <Eye className="h-3.5 w-3.5" aria-hidden /> {isPreview ? "Close preview" : "Preview"}
                      </Button>
                      {there && w.single !== false ? (
                        there.hidden ? (
                          <Button type="button" size="sm" variant="outline" className="h-8 text-xs" onClick={() => onShow(there.uid)}>
                            Show it
                          </Button>
                        ) : (
                          <span className="inline-flex h-8 items-center gap-1 px-2 text-xs font-medium text-muted-foreground">
                            <Check className="h-3.5 w-3.5 text-[#b88a4a]" aria-hidden /> On your dashboard
                          </span>
                        )
                      ) : (
                        <Button type="button" size="sm" className="h-8 gap-1 bg-[#141211] text-xs text-[#f4f1ea] hover:bg-[#2a2622] dark:bg-[#b88a4a] dark:text-white" onClick={() => add(w)}>
                          <Plus className="h-3.5 w-3.5" aria-hidden /> {justAdded === w.id ? "Added" : "Add"}
                        </Button>
                      )}
                    </div>
                    {isPreview && ui ? (
                      // A live render of the card with your data, not clickable here.
                      <div className="pointer-events-none mt-3 max-h-[420px] overflow-hidden rounded-xl border border-dashed bg-muted/30 p-3" aria-hidden inert>
                        <ui.Component card={{ uid: `preview-${w.id}`, widget: w.id, span: w.span }} def={w} />
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
        {!byCat.length ? <p className="py-8 text-center text-sm text-muted-foreground">No cards match “{q}”.</p> : null}
      </div>
    </Panel>
  );
}
