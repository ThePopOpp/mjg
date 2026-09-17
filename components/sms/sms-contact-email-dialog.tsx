"use client";

import { useState } from "react";
import { Loader2, Mail, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UserAvatar } from "@/components/ui/user-avatar";
import { useDashboardActionToken } from "@/components/layout/dashboard-action-token";
import type { ResolvedContact } from "@/components/sms/sms-inbox";

/**
 * Email the person you're texting, without leaving the SMS inbox. Posts to the existing
 * one-off email endpoint (/api/admin/email/manual), which takes multipart form data.
 */
export function SmsContactEmailDialog({
  open,
  onOpenChange,
  contact,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact: ResolvedContact | null;
}) {
  const actionToken = useDashboardActionToken();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  function close(next: boolean) {
    onOpenChange(next);
    if (!next) {
      // Reset so the next open starts clean.
      setSubject("");
      setMessage("");
      setError(null);
      setSent(false);
    }
  }

  async function send() {
    if (!contact?.email) return;
    setBusy(true);
    setError(null);
    try {
      const form = new FormData();
      form.set("actionToken", actionToken ?? "");
      form.set("recipients", contact.email);
      form.set("subject", subject);
      form.set("text", message);
      const res = await fetch("/api/admin/email/manual", { method: "POST", body: form });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Email failed to send.");
      setSent(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Email failed to send.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-[#b88a4a]" /> Email {contact?.name ?? "contact"}
          </DialogTitle>
        </DialogHeader>

        {contact ? (
          <div className="flex items-center gap-3 rounded-lg border bg-muted/40 p-3">
            <UserAvatar
              firstName={contact.firstName}
              lastName={contact.lastName}
              email={contact.email}
              avatarUrl={contact.avatarUrl}
              className="h-9 w-9"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{contact.name ?? contact.phoneDisplay}</p>
              <p className="truncate text-xs text-muted-foreground">{contact.email}</p>
            </div>
          </div>
        ) : null}

        {sent ? (
          <div className="space-y-4 py-2 text-center">
            <p className="text-sm">Your email is on its way to {contact?.email}.</p>
            <Button className="w-full" onClick={() => close(false)}>Done</Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="sms-email-subject">Subject</Label>
              <Input id="sms-email-subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sms-email-body">Message</Label>
              <Textarea id="sms-email-body" value={message} onChange={(e) => setMessage(e.target.value)} className="min-h-40" />
            </div>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => close(false)} disabled={busy}>Cancel</Button>
              <Button onClick={send} disabled={busy || !subject.trim() || !message.trim() || !contact?.email}>
                {busy ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending…</> : <><Send className="mr-2 h-4 w-4" /> Send email</>}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
