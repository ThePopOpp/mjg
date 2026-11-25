"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  pointerWithin,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, horizontalListSortingStrategy, rectSortingStrategy, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ChevronDown,
  Columns3,
  Eye,
  EyeOff,
  GripVertical,
  LayoutDashboard,
  MoreHorizontal,
  Pencil,
  Plus,
  RotateCcw,
  Rows3,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  Undo2,
  Wand2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDashboardActionToken } from "@/components/layout/dashboard-action-token";
import { cn } from "@/lib/utils";
import { WIDGET_BY_ID, allowed } from "@/lib/dashboard/overview/catalog";
import { card as makeCard, clampSpan, uid, type OverviewCard, type OverviewLayout, type OverviewRow } from "@/lib/dashboard/overview/layout";
import type { AppRole } from "@/lib/rbac/roles";
import { OverviewContext, type OverviewApi, type OverviewProfile } from "./overview-context";
import { Rail } from "./rail";
import { WIDGET_UI } from "./widgets";
import { AddCardSheet, type AddTarget } from "./add-card-sheet";
import { AllFeaturesSheet } from "./all-features-sheet";
import { GetStartedWizard, type WizardResult } from "./get-started-wizard";
import { openDashboardSearch } from "./command-search";

type SaveState = "idle" | "saving" | "saved" | "error";

const RANGES = [
  { value: "today", label: "Today" },
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
] as const;

/** Grid placement: phones pair up small cards, tablets use halves, desktop the saved span. */
function spanStyle(span: number): React.CSSProperties {
  return { "--span": span, "--md": span >= 7 ? 12 : 6, "--sm": span <= 3 ? 6 : 12 } as React.CSSProperties;
}
const SPAN_CLASS = "[grid-column:span_var(--sm)/span_var(--sm)] md:[grid-column:span_var(--md)/span_var(--md)] lg:[grid-column:span_var(--span)/span_var(--span)]";

export function OverviewBoard({ initialLayout, role, profile }: { initialLayout: OverviewLayout; role: AppRole; profile: OverviewProfile }) {
  const token = useDashboardActionToken();
  const [layout, setLayout] = useState<OverviewLayout>(initialLayout);
  const [editing, setEditing] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [featuresOpen, setFeaturesOpen] = useState(false);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [confirm, setConfirm] = useState<null | "standard" | "blank" | { deleteView: string }>(null);
  const [save, setSave] = useState<SaveState>("idle");
  const [flash, setFlash] = useState<string | null>(null);
  const history = useRef<OverviewLayout[]>([]);
  const dirty = useRef(false);
  const timer = useRef<number | null>(null);

  // Cards this role can see. Cards a "View as" role can't use stay saved but aren't shown.
  const visible = useCallback((c: OverviewCard) => {
    const def = WIDGET_BY_ID.get(c.widget);
    return !!def && allowed(role, def.access) && !!WIDGET_UI[c.widget];
  }, [role]);

  // ── Persistence ────────────────────────────────────────────────────────────
  const persist = useCallback(
    (next: OverviewLayout) => {
      if (timer.current) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(async () => {
        setSave("saving");
        try {
          const res = await fetch("/api/me/dashboard-layout", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ layout: next, actionToken: token }) });
          if (!res.ok) throw new Error();
          dirty.current = false;
          setSave("saved");
        } catch {
          setSave("error");
        }
      }, 600);
    },
    [token],
  );

  const commit = useCallback(
    (fn: (l: OverviewLayout) => OverviewLayout, opts: { undoable?: boolean } = {}) => {
      setLayout((prev) => {
        const next = fn(prev);
        if (next === prev) return prev;
        if (opts.undoable !== false) history.current = [...history.current.slice(-19), prev];
        dirty.current = true;
        persist(next);
        return next;
      });
    },
    [persist],
  );

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (dirty.current) e.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, []);

  // First visit in Blank mode: offer the wizard straight away.
  useEffect(() => {
    if (initialLayout.mode === "blank" && !initialLayout.wizardDone) setWizardOpen(true);
  }, [initialLayout]);

  // Safety net for a Radix quirk: when one dialog hands off to another, the page can be
  // left with pointer-events: none. Once nothing is open, make sure it's clickable.
  const anyOpen = addOpen || featuresOpen || wizardOpen || confirm !== null;
  useEffect(() => {
    if (anyOpen) return;
    const t = window.setTimeout(() => {
      if (document.body.style.pointerEvents === "none" && !document.querySelector('[role="dialog"][data-state="open"]')) document.body.style.pointerEvents = "";
    }, 400);
    return () => window.clearTimeout(t);
  }, [anyOpen]);

  const undo = () => {
    const prev = history.current.pop();
    if (!prev) return;
    setLayout(prev);
    persist(prev);
  };

  // ── View helpers ───────────────────────────────────────────────────────────
  const view = layout.views.find((v) => v.id === layout.activeView) ?? layout.views[0];
  const rows = view.rows;
  const setRows = useCallback(
    (fn: (rows: OverviewRow[]) => OverviewRow[], opts?: { undoable?: boolean }) =>
      commit((l) => ({ ...l, views: l.views.map((v) => (v.id === (l.views.find((x) => x.id === l.activeView) ?? l.views[0]).id ? { ...v, rows: fn(v.rows) } : v)) }), opts),
    [commit],
  );
  const updateRow = (id: string, patch: Partial<OverviewRow>) => setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  const updateCard = useCallback(
    (cardUid: string, fn: (c: OverviewCard) => OverviewCard | null, opts?: { undoable?: boolean }) =>
      setRows((rs) => rs.map((r) => ({ ...r, cards: r.cards.map((c) => (c.uid === cardUid ? fn(c) : c)).filter((c): c is OverviewCard => c !== null) })), opts),
    [setRows],
  );

  const highlight = (cardUid: string) => {
    setFlash(cardUid);
    window.setTimeout(() => document.getElementById(`card-${cardUid}`)?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "center" }), 120);
    window.setTimeout(() => setFlash((f) => (f === cardUid ? null : f)), 2200);
  };

  const addCard = (widget: string, target: AddTarget) => {
    const def = WIDGET_BY_ID.get(widget);
    if (!def) return;
    const c = makeCard(widget);
    setRows((rs) => {
      const next = rs.map((r) => ({ ...r, cards: [...r.cards] }));
      let dest = target;
      if (target === "auto") {
        const rail = def.tile ? next.find((r) => r.kind === "rail" && r.cards.some((x) => WIDGET_BY_ID.get(x.widget)?.tile)) : undefined;
        dest = rail?.id ?? next.find((r) => r.id === "r-added")?.id ?? "added";
      }
      const existing = next.find((r) => r.id === dest);
      if (existing) {
        existing.cards.push(c);
        existing.hidden = false;
        return next;
      }
      const row: OverviewRow = def.tile ? { id: uid("r"), kind: "rail", title: "Stat Cards", visible: 5, cards: [c] } : { id: dest === "added" ? "r-added" : uid("r"), kind: "grid", title: "Added Cards", cards: [c] };
      // New rows land near the top (under the search bar) so they're seen at once.
      if (target === "new-bottom") return [...next, row];
      const after = next.findIndex((r) => r.cards.some((x) => x.widget.startsWith("toolbar.")));
      return [...next.slice(0, after + 1), row, ...next.slice(after + 1)];
    });
    highlight(c.uid);
  };

  const showCard = (cardUid: string) => {
    setRows((rs) => rs.map((r) => (r.cards.some((c) => c.uid === cardUid) ? { ...r, hidden: false, cards: r.cards.map((c) => (c.uid === cardUid ? { ...c, hidden: false } : c)) } : r)));
    highlight(cardUid);
  };

  // ── Context for cards ──────────────────────────────────────────────────────
  const api: OverviewApi = useMemo(
    () => ({
      role,
      profile,
      layout,
      editing,
      setCardSettings: (cardUid, settings) => updateCard(cardUid, (c) => ({ ...c, settings }), { undoable: false }),
      setLayoutField: (key, value) => commit((l) => ({ ...l, [key]: value }), { undoable: false }),
      hideCard: (cardUid) => updateCard(cardUid, (c) => ({ ...c, hidden: true })),
      openAddCard: () => setAddOpen(true),
      openFeatures: () => setFeaturesOpen(true),
      openSearch: (q) => openDashboardSearch(q),
      startCustomize: () => setEditing(true),
      openWizard: () => setWizardOpen(true),
    }),
    [role, profile, layout, editing, updateCard, commit],
  );

  // ── Drag and drop ──────────────────────────────────────────────────────────
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
  const [activeId, setActiveId] = useState<string | null>(null);

  const collision: CollisionDetection = useCallback((args) => {
    const id = String(args.active.id);
    const only = (prefix: string) => args.droppableContainers.filter((c) => String(c.id).startsWith(prefix));
    if (id.startsWith("row:")) return closestCenter({ ...args, droppableContainers: only("row:") });
    const overCard = pointerWithin({ ...args, droppableContainers: only("card:") });
    if (overCard.length) return overCard;
    const overRow = pointerWithin({ ...args, droppableContainers: only("row:") });
    if (overRow.length) return overRow;
    return closestCenter({ ...args, droppableContainers: only("card:") });
  }, []);

  const rowOfCard = (cardUid: string, rs = rows) => rs.find((r) => r.cards.some((c) => c.uid === cardUid));

  const onDragStart = (e: DragStartEvent) => setActiveId(String(e.active.id));
  const onDragOver = (e: DragOverEvent) => {
    const a = String(e.active.id);
    const o = e.over ? String(e.over.id) : null;
    if (!o || !a.startsWith("card:")) return;
    const cardUid = a.slice(5);
    const from = rowOfCard(cardUid);
    const to = o.startsWith("card:") ? rowOfCard(o.slice(5)) : rows.find((r) => `row:${r.id}` === o);
    if (!from || !to || from.id === to.id) return;
    // Move across rows while dragging so the card previews in its new row.
    setRows(
      (rs) => {
        const moving = rs.find((r) => r.id === from.id)?.cards.find((c) => c.uid === cardUid);
        if (!moving) return rs;
        return rs.map((r) => {
          if (r.id === from.id) return { ...r, cards: r.cards.filter((c) => c.uid !== cardUid) };
          if (r.id === to.id) {
            const idx = o.startsWith("card:") ? r.cards.findIndex((c) => c.uid === o.slice(5)) : r.cards.length;
            const cards = [...r.cards];
            cards.splice(idx < 0 ? cards.length : idx, 0, moving);
            return { ...r, cards };
          }
          return r;
        });
      },
      { undoable: false },
    );
  };
  const onDragEnd = (e: DragEndEvent) => {
    setActiveId(null);
    const a = String(e.active.id);
    const o = e.over ? String(e.over.id) : null;
    if (!o || a === o) return;
    if (a.startsWith("row:") && o.startsWith("row:")) {
      setRows((rs) => arrayMove(rs, rs.findIndex((r) => `row:${r.id}` === a), rs.findIndex((r) => `row:${r.id}` === o)));
    } else if (a.startsWith("card:") && o.startsWith("card:")) {
      const row = rowOfCard(a.slice(5));
      if (!row || row.id !== rowOfCard(o.slice(5))?.id) return;
      setRows((rs) => rs.map((r) => (r.id === row.id ? { ...r, cards: arrayMove(r.cards, r.cards.findIndex((c) => c.uid === a.slice(5)), r.cards.findIndex((c) => c.uid === o.slice(5))) } : r)));
    }
  };

  // ── Starting points and views ──────────────────────────────────────────────
  const applyReset = async (kind: "standard" | "blank") => {
    setConfirm(null);
    history.current = [...history.current.slice(-19), layout];
    const res = await fetch("/api/me/dashboard-layout", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reset: kind, actionToken: token }) });
    const j = await res.json().catch(() => ({}));
    if (res.ok && j.layout) {
      setLayout(j.layout);
      setSave("saved");
      // Open the wizard after the confirm dialog has finished closing.
      if (kind === "blank") window.setTimeout(() => setWizardOpen(true), 250);
    } else setSave("error");
  };

  const finishWizard = ({ rows: built, density, name }: WizardResult) => {
    setWizardOpen(false);
    commit((l) => ({ ...l, wizardDone: true, density, views: l.views.map((v) => (v.id === view.id ? { ...v, name, rows: built } : v)) }));
    setEditing(false);
  };

  const addView = () => {
    const id = uid("v");
    commit((l) => ({ ...l, activeView: id, views: [...l.views, { id, name: `View ${l.views.length + 1}`, rows: [] }] }));
    setEditing(true);
  };

  const hiddenRows = rows.filter((r) => r.hidden && r.cards.some(visible));
  const hiddenCards = rows.filter((r) => !r.hidden).flatMap((r) => r.cards.filter((c) => c.hidden && visible(c)));
  const shownRows = editing ? rows : rows.filter((r) => !r.hidden && r.cards.some((c) => !c.hidden && visible(c)));
  const gap = layout.density === "compact" ? "gap-3" : "gap-4";
  const stack = layout.density === "compact" ? "space-y-5" : "space-y-7";
  const activeCard = activeId?.startsWith("card:") ? rows.flatMap((r) => r.cards).find((c) => c.uid === activeId.slice(5)) : null;

  return (
    <OverviewContext.Provider value={api}>
      <div className={cn("pb-10", stack)}>
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Overview</h1>
          {layout.views.length > 1 || editing ? (
            <div className="flex max-w-full items-center gap-1 overflow-x-auto rounded-full border bg-card p-1" role="tablist" aria-label="Dashboards">
              {layout.views.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  role="tab"
                  aria-selected={v.id === view.id}
                  onClick={() => commit((l) => ({ ...l, activeView: v.id }), { undoable: false })}
                  className={cn("shrink-0 rounded-full px-3 py-1 text-xs font-medium transition", v.id === view.id ? "bg-[#141211] text-[#f4f1ea] dark:bg-[#f4f1ea] dark:text-[#141211]" : "hover:bg-muted")}
                >
                  {v.name}
                </button>
              ))}
              {editing ? (
                <button type="button" onClick={addView} className="shrink-0 rounded-full p-1.5 hover:bg-muted" aria-label="New dashboard view">
                  <Plus className="h-3.5 w-3.5" />
                </button>
              ) : null}
            </div>
          ) : null}
          <div className="ml-auto flex items-center gap-2">
            <span className="hidden text-xs text-muted-foreground sm:inline" aria-live="polite">
              {save === "saving" ? "Saving…" : save === "saved" ? "Saved" : save === "error" ? "Couldn't save" : ""}
            </span>
            {save === "error" ? (
              <Button type="button" size="sm" variant="ghost" onClick={() => persist(layout)}>
                Retry
              </Button>
            ) : null}
            <Button type="button" size="sm" variant="outline" className="gap-1.5" onClick={() => setAddOpen(true)}>
              <Plus className="h-4 w-4" aria-hidden /> Add Card
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => setEditing((e) => !e)}
              className={cn("gap-1.5", editing ? "bg-[#b88a4a] text-white hover:bg-[#a47a3e]" : "bg-[#141211] text-[#f4f1ea] hover:bg-[#2a2622] dark:bg-[#f4f1ea] dark:text-[#141211]")}
              aria-pressed={editing}
            >
              {editing ? <X className="h-4 w-4" aria-hidden /> : <SlidersHorizontal className="h-4 w-4" aria-hidden />}
              {editing ? "Done" : "Customize"}
            </Button>
            {/* Non-modal: its items open dialogs, and a modal menu handing off to a dialog can leave the page unclickable. */}
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button type="button" size="icon" variant="ghost" className="h-9 w-9" aria-label="More dashboard options">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Dashboard</DropdownMenuLabel>
                <DropdownMenuItem onSelect={() => setWizardOpen(true)}>
                  <Wand2 className="mr-2 h-4 w-4" /> Setup wizard
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={addView}>
                  <LayoutDashboard className="mr-2 h-4 w-4" /> New view
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setFeaturesOpen(true)}>
                  <Sparkles className="mr-2 h-4 w-4" /> All Features
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Density</DropdownMenuLabel>
                <DropdownMenuRadioGroup value={layout.density} onValueChange={(v) => commit((l) => ({ ...l, density: v as OverviewLayout["density"] }), { undoable: false })}>
                  <DropdownMenuRadioItem value="comfy">Comfortable</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="compact">Compact</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Start over</DropdownMenuLabel>
                <DropdownMenuItem onSelect={() => setConfirm("standard")}>
                  <RotateCcw className="mr-2 h-4 w-4" /> Standard dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setConfirm("blank")}>
                  <Sparkles className="mr-2 h-4 w-4" /> Blank with setup wizard
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* ── Customize toolbar ──────────────────────────────────────────── */}
        {editing ? (
          <div className="sticky top-16 z-30 flex flex-wrap items-center gap-2 rounded-2xl border border-[#b88a4a]/50 bg-[#fbf6ec]/95 px-4 py-2.5 shadow-sm backdrop-blur dark:bg-[#211c17]/95">
            <Pencil className="h-4 w-4 text-[#b88a4a]" aria-hidden />
            <p className="mr-auto text-sm">
              <span className="font-semibold">Customizing.</span> <span className="text-muted-foreground">Drag the handles to move cards and rows. Use the keyboard: focus a handle, press Space, then the arrows.</span>
            </p>
            <Button type="button" size="sm" variant="ghost" className="gap-1.5" onClick={undo} disabled={!history.current.length}>
              <Undo2 className="h-4 w-4" aria-hidden /> Undo
            </Button>
            <Button type="button" size="sm" variant="ghost" className="gap-1.5" onClick={() => setRows((rs) => [...rs, { id: uid("r"), kind: "grid", title: "New row", cards: [] }])}>
              <Rows3 className="h-4 w-4" aria-hidden /> Add row
            </Button>
            {layout.views.length > 1 ? (
              <RenameView name={view.name} onRename={(name) => commit((l) => ({ ...l, views: l.views.map((v) => (v.id === view.id ? { ...v, name } : v)) }))} onDelete={() => setConfirm({ deleteView: view.id })} />
            ) : (
              <RenameView name={view.name} onRename={(name) => commit((l) => ({ ...l, views: l.views.map((v) => (v.id === view.id ? { ...v, name } : v)) }))} />
            )}
            <Button type="button" size="sm" className="bg-[#b88a4a] text-white hover:bg-[#a47a3e]" onClick={() => setEditing(false)}>
              Done
            </Button>
          </div>
        ) : null}

        {/* ── Rows ───────────────────────────────────────────────────────── */}
        {!rows.length ? (
          <BlankState onWizard={() => setWizardOpen(true)} onAdd={() => setAddOpen(true)} onStandard={() => applyReset("standard")} />
        ) : (
          <DndContext sensors={sensors} collisionDetection={collision} onDragStart={onDragStart} onDragOver={onDragOver} onDragEnd={onDragEnd} onDragCancel={() => setActiveId(null)}>
            <SortableContext items={shownRows.map((r) => `row:${r.id}`)} strategy={verticalListSortingStrategy}>
              <div className={stack}>
                {shownRows.map((row) => (
                  <RowView
                    key={row.id}
                    row={row}
                    editing={editing}
                    gap={gap}
                    visible={visible}
                    flash={flash}
                    statRange={layout.statRange}
                    onRange={(r) => commit((l) => ({ ...l, statRange: r }), { undoable: false })}
                    onUpdate={(patch) => updateRow(row.id, patch)}
                    onDelete={() => setRows((rs) => rs.filter((r) => r.id !== row.id))}
                    onCard={(cardUid, fn) => updateCard(cardUid, fn)}
                  />
                ))}
              </div>
            </SortableContext>
            <DragOverlay dropAnimation={null}>
              {activeCard ? (
                <div className="rounded-2xl border-2 border-[#b88a4a] bg-card/95 px-4 py-3 text-sm font-semibold shadow-2xl">{WIDGET_BY_ID.get(activeCard.widget)?.title}</div>
              ) : activeId?.startsWith("row:") ? (
                <div className="rounded-2xl border-2 border-[#b88a4a] bg-card/95 px-4 py-3 text-sm font-semibold shadow-2xl">{rows.find((r) => `row:${r.id}` === activeId)?.title || "Row"}</div>
              ) : null}
            </DragOverlay>
          </DndContext>
        )}

        {/* ── Hidden things, one click to bring back ─────────────────────── */}
        {!editing && (hiddenRows.length || hiddenCards.length) ? (
          <div className="flex flex-wrap items-center gap-2 border-t pt-4 text-xs text-muted-foreground">
            <EyeOff className="h-3.5 w-3.5" aria-hidden />
            <span>Hidden:</span>
            {hiddenRows.map((r) => (
              <button key={r.id} type="button" onClick={() => updateRow(r.id, { hidden: false })} className="inline-flex items-center gap-1 rounded-full border bg-card px-2.5 py-1 font-medium text-foreground hover:border-[#b88a4a]/60">
                <Eye className="h-3 w-3" aria-hidden /> {r.title || WIDGET_BY_ID.get(r.cards[0]?.widget ?? "")?.title || "Row"}
              </button>
            ))}
            {hiddenCards.map((c) => (
              <button key={c.uid} type="button" onClick={() => showCard(c.uid)} className="inline-flex items-center gap-1 rounded-full border bg-card px-2.5 py-1 font-medium text-foreground hover:border-[#b88a4a]/60">
                <Eye className="h-3 w-3" aria-hidden /> {WIDGET_BY_ID.get(c.widget)?.title}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <AddCardSheet open={addOpen} onOpenChange={setAddOpen} role={role} rows={rows} onAdd={addCard} onShow={showCard} />
      <AllFeaturesSheet open={featuresOpen} onOpenChange={setFeaturesOpen} role={role} />
      <GetStartedWizard
        open={wizardOpen}
        onOpenChange={(o) => {
          setWizardOpen(o);
          if (!o && !layout.wizardDone) commit((l) => ({ ...l, wizardDone: true }), { undoable: false });
        }}
        role={role}
        onFinish={finishWizard}
      />

      <Dialog open={confirm !== null} onOpenChange={(o) => !o && setConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirm === "standard" ? "Switch to the Standard dashboard?" : confirm === "blank" ? "Start from a blank dashboard?" : "Delete this view?"}
            </DialogTitle>
            <DialogDescription>
              {confirm === "standard"
                ? "Your current layout is replaced with the standard Overview. Your notes, reminders and recordings are kept."
                : confirm === "blank"
                  ? "Every card is removed and the setup wizard opens so you can build it your way. Your notes, reminders and recordings are kept."
                  : `“${view.name}” and its layout are removed. Other views are not affected.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setConfirm(null)}>
              Cancel
            </Button>
            <Button
              type="button"
              className={typeof confirm === "object" ? "bg-red-600 text-white hover:bg-red-700" : "bg-[#141211] text-[#f4f1ea] hover:bg-[#2a2622] dark:bg-[#b88a4a] dark:text-white"}
              onClick={() => {
                if (confirm === "standard" || confirm === "blank") applyReset(confirm);
                else if (confirm && typeof confirm === "object") {
                  const id = confirm.deleteView;
                  setConfirm(null);
                  commit((l) => {
                    const views = l.views.filter((v) => v.id !== id);
                    return views.length ? { ...l, views, activeView: views[0].id } : l;
                  });
                }
              }}
            >
              {typeof confirm === "object" ? "Delete view" : "Yes, switch"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </OverviewContext.Provider>
  );
}

// ── A row ────────────────────────────────────────────────────────────────────

function RowView({
  row,
  editing,
  gap,
  visible,
  flash,
  statRange,
  onRange,
  onUpdate,
  onDelete,
  onCard,
}: {
  row: OverviewRow;
  editing: boolean;
  gap: string;
  visible: (c: OverviewCard) => boolean;
  flash: string | null;
  statRange: OverviewLayout["statRange"];
  onRange: (r: OverviewLayout["statRange"]) => void;
  onUpdate: (patch: Partial<OverviewRow>) => void;
  onDelete: () => void;
  onCard: (uid: string, fn: (c: OverviewCard) => OverviewCard | null) => void;
}) {
  const sortable = useSortable({ id: `row:${row.id}`, disabled: !editing });
  const style = { transform: CSS.Translate.toString(sortable.transform), transition: sortable.transition };
  const cards = row.cards.filter((c) => visible(c) && (editing || !c.hidden));
  const hasStats = cards.some((c) => WIDGET_BY_ID.get(c.widget)?.tile);
  const rail = row.kind === "rail";
  const titled = !!row.title;

  return (
    <section
      ref={sortable.setNodeRef}
      style={style}
      aria-label={row.title || undefined}
      className={cn(
        "relative",
        editing && "rounded-2xl border-2 border-dashed border-[#b88a4a]/40 bg-[#b88a4a]/[0.03] p-3 pt-2",
        sortable.isDragging && "z-20 opacity-60",
        row.hidden && editing && "opacity-50",
      )}
    >
      {editing ? (
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <button type="button" className="cursor-grab touch-none rounded-md p-1 text-muted-foreground hover:bg-muted active:cursor-grabbing" aria-label={`Move row ${row.title ?? ""}`} {...sortable.attributes} {...sortable.listeners}>
            <GripVertical className="h-4 w-4" />
          </button>
          <Input value={row.title ?? ""} onChange={(e) => onUpdate({ title: e.target.value.slice(0, 60) })} placeholder="Row title (optional)" className="h-8 w-48" aria-label="Row title" />
          <div className="flex rounded-lg border p-0.5" role="group" aria-label="Row style">
            <button type="button" aria-pressed={!rail} onClick={() => onUpdate({ kind: "grid" })} className={cn("inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs", !rail && "bg-muted font-medium")}>
              <Columns3 className="h-3.5 w-3.5" aria-hidden /> Grid
            </button>
            <button type="button" aria-pressed={rail} onClick={() => onUpdate({ kind: "rail", visible: row.visible ?? 4 })} className={cn("inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs", rail && "bg-muted font-medium")}>
              <Rows3 className="h-3.5 w-3.5 rotate-90" aria-hidden /> Sliding row
            </button>
          </div>
          {rail ? (
            <div className="flex w-48 items-center gap-2">
              <span className="text-xs text-muted-foreground">Visible</span>
              <Slider min={1} max={8} step={0.5} value={[row.visible ?? 4]} onValueChange={([v]) => onUpdate({ visible: v })} thumbLabel="Cards visible" />
              <span className="w-7 text-xs font-medium tabular-nums">{row.visible ?? 4}</span>
            </div>
          ) : null}
          <div className="ml-auto flex items-center gap-1">
            <button type="button" onClick={() => onUpdate({ hidden: !row.hidden })} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label={row.hidden ? "Show row" : "Hide row"} title={row.hidden ? "Show row" : "Hide row"}>
              {row.hidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </button>
            <button type="button" onClick={onDelete} className="rounded-md p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950" aria-label="Delete row" title="Delete row">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : titled ? (
        <div className="mb-3 flex flex-wrap items-center gap-2 sm:pr-20">
          <button type="button" onClick={() => onUpdate({ collapsed: !row.collapsed })} className="group flex items-center gap-1.5" aria-expanded={!row.collapsed}>
            <h2 className="whitespace-nowrap text-lg font-semibold tracking-tight">{row.title}</h2>
            <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition", row.collapsed && "-rotate-90")} aria-hidden />
          </button>
          {hasStats ? (
            <div className="flex shrink-0 rounded-full border bg-card p-0.5" role="group" aria-label="Date range">
              {RANGES.map((r) => (
                <button key={r.value} type="button" aria-pressed={statRange === r.value} onClick={() => onRange(r.value)} className={cn("whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium", statRange === r.value ? "bg-[#141211] text-[#f4f1ea] dark:bg-[#f4f1ea] dark:text-[#141211]" : "text-muted-foreground hover:text-foreground")}>
                  {r.label}
                </button>
              ))}
            </div>
          ) : null}
          <button type="button" onClick={() => onUpdate({ hidden: true })} className={cn("rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground", rail ? "ml-2" : "ml-auto")} aria-label={`Hide ${row.title}`} title="Hide this section">
            <EyeOff className="h-4 w-4" />
          </button>
        </div>
      ) : null}

      {row.collapsed && !editing ? null : (
        <SortableContext items={cards.map((c) => `card:${c.uid}`)} strategy={rail && !editing ? horizontalListSortingStrategy : rectSortingStrategy}>
          {!cards.length && editing ? (
            <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">Drag cards here, or use Add Card.</div>
          ) : rail && !editing ? (
            <Rail visible={row.visible ?? 4} mobile={hasStats ? 2.2 : 1.2} label={row.title ?? "cards"} controls={titled ? "header" : "overlay"}>
              {cards.map((c) => (
                <CardView key={c.uid} card={c} editing={false} flash={flash === c.uid} inRail onCard={onCard} />
              ))}
            </Rail>
          ) : (
            <div className={cn("grid grid-cols-12", gap)}>
              {cards.map((c) => (
                <CardView key={c.uid} card={c} editing={editing} flash={flash === c.uid} inRail={rail} onCard={onCard} />
              ))}
            </div>
          )}
        </SortableContext>
      )}
    </section>
  );
}

// ── A card ───────────────────────────────────────────────────────────────────

function CardView({ card, editing, flash, inRail, onCard }: { card: OverviewCard; editing: boolean; flash: boolean; inRail: boolean; onCard: (uid: string, fn: (c: OverviewCard) => OverviewCard | null) => void }) {
  const def = WIDGET_BY_ID.get(card.widget)!;
  const ui = WIDGET_UI[card.widget];
  const sortable = useSortable({ id: `card:${card.uid}`, disabled: !editing });
  const style: React.CSSProperties = { ...(inRail && !editing ? {} : spanStyle(inRail ? 3 : card.span)), transform: CSS.Translate.toString(sortable.transform), transition: sortable.transition };
  const Body = ui.Component;

  return (
    <div
      id={`card-${card.uid}`}
      ref={sortable.setNodeRef}
      style={style}
      className={cn(
        "relative min-w-0",
        !(inRail && !editing) && SPAN_CLASS,
        flash && "rounded-2xl ring-4 ring-[#b88a4a]/50 transition-shadow",
        sortable.isDragging && "z-30 opacity-40",
        editing && card.hidden && "opacity-45",
      )}
    >
      {editing ? (
        <div className="absolute inset-x-2 top-2 z-20 flex items-center gap-1 rounded-xl border bg-card/95 px-1.5 py-1 shadow-md backdrop-blur">
          <button type="button" className="cursor-grab touch-none rounded-md p-1 text-muted-foreground hover:bg-muted active:cursor-grabbing" aria-label={`Move ${def.title}`} {...sortable.attributes} {...sortable.listeners}>
            <GripVertical className="h-4 w-4" />
          </button>
          <span className="min-w-0 flex-1 truncate text-xs font-semibold">{def.title}</span>
          {!inRail ? (
            <Popover>
              <PopoverTrigger asChild>
                <button type="button" className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label={`Resize ${def.title}`} title="Width">
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-64" align="end">
                <p className="mb-1 text-sm font-medium">Width</p>
                <p className="mb-3 text-xs text-muted-foreground">
                  {card.span} of 12 columns on desktop{card.span >= 12 ? " (full width)" : ""}.
                </p>
                <Slider min={def.minSpan ?? 2} max={12} step={1} value={[card.span]} onValueChange={([v]) => onCard(card.uid, (c) => ({ ...c, span: clampSpan(c.widget, v) }))} thumbLabel="Card width" />
                <div className="mt-3 grid grid-cols-4 gap-1.5">
                  {[3, 4, 6, 12].map((s) => (
                    <button key={s} type="button" onClick={() => onCard(card.uid, (c) => ({ ...c, span: clampSpan(c.widget, s) }))} className={cn("rounded-md border py-1 text-xs", card.span === s && "border-[#b88a4a] bg-[#b88a4a]/10 font-semibold")} disabled={s < (def.minSpan ?? 2)}>
                      {s === 12 ? "Full" : s === 6 ? "Half" : s === 4 ? "Third" : "Quarter"}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          ) : null}
          <button type="button" onClick={() => onCard(card.uid, (c) => ({ ...c, hidden: !c.hidden }))} className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label={card.hidden ? `Show ${def.title}` : `Hide ${def.title}`} title={card.hidden ? "Show" : "Hide"}>
            {card.hidden ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
          </button>
          <button type="button" onClick={() => onCard(card.uid, () => null)} className="rounded-md p-1 text-muted-foreground hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950" aria-label={`Remove ${def.title}`} title="Remove">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : null}
      {/* In Customize mode the card is a live preview: visible, not clickable. */}
      <div className={cn("h-full", editing && "pointer-events-none select-none pt-11")} inert={editing || undefined}>
        <Body card={card} def={def} />
      </div>
    </div>
  );
}

function BlankState({ onWizard, onAdd, onStandard }: { onWizard: () => void; onAdd: () => void; onStandard: () => void }) {
  return (
    <div className="relative overflow-hidden rounded-3xl border-2 border-dashed border-[#b88a4a]/40 bg-gradient-to-br from-[#fbf6ec] to-card px-6 py-14 text-center dark:from-[#211c17]">
      <span aria-hidden className="pointer-events-none absolute left-1/2 top-0 h-40 w-80 -translate-x-1/2 rounded-full bg-[#b88a4a]/20 blur-3xl" />
      <LayoutDashboard className="relative mx-auto h-10 w-10 text-[#b88a4a]" aria-hidden />
      <h2 className="relative mt-3 text-xl font-semibold">A blank canvas</h2>
      <p className="relative mx-auto mt-1 max-w-md text-pretty text-sm text-muted-foreground">Build a dashboard around your day: answer four quick questions, or add cards one at a time.</p>
      <div className="relative mt-5 flex flex-wrap justify-center gap-2">
        <Button type="button" onClick={onWizard} className="gap-1.5 bg-[#b88a4a] text-white hover:bg-[#a47a3e]">
          <Wand2 className="h-4 w-4" /> Run the setup wizard
        </Button>
        <Button type="button" variant="outline" onClick={onAdd} className="gap-1.5">
          <Plus className="h-4 w-4" /> Add Card
        </Button>
        <Button type="button" variant="ghost" onClick={onStandard}>
          Use the Standard dashboard
        </Button>
      </div>
    </div>
  );
}

function RenameView({ name, onRename, onDelete }: { name: string; onRename: (n: string) => void; onDelete?: () => void }) {
  const [value, setValue] = useState(name);
  useEffect(() => setValue(name), [name]);
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button type="button" size="sm" variant="ghost" className="gap-1.5">
          <Pencil className="h-4 w-4" aria-hidden /> View
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 space-y-2">
        <label className="block text-sm font-medium" htmlFor="view-rename">
          View name
        </label>
        <Input id="view-rename" value={value} maxLength={40} onChange={(e) => setValue(e.target.value)} onBlur={() => value.trim() && onRename(value.trim())} onKeyDown={(e) => e.key === "Enter" && value.trim() && onRename(value.trim())} />
        {onDelete ? (
          <Button type="button" size="sm" variant="ghost" className="w-full gap-1.5 text-red-600 hover:bg-red-50 hover:text-red-700" onClick={onDelete}>
            <Trash2 className="h-4 w-4" /> Delete this view
          </Button>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}
