"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, Check, ChevronLeft, ChevronRight, Mail, Send, Clock, CalendarClock } from "lucide-react";
import { useDashboardActionToken } from "@/components/layout/dashboard-action-token";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

type BacklogEmail = { stepNumber: number; templateName: string; scheduledAt: string };

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString([], { month: "short", day: "numeric" });
}

export function AddAttendeeButton({ experienceId, backlog = [] }: { experienceId: string; backlog?: BacklogEmail[] }) {
  const router = useRouter();
  const actionToken = useDashboardActionToken();
  const [open, setOpen] = useState(false);
  const [stepIdx, setStepIdx] = useState(0); // 0 = who, 1 = options, 2 = confirm
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [sendInvitation, setSendInvitation] = useState(true);
  const [sendBacklog, setSendBacklog] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ upcomingEmails: number; backlogSent: number; invited: boolean; alreadyOnList: boolean; inviteError: string | null } | null>(null);

  const valid = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim());
  const missedCount = backlog.length;

  function reset() {
    setStepIdx(0); setName(""); setEmail(""); setSendInvitation(true); setSendBacklog(false); setError(null); setDone(null);
  }

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/experiences/${experienceId}/attendees`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actionToken, name, email, sendInvitation, sendBacklog: sendBacklog && missedCount > 0 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setDone({ upcomingEmails: data.upcomingEmails ?? 0, backlogSent: data.backlogSent ?? 0, invited: Boolean(data.invited), alreadyOnList: Boolean(data.alreadyOnList), inviteError: typeof data.inviteError === "string" ? data.inviteError : null });
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Button type="button" size="sm" onClick={() => { reset(); setOpen(true); }}>
        <UserPlus className="mr-2 h-4 w-4" /> Add participant
      </Button>

      <Dialog open={open} onOpenChange={(v) => !busy && setOpen(v)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><UserPlus className="h-4 w-4 text-primary" /> Add a participant</DialogTitle>
            <DialogDescription>{done ? "All set." : `Step ${stepIdx + 1} of 3 — join someone to this challenge already in motion.`}</DialogDescription>
          </DialogHeader>

          {done ? (
            <div className="space-y-3 py-1">
              <div className="flex items-start gap-2 rounded-lg border border-primary/40 bg-primary/5 p-4 text-sm">
                <Check className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <span>
                  {done.alreadyOnList ? "They were already on the list — updated." : "Participant added."}{" "}
                  {done.upcomingEmails > 0 ? `Scheduled ${done.upcomingEmails} upcoming email${done.upcomingEmails === 1 ? "" : "s"}.` : "No upcoming emails remain."}
                  {done.backlogSent > 0 ? ` Sent ${done.backlogSent} missed email${done.backlogSent === 1 ? "" : "s"} now.` : ""}
                  {done.invited ? " Invitation sent." : ""}
                </span>
              </div>
              {done.inviteError ? (
                <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">Invitation failed to send: {done.inviteError}</div>
              ) : null}
              <DialogFooter>
                <Button variant="outline" onClick={reset}>Add another</Button>
                <Button onClick={() => setOpen(false)}>Done</Button>
              </DialogFooter>
            </div>
          ) : (
            <>
              {stepIdx === 0 ? (
                <div className="space-y-4">
                  <div className="space-y-1.5"><Label>Participant name</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" autoFocus /></div>
                  <div className="space-y-1.5"><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" /></div>
                </div>
              ) : stepIdx === 1 ? (
                <div className="space-y-3">
                  <label className="flex items-start justify-between gap-3 rounded-lg border p-3">
                    <span className="flex gap-2"><Mail className="mt-0.5 h-4 w-4 text-muted-foreground" /><span><span className="text-sm font-medium">Send invitation email</span><span className="block text-xs text-muted-foreground">Emails them a create-your-account invite.</span></span></span>
                    <Switch checked={sendInvitation} onCheckedChange={setSendInvitation} />
                  </label>
                  <label className={`flex items-start justify-between gap-3 rounded-lg border p-3 ${missedCount === 0 ? "opacity-60" : ""}`}>
                    <span className="flex gap-2"><CalendarClock className="mt-0.5 h-4 w-4 text-muted-foreground" /><span><span className="text-sm font-medium">Send the emails they missed</span><span className="block text-xs text-muted-foreground">{missedCount > 0 ? `${missedCount} email${missedCount === 1 ? "" : "s"} already went out before they joined. Send them now to catch up.` : "No emails have gone out yet — nothing to catch up."}</span></span></span>
                    <Switch checked={sendBacklog && missedCount > 0} onCheckedChange={setSendBacklog} disabled={missedCount === 0} />
                  </label>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-lg border p-3 text-sm">
                    <p className="font-medium">{name.trim() || "(no name)"} <span className="font-normal text-muted-foreground">· {email.trim()}</span></p>
                    <ul className="mt-2 space-y-1 text-muted-foreground">
                      <li className="flex items-center gap-2"><Mail className="h-3.5 w-3.5" /> Invitation email: <span className="font-medium text-foreground">{sendInvitation ? "Yes" : "No"}</span></li>
                      <li className="flex items-center gap-2"><Send className="h-3.5 w-3.5" /> Upcoming emails: <span className="font-medium text-foreground">scheduled automatically</span></li>
                      <li className="flex items-center gap-2"><Clock className="h-3.5 w-3.5" /> Missed emails: <span className="font-medium text-foreground">{sendBacklog && missedCount > 0 ? `send ${missedCount} now` : "skip"}</span></li>
                    </ul>
                  </div>

                  {sendBacklog && missedCount > 0 ? (
                    <div className="rounded-lg border border-primary/30 bg-primary/[0.03] p-3">
                      <p className="text-sm font-medium">These {missedCount} email{missedCount === 1 ? "" : "s"} will be sent now:</p>
                      <div className="mt-2 max-h-48 space-y-1 overflow-y-auto">
                        {backlog.map((b) => (
                          <div key={b.stepNumber} className="flex items-center justify-between gap-3 rounded border bg-background px-2.5 py-1.5 text-sm">
                            <span className="truncate">{b.templateName}</span>
                            <span className="shrink-0 text-xs text-muted-foreground">was {fmt(b.scheduledAt)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              )}

              {error ? <p className="text-sm text-destructive">{error}</p> : null}

              <DialogFooter className="sm:justify-between">
                <Button type="button" variant="ghost" onClick={() => setStepIdx((n) => Math.max(0, n - 1))} disabled={busy || stepIdx === 0}>
                  <ChevronLeft className="mr-1 h-4 w-4" /> Back
                </Button>
                {stepIdx < 2 ? (
                  <Button type="button" onClick={() => setStepIdx((n) => n + 1)} disabled={stepIdx === 0 && !valid}>
                    Next <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                ) : (
                  <Button type="button" onClick={submit} disabled={busy || !valid}>{busy ? "Working…" : "Invite & send now"}</Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
