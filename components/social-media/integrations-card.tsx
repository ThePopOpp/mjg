"use client";

import * as React from "react";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useDashboardActionToken } from "@/components/layout/dashboard-action-token";

// Social Media → Settings → Integrations: Metricool's website tracker (and, later,
// the Metricool publishing/analytics connection). Saved through
// /api/admin/site-integrations; the public site picks it up within ~5 minutes.

export function IntegrationsCard({ initial }: { initial: { enabled: boolean; hash: string | null } }) {
  const token = useDashboardActionToken();
  const [enabled, setEnabled] = React.useState(initial.enabled);
  const [hash, setHash] = React.useState(initial.hash ?? "");
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function save(next: { enabled: boolean; hash: string }) {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/site-integrations", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...next, actionToken: token }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Save failed.");
      setEnabled(json.metricool.enabled);
      setHash(json.metricool.hash ?? "");
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-lg border bg-card p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="max-w-xl">
          <h2 className="text-base font-semibold">Integrations · Metricool website tracker</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Loads Metricool&apos;s tracking code on the public site (not the dashboard) so Metricool can report website visits next to your social stats.
            Changes reach the site within about 5 minutes. MJG&apos;s own Analytics keeps working either way.
          </p>
        </div>
        <label className="flex items-center gap-2 text-sm font-medium">
          {enabled ? "On" : "Off"}
          <Switch checked={enabled} disabled={saving} onCheckedChange={(on) => save({ enabled: on, hash })} aria-label="Metricool tracker" />
        </label>
      </div>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <Input
          value={hash}
          onChange={(e) => setHash(e.target.value)}
          placeholder='Paste the Metricool tracking code, or just its hash'
          className="font-mono text-xs"
          aria-label="Metricool hash"
        />
        <Button onClick={() => save({ enabled, hash })} disabled={saving} className="shrink-0">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <Check className="h-4 w-4" /> : null}
          <span className="ml-1.5">Save</span>
        </Button>
      </div>
      {error ? <p className="mt-2 text-sm text-destructive">{error}</p> : null}
    </section>
  );
}
