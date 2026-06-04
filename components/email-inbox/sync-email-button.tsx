"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SyncEmailButton() {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function sync() {
    setLoading(true);
    setMessage(null);
    setError(null);

    const response = await fetch("/api/admin/email/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mailbox: "INBOX", limit: 25 }),
    });
    const payload = await response.json();

    if (!response.ok) {
      setError(payload.error ?? "Email sync failed.");
      setLoading(false);
      return;
    }

    setMessage(`Synced ${payload.synced} messages. Skipped ${payload.skipped}.`);
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="space-y-2">
      <Button disabled={loading} onClick={sync} type="button">
        <RefreshCw className="h-4 w-4" />
        {loading ? "Syncing..." : "Sync inbox"}
      </Button>
      {message ? <p className="text-sm text-primary">{message}</p> : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
