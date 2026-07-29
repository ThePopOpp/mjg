"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Upload, PencilLine, ArrowRight, FileText } from "lucide-react";
import { useDashboardActionToken } from "@/components/layout/dashboard-action-token";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MediaUploadField } from "@/components/experiences/media-upload-field";

const NEW_URL = "/dashboard/experiences/new";

const FREQUENCIES = [
  ...Array.from({ length: 12 }, (_, i) => `${i + 1} week${i ? "s" : ""}`),
  ...Array.from({ length: 12 }, (_, i) => `${i + 1} month${i ? "s" : ""}`),
];

export function NewExperienceButton() {
  const router = useRouter();
  const actionToken = useDashboardActionToken();
  const [open, setOpen] = useState(false);
  const [sheet, setSheet] = useState(false);
  const [remind, setRemind] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pdfInput = useRef<HTMLInputElement>(null);

  // Create Preview form
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [documentUrl, setDocumentUrl] = useState("");
  const [frequency, setFrequency] = useState("");
  const [showUrls, setShowUrls] = useState(false);

  async function upload(file: File, folder: string): Promise<string> {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", folder);
    const res = await fetch("/api/admin/uploads", { method: "POST", headers: { "x-mjg-action-token": actionToken }, body: fd });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Upload failed.");
    return data.url as string;
  }

  async function createPreviewAndGo(fields: Record<string, unknown>) {
    const res = await fetch("/api/admin/experiences/previews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ actionToken, ...fields }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Unable to save preview.");
    router.push(`${NEW_URL}?preview=${data.id}`);
  }

  async function onFilePicked(file: File) {
    setBusy(true);
    setError(null);
    try {
      const url = await upload(file, "experience-previews");
      // Route by type: images become the preview image, everything else a document.
      const key = file.type.startsWith("image/") ? "imageUrl" : "documentUrl";
      await createPreviewAndGo({ title: file.name.replace(/\.[^.]+$/, ""), [key]: url });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
      setBusy(false);
    }
  }

  async function saveCustomPreview() {
    if (!title.trim()) { setError("Add a title."); return; }
    setBusy(true);
    setError(null);
    try {
      await createPreviewAndGo({ title, content, imageUrl, videoUrl, audioUrl, documentUrl, frequencyLabel: frequency });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to save preview.");
      setBusy(false);
    }
  }

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}><Plus className="mr-2 h-4 w-4" /> New Experience</Button>

      <Dialog open={open} onOpenChange={(v) => !busy && setOpen(v)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add an experience preview?</DialogTitle>
            <DialogDescription>Facilitators and participants see this preview when they open the experience. It&apos;s optional.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {/* 1. Add later */}
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-3">
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Add later</p>
                  <label className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <Switch checked={remind} onCheckedChange={setRemind} /> Remind me
                  </label>
                </div>
              </div>
              <Button variant="outline" size="sm" disabled={busy} onClick={() => router.push(NEW_URL)}>Continue</Button>
            </div>

            {/* 2. Upload a file */}
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <div><p className="font-medium">Upload a file</p><p className="text-xs text-muted-foreground">PDF, JPEG, PNG, or a document.</p></div>
              </div>
              <input ref={pdfInput} type="file" accept="image/*,application/pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.rtf,.csv" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onFilePicked(f); }} />
              <Button variant="outline" size="sm" disabled={busy} onClick={() => pdfInput.current?.click()}><Upload className="mr-2 h-4 w-4" /> Upload</Button>
            </div>

            {/* 3. Create preview */}
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-3">
                <PencilLine className="h-5 w-5 text-muted-foreground" />
                <div><p className="font-medium">Create a preview</p><p className="text-xs text-muted-foreground">Title, content, media, and frequency.</p></div>
              </div>
              <Button variant="outline" size="sm" disabled={busy} onClick={() => { setOpen(false); setSheet(true); }}>Create</Button>
            </div>

            {/* 4. No preview */}
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div><p className="font-medium">No preview</p><p className="text-xs text-muted-foreground">Skip and go straight to setup.</p></div>
              <Button size="sm" disabled={busy} onClick={() => router.push(NEW_URL)}>Continue</Button>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
            {busy && <p className="text-sm text-muted-foreground">Working…</p>}
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Preview slideout */}
      <Sheet open={sheet} onOpenChange={(v) => !busy && setSheet(v)}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Create experience preview</SheetTitle>
            <SheetDescription>This is what facilitators and participants will see.</SheetDescription>
          </SheetHeader>
          <div className="mt-4 space-y-4">
            <div className="space-y-1.5"><Label>Experience title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="6 Week Challenge" /></div>
            <div className="space-y-1.5"><Label>Content</Label><Textarea rows={5} value={content} onChange={(e) => setContent(e.target.value)} placeholder="What this experience is about…" /></div>

            <div className="flex items-center justify-end">
              <label className="flex items-center gap-1.5 text-xs text-muted-foreground"><Switch checked={showUrls} onCheckedChange={setShowUrls} /> Add URL</label>
            </div>
            <MediaUploadField label="Image (JPEG / PNG)" url={imageUrl} setUrl={setImageUrl} accept="image/png,image/jpeg,image/webp,image/gif" upload={(f) => upload(f, "experience-previews")} setBusy={setBusy} setError={setError} showUrl={showUrls} />
            <MediaUploadField label="Video" url={videoUrl} setUrl={setVideoUrl} accept="video/*" upload={(f) => upload(f, "experience-previews")} setBusy={setBusy} setError={setError} showUrl={showUrls} />
            <MediaUploadField label="Audio" url={audioUrl} setUrl={setAudioUrl} accept="audio/*" upload={(f) => upload(f, "experience-previews")} setBusy={setBusy} setError={setError} showUrl={showUrls} />
            <MediaUploadField label="Document (PDF)" url={documentUrl} setUrl={setDocumentUrl} accept="application/pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.rtf,.csv" upload={(f) => upload(f, "experience-previews")} setBusy={setBusy} setError={setError} showUrl={showUrls} />

            <div className="space-y-1.5">
              <Label>Frequency</Label>
              <Select value={frequency} onValueChange={setFrequency}>
                <SelectTrigger><SelectValue placeholder="Select frequency" /></SelectTrigger>
                <SelectContent>{FREQUENCIES.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
              </Select>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <SheetFooter className="mt-6">
            <Button variant="outline" onClick={() => setSheet(false)} disabled={busy}>Cancel</Button>
            <Button onClick={saveCustomPreview} disabled={busy || !title.trim()}>{busy ? "Saving…" : "Save & continue"}</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}

