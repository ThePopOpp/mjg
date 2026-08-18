"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Plus, Trash2, Users, Check } from "lucide-react";
import { useDashboardActionToken } from "@/components/layout/dashboard-action-token";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { DatePicker } from "@/components/ui/date-picker";
import { TimePicker } from "@/components/ui/time-picker";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type Member = { name: string; email: string };

function todayISO() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function StartChallengeLauncher({ teamMembers }: { teamMembers: Member[] }) {
  const router = useRouter();
  const actionToken = useDashboardActionToken();
  const [open, setOpen] = useState(false);
  const initial = useMemo<Member[]>(
    () => (teamMembers.length ? teamMembers.map((m) => ({ name: m.name, email: m.email })) : [{ name: "", email: "" }]),
    [teamMembers],
  );

  const [attendees, setAttendees] = useState<Member[]>(initial);
  const [frequency, setFrequency] = useState<"weekly" | "biweekly">("weekly");
  const [startDate, setStartDate] = useState(todayISO());
  const [startTime, setStartTime] = useState("09:00");
  const [sendInvitations, setSendInvitations] = useState(true);
  const [startChallenge, setStartChallenge] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ invited: number; attendees: number; started: boolean } | null>(null);

  const validCount = attendees.filter((a) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(a.email.trim())).length;

  function reset() {
    setAttendees(initial);
    setFrequency("weekly");
    setStartDate(todayISO());
    setStartTime("09:00");
    setSendInvitations(true);
    setStartChallenge(true);
    setError(null);
    setDone(null);
  }

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/facilitator/experiences/start-challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actionToken, attendees, frequency, startDate, startTime, sendInvitations, startChallenge }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setDone({ invited: data.invited ?? 0, attendees: data.attendees ?? 0, started: Boolean(data.started) });
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Button type="button" onClick={() => { reset(); setOpen(true); }}>
        <Sparkles className="mr-2 h-4 w-4" /> Start 6-Week Challenge
      </Button>

      <Dialog open={open} onOpenChange={(v) => !busy && setOpen(v)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> Start 6-Week Challenge</DialogTitle>
            <DialogDescription>Launch the challenge for your group — invite participants and start the email series.</DialogDescription>
          </DialogHeader>

          {done ? (
            <div className="space-y-3 py-2">
              <div className="flex items-center gap-2 rounded-lg border border-primary/40 bg-primary/5 p-4 text-sm">
                <Check className="h-5 w-5 shrink-0 text-primary" />
                <span>
                  Challenge created for <strong>{done.attendees}</strong> participant{done.attendees === 1 ? "" : "s"}.
                  {done.invited ? ` Sent ${done.invited} account invitation${done.invited === 1 ? "" : "s"}.` : ""}
                  {done.started ? " The email series is scheduled and will send on its cadence." : " Saved as a draft — you can start it later."}
                </span>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Close</Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Participants */}
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> Participants</Label>
                <p className="text-xs text-muted-foreground">Pre-filled from your team{teamMembers.length ? "" : " (none yet)"} — add or edit as needed.</p>
                <div className="space-y-2">
                  {attendees.map((a, i) => (
                    <div key={i} className="flex gap-2">
                      <Input placeholder="Name" value={a.name} onChange={(e) => setAttendees((r) => r.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} className="flex-1" />
                      <Input placeholder="email@example.com" type="email" value={a.email} onChange={(e) => setAttendees((r) => r.map((x, j) => (j === i ? { ...x, email: e.target.value } : x)))} className="flex-1" />
                      <Button type="button" variant="ghost" size="icon" aria-label="Remove" onClick={() => setAttendees((r) => (r.length > 1 ? r.filter((_, j) => j !== i) : r))}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  ))}
                </div>
                <Button type="button" variant="outline" size="sm" onClick={() => setAttendees((r) => [...r, { name: "", email: "" }])}><Plus className="mr-2 h-4 w-4" /> Add participant</Button>
                <p className="text-xs text-muted-foreground">{validCount} valid recipient{validCount === 1 ? "" : "s"}.</p>
              </div>

              {/* Frequency */}
              <div className="space-y-1.5">
                <Label>Email series frequency</Label>
                <div className="inline-flex rounded-md border p-0.5">
                  <button type="button" onClick={() => setFrequency("weekly")} className={cn("rounded px-3 py-1.5 text-sm font-medium transition-colors", frequency === "weekly" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent")}>Weekly · 6 weeks</button>
                  <button type="button" onClick={() => setFrequency("biweekly")} className={cn("rounded px-3 py-1.5 text-sm font-medium transition-colors", frequency === "biweekly" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent")}>Bi-Weekly · 12 weeks</button>
                </div>
              </div>

              {/* Start date/time */}
              <div className="flex gap-3">
                <div className="flex-1 space-y-1.5"><Label>Start date</Label><DatePicker value={startDate} onChange={setStartDate} /></div>
                <div className="flex-1 space-y-1.5"><Label>Start time</Label><TimePicker value={startTime} onChange={setStartTime} /></div>
              </div>

              {/* Actions */}
              <div className="space-y-3 rounded-lg border p-3">
                <label className="flex items-start justify-between gap-3">
                  <span><span className="text-sm font-medium">Send account invitations now</span><span className="block text-xs text-muted-foreground">Emails each participant a create-your-account invite.</span></span>
                  <Switch checked={sendInvitations} onCheckedChange={setSendInvitations} />
                </label>
                <label className="flex items-start justify-between gap-3 border-t pt-3">
                  <span><span className="text-sm font-medium">Start the challenge</span><span className="block text-xs text-muted-foreground">Schedules the email series from the start date. Turn off to save as a draft.</span></span>
                  <Switch checked={startChallenge} onCheckedChange={setStartChallenge} />
                </label>
              </div>

              {error ? <p className="text-sm text-destructive">{error}</p> : null}

              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)} disabled={busy}>Cancel</Button>
                <Button onClick={submit} disabled={busy || validCount === 0}>{busy ? "Starting…" : "Start Challenge"}</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
