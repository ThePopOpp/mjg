"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * The explicit activation action.
 *
 * Separate from payment on purpose: activating starts the build window and the
 * premium term, and closes the unused-purchase refund window. The docset
 * requires it to be an explicit member action, so there is a button rather than
 * an automatic step after checkout.
 */
export function ActivateButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function activate() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/steward/activate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Could not activate.");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not activate.");
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <Button onClick={() => void activate()} disabled={busy}>
        {busy ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : null}
        Activate and start my term
      </Button>
      {error ? <p className="text-[11px] leading-snug text-destructive">{error}</p> : null}
    </div>
  );
}
