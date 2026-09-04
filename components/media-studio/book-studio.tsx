"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import {
  ArrowDown, ArrowUp, BookOpen, ImageIcon, Loader2, Plus, Trash2, X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Book, BookableAsset } from "@/lib/books/repository";
import { cn } from "@/lib/utils";

// three.js touches window/WebGL on import, so it must never render on the server.
const BookViewer3D = dynamic(() => import("./book-viewer-3d").then((m) => m.BookViewer3D), {
  ssr: false,
  loading: () => (
    <div className="flex aspect-[4/3] w-full items-center justify-center rounded-lg border bg-muted text-sm text-muted-foreground">
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      Loading 3D viewer…
    </div>
  ),
});

const SWATCHES = [
  { label: "Ink", value: "#111111" },
  { label: "Gold", value: "#c9aa70" },
  { label: "Cream", value: "#faf8f4" },
  { label: "Dark", value: "#10110f" },
  { label: "Light gold", value: "#e2ca9a" },
  { label: "White", value: "#ffffff" },
];

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <div className="flex items-center gap-1.5">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 w-8 cursor-pointer rounded border bg-transparent p-0.5"
          aria-label={label}
        />
        {SWATCHES.map((s) => (
          <button
            key={s.value}
            type="button"
            title={s.label}
            onClick={() => onChange(s.value)}
            style={{ background: s.value }}
            className={cn(
              "h-6 w-6 rounded-full border transition-transform hover:scale-110",
              value.toLowerCase() === s.value.toLowerCase() && "ring-2 ring-accent ring-offset-1",
            )}
          />
        ))}
      </div>
    </div>
  );
}

export function BookStudio({
  books: initialBooks,
  assets,
  actionToken,
}: {
  books: Book[];
  assets: BookableAsset[];
  actionToken: string;
}) {
  const [books, setBooks] = useState<Book[]>(initialBooks);
  const [selectedId, setSelectedId] = useState<string | null>(initialBooks[0]?.id ?? null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  const book = useMemo(() => books.find((b) => b.id === selectedId) ?? null, [books, selectedId]);

  function applyBook(saved: Book) {
    setBooks((prev) => (prev.some((b) => b.id === saved.id) ? prev.map((b) => (b.id === saved.id ? saved : b)) : [...prev, saved]));
    setSelectedId(saved.id);
  }

  async function call(url: string, method: string, payload: Record<string, unknown> = {}) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, actionToken }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Request failed.");
      return data;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed.");
      return null;
    } finally {
      setBusy(false);
    }
  }

  async function createBook() {
    const data = await call("/api/admin/books", "POST", {
      title: "New book",
      subtitle: "A Michael J. Gauthier title",
    });
    if (data?.book) applyBook(data.book as Book);
  }

  async function patchBook(patch: Record<string, unknown>) {
    if (!book) return;
    const data = await call(`/api/admin/books/${book.id}`, "PATCH", patch);
    if (data?.book) applyBook(data.book as Book);
  }

  async function removeBook() {
    if (!book || !confirm(`Delete "${book.title}"? This cannot be undone.`)) return;
    const data = await call(`/api/admin/books/${book.id}`, "DELETE");
    if (data) {
      const remaining = books.filter((b) => b.id !== book.id);
      setBooks(remaining);
      setSelectedId(remaining[0]?.id ?? null);
    }
  }

  async function addPage(asset: BookableAsset) {
    if (!book) return;
    setPickerOpen(false);
    const data = await call(`/api/admin/books/${book.id}/pages`, "POST", {
      mediaAssetId: asset.id,
      heading: asset.title,
    });
    if (data?.book) applyBook(data.book as Book);
  }

  async function addTextPage() {
    if (!book) return;
    const data = await call(`/api/admin/books/${book.id}/pages`, "POST", {
      heading: "New page",
      body: "",
    });
    if (data?.book) applyBook(data.book as Book);
  }

  async function patchPage(pageId: string, patch: Record<string, unknown>) {
    if (!book) return;
    const data = await call(`/api/admin/books/${book.id}/pages/${pageId}`, "PATCH", patch);
    if (data?.book) applyBook(data.book as Book);
  }

  async function removePage(pageId: string) {
    if (!book) return;
    const data = await call(`/api/admin/books/${book.id}/pages/${pageId}`, "DELETE");
    if (data?.book) applyBook(data.book as Book);
  }

  async function movePage(pageId: string, direction: -1 | 1) {
    if (!book) return;
    const ids = book.pages.map((p) => p.id);
    const from = ids.indexOf(pageId);
    const to = from + direction;
    if (from < 0 || to < 0 || to >= ids.length) return;
    [ids[from], ids[to]] = [ids[to], ids[from]];
    // Reorder locally first so the list doesn't jump while the request is in flight.
    const reordered = ids.map((id) => book.pages.find((p) => p.id === id)!);
    applyBook({ ...book, pages: reordered });
    const data = await call(`/api/admin/books/${book.id}/pages`, "PUT", { pageIds: ids });
    if (data?.book) applyBook(data.book as Book);
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-accent" />
              Book Studio
            </CardTitle>
            <CardDescription>
              Build a 3D page-turning book from uploaded photos. Pages are composed on brand — ink,
              cream and gold — then rendered as real geometry with WebGL.
            </CardDescription>
          </div>
          <Button type="button" onClick={createBook} disabled={busy}>
            <Plus className="h-4 w-4" />
            New book
          </Button>
        </CardHeader>

        {books.length > 1 ? (
          <CardContent className="pt-0">
            <div className="flex flex-wrap gap-2">
              {books.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setSelectedId(b.id)}
                  className={cn(
                    "rounded-md border px-3 py-1.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                    b.id === selectedId && "border-accent bg-accent/10 font-medium",
                  )}
                >
                  {b.title}
                  <span className="ml-2 text-xs text-muted-foreground">{b.pages.length}p</span>
                </button>
              ))}
            </div>
          </CardContent>
        ) : null}
      </Card>

      {error ? (
        <Card>
          <CardContent className="flex items-center justify-between p-3 text-sm text-destructive">
            {error}
            <Button type="button" variant="ghost" size="sm" onClick={() => setError(null)}>
              <X className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {!book ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <BookOpen className="h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No books yet. Create one, then drop in photos from Media Studio to build the spreads.
            </p>
            <Button type="button" onClick={createBook} disabled={busy}>
              <Plus className="h-4 w-4" />
              Create the first book
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
          {/* Live 3D preview */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Preview</CardTitle>
              <CardDescription>Drag across the book to turn a page, or use the arrow keys.</CardDescription>
            </CardHeader>
            <CardContent>
              <BookViewer3D book={book} />
            </CardContent>
          </Card>

          {/* Book settings + page list */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Book details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Title</label>
                  <Input
                    defaultValue={book.title}
                    onBlur={(e) => e.target.value !== book.title && patchBook({ title: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Subtitle</label>
                  <Input
                    defaultValue={book.subtitle}
                    onBlur={(e) => e.target.value !== book.subtitle && patchBook({ subtitle: e.target.value })}
                  />
                </div>
                <ColorField label="Cover" value={book.coverColor} onChange={(v) => patchBook({ coverColor: v })} />
                <ColorField label="Pages" value={book.pageColor} onChange={(v) => patchBook({ pageColor: v })} />
                <ColorField label="Accent" value={book.accentColor} onChange={(v) => patchBook({ accentColor: v })} />
                <div className="flex items-center justify-between pt-1">
                  <Badge variant="outline">{book.status}</Badge>
                  <Button type="button" variant="ghost" size="sm" onClick={removeBook} disabled={busy}>
                    <Trash2 className="h-4 w-4" />
                    Delete book
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-base">Pages ({book.pages.length})</CardTitle>
                <div className="flex gap-1.5">
                  <Button type="button" variant="outline" size="sm" onClick={addTextPage} disabled={busy}>
                    <Plus className="h-4 w-4" />
                    Text
                  </Button>
                  <Button type="button" size="sm" onClick={() => setPickerOpen(true)} disabled={busy}>
                    <ImageIcon className="h-4 w-4" />
                    Photo
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {book.pages.length === 0 ? (
                  <p className="py-6 text-center text-sm text-muted-foreground">
                    No pages yet. Add a photo from your uploaded media.
                  </p>
                ) : (
                  book.pages.map((page, i) => (
                    <div key={page.id} className="rounded-md border p-2">
                      <div className="flex items-start gap-2">
                        <div className="flex h-14 w-11 shrink-0 items-center justify-center overflow-hidden rounded border bg-muted">
                          {page.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={page.imageUrl} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <ImageIcon className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1 space-y-1.5">
                          <Input
                            className="h-8 text-sm"
                            defaultValue={page.heading}
                            placeholder="Heading"
                            onBlur={(e) => e.target.value !== page.heading && patchPage(page.id, { heading: e.target.value })}
                          />
                          <Textarea
                            className="min-h-14 text-sm"
                            defaultValue={page.body}
                            placeholder="Body copy (optional)"
                            onBlur={(e) => e.target.value !== page.body && patchPage(page.id, { body: e.target.value })}
                          />
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <Button type="button" variant="ghost" size="sm" className="h-7 w-7 p-0" disabled={i === 0 || busy} onClick={() => movePage(page.id, -1)}>
                            <ArrowUp className="h-3.5 w-3.5" />
                          </Button>
                          <Button type="button" variant="ghost" size="sm" className="h-7 w-7 p-0" disabled={i === book.pages.length - 1 || busy} onClick={() => movePage(page.id, 1)}>
                            <ArrowDown className="h-3.5 w-3.5" />
                          </Button>
                          <Button type="button" variant="ghost" size="sm" className="h-7 w-7 p-0" disabled={busy} onClick={() => removePage(page.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Asset picker */}
      <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
        <DialogContent className="max-h-[80vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add a page from uploaded media</DialogTitle>
          </DialogHeader>
          {assets.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No image assets found. Upload photos in the Photos tab first.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {assets.map((asset) => (
                <button
                  key={asset.id}
                  type="button"
                  onClick={() => addPage(asset)}
                  className="group overflow-hidden rounded-md border text-left transition-colors hover:border-accent"
                >
                  <div className="aspect-[3/4] overflow-hidden bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={asset.fileUrl}
                      alt={asset.title}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                  <p className="truncate px-2 py-1.5 text-xs">{asset.title}</p>
                </button>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
