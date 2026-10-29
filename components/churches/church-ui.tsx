"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDashboardActionToken } from "@/components/layout/dashboard-action-token";
import { groupApi } from "@/components/facilitator-groups/api";
import { cn } from "@/lib/utils";

// Shared bits for the church screens: status pills and Approve / Reject with an optional note.

const PILL: Record<string, string> = {
  pending: "bg-[#b88a4a]/15 text-[#8a6532] dark:text-[#e2ca9a]",
  approved: "bg-[#111111]/10 text-foreground dark:bg-white/10",
  active: "bg-[#111111]/10 text-foreground dark:bg-white/10",
  rejected: "bg-destructive/10 text-destructive",
  archived: "bg-muted text-muted-foreground",
};

export function StatusPill({ status }: { status: string }) {
  return <span className={cn("inline-flex rounded-full px-2 py-0.5 text-xs font-semibold capitalize", PILL[status] ?? PILL.archived)}>{status}</span>;
}

export function useChurchApi() {
  const token = useDashboardActionToken();
  return <T = any,>(url: string, method: string, body?: Record<string, unknown>) => groupApi<T>(url, method, body, token);
}

/** Approve / Reject with a note. `body` is merged into the request. */
export function DecideButtons({ url, body = {}, onDone, initial }: { url: string; body?: Record<string, unknown>; onDone?: (decision: string) => void; initial?: "approve" | "reject" | null }) {
  const api = useChurchApi();
  const router = useRouter();
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function decide(decision: "approve" | "reject") {
    setBusy(decision);
    setError(null);
    try {
      await api(url, "POST", { ...body, decision, note: note || undefined });
      onDone?.(decision);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-2">
      <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note (optional, sent to them)" className="h-8 text-sm" />
      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={() => decide("approve")} disabled={!!busy} className={cn(initial === "approve" && "ring-2 ring-[#b88a4a] ring-offset-2")}>
          <Check className="mr-1 h-4 w-4" />{busy === "approve" ? "Approving…" : "Approve"}
        </Button>
        <Button size="sm" variant="outline" onClick={() => decide("reject")} disabled={!!busy} className={cn(initial === "reject" && "ring-2 ring-[#b88a4a] ring-offset-2")}>
          <X className="mr-1 h-4 w-4" />{busy === "reject" ? "Rejecting…" : "Reject"}
        </Button>
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}

export const fmtDate = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "";
