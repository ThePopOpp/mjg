"use client";

// Editor settings (spec §16) and the full audit trail (spec §38).
//
// Direct publishing is the one genuinely dangerous switch in this module, so it
// states plainly what it does and what it still will not do.

import * as React from "react";
import { AlertTriangle, Bot, Loader2, ShieldCheck, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDashboardActionToken } from "@/components/layout/dashboard-action-token";
import { PROTECTED_ROUTES } from "@/lib/website/protected";
import { websiteApi } from "./api";
import { formatDateTime } from "./constants";
import type { EditorSettings, WebsiteAuditLog } from "@/lib/website/types";

export function SettingsPanel() {
  const token = useDashboardActionToken();
  const [settings, setSettings] = React.useState<EditorSettings | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    websiteApi.settings(token).then((r) => setSettings(r.settings)).catch((e) => setError(e.message));
  }, [token]);

  async function toggleDirectPublish(value: boolean) {
    setBusy(true);
    setError("");
    try {
      const { settings: next } = await websiteApi.updateSettings(token, { allowStewardDirectPublish: value });
      setSettings(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save that setting.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-border p-4">
        <h2 className="font-semibold">Steward</h2>
        {error ? <p className="mt-2 text-sm text-destructive">{error}</p> : null}

        <label className="mt-3 flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            disabled={busy || !settings}
            checked={settings?.allowStewardDirectPublish ?? false}
            onChange={(e) => toggleDirectPublish(e.target.checked)}
            className="mt-1 h-4 w-4 accent-[#b88a4a]"
          />
          <span>
            <span className="block text-sm font-medium">
              Let Steward publish low-risk changes without asking
              {busy ? <Loader2 className="ml-2 inline h-3 w-3 animate-spin" /> : null}
            </span>
            <span className="mt-1 block text-sm text-muted-foreground">
              Off by default. With this on, Steward can still only publish a change it has already validated, it still
              records a version and an audit entry, and it still cannot publish a protected page, a legal page or
              anything classed as high risk — those always come back to you.
            </span>
          </span>
        </label>

        {settings?.allowStewardDirectPublish ? (
          <p className="mt-3 flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            Direct publishing is on. Steward&rsquo;s low-risk edits will go live as soon as it makes them.
          </p>
        ) : null}
      </section>

      <section className="rounded-lg border border-border p-4">
        <h2 className="flex items-center gap-1.5 font-semibold"><ShieldCheck className="h-4 w-4" /> Protected addresses</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          These belong to the application itself. No page created here — by you or by Steward — can take one of these
          addresses, and nothing here can edit or delete them.
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {PROTECTED_ROUTES.map((route) => (
            <code key={route} className="rounded bg-muted px-2 py-0.5 text-xs">{route}</code>
          ))}
        </div>
      </section>

      <AuditLog />
    </div>
  );
}

function AuditLog() {
  const token = useDashboardActionToken();
  const [logs, setLogs] = React.useState<WebsiteAuditLog[]>([]);
  const [filter, setFilter] = React.useState<"all" | "user" | "steward">("all");
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    websiteApi.audit(token).then((r) => setLogs(r.logs)).catch(() => setLogs([])).finally(() => setLoading(false));
  }, [token]);

  const visible = logs.filter((l) => filter === "all" || l.actor_type === filter);

  return (
    <section className="rounded-lg border border-border">
      <div className="flex flex-wrap items-center gap-2 border-b border-border p-4">
        <h2 className="font-semibold">History</h2>
        <p className="text-sm text-muted-foreground">Every change to the website, by you or by Steward.</p>
        <div className="ml-auto flex gap-1">
          {(["all", "user", "steward"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "rounded-full px-2.5 py-1 text-xs font-medium capitalize",
                filter === f ? "bg-[#b88a4a] text-white" : "bg-muted text-muted-foreground hover:text-foreground",
              )}
            >
              {f === "user" ? "By people" : f === "steward" ? "By Steward" : "All"}
            </button>
          ))}
        </div>
      </div>

      <ul className="divide-y divide-border">
        {visible.map((log) => (
          <li key={log.id} className="flex gap-3 px-4 py-3">
            {log.actor_type === "steward" ? (
              <Bot className="mt-0.5 h-4 w-4 shrink-0 text-[#b88a4a]" />
            ) : (
              <User className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm">{log.summary || log.action}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                <code className="rounded bg-muted px-1">{log.action}</code> · {formatDateTime(log.created_at)}
              </p>
            </div>
          </li>
        ))}
        {loading ? <li className="px-4 py-8 text-center text-sm text-muted-foreground">Loading…</li> : null}
        {!loading && !visible.length ? (
          <li className="px-4 py-8 text-center text-sm text-muted-foreground">Nothing recorded yet.</li>
        ) : null}
      </ul>
    </section>
  );
}
