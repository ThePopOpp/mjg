"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CornerDownLeft, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut } from "@/components/ui/command";
import { visibleNav, type NavLeaf } from "@/components/layout/dashboard-nav";
import type { AppRole } from "@/lib/rbac/roles";

// The dashboard-wide search (Ctrl/⌘ K). Mounted once in the dashboard shell, so it
// works on every page; the header search box and the Overview search card open it
// by dispatching OPEN_SEARCH_EVENT.

export const OPEN_SEARCH_EVENT = "mjg:open-search";

export function openDashboardSearch(query = "") {
  window.dispatchEvent(new CustomEvent(OPEN_SEARCH_EVENT, { detail: query }));
}

type Hit = { id: string; group: string; title: string; subtitle?: string; href: string };

export function CommandSearch({ role }: { role: AppRole }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    const onOpen = (e: Event) => {
      setQ(String((e as CustomEvent<string>).detail ?? ""));
      setOpen(true);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_SEARCH_EVENT, onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_SEARCH_EVENT, onOpen);
    };
  }, []);

  // Records come from the server (debounced); features are matched here.
  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) {
      setHits([]);
      return;
    }
    setLoading(true);
    const ctrl = new AbortController();
    const t = window.setTimeout(() => {
      fetch(`/api/dashboard/search?q=${encodeURIComponent(term)}`, { signal: ctrl.signal })
        .then((r) => r.json())
        .then((j: { results?: Hit[] }) => setHits(j.results ?? []))
        .catch(() => undefined)
        .finally(() => setLoading(false));
    }, 220);
    return () => {
      ctrl.abort();
      window.clearTimeout(t);
    };
  }, [q]);

  const features = useMemo(() => {
    const flat: (NavLeaf & { group: string })[] = [];
    for (const e of visibleNav(role)) {
      if (e.kind === "group") e.items.forEach((i) => flat.push({ ...i, group: e.label }));
      else flat.push({ ...e, group: "General" });
    }
    return flat;
  }, [role]);
  const needle = q.trim().toLowerCase();
  const featureHits = needle ? features.filter((f) => f.label.toLowerCase().includes(needle) || f.group.toLowerCase().includes(needle)).slice(0, 8) : features.slice(0, 8);
  const grouped = hits.reduce<Record<string, Hit[]>>((acc, h) => ((acc[h.group] ??= []).push(h), acc), {});

  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="top-[12%] max-w-xl translate-y-0 gap-0 overflow-hidden p-0">
        <DialogTitle className="sr-only">Search the dashboard</DialogTitle>
        <Command shouldFilter={false} label="Search the dashboard">
          <CommandInput value={q} onValueChange={setQ} placeholder="Search features, people, bookings, posts…" />
          <CommandList>
            <CommandEmpty>{loading ? "Searching…" : needle.length < 2 ? "Type to search." : "No results."}</CommandEmpty>
            {featureHits.length ? (
              <CommandGroup heading={needle ? "Features" : "Jump to"}>
                {featureHits.map((f) => (
                  <CommandItem key={f.href} value={`feature-${f.href}`} onSelect={() => go(f.href)}>
                    <f.icon className="h-4 w-4 text-[#b88a4a]" aria-hidden />
                    <span>{f.label}</span>
                    <span className="text-xs text-muted-foreground">{f.group}</span>
                    <CommandShortcut>
                      <CornerDownLeft className="h-3 w-3" />
                    </CommandShortcut>
                  </CommandItem>
                ))}
              </CommandGroup>
            ) : null}
            {Object.entries(grouped).map(([group, list]) => (
              <div key={group}>
                <CommandSeparator />
                <CommandGroup heading={group}>
                  {list.map((h) => (
                    <CommandItem key={h.id} value={h.id} onSelect={() => go(h.href)}>
                      <FileText className="h-4 w-4 text-muted-foreground" aria-hidden />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate">{h.title}</span>
                        {h.subtitle ? <span className="block truncate text-xs text-muted-foreground">{h.subtitle}</span> : null}
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </div>
            ))}
          </CommandList>
        </Command>
        <div className="flex items-center justify-between border-t px-3 py-2 text-[11px] text-muted-foreground">
          <span>↑↓ to move · Enter to open · Esc to close</span>
          {loading ? <span>Searching…</span> : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
