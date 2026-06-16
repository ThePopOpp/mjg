"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDashboardActionToken } from "@/components/layout/dashboard-action-token";

export function SendDueJourneyButton() {
  const actionToken = useDashboardActionToken();
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function sendDue() {
    if (!window.confirm(`Send up to ${limit} due 7-day journey emails now?`)) return;
    setLoading(true);
    setMessage(null);
    setError(null);

    const response = await fetch("/api/admin/email/journey/send-due", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-mjg-action-token": actionToken },
      body: JSON.stringify({ limit, actionToken }),
    });
    const payload = await response.json();
    if (!response.ok) {
      setError(payload.error ?? "Unable to send journey emails.");
      setLoading(false);
      return;
    }

    setMessage(`Processed ${payload.processed}. Sent ${payload.sent}, skipped ${payload.skipped}, failed ${payload.failed}.`);
    setLoading(false);
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <label className="space-y-2 text-sm font-medium">
        <span>Send limit</span>
        <Input min={1} max={50} value={limit} onChange={(event) => setLimit(Number(event.target.value))} type="number" />
      </label>
      <Button disabled={loading} onClick={sendDue} type="button">
        <Send className="h-4 w-4" />
        {loading ? "Sending..." : "Send due journey emails"}
      </Button>
      {message ? <p className="text-sm text-primary">{message}</p> : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
