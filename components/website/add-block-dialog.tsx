"use client";

// "Add a section" — the owner-facing view of the approved component registry.
// Everything Mike can place is here; nothing else can be placed at all.

import * as React from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { BLOCK_CATEGORIES, COMPONENT_LIST, type BlockCategory } from "@/lib/website/registry";

export function AddBlockDialog({
  open,
  onClose,
  onPick,
}: {
  open: boolean;
  onClose: () => void;
  onPick: (type: string) => void;
}) {
  const [query, setQuery] = React.useState("");
  const [category, setCategory] = React.useState<BlockCategory | "All">("All");

  React.useEffect(() => {
    if (open) { setQuery(""); setCategory("All"); }
  }, [open]);

  if (!open) return null;

  const term = query.trim().toLowerCase();
  const matches = COMPONENT_LIST.filter((d) => d.ownerEditable)
    .filter((d) => category === "All" || d.category === category)
    .filter((d) => !term || `${d.label} ${d.description} ${d.type}`.toLowerCase().includes(term));

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div className="relative z-10 flex max-h-[80vh] w-full max-w-2xl flex-col rounded-xl border border-border bg-card shadow-xl">
        <div className="flex items-center gap-3 border-b border-border p-4">
          <h2 className="font-semibold">Add a section</h2>
          <button onClick={onClose} aria-label="Close" className="ml-auto rounded-md p-1 hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3 border-b border-border p-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search sections…"
              className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(["All", ...BLOCK_CATEGORIES] as const).map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c as BlockCategory | "All")}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                  category === c ? "bg-[#b88a4a] text-white" : "bg-muted text-muted-foreground hover:text-foreground",
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="grid flex-1 grid-cols-1 gap-2 overflow-y-auto p-4 sm:grid-cols-2">
          {matches.map((d) => (
            <button
              key={d.type}
              onClick={() => { onPick(d.type); onClose(); }}
              className="rounded-lg border border-border p-3 text-left transition-colors hover:border-[#b88a4a] hover:bg-[#b88a4a]/5"
            >
              <span className="block text-sm font-semibold">{d.label}</span>
              <span className="mt-1 block text-xs leading-5 text-muted-foreground">{d.description}</span>
            </button>
          ))}
          {!matches.length ? (
            <p className="col-span-full py-6 text-center text-sm text-muted-foreground">
              No section matches that. If you need something that is not here, ask Steward — it will write a developer
              specification for a new component rather than improvising.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
