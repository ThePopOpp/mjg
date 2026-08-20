"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, Check } from "lucide-react";
import { useDashboardActionToken } from "@/components/layout/dashboard-action-token";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

export function AddAttendeeButton({ experienceId }: { experienceId: string }) {
  const router = useRouter();
  const actionToken = useDashboardActionToken();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [sendInvitation, setSendInvitation] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ upcomingEmails: number; invited: boolean; alreadyOnList: boolean } | null>(null);

  const valid = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim());

  function reset() { setName(""); setEmail(""); setSendInvitation(true); setError(null); setDone(null); }

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/experiences/${experienceId}/attendees`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actionToken, name, email, sendInvitation }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setDone({ upcomingEmails: data.upcomingEmails ?? 0, invited: Boolean(data.invited), alreadyOnList: Boolean(data.alreadyOnList) });
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add a participant</DialogTitle>
            <DialogDescription>They join the challenge from here on — they&apos;ll get the upcoming emails, not the ones that already went out.</DialogDescription>
          </DialogHeader>

          {done ? (
            <div className="space-y-3 py-1">
              <div className="flex items-center gap-2 rounded-lg border border-primary/40 bg-primary/5 p-4 text-sm">
                <Check className="h-5 w-5 shrink-0 text-primary" />
                <span>
                  {done.alreadyOnList ? "They were already on the list — updated." : "Participant added."}{" "}
                  {done.upcomingEmails > 0 ? `Scheduled ${done.upcomingEmails} upcoming email${done.upcomingEmails === 1 ? "" : "s"}.` : "No upcoming emails remain to schedule."}
                  {done.invited ? " Invitation sent." : ""}
                </span>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => reset()}>Add another</Button>
                <Button onClick={() => setOpen(false)}>Done</Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-1.5"><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" /></div>
              <div className="space-y-1.5"><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" /></div>
              <label className="flex items-start justify-between gap-3 rounded-lg border p-3">
                <span><span className="text-sm font-medium">Send account invitation</span><span className="block text-xs text-muted-foreground">Emails them a create-your-account invite.</span></span>
                <Switch checked={sendInvitation} onCheckedChange={setSendInvitation} />
              </label>
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)} disabled={busy}>Cancel</Button>
                <Button onClick={submit} disabled={busy || !valid}>{busy ? "Adding…" : "Add participant"}</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
