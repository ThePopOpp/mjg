"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { visibleNav, type NavLeaf } from "@/components/layout/dashboard-nav";
import type { AppRole } from "@/lib/rbac/roles";
import { Panel } from "./panel";

/** Every page the role can open, grouped as in the sidebar, with search. */
export function AllFeaturesSheet({ open, onOpenChange, role }: { open: boolean; onOpenChange: (o: boolean) => void; role: AppRole }) {
  const [q, setQ] = useState("");
  const groups = useMemo(() => {
    const out: { label: string; items: NavLeaf[] }[] = [];
    const general: NavLeaf[] = [];
    for (const e of visibleNav(role)) {
      if (e.kind === "group") out.push({ label: e.label, items: e.items });
      else general.push(e);
    }
    return general.length ? [{ label: "General", items: general }, ...out] : out;
  }, [role]);

  const needle = q.trim().toLowerCase();
  const filtered = needle
    ? groups.map((g) => ({ ...g, items: g.items.filter((i) => i.label.toLowerCase().includes(needle) || g.label.toLowerCase().includes(needle) || i.href.includes(needle)) })).filter((g) => g.items.length)
    : groups;
  const total = groups.reduce((s, g) => s + g.items.length, 0);

  return (
    <Panel open={open} onOpenChange={onOpenChange} title="All Features" description={`${total} areas you can open, grouped like the sidebar.`} width="sm:max-w-2xl">
      <div className="sticky top-0 z-10 border-b bg-background/95 px-6 py-3 backdrop-blur">
        <label className="relative block">
          <span className="sr-only">Filter features</span>
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter features…" className="pl-9" autoFocus />
        </label>
      </div>
      <div className="space-y-6 px-6 py-5">
        {filtered.map((g) => (
          <section key={g.label} aria-label={g.label}>
            <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{g.label}</h3>
            <ul className="grid gap-2 sm:grid-cols-2">
              {g.items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => onOpenChange(false)}
                    className="group flex items-center gap-3 rounded-xl border bg-card p-3 transition hover:-translate-y-0.5 hover:border-[#b88a4a]/50 hover:shadow-sm motion-reduce:hover:translate-y-0"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#b88a4a]/15 text-[#9a7038] transition group-hover:bg-[#b88a4a] group-hover:text-white dark:text-[#d9b27a]">
                      <item.icon className="h-4 w-4" aria-hidden />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">{item.label}</span>
                      <span className="block truncate text-[11px] text-muted-foreground">{item.href.replace("/dashboard", "") || "/"}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
        {!filtered.length ? <p className="py-8 text-center text-sm text-muted-foreground">No features match “{q}”.</p> : null}
      </div>
    </Panel>
  );
}
