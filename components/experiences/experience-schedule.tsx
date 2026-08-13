"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarClock, Send, Save } from "lucide-react";
import { useDashboardActionToken } from "@/components/layout/dashboard-action-token";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { TimePicker } from "@/components/ui/time-picker";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

export type ScheduleRow = {
  id: string;
  step_number: number;
  email: string | null;
  label: string | null;
  scheduled_at: string | null;
  status: string;
  sent_at: string | null;
  error_message: string | null;
};

function fmt(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
}

// Split an ISO timestamp into the local YYYY-MM-DD and HH:mm the pickers expect.
function splitLocal(iso: string | null): { date: string; time: string } {
  const d = iso ? new Date(iso) : new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return { date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`, time: `${pad(d.getHours())}:${pad(d.getMinutes())}` };
}

export function ExperienceSchedule({ experienceId, rows }: { experienceId: string; rows: ScheduleRow[] }) {
  const router = useRouter();
  const actionToken = useDashboardActionToken();
  const [editing, setEditing] = useState<ScheduleRow | null>(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("09:00");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmSend, setConfirmSend] = useState<ScheduleRow | null>(null);

  function openEdit(row: ScheduleRow) {
    const { date: d, time: t } = splitLocal(row.scheduled_at);
    setDate(d);
    setTime(t);
    setError(null);
    setEditing(row);
  }

  async function call(row: ScheduleRow, body: Record<string, unknown>) {
    setBusyId(row.id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/experiences/${experienceId}/send-events`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actionToken, eventId: row.id, ...body }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Action failed.");
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      return false;
    } finally {
      setBusyId(null);
    }
  }

  async function saveReschedule() {
    if (!editing) return;
    // Combine the local date + time into an ISO instant the server stores verbatim.
    const scheduledAt = new Date(`${date}T${time}:00`).toISOString();
    if (await call(editing, { scheduledAt })) {
      setEditing(null);
      router.refresh();
    }
  }

  async function sendNow() {
    if (!confirmSend) return;
    const row = confirmSend;
    if (await call(row, { action: "send-now" })) {
      setConfirmSend(null);
      router.refresh();
    } else {
      setConfirmSend(null);
    }
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Step</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Recipient</TableHead>
            <TableHead>Scheduled</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Sent</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((e) => {
            const canManage = e.status === "scheduled" || e.status === "failed" || e.status === "skipped";
            return (
              <TableRow key={e.id}>
                <TableCell className="whitespace-nowrap">{e.step_number}</TableCell>
                <TableCell className="max-w-[16rem] truncate text-muted-foreground">{e.label ?? `Step ${e.step_number}`}</TableCell>
                <TableCell>{e.email ?? "—"}</TableCell>
                <TableCell className="whitespace-nowrap">{fmt(e.scheduled_at)}</TableCell>
                <TableCell className="capitalize">{e.status}{e.error_message ? ` — ${e.error_message}` : ""}</TableCell>
                <TableCell className="whitespace-nowrap">{fmt(e.sent_at)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    {e.status === "scheduled" ? (
                      <button type="button" onClick={() => openEdit(e)} disabled={busyId === e.id} className="inline-flex items-center gap-1 rounded border bg-background px-2 py-1 text-xs font-medium hover:bg-accent" aria-label="Reschedule">
                        <CalendarClock className="h-3.5 w-3.5" /> Reschedule
                      </button>
                    ) : null}
                    {canManage ? (
                      <button type="button" onClick={() => setConfirmSend(e)} disabled={busyId === e.id} className="inline-flex items-center gap-1 rounded border bg-background px-2 py-1 text-xs font-medium hover:bg-accent" aria-label="Send now">
                        <Send className="h-3.5 w-3.5" /> {busyId === e.id ? "Sending…" : "Send now"}
                      </button>
                    ) : null}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
          {!rows.length ? <TableRow><TableCell colSpan={7}>Nothing scheduled yet.</TableCell></TableRow> : null}
        </TableBody>
      </Table>
      {error ? <p className="px-4 py-2 text-sm text-destructive">{error}</p> : null}

      {/* Reschedule dialog */}
      <Dialog open={Boolean(editing)} onOpenChange={(v) => !busyId && !v && setEditing(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Reschedule email</DialogTitle>
            <DialogDescription>{editing?.label ?? `Step ${editing?.step_number}`} → {editing?.email ?? "recipient"}. Set a new send date and time.</DialogDescription>
          </DialogHeader>
          <div className="flex gap-3">
            <div className="flex-1 space-y-1.5"><label className="text-sm font-medium">Date</label><DatePicker value={date} onChange={setDate} /></div>
            <div className="flex-1 space-y-1.5"><label className="text-sm font-medium">Time</label><TimePicker value={time} onChange={setTime} /></div>
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)} disabled={Boolean(busyId)}>Cancel</Button>
            <Button onClick={saveReschedule} disabled={Boolean(busyId) || !date}><Save className="mr-2 h-4 w-4" /> {busyId ? "Saving…" : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send-now confirm */}
      <Dialog open={Boolean(confirmSend)} onOpenChange={(v) => !busyId && !v && setConfirmSend(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Send this email now?</DialogTitle>
            <DialogDescription>This immediately emails {confirmSend?.email ?? "the recipient"} ({confirmSend?.label ?? `Step ${confirmSend?.step_number}`}), out of schedule. It can&apos;t be unsent.</DialogDescription>
          </DialogHeader>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmSend(null)} disabled={Boolean(busyId)}>Cancel</Button>
            <Button onClick={sendNow} disabled={Boolean(busyId)}><Send className="mr-2 h-4 w-4" /> {busyId ? "Sending…" : "Send now"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
