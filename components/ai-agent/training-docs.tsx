"use client";

// Training Docs — upload reference material to teach Steward.
//
// Files are converted to markdown server-side on upload (see
// lib/ai-agent/training-docs/convert.ts); the original stays downloadable. Only
// docs that converted to text ("Readable") reach the agent — images and formats we
// can't parse are kept but clearly marked so nobody assumes Steward has read them.

import * as React from "react";
import {
  Upload, FileText, Search, Loader2, Trash2, Download, RefreshCw, X, ClipboardPaste,
  CircleCheck, CircleAlert, ImageIcon, Archive, ArchiveRestore,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FieldSelect } from "@/components/ui/field-select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useDashboardActionToken } from "@/components/layout/dashboard-action-token";

type Doc = {
  id: string;
  title: string;
  summary: string | null;
  content_md?: string | null;
  source_kind: string;
  file_name: string | null;
  file_url: string | null;
  mime_type: string | null;
  size_bytes: number | null;
  status: "ready" | "stored" | "failed" | "archived";
  conversion_error: string | null;
  char_count: number;
  tags: string[];
  created_by_email: string | null;
  created_at: string;
  updated_at: string;
};

const STATUS_META: Record<Doc["status"], { label: string; hint: string; pill: string; icon: React.ElementType }> = {
  ready: { label: "Readable", hint: "Converted to markdown — Steward can read this.", pill: "bg-primary/10 text-primary", icon: CircleCheck },
  stored: { label: "Stored only", hint: "Saved and downloadable, but there's no text for Steward to read.", pill: "bg-muted text-muted-foreground", icon: ImageIcon },
  failed: { label: "Couldn't convert", hint: "The file was saved but conversion failed.", pill: "bg-destructive/10 text-destructive", icon: CircleAlert },
  archived: { label: "Archived", hint: "Kept, but hidden from Steward.", pill: "bg-muted text-muted-foreground", icon: Archive },
};

const FILTERS = [
  { value: "all", label: "All docs" },
  { value: "ready", label: "Readable" },
  { value: "stored", label: "Stored only" },
  { value: "failed", label: "Couldn't convert" },
  { value: "archived", label: "Archived" },
];

const ACCEPT = ".md,.markdown,.txt,.log,.csv,.tsv,.json,.html,.htm,.pdf,.docx,.doc,.rtf,image/*";

function prettyBytes(n: number | null) {
  if (!n) return "—";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export function TrainingDocs() {
  const token = useDashboardActionToken();
  const [docs, setDocs] = React.useState<Doc[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [uploading, setUploading] = React.useState<string[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState("all");
  const [active, setActive] = React.useState<Doc | null>(null);
  const [pasteOpen, setPasteOpen] = React.useState(false);
  const [dragging, setDragging] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/admin/ai-agent/training-docs", { headers: { "x-mjg-action-token": token } }).then((x) => x.json());
      if (Array.isArray(r.docs)) setDocs(r.docs);
      if (r.error) setError(r.error);
    } catch { setError("Couldn't load training docs."); }
    finally { setLoading(false); }
  }, [token]);
  React.useEffect(() => { load(); }, [load]);

  async function uploadFiles(files: FileList | File[]) {
    const list = Array.from(files);
    if (!list.length) return;
    setError(null);
    setUploading(list.map((f) => f.name));
    // Sequential: each file is parsed in-process, and a stampede of large PDFs
    // would be a good way to exhaust the server.
    for (const file of list) {
      try {
        const fd = new FormData();
        fd.append("file", file);
        const r = await fetch("/api/admin/ai-agent/training-docs", {
          method: "POST", headers: { "x-mjg-action-token": token }, body: fd,
        }).then((x) => x.json());
        if (r.error) setError(`${file.name}: ${r.error}`);
        else if (r.doc) setDocs((d) => [r.doc, ...d]);
      } catch {
        setError(`${file.name}: upload failed.`);
      } finally {
        setUploading((u) => u.filter((n) => n !== file.name));
      }
    }
  }

  async function patch(id: string, body: Record<string, unknown>) {
    const r = await fetch("/api/admin/ai-agent/training-docs", {
      method: "PATCH",
      headers: { "content-type": "application/json", "x-mjg-action-token": token },
      body: JSON.stringify({ id, actionToken: token, ...body }),
    }).then((x) => x.json());
    if (r.doc) {
      setDocs((d) => d.map((x) => (x.id === id ? { ...x, ...r.doc } : x)));
      setActive((a) => (a && a.id === id ? { ...a, ...r.doc } : a));
    }
    if (r.error) setError(r.error);
    return r;
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this training doc? Steward will stop using it.")) return;
    const r = await fetch(`/api/admin/ai-agent/training-docs?id=${id}`, {
      method: "DELETE", headers: { "x-mjg-action-token": token },
    }).then((x) => x.json());
    if (r.error) return setError(r.error);
    setDocs((d) => d.filter((x) => x.id !== id));
    setActive(null);
  }

  async function openDoc(doc: Doc) {
    setActive(doc);
    // The list omits bodies; fetch this one's text for the preview.
    const r = await fetch(`/api/admin/ai-agent/training-docs?id=${doc.id}`, { headers: { "x-mjg-action-token": token } }).then((x) => x.json());
    if (r.doc) setActive(r.doc);
  }

  const shown = docs
    .filter((d) => (status === "all" ? d.status !== "archived" : d.status === status))
    .filter((d) => {
      const q = search.trim().toLowerCase();
      return !q || [d.title, d.summary ?? "", d.file_name ?? "", d.tags.join(" ")].join(" ").toLowerCase().includes(q);
    });

  const readable = docs.filter((d) => d.status === "ready").length;

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); void uploadFiles(e.dataTransfer.files); }}
        className={cn(
          "rounded-xl border-2 border-dashed p-6 text-center transition",
          dragging ? "border-primary bg-accent/40" : "border-muted-foreground/25",
        )}
      >
        <Upload className="mx-auto h-6 w-6 text-muted-foreground" aria-hidden />
        <p className="mt-2 text-sm font-medium">Drop files here, or</p>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
          <Button size="sm" variant="outline" onClick={() => inputRef.current?.click()} className="gap-1.5">
            <FileText className="h-3.5 w-3.5" /> Choose files
          </Button>
          <Button size="sm" variant="outline" onClick={() => setPasteOpen(true)} className="gap-1.5">
            <ClipboardPaste className="h-3.5 w-3.5" /> Paste text
          </Button>
        </div>
        <p className="mx-auto mt-3 max-w-lg text-xs leading-5 text-muted-foreground">
          Markdown, text, CSV, JSON, HTML, Word (.docx) and PDF are converted to markdown for Steward to read.
          Images and other formats are stored for reference but can&apos;t be read. Max 25 MB per file.
        </p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPT}
          className="hidden"
          onChange={(e) => { if (e.target.files) void uploadFiles(e.target.files); e.target.value = ""; }}
        />
      </div>

      {uploading.length > 0 && (
        <div className="space-y-1.5">
          {uploading.map((name) => (
            <div key={name} className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
              <span className="truncate">Converting {name}…</span>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
          <span className="min-w-0 flex-1">{error}</span>
          <button onClick={() => setError(null)} aria-label="Dismiss"><X className="h-3.5 w-3.5" /></button>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <FieldSelect value={status} onChange={setStatus} options={FILTERS} className="h-9 w-40" />
        <div className="relative min-w-44 flex-1 sm:max-w-64">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search docs…" aria-label="Search training docs" className="h-9 pl-8 text-xs" />
        </div>
        <span className="text-xs text-muted-foreground">
          {shown.length} doc{shown.length === 1 ? "" : "s"} · {readable} readable by Steward
        </span>
        <Button variant="outline" size="sm" onClick={load} aria-label="Refresh" className="ml-auto">
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
        </Button>
      </div>

      {loading && docs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-muted/30 p-10 text-center text-sm text-muted-foreground">Loading…</div>
      ) : shown.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-muted/30 p-10 text-center">
          <p className="text-sm font-medium">{docs.length === 0 ? "No training docs yet." : "Nothing matches."}</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
            {docs.length === 0
              ? "Upload guides, playbooks or process notes and Steward will use them when answering."
              : "Try a different filter or search."}
          </p>
        </div>
      ) : (
        <div className="grid gap-2">
          {shown.map((d) => {
            const meta = STATUS_META[d.status];
            const Icon = meta.icon;
            return (
              <button
                key={d.id}
                onClick={() => void openDoc(d)}
                className="flex items-start gap-3 rounded-lg border border-border bg-card p-3 text-left transition hover:border-primary/40 hover:bg-accent/30"
              >
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-primary">
                  <FileText className="h-4 w-4" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-1.5">
                    <span className="truncate text-sm font-medium">{d.title}</span>
                    <span className={cn("inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium", meta.pill)}>
                      <Icon className="h-2.5 w-2.5" aria-hidden /> {meta.label}
                    </span>
                    {d.tags.map((t) => (
                      <span key={t} className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">{t}</span>
                    ))}
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                    {d.summary || d.conversion_error || "No summary"}
                  </span>
                  <span className="mt-0.5 block truncate text-[10px] text-muted-foreground">
                    {d.file_name ?? "Pasted text"} · {prettyBytes(d.size_bytes)}
                    {d.char_count ? ` · ${d.char_count.toLocaleString()} chars` : ""} · {new Date(d.created_at).toLocaleDateString()}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      )}

      {active && (
        <DocDrawer
          doc={active}
          onClose={() => setActive(null)}
          onPatch={patch}
          onDelete={() => void remove(active.id)}
        />
      )}

      <PasteDialog
        open={pasteOpen}
        onOpenChange={setPasteOpen}
        token={token}
        onCreated={(doc) => { setDocs((d) => [doc, ...d]); setPasteOpen(false); }}
      />
    </div>
  );
}

function DocDrawer({
  doc, onClose, onPatch, onDelete,
}: {
  doc: Doc;
  onClose: () => void;
  onPatch: (id: string, body: Record<string, unknown>) => Promise<{ error?: string }>;
  onDelete: () => void;
}) {
  const [title, setTitle] = React.useState(doc.title);
  const [summary, setSummary] = React.useState(doc.summary ?? "");
  const [tags, setTags] = React.useState(doc.tags.join(", "));
  const [saving, setSaving] = React.useState(false);
  const meta = STATUS_META[doc.status];

  React.useEffect(() => {
    setTitle(doc.title); setSummary(doc.summary ?? ""); setTags(doc.tags.join(", "));
  }, [doc.id, doc.title, doc.summary, doc.tags]);

  async function save() {
    setSaving(true);
    await onPatch(doc.id, { title: title.trim(), summary: summary.trim() || null, tags: tags.split(",").map((t) => t.trim()).filter(Boolean) });
    setSaving(false);
  }

  const archived = doc.status === "archived";

  return (
    <Sheet open onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-xl">
        <SheetHeader className="shrink-0 border-b border-border px-4 py-3">
          <SheetTitle className="pr-8 text-base">Training doc</SheetTitle>
        </SheetHeader>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
          <div className={cn("flex items-start gap-2 rounded-lg px-3 py-2 text-xs", meta.pill)}>
            <meta.icon className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
            <span>{doc.conversion_error || meta.hint}</span>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Summary</Label>
            <Textarea value={summary} onChange={(e) => setSummary(e.target.value)} rows={2} placeholder="One line describing what's in here…" />
            {/* The summary is the only part of a doc Steward sees without opening it. */}
            <p className="text-xs text-muted-foreground">Shown in Steward&apos;s index — this is how it decides whether to read this doc.</p>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tags</Label>
            <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="onboarding, policy" />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Converted markdown {doc.char_count ? `· ${doc.char_count.toLocaleString()} chars` : ""}
            </Label>
            {doc.content_md ? (
              <pre className="max-h-80 overflow-auto whitespace-pre-wrap rounded-lg border border-border bg-muted/40 p-3 text-xs leading-5">
                {doc.content_md}
              </pre>
            ) : (
              <p className="rounded-lg border border-dashed border-border p-3 text-xs text-muted-foreground">
                No text was extracted from this file.
              </p>
            )}
          </div>

          <div className="grid gap-1 text-xs text-muted-foreground">
            <span>Source: {doc.source_kind === "paste" ? "Pasted text" : doc.file_name}</span>
            <span>Added {new Date(doc.created_at).toLocaleString()}{doc.created_by_email ? ` by ${doc.created_by_email}` : ""}</span>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2 border-t border-border p-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => void onPatch(doc.id, { status: archived ? "ready" : "archived" })}
            className="gap-1.5"
            // A doc with no text can't become readable by un-archiving it.
            disabled={archived && !doc.content_md}
            title={archived && !doc.content_md ? "This doc has no readable text" : undefined}
          >
            {archived ? <><ArchiveRestore className="h-3.5 w-3.5" /> Restore</> : <><Archive className="h-3.5 w-3.5" /> Archive</>}
          </Button>
          {doc.file_url && (
            <Button variant="outline" size="sm" asChild>
              <a href={doc.file_url} target="_blank" rel="noopener" className="gap-1.5"><Download className="h-3.5 w-3.5" /> Original</a>
            </Button>
          )}
          <Button variant="outline" size="sm" className="gap-1.5 text-destructive hover:text-destructive" onClick={onDelete}>
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </Button>
          <Button size="sm" className="ml-auto" onClick={save} disabled={saving || !title.trim()}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function PasteDialog({
  open, onOpenChange, token, onCreated,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  token: string;
  onCreated: (doc: Doc) => void;
}) {
  const [title, setTitle] = React.useState("");
  const [text, setText] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  async function submit() {
    setBusy(true); setErr(null);
    try {
      const fd = new FormData();
      fd.append("title", title.trim());
      fd.append("text", text);
      const r = await fetch("/api/admin/ai-agent/training-docs", {
        method: "POST", headers: { "x-mjg-action-token": token }, body: fd,
      }).then((x) => x.json());
      if (r.error) setErr(r.error);
      else if (r.doc) { onCreated(r.doc); setTitle(""); setText(""); }
    } catch { setErr("Couldn't save that."); }
    finally { setBusy(false); }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !busy && onOpenChange(o)}>
      <DialogContent className="max-w-2xl">
        <DialogHeader><DialogTitle>Paste training text</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Client onboarding process" autoFocus />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Content (markdown)</Label>
            <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={12} placeholder="Paste or write the reference material…" className="font-mono text-xs" />
          </div>
          {err && <p className="text-sm text-destructive">{err}</p>}
        </div>
        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={busy}>Cancel</Button>
          <Button onClick={submit} disabled={busy || !title.trim() || !text.trim()}>{busy ? "Saving…" : "Add doc"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
