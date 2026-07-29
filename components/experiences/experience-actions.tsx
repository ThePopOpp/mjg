"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Archive, Trash2, Save, Plus } from "lucide-react";
import { useDashboardActionToken } from "@/components/layout/dashboard-action-token";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import { TimePicker } from "@/components/ui/time-picker";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MediaUploadField } from "@/components/experiences/media-upload-field";

type PreviewShape = {
  id: string;
  title: string;
  content: string | null;
  image_url: string | null;
  video_url: string | null;
  audio_url: string | null;
  document_url: string | null;
  frequency_label: string | null;
};

export type EditableExperience = {
  id: string;
  name: string;
  start_date: string;
  start_time?: string | null;
  status: string;
  facilitator_id?: string | null;
  preview?: PreviewShape | null;
};

const STATUSES = ["draft", "scheduled", "active", "completed", "cancelled"];
const FREQUENCIES = [
  ...Array.from({ length: 12 }, (_, i) => `${i + 1} week${i ? "s" : ""}`),
  ...Array.from({ length: 12 }, (_, i) => `${i + 1} month${i ? "s" : ""}`),
];

export function ExperienceActions({
  experience,
  facilitators,
  variant = "row",
}: {
  experience: EditableExperience;
  facilitators: { id: string; name: string }[];
  variant?: "row" | "overlay";
}) {
  const router = useRouter();
  const actionToken = useDashboardActionToken();
  const [editOpen, setEditOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(experience.name);
  const [startDate, setStartDate] = useState(experience.start_date);
  const [startTime, setStartTime] = useState((experience.start_time ?? "09:00").slice(0, 5));
  const [status, setStatus] = useState(experience.status);
  const [facilitatorId, setFacilitatorId] = useState(experience.facilitator_id ?? "");

  // Preview state
  const hadPreview = Boolean(experience.preview);
  const [previewOn, setPreviewOn] = useState(hadPreview);
  const [pTitle, setPTitle] = useState(experience.preview?.title ?? "");
  const [pContent, setPContent] = useState(experience.preview?.content ?? "");
  const [pImage, setPImage] = useState(experience.preview?.image_url ?? "");
  const [pVideo, setPVideo] = useState(experience.preview?.video_url ?? "");
  const [pAudio, setPAudio] = useState(experience.preview?.audio_url ?? "");
  const [pDoc, setPDoc] = useState(experience.preview?.document_url ?? "");
  const [pFreq, setPFreq] = useState(experience.preview?.frequency_label ?? "");

  async function upload(file: File): Promise<string> {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", "experience-previews");
    const res = await fetch("/api/admin/uploads", { method: "POST", headers: { "x-mjg-action-token": actionToken }, body: fd });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Upload failed.");
    return data.url as string;
  }

  async function call(method: "PATCH" | "DELETE", body: Record<string, unknown>) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/experiences/${experience.id}`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actionToken, ...body }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Action failed.");
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function saveEdit() {
    // Preview: object to add/update, null to remove, omitted to leave unchanged.
    let preview: unknown;
    if (previewOn) {
      if (!pTitle.trim()) { setError("Add a preview title (or remove the preview)."); return; }
      preview = { title: pTitle, content: pContent, imageUrl: pImage, videoUrl: pVideo, audioUrl: pAudio, documentUrl: pDoc, frequencyLabel: pFreq };
    } else if (hadPreview) {
      preview = null;
    }
    const body: Record<string, unknown> = { name, startDate, startTime, status, facilitatorId: facilitatorId || null };
    if (preview !== undefined) body.preview = preview;

    const ok = await call("PATCH", body);
    if (ok) { setEditOpen(false); router.refresh(); }
  }
  async function archive() { if (await call("PATCH", { archived: true })) router.refresh(); }
  async function del() { if (await call("DELETE", {})) { setConfirmDelete(false); router.refresh(); } }

  const stop = (e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); };

  return (
    <div className={variant === "overlay" ? "flex items-center gap-0.5" : "flex items-center justify-end gap-0.5"} onClick={stop}>
      <button type="button" onClick={() => setEditOpen(true)} className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground" aria-label="Edit"><Pencil className="h-4 w-4" /></button>
      <button type="button" onClick={archive} disabled={busy} className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground" aria-label="Archive"><Archive className="h-4 w-4" /></button>
      <button type="button" onClick={() => setConfirmDelete(true)} className="rounded p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive" aria-label="Delete"><Trash2 className="h-4 w-4" /></button>

      {/* Edit */}
      <Dialog open={editOpen} onOpenChange={(v) => !busy && setEditOpen(v)}>
        <DialogContent onClick={stop} className="max-h-[88vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader><DialogTitle>Edit experience</DialogTitle><DialogDescription>Update the details and preview for this experience.</DialogDescription></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5"><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
            <div className="flex gap-3">
              <div className="flex-1 space-y-1.5"><Label>Start date</Label><DatePicker value={startDate} onChange={setStartDate} /></div>
              <div className="flex-1 space-y-1.5"><Label>Start time</Label><TimePicker value={startTime} onChange={setStartTime} /></div>
            </div>
            <div className="flex gap-3">
              <div className="flex-1 space-y-1.5"><Label>Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="flex-1 space-y-1.5"><Label>Facilitator</Label>
                <Select value={facilitatorId || "none"} onValueChange={(v) => setFacilitatorId(v === "none" ? "" : v)}>
                  <SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger>
                  <SelectContent><SelectItem value="none">Unassigned</SelectItem>{facilitators.map((f) => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Changing the start date/time reschedules any emails that haven&apos;t sent yet.</p>

            {/* Experience Preview */}
            <div className="rounded-lg border p-3">
              <div className="flex items-center justify-between">
                <div><p className="text-sm font-medium">Experience Preview</p><p className="text-xs text-muted-foreground">Shown to facilitators &amp; participants.</p></div>
                {previewOn ? (
                  <Button type="button" variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => setPreviewOn(false)}><Trash2 className="mr-1.5 h-4 w-4" /> Remove</Button>
                ) : (
                  <Button type="button" variant="outline" size="sm" onClick={() => setPreviewOn(true)}><Plus className="mr-1.5 h-4 w-4" /> {hadPreview ? "Restore preview" : "Add preview"}</Button>
                )}
              </div>

              {previewOn && (
                <div className="mt-3 space-y-3">
                  <div className="space-y-1.5"><Label>Title</Label><Input value={pTitle} onChange={(e) => setPTitle(e.target.value)} placeholder="6 Week Challenge" /></div>
                  <div className="space-y-1.5"><Label>Content</Label><Textarea rows={4} value={pContent} onChange={(e) => setPContent(e.target.value)} placeholder="What this experience is about…" /></div>
                  <MediaUploadField label="Image (JPEG / PNG)" url={pImage} setUrl={setPImage} accept="image/png,image/jpeg,image/webp,image/gif" upload={upload} setBusy={setBusy} setError={setError} />
                  <MediaUploadField label="Video" url={pVideo} setUrl={setPVideo} accept="video/*" upload={upload} setBusy={setBusy} setError={setError} />
                  <MediaUploadField label="Audio" url={pAudio} setUrl={setPAudio} accept="audio/*" upload={upload} setBusy={setBusy} setError={setError} />
                  <MediaUploadField label="Document (PDF)" url={pDoc} setUrl={setPDoc} accept="application/pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.rtf,.csv" upload={upload} setBusy={setBusy} setError={setError} />
                  <div className="space-y-1.5"><Label>Frequency</Label>
                    <Select value={pFreq || "none"} onValueChange={(v) => setPFreq(v === "none" ? "" : v)}>
                      <SelectTrigger><SelectValue placeholder="Select frequency" /></SelectTrigger>
                      <SelectContent><SelectItem value="none">None</SelectItem>{FREQUENCIES.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)} disabled={busy}>Cancel</Button>
            <Button onClick={saveEdit} disabled={busy || !name.trim()}><Save className="mr-2 h-4 w-4" /> {busy ? "Saving…" : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={confirmDelete} onOpenChange={(v) => !busy && setConfirmDelete(v)}>
        <DialogContent onClick={stop}>
          <DialogHeader><DialogTitle>Delete experience?</DialogTitle><DialogDescription>This permanently removes “{experience.name}”, its attendees, and its scheduled emails. This can&apos;t be undone.</DialogDescription></DialogHeader>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(false)} disabled={busy}>Cancel</Button>
            <Button variant="destructive" onClick={del} disabled={busy}><Trash2 className="mr-2 h-4 w-4" /> {busy ? "Deleting…" : "Delete"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

