"use client";

import { useState } from "react";
import { Check, Copy, Loader2, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useDashboardActionToken } from "@/components/layout/dashboard-action-token";
import { cn } from "@/lib/utils";

// Settings for the Claude connector (MCP). Data: lib/mcp/admin.ts · API: /api/admin/mcp.

export type ConnectorOverview = {
  enabled: boolean;
  connections: Array<{ id: string; kind: string; name: string; scopes: string[]; created_at: string; last_used_at: string | null; paused_at: string | null; profile: { email: string } | null }>;
  calls: Array<{
    id: number;
    created_at: string;
    tool: string;
    risk: string | null;
    status: string;
    error: string | null;
    duration_ms: number | null;
    client_label: string | null;
    entity: string | null;
    record_id: string | null;
    restorable: boolean;
    profile: { email: string } | null;
  }>;
  clients: Array<{ client_id: string; client_name: string | null; client_label: string; redirect_uris: string[]; disabled_at: string | null; created_at: string }>;
  caps: { sms: number | null; email: number | null };
  approvals: Array<{ id: string; tool: string; preview: { summary?: string; details?: unknown } | null; created_at: string; expires_at: string; token: { name: string } | null }>;
  tasks: Array<{ id: string; title: string; status: string; priority: string; result: string | null; created_at: string; completed_at: string | null; agent: { name: string } | null }>;
};

const TASK_TONE: Record<string, string> = {
  queued: "bg-muted",
  in_progress: "bg-[#b88a4a]/15 text-[#8a6532] dark:text-[#d8bd86]",
  needs_review: "bg-[#b88a4a]/25 text-[#8a6532] dark:text-[#d8bd86]",
  done: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  failed: "bg-destructive/10 text-destructive",
  canceled: "bg-muted text-muted-foreground",
};

type ScopeDomain = { key: string; label: string };

/** Activity filter options; values match mcp_tool_calls.client_label. */
const CLIENT_FILTERS = ["Claude", "ChatGPT", "Agent", "Other"] as const;
type Level = "none" | "read" | "write";

const when = (iso: string | null) => (iso ? new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "—");

const STATUS_TONE: Record<string, string> = {
  ok: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  preview: "bg-[#b88a4a]/15 text-[#8a6532] dark:text-[#d8bd86]",
  denied: "bg-destructive/10 text-destructive",
  error: "bg-destructive/10 text-destructive",
  invalid: "bg-destructive/10 text-destructive",
};

export function ClaudeConnectorAdmin({
  initial,
  connectorUrl,
  scopeDomains,
  toolCounts,
}: {
  initial: ConnectorOverview;
  connectorUrl: string;
  scopeDomains: ScopeDomain[];
  toolCounts: { total: number; high: number };
}) {
  const actionToken = useDashboardActionToken();
  const [data, setData] = useState(initial);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [agentName, setAgentName] = useState("");
  const [levels, setLevels] = useState<Record<string, Level>>({});
  const [expiresInDays, setExpiresInDays] = useState("90");
  const [newSecret, setNewSecret] = useState<string | null>(null);
  const [clientFilter, setClientFilter] = useState("");
  const [caps, setCaps] = useState({ sms: initial.caps.sms?.toString() ?? "", email: initial.caps.email?.toString() ?? "" });

  // One row per AI client (Claude registers more than once); off if any registration is off.
  const clientGroups = Object.values(
    data.clients.reduce<Record<string, { label: string; count: number; disabled: boolean; since: string }>>((acc, c) => {
      const g = (acc[c.client_label] ??= { label: c.client_label, count: 0, disabled: false, since: c.created_at });
      g.count += 1;
      g.disabled ||= Boolean(c.disabled_at);
      if (c.created_at < g.since) g.since = c.created_at;
      return acc;
    }, {}),
  );

  async function refresh(filter = clientFilter) {
    const qs = filter ? `?client=${encodeURIComponent(filter)}` : "";
    const fresh = await fetch(`/api/admin/mcp${qs}`, { headers: { "x-mjg-action-token": actionToken ?? "" } });
    if (fresh.ok) setData(await fresh.json());
  }

  async function call(action: string, payload: Record<string, unknown> = {}) {
    setBusy(action + (payload.id ?? payload.label ?? ""));
    setError(null);
    try {
      const res = await fetch("/api/admin/mcp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, actionToken, ...payload }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Something went wrong.");
      await refresh();
      return json;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      return null;
    } finally {
      setBusy(null);
    }
  }

  async function createToken() {
    const scopes = Object.entries(levels)
      .filter(([, level]) => level !== "none")
      .map(([domain, level]) => `${domain}:${level}`);
    const result = await call("create_agent_token", { name: agentName, scopes, expiresInDays: Number(expiresInDays) || undefined });
    if (result?.secret) {
      setNewSecret(result.secret);
      setAgentName("");
      setLevels({});
    }
  }

  return (
    <div className="space-y-6">
      {error ? <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive dark:text-red-300">{error}</p> : null}

      {/* Status + setup */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
          <div>
            <CardTitle>Connector</CardTitle>
            <CardDescription className="mt-1">
              {data.enabled ? "On — Super Admins can connect Claude and agents can call MJG." : "Off — nobody can connect or call MJG through Claude."}{" "}
              {toolCounts.total} tools, {toolCounts.high} of them high-risk (preview first, then an explicit yes).
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {busy === "set_enabled" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            <Switch checked={data.enabled} disabled={busy !== null} onCheckedChange={(v) => call("set_enabled", { enabled: v })} aria-label="Connector on or off" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-2 font-mono text-[13px]">
            <span className="min-w-0 flex-1 truncate">{connectorUrl}</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                navigator.clipboard?.writeText(connectorUrl);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <ol className="list-decimal space-y-1.5 pl-5 text-muted-foreground">
            <li>Turn the connector on above.</li>
            <li>In Claude (Teams), an owner adds a custom connector with this URL (Organization settings → Connectors).</li>
            <li>Each Super Admin opens Connectors in Claude, clicks Connect, and signs in with their MJG account.</li>
            <li>In Claude Code: <code className="rounded bg-muted px-1">claude mcp add --transport http mjg {connectorUrl}</code></li>
          </ol>
        </CardContent>
      </Card>

      {/* Approvals */}
      {data.approvals.length ? (
        <Card className="border-[#b88a4a]/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-[#b88a4a]" /> Waiting for your approval
            </CardTitle>
            <CardDescription>High-risk actions requested by agents. Approving runs it now, as the agent.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.approvals.map((a) => (
              <div key={a.id} className="rounded-lg border p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium">{a.preview?.summary ?? a.tool}</p>
                  <span className="text-xs text-muted-foreground">
                    {a.token?.name ?? "Agent"} · {when(a.created_at)} · expires {when(a.expires_at)}
                  </span>
                </div>
                {a.preview?.details ? (
                  <pre className="mt-2 max-h-48 overflow-auto rounded bg-muted/50 p-2 text-xs">{JSON.stringify(a.preview.details, null, 2)}</pre>
                ) : null}
                <div className="mt-3 flex gap-2">
                  <Button size="sm" disabled={busy !== null} onClick={() => call("approve", { id: a.id })}>
                    Approve &amp; run
                  </Button>
                  <Button size="sm" variant="outline" disabled={busy !== null} onClick={() => call("reject", { id: a.id })}>
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      {/* Connections */}
      <Card>
        <CardHeader>
          <CardTitle>Connections</CardTitle>
          <CardDescription>People signed in from Claude, and agent tokens. Disconnecting takes effect on the next call.</CardDescription>
        </CardHeader>
        <CardContent>
          {data.connections.length ? (
            <ul className="divide-y">
              {data.connections.map((c) => (
                <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="font-medium">
                      {c.name} <Badge variant="outline" className="ml-1 align-middle">{c.kind === "agent" ? "Agent" : "Person"}</Badge>
                      {c.paused_at ? <Badge variant="outline" className="ml-1 align-middle border-[#b88a4a] text-[#8a6532] dark:text-[#d8bd86]">Paused</Badge> : null}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {c.profile?.email ?? "—"} · last used {when(c.last_used_at)}
                      {c.kind === "agent" ? ` · ${c.scopes.filter((s) => s !== "core:read").join(", ")}` : ""}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {c.kind === "agent" ? (
                      <Button size="sm" variant="outline" disabled={busy !== null} onClick={() => call(c.paused_at ? "resume" : "pause", { id: c.id })}>
                        {c.paused_at ? "Resume" : "Pause"}
                      </Button>
                    ) : null}
                    <Button size="sm" variant="outline" disabled={busy !== null} onClick={() => call("revoke", { id: c.id })}>
                      Disconnect
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">Nothing connected yet.</p>
          )}
        </CardContent>
      </Card>

      {/* AI clients */}
      <Card>
        <CardHeader>
          <CardTitle>AI clients</CardTitle>
          <CardDescription>
            Claude and ChatGPT reach the same tools under the same rules. Switch one off to refuse every call from it, starting with the next one.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {clientGroups.length ? (
            <ul className="divide-y">
              {clientGroups.map((g) => (
                <li key={g.label} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="font-medium">
                      {g.label}
                      {g.disabled ? <Badge variant="outline" className="ml-2 align-middle border-[#b88a4a] text-[#8a6532] dark:text-[#d8bd86]">Off</Badge> : null}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {g.count} registration{g.count === 1 ? "" : "s"} · first connected {when(g.since)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {busy === `set_client_disabled${g.label}` ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    <Switch
                      checked={!g.disabled}
                      disabled={busy !== null}
                      onCheckedChange={(on) => call("set_client_disabled", { label: g.label, disabled: !on })}
                      aria-label={`${g.label} on or off`}
                    />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No AI client has connected yet.</p>
          )}
        </CardContent>
      </Card>

      {/* Limits */}
      <Card>
        <CardHeader>
          <CardTitle>Limits</CardTitle>
          <CardDescription>
            Total one-person sends through the connector in any 24 hours, across every person, client and agent. Leave blank for no limit. Broadcasts
            always need a confirmed preview showing how many people they reach.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1.5 text-sm">
              <span className="font-medium">Texts per day</span>
              <Input type="number" min={0} placeholder="No limit" value={caps.sms} onChange={(e) => setCaps((v) => ({ ...v, sms: e.target.value }))} />
            </label>
            <label className="space-y-1.5 text-sm">
              <span className="font-medium">Emails per day</span>
              <Input type="number" min={0} placeholder="No limit" value={caps.email} onChange={(e) => setCaps((v) => ({ ...v, email: e.target.value }))} />
            </label>
          </div>
          <Button disabled={busy !== null} onClick={() => call("set_caps", { sms: caps.sms, email: caps.email })}>
            {busy === "set_caps" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Save limits
          </Button>
        </CardContent>
      </Card>

      {/* Agent tasks */}
      <Card>
        <CardHeader>
          <CardTitle>Agent tasks</CardTitle>
          <CardDescription>Work handed to agents from Claude. Accept a result, send it back, or cancel it.</CardDescription>
        </CardHeader>
        <CardContent>
          {data.tasks.length ? (
            <ul className="divide-y">
              {data.tasks.map((t) => (
                <li key={t.id} className="flex flex-wrap items-start justify-between gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">
                      {t.title}{" "}
                      <span className={cn("ml-1 rounded px-1.5 py-0.5 align-middle text-xs font-medium", TASK_TONE[t.status] ?? "bg-muted")}>{t.status.replace("_", " ")}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t.agent?.name ?? "Any agent"} · {t.priority} · created {when(t.created_at)}
                      {t.completed_at ? ` · finished ${when(t.completed_at)}` : ""}
                    </p>
                    {t.result ? <p className="mt-1 text-sm text-muted-foreground">{t.result.slice(0, 280)}</p> : null}
                  </div>
                  <div className="flex gap-2">
                    {t.status === "needs_review" ? (
                      <Button size="sm" disabled={busy !== null} onClick={() => call("resolve_task", { id: t.id, outcome: "done" })}>
                        Accept
                      </Button>
                    ) : null}
                    {["needs_review", "failed", "in_progress"].includes(t.status) ? (
                      <Button size="sm" variant="outline" disabled={busy !== null} onClick={() => call("resolve_task", { id: t.id, outcome: "requeue" })}>
                        Send back
                      </Button>
                    ) : null}
                    {["queued", "in_progress", "needs_review"].includes(t.status) ? (
                      <Button size="sm" variant="outline" disabled={busy !== null} onClick={() => call("resolve_task", { id: t.id, outcome: "canceled" })}>
                        Cancel
                      </Button>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No agent tasks yet. In Claude, ask: “give the Scribe agent a task to …”.</p>
          )}
        </CardContent>
      </Card>

      {/* New agent token */}
      <Card>
        <CardHeader>
          <CardTitle>New agent token</CardTitle>
          <CardDescription>
            For Paperclip, Hermes, OpenClaw or another agent. It acts on your behalf, only in the areas you allow. Its high-risk actions always wait here
            for a person to approve.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {newSecret ? (
            <div className="rounded-lg border border-[#b88a4a]/60 bg-[#b88a4a]/10 p-4 text-sm">
              <p className="font-medium">Copy this token now — it won’t be shown again.</p>
              <p className="mt-2 break-all font-mono text-[13px]">{newSecret}</p>
              <p className="mt-2 text-muted-foreground">The agent sends it as <code>Authorization: Bearer …</code> to {connectorUrl}.</p>
              <Button size="sm" variant="outline" className="mt-3" onClick={() => setNewSecret(null)}>
                Done
              </Button>
            </div>
          ) : null}
          <div className="grid gap-3 sm:grid-cols-[1fr_10rem]">
            <Input placeholder="Agent name, e.g. Hermes — Scribe" value={agentName} onChange={(e) => setAgentName(e.target.value)} />
            <Input type="number" min={1} placeholder="Expires in days" value={expiresInDays} onChange={(e) => setExpiresInDays(e.target.value)} aria-label="Expires in days" />
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {scopeDomains.map((d) => {
              const level = levels[d.key] ?? "none";
              return (
                <div key={d.key} className="flex items-center justify-between gap-3 rounded-md border px-3 py-2 text-sm">
                  <span>{d.label}</span>
                  <div className="flex overflow-hidden rounded-md border text-xs">
                    {(["none", "read", "write"] as const).map((l) => (
                      <button
                        key={l}
                        type="button"
                        onClick={() => setLevels((v) => ({ ...v, [d.key]: l }))}
                        className={cn("px-2.5 py-1 capitalize transition-colors", level === l ? "bg-[#b88a4a] text-white" : "hover:bg-muted")}
                      >
                        {l === "none" ? "Off" : l}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          <Button disabled={busy !== null || !agentName.trim()} onClick={createToken}>
            {busy === "create_agent_token" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Create token
          </Button>
        </CardContent>
      </Card>

      {/* Activity */}
      <Card>
        <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3 space-y-0">
          <div>
            <CardTitle>Recent activity</CardTitle>
            <CardDescription className="mt-1">The last 50 calls through the connector. Deletes can be restored here.</CardDescription>
          </div>
          <select
            value={clientFilter}
            onChange={(e) => {
              setClientFilter(e.target.value);
              void refresh(e.target.value);
            }}
            className="h-9 rounded-md border bg-background px-2 text-sm"
            aria-label="Show calls from"
          >
            <option value="">All clients</option>
            {CLIENT_FILTERS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </CardHeader>
        <CardContent>
          {data.calls.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs text-muted-foreground">
                  <tr>
                    <th className="py-2 pr-3 font-medium">When</th>
                    <th className="py-2 pr-3 font-medium">Who</th>
                    <th className="py-2 pr-3 font-medium">Client</th>
                    <th className="py-2 pr-3 font-medium">Tool</th>
                    <th className="py-2 pr-3 font-medium">Outcome</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {data.calls.map((c) => (
                    <tr key={c.id}>
                      <td className="whitespace-nowrap py-2 pr-3 text-muted-foreground">{when(c.created_at)}</td>
                      <td className="py-2 pr-3">{c.profile?.email ?? "—"}</td>
                      <td className="py-2 pr-3 text-muted-foreground">{c.client_label ?? "—"}</td>
                      <td className="py-2 pr-3 font-mono text-[12.5px]">
                        {c.tool}
                        {c.risk === "high" ? <Badge variant="outline" className="ml-2">high</Badge> : null}
                      </td>
                      <td className="py-2 pr-3">
                        <span className={cn("rounded px-1.5 py-0.5 text-xs font-medium", STATUS_TONE[c.status] ?? "bg-muted")}>{c.status}</span>
                        {c.error ? <span className="ml-2 text-xs text-muted-foreground">{c.error.slice(0, 120)}</span> : null}
                        {c.restorable && c.entity && c.record_id ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="ml-2 h-7 px-2 text-xs"
                            disabled={busy !== null}
                            onClick={() => call("restore", { entity: c.entity, id: c.record_id })}
                          >
                            Restore
                          </Button>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No calls yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
