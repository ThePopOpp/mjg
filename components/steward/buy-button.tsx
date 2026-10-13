"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Starts Checkout for one offer.
 *
 * Deliberately does nothing but redirect: the session is created server-side
 * from the catalogue row, so the browser never names a price and cannot be
 * talked into a cheaper one.
 */
export function BuyButton({
  offerKey,
  label,
  disabled,
  disabledReason,
}: {
  offerKey: string;
  label: string;
  disabled?: boolean;
  disabledReason?: string;
}) {
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function start() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/steward/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ offerKey }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.url) throw new Error(json.error || "Could not start checkout.");
      window.location.href = json.url as string;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not start checkout.");
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <Button className="w-full" onClick={() => void start()} disabled={busy || disabled} title={disabledReason}>
        {busy ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : null}
        {label}
      </Button>
      {disabled && disabledReason ? (
        <p className="text-[11px] leading-snug text-muted-foreground">{disabledReason}</p>
      ) : null}
      {error ? <p className="text-[11px] leading-snug text-destructive">{error}</p> : null}
    </div>
  );
}
