"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Archive, Trash2, Save } from "lucide-react";
import { useDashboardActionToken } from "@/components/layout/dashboard-action-token";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { TimePicker } from "@/components/ui/time-picker";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type EditableExperience = {
  id: string;
  name: string;
  start_date: string;
  start_time?: string | null;
  status: string;
  facilitator_id?: string | null;
};

const STATUSES = ["draft", "scheduled", "active", "completed", "cancelled"];

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
    const ok = await call("PATCH", { name, startDate, startTime, status, facilitatorId: facilitatorId || null });
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
        <DialogContent onClick={stop}>
          <DialogHeader><DialogTitle>Edit experience</DialogTitle><DialogDescription>Update the details for this experience.</DialogDescription></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5"><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
            <div className="flex gap-3">
              <div className="w-48 space-y-1.5"><Label>Start date</Label><DatePicker value={startDate} onChange={setStartDate} /></div>
              <div className="w-36 space-y-1.5"><Label>Start time</Label><TimePicker value={startTime} onChange={setStartTime} /></div>
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
            {error && <p className="text-sm text-destructive">{error}</p>}
            <p className="text-xs text-muted-foreground">Changing the start date/time reschedules any emails that haven&apos;t sent yet.</p>
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
