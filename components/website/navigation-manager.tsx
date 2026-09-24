"use client";

// Navigation manager (spec §21). Main / footer / utility menus, one level of
// dropdowns, internal or external links, visibility and order.
//
// Navigation shows on every page, so it is classified high risk: each change is
// saved on its own explicit action rather than silently as you type.

import * as React from "react";
import { ChevronDown, ChevronUp, ExternalLink, Eye, EyeOff, Loader2, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useDashboardActionToken } from "@/components/layout/dashboard-action-token";
import { websiteApi } from "./api";
import type { NavigationGroup, WebsiteNavItem } from "@/lib/website/types";

const GROUPS: { value: NavigationGroup; label: string; hint: string }[] = [
  { value: "main", label: "Main menu", hint: "The bar across the top of every page." },
  { value: "footer", label: "Footer", hint: "The links at the bottom of every page." },
  { value: "utility", label: "Utility", hint: "Secondary links such as sign in." },
];

const INPUT =
  "h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

type PageOption = { id: string; title: string; slug: string; status: string };

export function NavigationManager() {
  const token = useDashboardActionToken();
  const [group, setGroup] = React.useState<NavigationGroup>("main");
  const [items, setItems] = React.useState<WebsiteNavItem[]>([]);
  const [pages, setPages] = React.useState<PageOption[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");
  const [adding, setAdding] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await websiteApi.navigation(token);
      setItems(data.items);
      setPages(data.pages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load the navigation.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  React.useEffect(() => { void load(); }, [load]);

  const groupItems = items.filter((i) => i.navigation_group === group);
  const roots = groupItems.filter((i) => !i.parent_id).sort((a, b) => a.sort_order - b.sort_order);

  async function run(fn: () => Promise<unknown>) {
    setBusy(true);
    setError("");
    try {
      await fn();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update the navigation.");
    } finally {
      setBusy(false);
    }
  }

  function move(item: WebsiteNavItem, direction: -1 | 1) {
    const siblings = groupItems.filter((i) => i.parent_id === item.parent_id).sort((a, b) => a.sort_order - b.sort_order);
    const index = siblings.findIndex((i) => i.id === item.id);
    const target = index + direction;
    if (target < 0 || target >= siblings.length) return;
    const reordered = [...siblings];
    reordered.splice(target, 0, reordered.splice(index, 1)[0]);
    void run(() =>
      websiteApi.reorderNavigation(token, group, reordered.map((i, n) => ({ id: i.id, parent_id: i.parent_id, sort_order: n }))),
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1.5">
        {GROUPS.map((g) => (
          <button
            key={g.value}
            onClick={() => setGroup(g.value)}
            className={cn(
              "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
              group === g.value ? "bg-[#b88a4a] text-white" : "bg-muted text-muted-foreground hover:text-foreground",
            )}
          >
            {g.label}
          </button>
        ))}
        <Button size="sm" className="ml-auto gap-1.5" onClick={() => setAdding(true)}>
          <Plus className="h-4 w-4" /> Add item
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">{GROUPS.find((g) => g.value === group)?.hint}</p>
      {error ? <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p> : null}
      {loading ? <p className="text-sm text-muted-foreground">Loading…</p> : null}

      <ul className="space-y-2">
        {roots.map((item) => (
          <NavRow
            key={item.id}
            item={item}
            pages={pages}
            children={groupItems.filter((c) => c.parent_id === item.id).sort((a, b) => a.sort_order - b.sort_order)}
            busy={busy}
            onMove={(d) => move(item, d)}
            onSave={(patch) => run(() => websiteApi.updateNavItem(token, { id: item.id, ...patch }))}
            onDelete={() => run(() => websiteApi.deleteNavItem(token, item.id))}
            onSaveChild={(id, patch) => run(() => websiteApi.updateNavItem(token, { id, ...patch }))}
            onDeleteChild={(id) => run(() => websiteApi.deleteNavItem(token, id))}
            onAddChild={() =>
              run(() => websiteApi.createNavItem(token, {
                navigation_group: group, parent_id: item.id, label: "New link", url: "",
                sort_order: groupItems.filter((c) => c.parent_id === item.id).length,
              }))
            }
          />
        ))}
        {!loading && !roots.length ? (
          <li className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
            This menu is empty. Add the first item above.
          </li>
        ) : null}
      </ul>

      {adding ? (
        <AddNavItem
          group={group}
          pages={pages}
          nextOrder={roots.length}
          onClose={() => setAdding(false)}
          onCreate={(body) => run(() => websiteApi.createNavItem(token, body))}
        />
      ) : null}
    </div>
  );
}

function NavRow({
  item, children, pages, busy, onMove, onSave, onDelete, onAddChild, onSaveChild, onDeleteChild,
}: {
  item: WebsiteNavItem;
  children: WebsiteNavItem[];
  pages: PageOption[];
  busy: boolean;
  onMove: (direction: -1 | 1) => void;
  onSave: (patch: Record<string, unknown>) => void;
  onDelete: () => void;
  onAddChild: () => void;
  onSaveChild: (id: string, patch: Record<string, unknown>) => void;
  onDeleteChild: (id: string) => void;
}) {
  const [label, setLabel] = React.useState(item.label);
  const [url, setUrl] = React.useState(item.url);
  React.useEffect(() => { setLabel(item.label); setUrl(item.url); }, [item.label, item.url]);
  const dirty = label !== item.label || url !== item.url;

  return (
    <li className={cn("rounded-lg border border-border", !item.is_visible && "opacity-60")}>
      <div className="flex flex-wrap items-center gap-2 p-3">
        <div className="flex flex-col">
          <button aria-label="Move up" onClick={() => onMove(-1)} className="rounded p-0.5 text-muted-foreground hover:bg-muted"><ChevronUp className="h-3.5 w-3.5" /></button>
          <button aria-label="Move down" onClick={() => onMove(1)} className="rounded p-0.5 text-muted-foreground hover:bg-muted"><ChevronDown className="h-3.5 w-3.5" /></button>
        </div>
        <input value={label} onChange={(e) => setLabel(e.target.value)} className={cn(INPUT, "w-40")} aria-label="Label" />
        <LinkField url={url} pages={pages} onChange={setUrl} />
        <button
          aria-label={item.is_visible ? "Hide from the menu" : "Show in the menu"}
          onClick={() => onSave({ is_visible: !item.is_visible })}
          className="rounded-md p-2 text-muted-foreground hover:bg-muted"
        >
          {item.is_visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
        </button>
        <button
          aria-label="Open in a new tab"
          title={item.open_in_new_tab ? "Opens in a new tab" : "Opens in the same tab"}
          onClick={() => onSave({ open_in_new_tab: !item.open_in_new_tab })}
          className={cn("rounded-md p-2 hover:bg-muted", item.open_in_new_tab ? "text-[#b88a4a]" : "text-muted-foreground")}
        >
          <ExternalLink className="h-4 w-4" />
        </button>
        {dirty ? (
          <Button size="sm" className="h-8" disabled={busy} onClick={() => onSave({ label, url })}>
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Save"}
          </Button>
        ) : null}
        <button aria-label="Remove" onClick={onDelete} className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-destructive">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {children.length ? (
        <ul className="space-y-2 border-t border-border bg-muted/30 p-3 pl-10">
          {children.map((child) => (
            <NavChildRow
              key={child.id}
              item={child}
              pages={pages}
              busy={busy}
              onSave={(patch) => onSaveChild(child.id, patch)}
              onDelete={() => onDeleteChild(child.id)}
            />
          ))}
        </ul>
      ) : null}

      <div className="border-t border-border px-3 py-2">
        <button onClick={onAddChild} className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground">
          <Plus className="h-3 w-3" /> Add a dropdown link under &ldquo;{item.label}&rdquo;
        </button>
      </div>
    </li>
  );
}

function NavChildRow({
  item, pages, busy, onSave, onDelete,
}: {
  item: WebsiteNavItem;
  pages: PageOption[];
  busy: boolean;
  onSave: (patch: Record<string, unknown>) => void;
  onDelete: () => void;
}) {
  const [label, setLabel] = React.useState(item.label);
  const [url, setUrl] = React.useState(item.url);
  React.useEffect(() => { setLabel(item.label); setUrl(item.url); }, [item.label, item.url]);
  const dirty = label !== item.label || url !== item.url;

  return (
    <li className="flex flex-wrap items-center gap-2">
      <input value={label} onChange={(e) => setLabel(e.target.value)} className={cn(INPUT, "w-36")} aria-label="Label" />
      <LinkField url={url} pages={pages} onChange={setUrl} />
      {dirty ? (
        <Button size="sm" className="h-8" disabled={busy} onClick={() => onSave({ label, url })}>Save</Button>
      ) : null}
      <button aria-label="Remove" onClick={onDelete} className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-destructive">
        <Trash2 className="h-4 w-4" />
      </button>
    </li>
  );
}

/** Address field with a "pick a page" shortcut so internal links stay correct. */
function LinkField({ url, pages, onChange }: { url: string; pages: PageOption[]; onChange: (url: string) => void }) {
  return (
    <div className="flex min-w-[220px] flex-1 gap-1">
      <input value={url} onChange={(e) => onChange(e.target.value)} placeholder="/page-address or https://…" className={INPUT} aria-label="Links to" />
      <select
        value=""
        aria-label="Choose a page"
        onChange={(e) => { if (e.target.value) onChange(e.target.value); }}
        className="h-9 w-28 rounded-md border border-input bg-background px-1 text-xs"
      >
        <option value="">Pick a page…</option>
        {pages.map((p) => <option key={p.id} value={`/${p.slug}`}>{p.title}</option>)}
      </select>
    </div>
  );
}

function AddNavItem({
  group, pages, nextOrder, onClose, onCreate,
}: {
  group: NavigationGroup;
  pages: PageOption[];
  nextOrder: number;
  onClose: () => void;
  onCreate: (body: Record<string, unknown>) => void;
}) {
  const [label, setLabel] = React.useState("");
  const [url, setUrl] = React.useState("");

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div className="relative z-10 w-full max-w-md rounded-xl border border-border bg-card shadow-xl">
        <div className="border-b border-border p-4"><h2 className="font-semibold">Add a navigation item</h2></div>
        <div className="space-y-3 p-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Label</label>
            <input autoFocus value={label} onChange={(e) => setLabel(e.target.value)} className={INPUT} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Links to</label>
            <LinkField url={url} pages={pages} onChange={setUrl} />
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-border p-4">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button
            disabled={!label.trim()}
            onClick={() => { onCreate({ navigation_group: group, label, url, sort_order: nextOrder }); onClose(); }}
          >
            Add
          </Button>
        </div>
      </div>
    </div>
  );
}
