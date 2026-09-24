"use client";

// Global content (spec §22) and redirects (spec §24).
//
// Global values appear on every page, so each item saves on its own explicit
// action and the shape is fixed by the record — you edit the values, never the
// keys, which is what stops a typo from silently blanking the footer.

import * as React from "react";
import { ArrowRight, Loader2, Plus, Power, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useDashboardActionToken } from "@/components/layout/dashboard-action-token";
import { websiteApi } from "./api";
import { formatDate } from "./constants";
import type { WebsiteGlobal, WebsiteRedirect } from "@/lib/website/types";

const INPUT =
  "h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

const FIELD_LABELS: Record<string, string> = {
  enabled: "Show this",
  text: "Text",
  href: "Links to",
  label: "Label",
  email: "Email address",
  phone: "Phone",
  address: "Address",
  facebook: "Facebook",
  instagram: "Instagram",
  linkedin: "LinkedIn",
  youtube: "YouTube",
  titleSuffix: "Title suffix",
  description: "Default description",
  ogImage: "Default share image",
};

export function GlobalsManager() {
  const token = useDashboardActionToken();
  const [globals, setGlobals] = React.useState<WebsiteGlobal[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const { globals: rows } = await websiteApi.globals(token);
      // editor.settings is surfaced on the Settings tab, not here.
      setGlobals(rows.filter((g) => g.type !== "settings"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load the global content.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  React.useEffect(() => { void load(); }, [load]);

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <div>
          <h2 className="font-semibold">Global content</h2>
          <p className="text-sm text-muted-foreground">
            These values appear on every page. Changing one changes the whole site, so each is saved on its own.
          </p>
        </div>
        {error ? <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p> : null}
        {loading ? <p className="text-sm text-muted-foreground">Loading…</p> : null}
        <div className="grid gap-3 md:grid-cols-2">
          {globals.map((g) => <GlobalCard key={g.id} global={g} onSaved={load} />)}
        </div>
      </section>

      <RedirectsSection />
    </div>
  );
}

function GlobalCard({ global, onSaved }: { global: WebsiteGlobal; onSaved: () => void }) {
  const token = useDashboardActionToken();
  const [value, setValue] = React.useState<Record<string, unknown>>(global.value ?? {});
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");

  React.useEffect(() => setValue(global.value ?? {}), [global.value]);
  const dirty = JSON.stringify(value) !== JSON.stringify(global.value ?? {});

  async function save() {
    setBusy(true);
    setError("");
    try {
      await websiteApi.updateGlobal(token, global.key, value);
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save that item.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-lg border border-border p-4">
      <h3 className="font-medium">{global.label}</h3>
      {global.description ? <p className="mt-0.5 text-xs text-muted-foreground">{global.description}</p> : null}

      <div className="mt-3 space-y-2.5">
        {Object.entries(value).map(([key, current]) => (
          <div key={key}>
            {typeof current === "boolean" ? (
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox" checked={current}
                  onChange={(e) => setValue((v) => ({ ...v, [key]: e.target.checked }))}
                  className="h-4 w-4 accent-[#b88a4a]"
                />
                {FIELD_LABELS[key] ?? key}
              </label>
            ) : (
              <>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {FIELD_LABELS[key] ?? key}
                </label>
                <input className={INPUT} value={String(current ?? "")} onChange={(e) => setValue((v) => ({ ...v, [key]: e.target.value }))} />
              </>
            )}
          </div>
        ))}
      </div>

      {error ? <p className="mt-2 text-xs text-destructive">{error}</p> : null}
      <Button size="sm" className="mt-3 gap-1.5" disabled={!dirty || busy} onClick={save}>
        {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null} {dirty ? "Save" : "Saved"}
      </Button>
    </div>
  );
}

function RedirectsSection() {
  const token = useDashboardActionToken();
  const [redirects, setRedirects] = React.useState<WebsiteRedirect[]>([]);
  const [source, setSource] = React.useState("");
  const [destination, setDestination] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");

  const load = React.useCallback(async () => {
    try {
      const { redirects: rows } = await websiteApi.redirects(token);
      setRedirects(rows);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load the redirects.");
    }
  }, [token]);

  React.useEffect(() => { void load(); }, [load]);

  async function run(fn: () => Promise<unknown>) {
    setBusy(true);
    setError("");
    try {
      await fn();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update the redirects.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="space-y-3 border-t border-border pt-6">
      <div>
        <h2 className="font-semibold">Redirects</h2>
        <p className="text-sm text-muted-foreground">
          Old addresses that should send visitors somewhere new. One is created for you automatically whenever you change
          a page&rsquo;s address.
        </p>
      </div>

      {error ? <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p> : null}

      <form
        className="flex flex-wrap items-end gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          void run(async () => {
            await websiteApi.createRedirect(token, { source_path: source, destination_path: destination });
            setSource("");
            setDestination("");
          });
        }}
      >
        <div className="min-w-[180px] flex-1">
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Old address</label>
          <input className={INPUT} value={source} onChange={(e) => setSource(e.target.value)} placeholder="/old-page" />
        </div>
        <ArrowRight className="mb-2.5 h-4 w-4 text-muted-foreground" />
        <div className="min-w-[180px] flex-1">
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">New address</label>
          <input className={INPUT} value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="/new-page" />
        </div>
        <Button type="submit" disabled={busy || !source.trim() || !destination.trim()} className="gap-1.5">
          <Plus className="h-4 w-4" /> Add
        </Button>
      </form>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-3 py-2 text-left font-semibold">From</th>
              <th className="px-3 py-2 text-left font-semibold">To</th>
              <th className="px-3 py-2 text-left font-semibold">Type</th>
              <th className="px-3 py-2 text-left font-semibold">Created</th>
              <th className="px-3 py-2 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {redirects.map((r) => (
              <tr key={r.id} className={cn(!r.is_active && "opacity-50")}>
                <td className="px-3 py-2 font-mono text-xs">{r.source_path}</td>
                <td className="px-3 py-2 font-mono text-xs">{r.destination_path}</td>
                <td className="px-3 py-2 text-xs text-muted-foreground">{r.status_code === 301 ? "Permanent" : "Temporary"}</td>
                <td className="px-3 py-2 text-xs text-muted-foreground">{formatDate(r.created_at)}</td>
                <td className="px-3 py-2">
                  <div className="flex justify-end gap-1">
                    <button
                      aria-label={r.is_active ? "Turn off" : "Turn on"}
                      onClick={() => void run(() => websiteApi.setRedirectActive(token, r.id, !r.is_active))}
                      className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      <Power className="h-3.5 w-3.5" />
                    </button>
                    <button
                      aria-label="Remove"
                      onClick={() => void run(() => websiteApi.deleteRedirect(token, r.id))}
                      className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!redirects.length ? (
              <tr><td colSpan={5} className="px-3 py-8 text-center text-sm text-muted-foreground">No redirects yet.</td></tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
