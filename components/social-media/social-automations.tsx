"use client";

import * as React from "react";
import { Check, Loader2 } from "lucide-react";
import { FieldSelect } from "@/components/ui/field-select";
import { cn } from "@/lib/utils";
import { useDashboardActionToken } from "@/components/layout/dashboard-action-token";
import { SOCIAL_EVENT_KEYS, PLATFORMS } from "@/lib/social-media/constants";
import type { SocialAutomation, SocialTemplate } from "@/lib/social-media/types";

export function SocialAutomations({ templates, initialAutomations }: { templates: SocialTemplate[]; initialAutomations: SocialAutomation[] }) {
  const token = useDashboardActionToken();
  const byKey = new Map(initialAutomations.map((a) => [a.event_key, a]));
  const [rows, setRows] = React.useState(() =>
    SOCIAL_EVENT_KEYS.map((e) => {
      const a = byKey.get(e.key);
      return { event_key: e.key, label: e.label, description: e.description, template_id: a?.template_id ?? "", platforms: a?.platforms ?? ["facebook", "linkedin"], enabled: a?.enabled ?? false };
    }),
  );
  const [saving, setSaving] = React.useState<string | null>(null);
  const [savedKey, setSavedKey] = React.useState<string | null>(null);

  const tplOpts = [{ value: "", label: "No template" }, ...templates.map((t) => ({ value: t.id, label: t.name }))];
  const set = (key: string, patch: Partial<typeof rows[number]>) => setRows((prev) => prev.map((r) => (r.event_key === key ? { ...r, ...patch } : r)));

  async function save(key: string) {
    const row = rows.find((r) => r.event_key === key); if (!row) return;
    setSaving(key);
    try {
      await fetch("/api/admin/social-media/automations", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ event_key: row.event_key, template_id: row.template_id || null, platforms: row.platforms, enabled: row.enabled, actionToken: token }) });
      setSavedKey(key); setTimeout(() => setSavedKey(null), 1500);
    } finally { setSaving(null); }
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">Bind a template to an event so Siggey (or the system) can auto-draft a post when it happens. Drafts land in History for your review before publishing.</p>
      {rows.map((r) => (
        <div key={r.event_key} className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" className="accent-primary" checked={r.enabled} onChange={(e) => set(r.event_key, { enabled: e.target.checked })} /> {r.label}</label>
            <button onClick={() => save(r.event_key)} disabled={saving === r.event_key} className="ml-auto inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1 text-xs hover:bg-muted">
              {saving === r.event_key ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : savedKey === r.event_key ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : null}
              {savedKey === r.event_key ? "Saved" : "Save"}
            </button>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">{r.description}</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <div><label className="mb-1 block text-[11px] text-muted-foreground">Template</label><FieldSelect value={r.template_id} onChange={(v) => set(r.event_key, { template_id: v })} options={tplOpts} className="h-8" /></div>
            <div>
              <label className="mb-1 block text-[11px] text-muted-foreground">Platforms</label>
              <div className="flex flex-wrap gap-1.5">
                {PLATFORMS.filter((p) => p.primary).map((p) => (
                  <button key={p.id} type="button" onClick={() => set(r.event_key, { platforms: r.platforms.includes(p.id) ? r.platforms.filter((x) => x !== p.id) : [...r.platforms, p.id] })}
                    className={cn("rounded-full border px-2.5 py-1 text-xs font-medium", r.platforms.includes(p.id) ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground")}>{p.label}</button>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
