"use client";

import { useRef, useState } from "react";
import { Plus, Pencil, Trash2, Upload, Link2, Loader2, GripVertical, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import type { AdminChallengeVideo } from "@/lib/six-week-challenge/repository";
import { cn } from "@/lib/utils";

type FormState = {
  id?: string;
  slug: string;
  order: number;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  videoLink: string;
  embedDirect: boolean;
  thumbnailUrl: string;
  availability: string;
  status: string;
};

const EMPTY: FormState = {
  slug: "", order: 0, badge: "", title: "", subtitle: "", description: "",
  videoLink: "", embedDirect: true, thumbnailUrl: "", availability: "coming_soon", status: "published",
};

const hasVideo = (v: AdminChallengeVideo) => Boolean(v.youtubeId || v.driveId || v.videoUrl);

function slugify(s: string) {
  return s.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
}

// Turn a pasted Drive/YouTube/mp4 link into the stored fields.
function parseVideoLink(link: string): { youtubeId: string | null; driveId: string | null; videoUrl: string | null } {
  const s = link.trim();
  if (!s) return { youtubeId: null, driveId: null, videoUrl: null };
  const drive = s.match(/drive\.google\.com\/file\/d\/([A-Za-z0-9_-]+)/);
  if (drive) return { driveId: drive[1], youtubeId: null, videoUrl: null };
  const yt = s.match(/(?:youtu\.be\/|[?&]v=|embed\/)([A-Za-z0-9_-]{11})/);
  if (yt) return { youtubeId: yt[1], driveId: null, videoUrl: null };
  return { videoUrl: s, youtubeId: null, driveId: null };
}

function videoLinkOf(v: AdminChallengeVideo): string {
  if (v.driveId) return `https://drive.google.com/file/d/${v.driveId}/view`;
  if (v.youtubeId) return `https://youtu.be/${v.youtubeId}`;
  return v.videoUrl ?? "";
}

export function ChallengeVideoStudio({
  videos,
  onChange,
  actionToken,
}: {
  videos: AdminChallengeVideo[];
  onChange: (videos: AdminChallengeVideo[]) => void;
  actionToken: string;
}) {
  const [form, setForm] = useState<FormState | null>(null);
  const [urlMode, setUrlMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function openNew() {
    setError(null);
    setUrlMode(false);
    const nextOrder = videos.length ? Math.max(...videos.map((v) => v.order)) + 1 : 0;
    setForm({ ...EMPTY, order: nextOrder });
  }

  function openEdit(v: AdminChallengeVideo) {
    setError(null);
    setUrlMode(false);
    setForm({
      id: v.id,
      slug: v.slug,
      order: v.order,
      badge: v.badge,
      title: v.title,
      subtitle: v.subtitle,
      description: v.description,
      videoLink: videoLinkOf(v),
      embedDirect: v.embedDirect ?? true,
      thumbnailUrl: v.thumbnailUrl ?? "",
      availability: v.availability ?? (hasVideo(v) ? "available" : "coming_soon"),
      status: v.status ?? "published",
    });
  }

  async function uploadThumbnail(file: File) {
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("actionToken", actionToken);
      fd.append("intent", "thumbnail");
      const res = await fetch("/api/admin/media-assets/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed.");
      setForm((f) => (f ? { ...f, thumbnailUrl: data.url } : f));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  function sortByOrder(list: AdminChallengeVideo[]) {
    return [...list].sort((a, b) => a.order - b.order);
  }

  async function save() {
    if (!form) return;
    setSaving(true);
    setError(null);
    try {
      const parsed = parseVideoLink(form.videoLink);
      const slug = form.slug.trim() || slugify(form.title);
      if (!slug) throw new Error("Add a title or slug.");
      const payload = {
        actionToken,
        slug,
        order: Number(form.order) || 0,
        badge: form.badge,
        title: form.title,
        subtitle: form.subtitle,
        description: form.description,
        youtubeId: parsed.youtubeId,
        driveId: parsed.driveId,
        videoUrl: parsed.videoUrl,
        embedDirect: form.embedDirect,
        thumbnailUrl: form.thumbnailUrl || null,
        thumbnailDark: form.thumbnailUrl || null,
        availability: form.availability,
        status: form.status,
      };
      const res = await fetch(
        form.id ? `/api/admin/challenge-videos/${form.id}` : "/api/admin/challenge-videos",
        { method: form.id ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed.");
      const saved = data.video as AdminChallengeVideo;
      const next = form.id
        ? videos.map((v) => (v.id === saved.id ? saved : v))
        : [...videos, saved];
      onChange(sortByOrder(next));
      setForm(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(v: AdminChallengeVideo) {
    if (!window.confirm(`Delete "${v.title}"? This removes it from the public site.`)) return;
    setBusyId(v.id);
    try {
      const res = await fetch(`/api/admin/challenge-videos/${v.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actionToken }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Delete failed.");
      onChange(videos.filter((x) => x.id !== v.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
        <div>
          <CardTitle>Video Studio</CardTitle>
          <CardDescription>
            Add and edit the 6-Week Challenge videos — thumbnail, video link, and content. Saving updates the{" "}
            <Link href="/6-week-challenge/videos" target="_blank" className="font-medium text-primary hover:underline">public site</Link>.
          </CardDescription>
        </div>
        <Button size="sm" onClick={openNew} className="gap-1.5 shrink-0"><Plus className="h-4 w-4" /> Add video</Button>
      </CardHeader>
      <CardContent className="space-y-2">
        {error && !form ? <p className="text-sm text-destructive">{error}</p> : null}
        {videos.map((v) => (
          <div key={v.id} className="flex items-center gap-3 rounded-lg border border-border p-2.5">
            <GripVertical className="hidden h-4 w-4 shrink-0 text-muted-foreground sm:block" />
            <div className="relative h-12 w-20 shrink-0 overflow-hidden rounded bg-muted">
              {v.thumbnailUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={v.thumbnailUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-[10px] uppercase tracking-wide text-muted-foreground">No thumb</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-primary">{v.badge || "—"}</span>
                <span className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-medium",
                  v.status === "published" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground",
                )}>{v.status}</span>
                <span className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-medium",
                  hasVideo(v) ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground",
                )}>{hasVideo(v) ? "video set" : "no video"}</span>
              </div>
              <p className="truncate font-medium">{v.title || "Untitled"}</p>
              <p className="truncate text-xs text-muted-foreground">{v.subtitle}</p>
            </div>
            <Link href={`/6-week-challenge/videos/${v.slug}`} target="_blank" title="Open public page" className="hidden text-muted-foreground hover:text-primary sm:block">
              <ExternalLink className="h-4 w-4" />
            </Link>
            <Button size="icon" variant="ghost" onClick={() => openEdit(v)} title="Edit"><Pencil className="h-4 w-4" /></Button>
            <Button size="icon" variant="ghost" onClick={() => remove(v)} disabled={busyId === v.id} title="Delete" className="text-muted-foreground hover:text-destructive">
              {busyId === v.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            </Button>
          </div>
        ))}
        {!videos.length ? <p className="py-6 text-center text-sm text-muted-foreground">No videos yet. Click &ldquo;Add video&rdquo;.</p> : null}
      </CardContent>

      {/* Add / Edit form */}
      <Dialog open={Boolean(form)} onOpenChange={(o) => !o && setForm(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{form?.id ? "Edit video" : "Add video"}</DialogTitle>
          </DialogHeader>
          {form ? (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <Field label="Badge" hint='e.g. "Week 1"'>
                  <Input value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} placeholder="Week 1" />
                </Field>
                <Field label="Title" className="sm:col-span-2">
                  <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Wake Up" />
                </Field>
              </div>
              <Field label="Subtitle">
                <Input value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
              </Field>
              <Field label="Description">
                <Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="resize-none" />
              </Field>

              {/* Thumbnail: upload (primary), URL (secondary, toggled) */}
              <div className="space-y-2 rounded-lg border border-border p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Thumbnail</span>
                  <button type="button" onClick={() => setUrlMode((m) => !m)} className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                    <Link2 className="h-3.5 w-3.5" /> {urlMode ? "Upload a file instead" : "Paste a URL instead"}
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative h-16 w-28 shrink-0 overflow-hidden rounded border border-border bg-muted">
                    {form.thumbnailUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={form.thumbnailUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-[10px] uppercase text-muted-foreground">Preview</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    {urlMode ? (
                      <Input value={form.thumbnailUrl} onChange={(e) => setForm({ ...form, thumbnailUrl: e.target.value })} placeholder="https://… or /6-week-challenge/thumbnails/…" />
                    ) : (
                      <>
                        <input
                          ref={fileRef}
                          type="file"
                          accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                          className="hidden"
                          onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadThumbnail(f); e.target.value = ""; }}
                        />
                        <Button type="button" variant="outline" size="sm" disabled={uploading} onClick={() => fileRef.current?.click()} className="gap-1.5">
                          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                          {uploading ? "Uploading…" : "Upload image"}
                        </Button>
                        <p className="mt-1 text-xs text-muted-foreground">PNG, JPG, WEBP, GIF, or SVG.</p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Video link */}
              <Field label="Video link" hint="Google Drive or YouTube share link, or a direct .mp4 URL">
                <Input value={form.videoLink} onChange={(e) => setForm({ ...form, videoLink: e.target.value })} placeholder="https://drive.google.com/file/d/…/view" />
              </Field>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.embedDirect} onChange={(e) => setForm({ ...form, embedDirect: e.target.checked })} className="h-4 w-4 rounded border-border" />
                Play on one click (embed the host player directly)
              </label>

              <Field label="Availability chip" hint="Shown on the card — flip to Available as each video goes live.">
                <select value={form.availability} onChange={(e) => setForm({ ...form, availability: e.target.value })} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                  <option value="available">Available</option>
                  <option value="coming_soon">Coming Soon</option>
                  <option value="none">No chip</option>
                </select>
              </Field>

              <div className="grid gap-3 sm:grid-cols-3">
                <Field label="Slug" hint="URL id; auto from title if blank">
                  <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="week-1" />
                </Field>
                <Field label="Order">
                  <Input type="number" step="0.5" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} />
                </Field>
                <Field label="Status">
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                    <option value="published">Published</option>
                    <option value="draft">Draft (hidden)</option>
                  </select>
                </Field>
              </div>

              {error ? <p className="text-sm text-destructive">{error}</p> : null}
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setForm(null)} disabled={saving}>Cancel</Button>
            <Button onClick={save} disabled={saving || uploading} className="gap-1.5">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {form?.id ? "Save changes" : "Add video"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function Field({ label, hint, className, children }: { label: string; hint?: string; className?: string; children: React.ReactNode }) {
  return (
    <label className={cn("block space-y-1", className)}>
      <span className="text-sm font-medium">{label}</span>
      {children}
      {hint ? <span className="block text-xs text-muted-foreground">{hint}</span> : null}
    </label>
  );
}
