"use client";

import { useState } from "react";
import { Check, Save, Sparkles } from "lucide-react";
import { useDashboardActionToken } from "@/components/layout/dashboard-action-token";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type { ChallengeTypeOption } from "@/lib/facilitator/access";

export function FacilitatorChallengeAccess({
  facilitatorId,
  types,
  allowedIds,
  canEdit,
}: {
  facilitatorId: string;
  types: ChallengeTypeOption[];
  allowedIds: string[];
  canEdit: boolean;
}) {
  const actionToken = useDashboardActionToken();
  const [allowed, setAllowed] = useState<Set<string>>(new Set(allowedIds));
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggle(id: string) {
    if (!canEdit) return;
    setSaved(false);
    setAllowed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  async function save() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/user-management/facilitator-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actionToken, facilitatorId, typeIds: Array.from(allowed) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save.");
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save.");
    } finally {
      setBusy(false);
    }
  }

  if (!types.length) {
    return <p className="text-sm text-muted-foreground">No challenge programs are configured yet.</p>;
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {canEdit ? "Choose which challenges this facilitator can start and see." : "Challenges this facilitator can start and see (Super Admin controls this)."}
      </p>
      <div className="space-y-2">
        {types.map((t) => (
          <label key={t.id} className={cn("flex items-center justify-between gap-3 rounded-lg border p-3", allowed.has(t.id) ? "border-primary/40 bg-primary/[0.03]" : "")}>
            <span className="flex items-center gap-2 text-sm font-medium">
              <Sparkles className={cn("h-4 w-4", allowed.has(t.id) ? "text-primary" : "text-muted-foreground")} /> {t.name}
            </span>
            <Switch checked={allowed.has(t.id)} onCheckedChange={() => toggle(t.id)} disabled={!canEdit} />
          </label>
        ))}
      </div>
      {canEdit ? (
        <div className="flex items-center gap-3">
          <Button type="button" onClick={save} disabled={busy}><Save className="mr-2 h-4 w-4" /> {busy ? "Saving…" : "Save access"}</Button>
          {saved ? <span className="flex items-center gap-1.5 text-sm text-primary"><Check className="h-4 w-4" /> Saved</span> : null}
          {error ? <span className="text-sm text-destructive">{error}</span> : null}
        </div>
      ) : null}
    </div>
  );
}
