"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Plus, Trash2, Users, Check, Eye } from "lucide-react";
import { useDashboardActionToken } from "@/components/layout/dashboard-action-token";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { DatePicker } from "@/components/ui/date-picker";
import { TimePicker } from "@/components/ui/time-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { FacilitatorJoinToggle, type FacilitatorEmailTrack } from "@/components/experiences/facilitator-join-toggle";
import { cn } from "@/lib/utils";

type Member = { name: string; email: string };
type Option = { id: string; name: string };
type VisibilityMode = "all" | "select" | "none";

function todayISO() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function StartChallengeAdminLauncher({ types, facilitators }: { types: Option[]; facilitators: Option[] }) {
  const router = useRouter();
  const actionToken = useDashboardActionToken();
  const [open, setOpen] = useState(false);

  const [typeId, setTypeId] = useState(types[0]?.id ?? "");
  const [name, setName] = useState("");
  const [attendees, setAttendees] = useState<Member[]>([{ name: "", email: "" }]);
  const [frequency, setFrequency] = useState<"weekly" | "biweekly">("weekly");
  const [startDate, setStartDate] = useState(todayISO());
  const [startTime, setStartTime] = useState("09:00");
  const [ownerId, setOwnerId] = useState<string>("");
  const [sendInvitations, setSendInvitations] = useState(true);
  const [inviteSchedule, setInviteSchedule] = useState<"now" | "schedule">("now");
  const [inviteDate, setInviteDate] = useState(todayISO());
  const [inviteTime, setInviteTime] = useState("09:00");
  const [startChallenge, setStartChallenge] = useState(true);
  const [visibility, setVisibility] = useState<VisibilityMode>("all");
  const [visibleFacilitators, setVisibleFacilitators] = useState<string[]>([]);
  // An admin isn't assumed to be the group's facilitator — explicit opt-in.
  const [joinAsFacilitator, setJoinAsFacilitator] = useState(false);
  const [emailTrack, setEmailTrack] = useState<FacilitatorEmailTrack>("leader");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ invited: number; attendees: number; started: boolean; visibility: number; failedInvites: { email: string; reason: string }[] } | null>(null);

  const validCount = useMemo(() => attendees.filter((a) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(a.email.trim())).length, [attendees]);

  function reset() {
    setTypeId(types[0]?.id ?? "");
    setName("");
    setAttendees([{ name: "", email: "" }]);
    setFrequency("weekly");
    setStartDate(todayISO());
    setStartTime("09:00");
    setOwnerId("");
    setSendInvitations(true);
    setInviteSchedule("now");
    setInviteDate(todayISO());
    setInviteTime("09:00");
    setStartChallenge(true);
    setVisibility("all");
    setVisibleFacilitators([]);
    setError(null);
    setDone(null);
  }

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      const invitationSendAt = sendInvitations && inviteSchedule === "schedule" ? new Date(`${inviteDate}T${inviteTime}:00`).toISOString() : null;
      const res = await fetch("/api/admin/experiences/start-challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actionToken,
          experienceTypeId: typeId,
          name: name.trim() || undefined,
          attendees,
          frequency,
          startDate,
          startTime,
          facilitatorId: ownerId || null,
          joinAsFacilitator,
          facilitatorEmailTrack: emailTrack,
          sendInvitations,
          invitationSendAt,
          startChallenge,
          visibility: { mode: visibility, facilitatorIds: visibleFacilitators },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setDone({ invited: data.invited ?? 0, attendees: data.attendees ?? 0, started: Boolean(data.started), visibility: data.visibility ?? 0, failedInvites: Array.isArray(data.failedInvites) ? data.failedInvites : [] });
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
        <Sparkles className="mr-2 h-4 w-4" /> Start New Challenge
      </Button>

      <Dialog open={open} onOpenChange={(v) => !busy && setOpen(v)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> Start New Challenge</DialogTitle>
            <DialogDescription>Launch any challenge or series — add recipients, invite them, start the emails, and set who can see it.</DialogDescription>
          </DialogHeader>

          {done ? (
            <div className="space-y-3 py-2">
              <div className="flex items-center gap-2 rounded-lg border border-primary/40 bg-primary/5 p-4 text-sm">
                <Check className="h-5 w-5 shrink-0 text-primary" />
                <span>
                  Challenge created for <strong>{done.attendees}</strong> recipient{done.attendees === 1 ? "" : "s"}.
                  {done.invited ? (inviteSchedule === "schedule" ? ` Scheduled ${done.invited} invitation${done.invited === 1 ? "" : "s"} for ${inviteDate}.` : ` Sent ${done.invited} invitation${done.invited === 1 ? "" : "s"}.`) : ""}
                  {done.started ? " The email series is scheduled." : " Saved as a draft."}
                  {done.visibility ? ` Visible to ${done.visibility} facilitator${done.visibility === 1 ? "" : "s"}.` : ""}
                </span>
              </div>
              {done.failedInvites.length ? (
                <div className="space-y-1 rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm">
                  <p className="font-medium text-destructive">{done.failedInvites.length} invitation{done.failedInvites.length === 1 ? "" : "s"} failed to send:</p>
                  <ul className="space-y-0.5 text-muted-foreground">
                    {done.failedInvites.map((f) => <li key={f.email}><span className="font-medium text-foreground">{f.email}</span> — {f.reason}</li>)}
                  </ul>
                </div>
              ) : null}
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Close</Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Challenge / series */}
              <div className="space-y-1.5">
                <Label>Challenge / series</Label>
                <Select value={typeId} onValueChange={setTypeId}>
                  <SelectTrigger><SelectValue placeholder="Select a challenge" /></SelectTrigger>
                  <SelectContent>{types.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>

              {/* Group name */}
              <div className="space-y-1.5">
                <Label>Group name <span className="font-normal text-muted-foreground">(optional)</span></Label>
                <Input placeholder="e.g. Core 5 Group" value={name} onChange={(e) => setName(e.target.value)} />
              </div>

              {/* Are you the facilitator? — sits directly above the roster so it's clear
                  whether the launcher is themselves in the challenge. */}
              <FacilitatorJoinToggle
                variant="admin"
                joining={joinAsFacilitator}
                onJoiningChange={setJoinAsFacilitator}
                track={emailTrack}
                onTrackChange={setEmailTrack}
              />

              {/* Recipients */}
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> Recipients</Label>
                <p className="text-xs text-muted-foreground">Add facilitators, participants, or anyone by name + email.</p>
                <div className="space-y-2">
                  {attendees.map((a, i) => (
                    <div key={i} className="flex gap-2">
                      <Input placeholder="Name" value={a.name} onChange={(e) => setAttendees((r) => r.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} className="flex-1" />
                      <Input placeholder="email@example.com" type="email" value={a.email} onChange={(e) => setAttendees((r) => r.map((x, j) => (j === i ? { ...x, email: e.target.value } : x)))} className="flex-1" />
                      <Button type="button" variant="ghost" size="icon" aria-label="Remove" onClick={() => setAttendees((r) => (r.length > 1 ? r.filter((_, j) => j !== i) : r))}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  ))}
                </div>
                <Button type="button" variant="outline" size="sm" onClick={() => setAttendees((r) => [...r, { name: "", email: "" }])}><Plus className="mr-2 h-4 w-4" /> Add recipient</Button>
                <p className="text-xs text-muted-foreground">{validCount} valid recipient{validCount === 1 ? "" : "s"}.</p>
              </div>

              {/* Frequency */}
              <div className="space-y-1.5">
                <Label>Email series frequency</Label>
                <div className="inline-flex rounded-md border p-0.5">
                  <button type="button" onClick={() => setFrequency("weekly")} className={cn("rounded px-3 py-1.5 text-sm font-medium transition-colors", frequency === "weekly" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent")}>Weekly</button>
                  <button type="button" onClick={() => setFrequency("biweekly")} className={cn("rounded px-3 py-1.5 text-sm font-medium transition-colors", frequency === "biweekly" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent")}>Bi-Weekly</button>
                </div>
              </div>

              {/* Start date/time */}
              <div className="flex gap-3">
                <div className="flex-1 space-y-1.5"><Label>Challenge start date</Label><DatePicker value={startDate} onChange={setStartDate} /></div>
                <div className="flex-1 space-y-1.5"><Label>Start time</Label><TimePicker value={startTime} onChange={setStartTime} /></div>
              </div>

              {/* Owner (optional) */}
              <div className="space-y-1.5">
                <Label>Assign facilitator (optional)</Label>
                <Select value={ownerId || "none"} onValueChange={(v) => setOwnerId(v === "none" ? "" : v)}>
                  <SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger>
                  <SelectContent><SelectItem value="none">Unassigned</SelectItem>{facilitators.map((f) => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>

              {/* Actions */}
              <div className="space-y-3 rounded-lg border p-3">
                <label className="flex items-start justify-between gap-3">
                  <span><span className="text-sm font-medium">Send account invitations</span><span className="block text-xs text-muted-foreground">Emails each recipient a create-your-account invite.</span></span>
                  <Switch checked={sendInvitations} onCheckedChange={setSendInvitations} />
                </label>
                {sendInvitations ? (
                  <div className="space-y-2 border-t pt-3">
                    <div className="inline-flex rounded-md border p-0.5">
                      <button type="button" onClick={() => setInviteSchedule("now")} className={cn("rounded px-3 py-1 text-xs font-medium transition-colors", inviteSchedule === "now" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent")}>Send now</button>
                      <button type="button" onClick={() => setInviteSchedule("schedule")} className={cn("rounded px-3 py-1 text-xs font-medium transition-colors", inviteSchedule === "schedule" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent")}>Schedule</button>
                    </div>
                    {inviteSchedule === "schedule" ? (
                      <div className="flex gap-2">
                        <div className="flex-1"><DatePicker value={inviteDate} onChange={setInviteDate} /></div>
                        <div className="flex-1"><TimePicker value={inviteTime} onChange={setInviteTime} /></div>
                      </div>
                    ) : null}
                  </div>
                ) : null}
                <label className="flex items-start justify-between gap-3 border-t pt-3">
                  <span><span className="text-sm font-medium">Start the challenge</span><span className="block text-xs text-muted-foreground">Schedules the email series from the start date. Turn off to save as a draft.</span></span>
                  <Switch checked={startChallenge} onCheckedChange={setStartChallenge} />
                </label>
              </div>

              {/* Visibility */}
              <div className="space-y-2 rounded-lg border p-3">
                <Label className="flex items-center gap-1.5"><Eye className="h-3.5 w-3.5" /> Visibility</Label>
                <p className="text-xs text-muted-foreground">Which facilitators can see and launch this challenge.</p>
                <div className="inline-flex rounded-md border p-0.5">
                  {([["all", "All facilitators"], ["select", "Select facilitators"], ["none", "Just admins"]] as [VisibilityMode, string][]).map(([mode, label]) => (
                    <button key={mode} type="button" onClick={() => setVisibility(mode)} className={cn("rounded px-3 py-1 text-xs font-medium transition-colors", visibility === mode ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent")}>{label}</button>
                  ))}
                </div>
                {visibility === "select" ? (
                  <div className="mt-1 max-h-40 space-y-1 overflow-y-auto rounded-md border p-2">
                    {facilitators.length ? facilitators.map((f) => {
                      const checked = visibleFacilitators.includes(f.id);
                      return (
                        <label key={f.id} className="flex cursor-pointer items-center gap-2 rounded px-1 py-1 text-sm hover:bg-accent">
                          <input type="checkbox" checked={checked} onChange={(e) => setVisibleFacilitators((r) => (e.target.checked ? [...r, f.id] : r.filter((x) => x !== f.id)))} className="h-4 w-4 rounded border-input" />
                          {f.name}
                        </label>
                      );
                    }) : <p className="px-1 py-1 text-xs text-muted-foreground">No facilitators yet.</p>}
                  </div>
                ) : null}
              </div>

              {error ? <p className="text-sm text-destructive">{error}</p> : null}

              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)} disabled={busy}>Cancel</Button>
                <Button onClick={submit} disabled={busy || !typeId || validCount === 0}>{busy ? "Starting…" : "Start Challenge"}</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
