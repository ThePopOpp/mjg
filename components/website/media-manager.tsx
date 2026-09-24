"use client";

// Media tab (spec §20). A view onto the existing MJG media library: search,
// see where an image is used, and fix alt text. Uploading stays in Media Studio
// so there is exactly one place where files enter the system.

import * as React from "react";
import Link from "next/link";
import { AlertTriangle, ExternalLink, ImageIcon, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDashboardActionToken } from "@/components/layout/dashboard-action-token";
import { websiteApi } from "./api";
import type { MediaItem, MediaUsage } from "@/lib/website/media";

export function MediaManager() {
  const token = useDashboardActionToken();
  const [items, setItems] = React.useState<MediaItem[]>([]);
  const [query, setQuery] = React.useState("");
  const [assetType, setAssetType] = React.useState("photo");
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [selected, setSelected] = React.useState<MediaItem | null>(null);

  const load = React.useCallback(
    async (search: string, type: string) => {
      setLoading(true);
      setError("");
      try {
        const { media } = await websiteApi.media(token, { query: search, assetType: type });
        setItems(media);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load the media library.");
      } finally {
        setLoading(false);
      }
    },
    [token],
  );

  React.useEffect(() => { void load("", "photo"); }, [load]);

  const missingAlt = items.filter((i) => !i.altText.trim()).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <form
          className="relative min-w-[220px] flex-1"
          onSubmit={(e) => { e.preventDefault(); void load(query, assetType); }}
        >
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search the media library…"
            className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </form>
        <select
          value={assetType}
          onChange={(e) => { setAssetType(e.target.value); void load(query, e.target.value); }}
          className="h-9 rounded-md border border-input bg-background px-2 text-sm"
        >
          <option value="photo">Images</option>
          <option value="video">Video</option>
          <option value="audio">Audio</option>
          <option value="all">Everything</option>
        </select>
        <Button asChild variant="outline" className="gap-1.5">
          <Link href="/dashboard/media-studio"><ExternalLink className="h-4 w-4" /> Upload in Media Studio</Link>
        </Button>
      </div>

      {missingAlt ? (
        <p className="flex items-center gap-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {missingAlt} item{missingAlt === 1 ? " has" : "s have"} no image description. Screen readers and search engines
          both rely on it.
        </p>
      ) : null}

      {error ? <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p> : null}
      {loading ? <p className="text-sm text-muted-foreground">Loading…</p> : null}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => setSelected(item)}
            className="overflow-hidden rounded-lg border border-border text-left transition-shadow hover:shadow-md"
          >
            <span className="flex aspect-[4/3] items-center justify-center bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {item.url && item.assetType === "photo" ? (
                <img src={item.url} alt="" className="h-full w-full object-cover" loading="lazy" />
              ) : (
                <ImageIcon className="h-6 w-6 text-muted-foreground" />
              )}
            </span>
            <span className="block truncate px-2 py-1.5 text-xs font-medium">{item.title}</span>
            {!item.altText ? (
              <span className="block px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-wide text-amber-600">No description</span>
            ) : null}
          </button>
        ))}
      </div>
      {!loading && !items.length ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          Nothing here yet. Upload in Media Studio and it will appear in this list.
        </p>
      ) : null}

      {selected ? <MediaDetail item={selected} onClose={() => setSelected(null)} onSaved={() => void load(query, assetType)} /> : null}
    </div>
  );
}

function MediaDetail({ item, onClose, onSaved }: { item: MediaItem; onClose: () => void; onSaved: () => void }) {
  const token = useDashboardActionToken();
  const [altText, setAltText] = React.useState(item.altText);
  const [usage, setUsage] = React.useState<MediaUsage[] | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    websiteApi.mediaUsage(token, item.url).then((r) => setUsage(r.usage)).catch(() => setUsage([]));
  }, [token, item.url]);

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div className="relative z-10 w-full max-w-lg rounded-xl border border-border bg-card shadow-xl">
        <div className="border-b border-border p-4">
          <h2 className="font-semibold">{item.title}</h2>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{item.url}</p>
        </div>

        <div className="space-y-4 p-4">
          {item.assetType === "photo" && item.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.url} alt="" className="max-h-56 w-full rounded-md border border-border object-contain" />
          ) : null}

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Image description (alt text)
            </label>
            <input
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="Describe what the image shows"
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              This is saved on the image itself, so every page using it is fixed at once.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Used on</h3>
            {usage === null ? (
              <p className="mt-1 text-sm text-muted-foreground">Checking…</p>
            ) : usage.length ? (
              <ul className="mt-1 space-y-1 text-sm">
                {usage.map((u) => (
                  <li key={u.pageId}>
                    <Link href={`/dashboard/cms/editor/pages/${u.pageId}`} className="text-[#b88a4a] hover:underline">{u.title}</Link>
                    <span className="text-muted-foreground"> — {u.blockIds.length} section{u.blockIds.length === 1 ? "" : "s"}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-1 text-sm text-muted-foreground">Not used on any website page yet.</p>
            )}
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>

        <div className="flex justify-end gap-2 border-t border-border p-4">
          <Button variant="ghost" onClick={onClose}>Close</Button>
          <Button
            disabled={busy || altText === item.altText}
            className="gap-1.5"
            onClick={async () => {
              setBusy(true);
              setError("");
              try {
                await websiteApi.updateMediaAlt(token, item.id, altText);
                onSaved();
                onClose();
              } catch (err) {
                setError(err instanceof Error ? err.message : "Could not save the description.");
                setBusy(false);
              }
            }}
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Save description
          </Button>
        </div>
      </div>
    </div>
  );
}
