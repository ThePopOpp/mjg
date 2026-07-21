"use client";

import { useEffect, useMemo, useState } from "react";
import { GripVertical, Save, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// Listen-page track ordering.
//
// An audiobook has a deliberate chapter order, so the Listen page reads
// metadata.sort_order instead of the newest-first default. This is where a Super
// Admin sets it: drag to rearrange, then save.
//
// Hand-rolled with native HTML5 drag events — the repo has no drag library, and the
// Project Manager kanban and Plan Builder board both do it this way. Keyboard
// controls sit alongside the drag handles, since drag-and-drop alone isn't operable
// without a mouse.

const LISTEN_TARGET = "frontend_listen";

function sortOrderOf(asset: any) {
  const raw = asset?.metadata?.sort_order;
  const value = typeof raw === "number" ? raw : typeof raw === "string" ? Number(raw) : NaN;
  return Number.isFinite(value) ? value : Number.MAX_SAFE_INTEGER;
}

export function ListenOrderPanel({ assets, actionToken }: { assets: any[]; actionToken: string }) {
  const router = useRouter();

  // Same rule as the public page: explicit order first, everything else after in a
  // stable created_at order — so an un-ordered track never jumps around.
  const listenTracks = useMemo(() => {
    return assets
      .filter((asset) => {
        const targets = Array.isArray(asset.metadata?.display_targets) ? asset.metadata.display_targets : [];
        return targets.includes(LISTEN_TARGET);
      })
      .sort((a, b) => {
        const delta = sortOrderOf(a) - sortOrderOf(b);
        if (delta !== 0) return delta;
        return String(a.created_at ?? "").localeCompare(String(b.created_at ?? ""));
      });
  }, [assets]);

  const [order, setOrder] = useState<any[]>(listenTracks);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Re-sync when the server data changes (after a save, or a track is added to /
  // removed from the target elsewhere in the studio).
  const signature = listenTracks.map((t) => `${t.id}:${sortOrderOf(t)}`).join("|");
  useEffect(() => {
    setOrder(listenTracks);
    setDraggingId(null);
    setOverId(null);
  }, [signature]); // eslint-disable-line react-hooks/exhaustive-deps

  const dirty = order.some((track, index) => track.id !== listenTracks[index]?.id);

  function move(fromIndex: number, toIndex: number) {
    if (toIndex < 0 || toIndex >= order.length || fromIndex === toIndex) return;
    setOrder((prev) => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
    setMessage(null);
  }

  function handleDrop(targetId: string) {
    const from = order.findIndex((t) => t.id === draggingId);
    const to = order.findIndex((t) => t.id === targetId);
    if (from !== -1 && to !== -1) move(from, to);
    setDraggingId(null);
    setOverId(null);
  }

  async function save() {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      if (!actionToken) throw new Error("Dashboard action token is missing. Refresh the page and try again.");
      const response = await fetch("/api/admin/media-assets/order", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json", "x-mjg-action-token": actionToken },
        body: JSON.stringify({ actionToken, orderedIds: order.map((t) => t.id) }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Saving the track order failed.");
      setMessage(`Track order saved. ${data.updated} track${data.updated === 1 ? "" : "s"} updated.`);
      router.refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Saving the track order failed.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Listen page order</CardTitle>
        <CardDescription>
          The order these tracks play in on the public Listen page. Drag a track by its handle, or use the
          arrow buttons, then save.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {order.length === 0 ? (
          <p className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
            No tracks are set to appear on the Listen page yet. Turn on the &ldquo;Listen page&rdquo; display
            location for an audio track and it will show up here.
          </p>
        ) : (
          <>
            <ol className="space-y-2">
              {order.map((track, index) => (
                <li
                  key={track.id}
                  draggable
                  onDragStart={() => setDraggingId(track.id)}
                  onDragEnd={() => { setDraggingId(null); setOverId(null); }}
                  onDragOver={(e) => { e.preventDefault(); setOverId(track.id); }}
                  onDragLeave={() => setOverId((prev) => (prev === track.id ? null : prev))}
                  onDrop={(e) => { e.preventDefault(); handleDrop(track.id); }}
                  className={cn(
                    "flex items-center gap-3 rounded-md border bg-background p-3",
                    draggingId === track.id && "opacity-50",
                    overId === track.id && draggingId !== track.id && "border-primary ring-1 ring-primary",
                  )}
                >
                  <span className="cursor-grab text-muted-foreground active:cursor-grabbing" aria-hidden="true">
                    <GripVertical className="h-4 w-4" />
                  </span>
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                    {index + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{track.title}</span>
                    {track.description ? (
                      <span className="block truncate text-xs text-muted-foreground">{track.description}</span>
                    ) : null}
                  </span>
                  {track.status !== "published" ? (
                    <Badge variant="secondary" className="shrink-0">
                      {track.status === "draft" ? "Draft — hidden" : track.status}
                    </Badge>
                  ) : null}
                  <span className="flex shrink-0 gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      disabled={index === 0}
                      aria-label={`Move ${track.title} up`}
                      onClick={() => move(index, index - 1)}
                    >
                      ↑
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      disabled={index === order.length - 1}
                      aria-label={`Move ${track.title} down`}
                      onClick={() => move(index, index + 1)}
                    >
                      ↓
                    </Button>
                  </span>
                </li>
              ))}
            </ol>

            {message ? <p className="rounded-md bg-primary/10 p-3 text-sm text-primary">{message}</p> : null}
            {error ? <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</p> : null}

            <div className="flex flex-wrap gap-3">
              <Button type="button" disabled={!dirty || saving} onClick={save}>
                <Save className="h-4 w-4" />
                {saving ? "Saving..." : "Save track order"}
              </Button>
              {dirty ? (
                <Button type="button" variant="ghost" disabled={saving} onClick={() => { setOrder(listenTracks); setMessage(null); }}>
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </Button>
              ) : null}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
