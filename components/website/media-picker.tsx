"use client";

// Media picker (spec §20) — reads the existing MJG media library rather than
// introducing a second one, so anything uploaded in Media Studio is immediately
// available here. Alt text is edited on the asset so every page that uses the
// image inherits it.

import * as React from "react";
import { ImageIcon, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDashboardActionToken } from "@/components/layout/dashboard-action-token";
import { websiteApi } from "./api";
import type { MediaItem } from "@/lib/website/media";

export function MediaPicker({
  open,
  assetType = "photo",
  onSelect,
  onClose,
}: {
  open: boolean;
  assetType?: string;
  onSelect: (item: MediaItem) => void;
  onClose: () => void;
}) {
  const token = useDashboardActionToken();
  const [query, setQuery] = React.useState("");
  const [items, setItems] = React.useState<MediaItem[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const load = React.useCallback(
    async (search: string) => {
      setLoading(true);
      setError("");
      try {
        const { media } = await websiteApi.media(token, { query: search, assetType });
        setItems(media);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load the media library.");
      } finally {
        setLoading(false);
      }
    },
    [token, assetType],
  );

  React.useEffect(() => {
    if (open) void load("");
  }, [open, load]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div className="relative z-10 flex max-h-[80vh] w-full max-w-3xl flex-col rounded-xl border border-border bg-card shadow-xl">
        <div className="flex items-center gap-3 border-b border-border p-4">
          <h2 className="font-semibold">Choose from the media library</h2>
          <button onClick={onClose} aria-label="Close" className="ml-auto rounded-md p-1 hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); void load(query); }}
          className="flex gap-2 border-b border-border p-4"
        >
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title or description…"
              className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <Button type="submit" size="sm" variant="outline">Search</Button>
        </form>

        <div className="flex-1 overflow-y-auto p-4">
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          {loading ? <p className="text-sm text-muted-foreground">Loading…</p> : null}
          {!loading && !items.length ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Nothing here yet. Upload images in Media Studio and they will appear in this list.
            </p>
          ) : null}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => { onSelect(item); onClose(); }}
                className="group overflow-hidden rounded-lg border border-border text-left transition-shadow hover:shadow-md"
              >
                <span className="flex aspect-[4/3] items-center justify-center bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {item.url ? <img src={item.url} alt="" className="h-full w-full object-cover" loading="lazy" /> : <ImageIcon className="h-6 w-6 text-muted-foreground" />}
                </span>
                <span className="block truncate px-2 py-1.5 text-xs font-medium">{item.title}</span>
                {!item.altText ? (
                  <span className="block px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-wide text-amber-600">No alt text</span>
                ) : null}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
