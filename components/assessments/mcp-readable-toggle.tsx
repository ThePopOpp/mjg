"use client";

import * as React from "react";
import { Bot, Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useDashboardActionToken } from "@/components/layout/dashboard-action-token";

// "Readable by MCP": whether Claude / ChatGPT may read people's results for this
// assessment. Super Admin only — render it only for Super Admins; the API checks too.
export function McpReadableToggle({ assessment, disabledReason }: { assessment: string; disabledReason?: string }) {
  const token = useDashboardActionToken();
  const [on, setOn] = React.useState<boolean | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let live = true;
    setOn(null);
    setError(null);
    fetch(`/api/admin/assessments/mcp-readable?assessment=${encodeURIComponent(assessment)}`, { headers: { "x-mjg-action-token": token } })
      .then((r) => r.json())
      .then((r) => { if (live) { if (r.error) setError(r.error); else setOn(Boolean(r.mcpReadable)); } })
      .catch(() => { if (live) setError("Could not load."); });
    return () => { live = false; };
  }, [assessment, token]);

  async function change(next: boolean) {
    setBusy(true);
    setError(null);
    try {
      const r = await fetch("/api/admin/assessments/mcp-readable", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ assessment, readable: next, actionToken: token }),
      }).then((x) => x.json());
      if (r.error) throw new Error(r.error);
      setOn(Boolean(r.mcpReadable));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-[#b88a4a]/30 bg-[#b88a4a]/5 px-3 py-2.5">
      <Bot className="h-4 w-4 shrink-0 text-[#b88a4a]" />
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium">Readable by MCP</div>
        <p className="text-[11.5px] leading-snug text-muted-foreground">
          {disabledReason ?? "Lets Claude and ChatGPT read people's results for this assessment. Written reflections are never shared. Off by default."}
        </p>
        {error && <p className="mt-1 text-[11.5px] text-destructive">{error}</p>}
      </div>
      {busy || (on === null && !error) ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /> : null}
      <Switch
        checked={on === true}
        disabled={busy || on === null || Boolean(disabledReason)}
        onCheckedChange={change}
        aria-label="Readable by MCP"
        className="data-[state=checked]:bg-[#b88a4a]"
      />
    </div>
  );
}
