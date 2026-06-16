"use client";

import { FormEvent, useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDashboardActionToken } from "@/components/layout/dashboard-action-token";

export function EmailTestForm({ defaultTo }: { defaultTo: string }) {
  const actionToken = useDashboardActionToken();
  const [to, setTo] = useState(defaultTo);
  const [subject, setSubject] = useState("MJG Dashboard test email");
  const [message, setMessage] = useState("This is a test email from the MJG Dashboard SMTP configuration.");
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function sendTest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setResult(null);
    setError(null);

    const response = await fetch("/api/admin/email/test", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-mjg-action-token": actionToken },
      body: JSON.stringify({ to, subject, message, actionToken }),
    });
    const payload = await response.json();

    if (!response.ok) {
      setError(payload.error ?? "Test email failed.");
      setLoading(false);
      return;
    }

    if (payload.skipped) {
      setResult(`Skipped: ${payload.reason}`);
    } else {
      setResult(`Sent. Message id: ${payload.messageId ?? "not provided"}`);
    }
    setLoading(false);
  }

  return (
    <form className="space-y-4" onSubmit={sendTest}>
      <label className="space-y-2 text-sm font-medium">
        <span>Send to</span>
        <Input onChange={(event) => setTo(event.target.value)} placeholder="name@example.com" required type="email" value={to} />
      </label>
      <label className="space-y-2 text-sm font-medium">
        <span>Subject</span>
        <Input onChange={(event) => setSubject(event.target.value)} required value={subject} />
      </label>
      <label className="space-y-2 text-sm font-medium">
        <span>Message</span>
        <textarea
          className="min-h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          onChange={(event) => setMessage(event.target.value)}
          required
          value={message}
        />
      </label>
      {error ? <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</p> : null}
      {result ? <p className="rounded-md bg-primary/10 p-3 text-sm text-primary">{result}</p> : null}
      <Button disabled={loading || !to || !subject || !message} type="submit">
        <Send className="h-4 w-4" />
        {loading ? "Sending..." : "Send test email"}
      </Button>
    </form>
  );
}
