"use client";

// The page structure panel (spec §11, left panel): reorder by drag or by the
// arrow buttons, duplicate, hide, delete, and add.

import * as React from "react";
import { ChevronDown, ChevronUp, Copy, Eye, EyeOff, GripVertical, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { blockLabel, blockPreviewText } from "@/lib/website/registry";
import type { WebsiteBlock } from "@/lib/website/types";

export function BlockTree({
  blocks,
  selectedId,
  onSelect,
  onAdd,
  onMove,
  onReorder,
  onDuplicate,
  onToggleHidden,
  onRemove,
}: {
  blocks: WebsiteBlock[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onMove: (id: string, direction: "up" | "down") => void;
  onReorder: (orderedIds: string[]) => void;
  onDuplicate: (id: string) => void;
  onToggleHidden: (id: string, hidden: boolean) => void;
  onRemove: (id: string) => void;
}) {
  const [dragId, setDragId] = React.useState<string | null>(null);
  const [overId, setOverId] = React.useState<string | null>(null);

  function drop(targetId: string) {
    if (!dragId || dragId === targetId) return;
    const ids = blocks.map((b) => b.id);
    const from = ids.indexOf(dragId);
    const to = ids.indexOf(targetId);
    if (from === -1 || to === -1) return;
    ids.splice(to, 0, ids.splice(from, 1)[0]);
    onReorder(ids);
    setDragId(null);
    setOverId(null);
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Page structure</h2>
        <span className="text-xs text-muted-foreground">{blocks.length}</span>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {blocks.map((block, i) => (
          <div
            key={block.id}
            draggable
            onDragStart={() => setDragId(block.id)}
            onDragEnd={() => { setDragId(null); setOverId(null); }}
            onDragOver={(e) => { e.preventDefault(); setOverId(block.id); }}
            onDrop={(e) => { e.preventDefault(); drop(block.id); }}
            className={cn(
              "group mb-1 rounded-lg border px-2 py-2 transition-colors",
              selectedId === block.id ? "border-[#b88a4a] bg-[#b88a4a]/10" : "border-transparent hover:bg-muted",
              overId === block.id && dragId && dragId !== block.id && "border-dashed border-[#b88a4a]",
              block.hidden && "opacity-55",
            )}
          >
            <div className="flex items-center gap-1.5">
              <GripVertical className="h-3.5 w-3.5 shrink-0 cursor-grab text-muted-foreground" aria-hidden />
              <button onClick={() => onSelect(block.id)} className="min-w-0 flex-1 text-left">
                <span className="block truncate text-sm font-medium">
                  {blockLabel(block.type)}
                  {block.hidden ? <span className="ml-1.5 text-xs font-normal text-muted-foreground">(hidden)</span> : null}
                </span>
                <span className="block truncate text-xs text-muted-foreground">{blockPreviewText(block)}</span>
              </button>
            </div>

            <div className="mt-1 flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
              <IconButton label="Move up" disabled={i === 0} onClick={() => onMove(block.id, "up")}><ChevronUp className="h-3.5 w-3.5" /></IconButton>
              <IconButton label="Move down" disabled={i === blocks.length - 1} onClick={() => onMove(block.id, "down")}><ChevronDown className="h-3.5 w-3.5" /></IconButton>
              <IconButton label="Duplicate" onClick={() => onDuplicate(block.id)}><Copy className="h-3.5 w-3.5" /></IconButton>
              <IconButton
                label={block.hidden ? "Show on the page" : "Hide from the page"}
                onClick={() => onToggleHidden(block.id, !block.hidden)}
              >
                {block.hidden ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </IconButton>
              <IconButton label="Remove" danger onClick={() => onRemove(block.id)}><Trash2 className="h-3.5 w-3.5" /></IconButton>
            </div>
          </div>
        ))}

        {!blocks.length ? (
          <p className="px-2 py-8 text-center text-sm text-muted-foreground">
            This page is empty. Add your first section below.
          </p>
        ) : null}
      </div>

      <div className="border-t border-border p-3">
        <Button onClick={onAdd} variant="outline" className="w-full gap-1.5">
          <Plus className="h-4 w-4" /> Add section
        </Button>
      </div>
    </div>
  );
}

function IconButton({
  label,
  onClick,
  disabled,
  danger,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "rounded p-1 text-muted-foreground hover:bg-background disabled:opacity-30",
        danger ? "hover:text-destructive" : "hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
