"use client";

import { useState } from "react";
import { buttonClass } from "@/components/marketing/primitives";

export function UnsubscribeConfirm({ token }: { token: string }) {
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const go = async () => {
    setState("busy");
    setError(null);
    try {
      const res = await fetch("/api/public/email/unsubscribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ t: token }) });
      const j = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!res.ok || !j.ok) throw new Error(j.error || "We couldn't process that just now. Please try again.");
      setState("done");
    } catch (e) {
      setError((e as Error).message);
      setState("error");
    }
  };
  if (state === "done") {
    return (
      <p role="status" className="mt-6 rounded-xl border bg-card px-4 py-3 text-[15px]">
        You&apos;re unsubscribed. Nothing further from this series will be sent.
      </p>
    );
  }
  return (
    <div className="mt-6">
      <button type="button" onClick={go} disabled={state === "busy"} className={buttonClass("primary")}>
        {state === "busy" ? "Unsubscribing…" : "Unsubscribe"}
      </button>
      {error ? (
        <p role="alert" className="mt-3 text-sm text-red-700 dark:text-red-300">
          {error}
        </p>
      ) : null}
    </div>
  );
}
