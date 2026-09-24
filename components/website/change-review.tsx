"use client";

// Before/after comparison (spec §18). Used by the version-history compare view,
// the Steward proposal card and the publish dialog. Word-level highlighting
// makes "what actually changed" obvious without reading two blocks of copy.

import * as React from "react";
import { ArrowRight, Minus, MoveVertical, Pencil, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { diffWords, type BlockChange, type PageDiff } from "@/lib/website/diff";

const KIND_META: Record<BlockChange["kind"], { label: string; icon: React.ElementType; tone: string }> = {
  added: { label: "Added", icon: Plus, tone: "text-emerald-600 dark:text-emerald-400" },
  removed: { label: "Removed", icon: Minus, tone: "text-destructive" },
  edited: { label: "Edited", icon: Pencil, tone: "text-[#b88a4a]" },
  moved: { label: "Moved", icon: MoveVertical, tone: "text-blue-600 dark:text-blue-400" },
  hidden: { label: "Hidden", icon: Minus, tone: "text-muted-foreground" },
  shown: { label: "Shown", icon: Plus, tone: "text-emerald-600 dark:text-emerald-400" },
};

export function WordDiff({ before, after }: { before: string; after: string }) {
  const segments = React.useMemo(() => diffWords(before, after), [before, after]);
  return (
    <p className="text-sm leading-6">
      {segments.map((seg, i) => (
        <span
          key={i}
          className={cn(
            seg.kind === "added" && "rounded bg-emerald-500/20 text-emerald-800 dark:text-emerald-300",
            seg.kind === "removed" && "rounded bg-destructive/15 text-destructive line-through",
          )}
        >
          {seg.text}
        </span>
      ))}
    </p>
  );
}

export function ChangeReview({ diff, compact }: { diff: PageDiff; compact?: boolean }) {
  if (!diff.hasChanges) {
    return <p className="text-sm text-muted-foreground">Nothing has changed.</p>;
  }

  return (
    <div className="space-y-4">
      <p className="text-sm font-medium">{diff.summary}</p>

      {diff.meta.length ? (
        <div className="rounded-lg border border-border">
          <p className="border-b border-border px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Page settings
          </p>
          <ul className="divide-y divide-border">
            {diff.meta.map((m) => (
              <li key={m.field} className="px-3 py-2">
                <p className="text-xs font-semibold">{m.label}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
                  <span className="rounded bg-destructive/10 px-1.5 py-0.5 text-destructive line-through">{m.before || "(empty)"}</span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 text-emerald-700 dark:text-emerald-400">{m.after || "(empty)"}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {diff.blocks.length ? (
        <ul className="space-y-2">
          {diff.blocks.map((change, i) => {
            const meta = KIND_META[change.kind];
            const Icon = meta.icon;
            return (
              <li key={`${change.blockId}-${change.kind}-${i}`} className="rounded-lg border border-border">
                <div className="flex items-center gap-2 border-b border-border px-3 py-2">
                  <Icon className={cn("h-3.5 w-3.5 shrink-0", meta.tone)} />
                  <span className={cn("text-xs font-semibold uppercase tracking-wide", meta.tone)}>{meta.label}</span>
                  <span className="truncate text-sm font-medium">{change.label}</span>
                  {change.kind === "moved" && typeof change.from === "number" && typeof change.to === "number" ? (
                    <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                      position {change.from + 1} → {change.to + 1}
                    </span>
                  ) : null}
                </div>
                {!compact && change.fields?.length ? (
                  <ul className="divide-y divide-border">
                    {change.fields.slice(0, 8).map((f) => (
                      <li key={f.path} className="px-3 py-2">
                        <p className="text-xs text-muted-foreground">{f.path}</p>
                        <WordDiff before={f.before} after={f.after} />
                      </li>
                    ))}
                    {change.fields.length > 8 ? (
                      <li className="px-3 py-2 text-xs text-muted-foreground">
                        and {change.fields.length - 8} more field change{change.fields.length - 8 === 1 ? "" : "s"}
                      </li>
                    ) : null}
                  </ul>
                ) : (
                  <p className="px-3 py-2 text-sm text-muted-foreground">{change.preview}</p>
                )}
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
