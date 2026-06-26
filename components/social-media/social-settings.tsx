"use client";

import * as React from "react";
import { Check, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FieldSelect } from "@/components/ui/field-select";
import { cn } from "@/lib/utils";
import { useDashboardActionToken } from "@/components/layout/dashboard-action-token";
import { PLATFORMS, PLATFORM_MAP } from "@/lib/social-media/constants";
import type { SocialAccount } from "@/lib/social-media/types";

type Draft = {
  id?: string; platform: string; display_name: string; profile_url: string;
  status: string; is_active: boolean; credentials: Record<string, string>;
};
function toDraft(a: SocialAccount): Draft {
  return { id: a.id, platform: a.platform, display_name: a.display_name, profile_url: a.profile_url ?? "", status: a.status, is_active: a.is_active, credentials: { ...(a.credentials ?? {}) } };
}

export function SocialSettings({ initialAccounts }: { initialAccounts: SocialAccount[] }) {
  const token = useDashboardActionToken();
  const [accounts, setAccounts] = React.useState<Draft[]>(initialAccounts.map(toDraft));
  const [savingId, setSavingId] = React.useState<string | null>(null);
  const [savedId, setSavedId] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [adding, setAdding] = React.useState("");

  const usedPlatforms = new Set(accounts.map((a) => a.platform));
  const addable = PLATFORMS.filter((p) => !usedPlatforms.has(p.id));

  const set = (idx: number, patch: Partial<Draft>) => setAccounts((prev) => prev.map((a, i) => (i === idx ? { ...a, ...patch } : a)));
  const setCred = (idx: number, key: string, value: string) => setAccounts((prev) => prev.map((a, i) => (i === idx ? { ...a, credentials: { ...a.credentials, [key]: value } } : a)));

  function addPlatform(platform: string) {
    if (!platform) return;
    const def = PLATFORM_MAP[platform];
    setAccounts((prev) => [...prev, { platform, display_name: `${def?.label ?? platform} account`, profile_url: "", status: "disconnected", is_active: true, credentials: {} }]);
    setAdding("");
  }

  async function save(idx: number) {
    const a = accounts[idx];
    setSavingId(a.id ?? `new-${idx}`); setError(null);
    try {
      const res = await fetch("/api/admin/social-media/accounts", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...a, actionToken: token }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Save failed.");
      setAccounts((prev) => prev.map((x, i) => (i === idx ? toDraft(json.account) : x)));
      setSavedId(json.account.id); setTimeout(() => setSavedId(null), 1500);
    } catch (e) { setError(e instanceof Error ? e.message : "Save failed."); }
    finally { setSavingId(null); }
  }
  async function remove(idx: number) {
    const a = accounts[idx];
    if (!window.confirm(`Remove ${a.display_name}?`)) return;
    if (a.id) {
      await fetch(`/api/admin/social-media/accounts/${a.id}`, { method: "DELETE", headers: { "content-type": "application/json" }, body: JSON.stringify({ actionToken: token }) });
    }
    setAccounts((prev) => prev.filter((_, i) => i !== idx));
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm">
        Credentials are stored securely in your database (admin-only access) and used to publish on your behalf. Live posting to each network is wired up after you save valid credentials and mark the account <span className="font-medium">Connected</span>.
      </div>

      {accounts.map((a, idx) => {
        const def = PLATFORM_MAP[a.platform];
        const savingKey = a.id ?? `new-${idx}`;
        return (
          <div key={a.id ?? `new-${idx}`} className="rounded-xl border border-border bg-card p-4">
            <div className="mb-3 flex items-center gap-2">
              <span className="h-3 w-3 rounded-full" style={{ background: def?.color ?? "#6b7280" }} />
              <span className="font-semibold">{def?.label ?? a.platform}</span>
              <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium capitalize", a.status === "connected" ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" : "bg-muted text-muted-foreground")}>{a.status}</span>
              <button onClick={() => remove(idx)} className="ml-auto text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div><label className="mb-1 block text-xs font-medium text-muted-foreground">Display name</label><Input value={a.display_name} onChange={(e) => set(idx, { display_name: e.target.value })} /></div>
              <div><label className="mb-1 block text-xs font-medium text-muted-foreground">Profile / Page URL</label><Input value={a.profile_url} onChange={(e) => set(idx, { profile_url: e.target.value })} placeholder="https://…" /></div>
              {(def?.credentialFields ?? []).map((f) => (
                <div key={f.key}>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">{f.label}</label>
                  <Input type={f.type === "password" ? "password" : "text"} value={a.credentials[f.key] ?? ""} onChange={(e) => setCred(idx, f.key, e.target.value)} placeholder={f.help} />
                  {f.help && <p className="mt-0.5 text-[10px] text-muted-foreground">{f.help}</p>}
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-3 border-t border-border pt-3">
              <div className="w-44"><FieldSelect value={a.status} onChange={(v) => set(idx, { status: v })} options={[{ value: "disconnected", label: "Disconnected" }, { value: "connected", label: "Connected" }, { value: "error", label: "Error" }]} className="h-8" /></div>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="accent-primary" checked={a.is_active} onChange={(e) => set(idx, { is_active: e.target.checked })} /> Active</label>
              <Button size="sm" className="ml-auto" onClick={() => save(idx)} disabled={savingId === savingKey}>
                {savingId === savingKey ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : savedId === a.id ? <Check className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />} Save
              </Button>
            </div>
          </div>
        );
      })}

      {error && <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>}

      {addable.length > 0 && (
        <div className="flex items-center gap-2 rounded-xl border border-dashed border-border p-3">
          <Plus className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Add another platform:</span>
          <div className="w-48"><FieldSelect value={adding} onChange={addPlatform} options={[{ value: "", label: "Choose…" }, ...addable.map((p) => ({ value: p.id, label: p.label }))]} className="h-8" /></div>
        </div>
      )}
    </div>
  );
}
