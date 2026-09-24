"use client";

// Version history (spec §17/§18). Restoring puts the old content back into the
// DRAFT, never straight onto the live page — so a restore is itself reviewable
// and itself reversible.

import * as React from "react";
import { Bot, History, RotateCcw, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { diffContent } from "@/lib/website/diff";
import { formatDateTime } from "./constants";
import { ChangeReview } from "./change-review";
import type { WebsiteContent, WebsitePageVersion } from "@/lib/website/types";

export function VersionHistory({
  versions,
  currentDraft,
  onRestore,
}: {
  versions: WebsitePageVersion[];
  currentDraft: WebsiteContent;
  onRestore: (versionId: string) => Promise<void>;
}) {
  const [compareId, setCompareId] = React.useState<string | null>(null);
  const [restoring, setRestoring] = React.useState<string | null>(null);
  const [error, setError] = React.useState("");

  const comparing = versions.find((v) => v.id === compareId) ?? null;
  const diff = React.useMemo(
    () => (comparing ? diffContent(comparing.content, currentDraft) : null),
    [comparing, currentDraft],
  );

  async function restore(id: string) {
    setRestoring(id);
    setError("");
    try {
      await onRestore(id);
      setCompareId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not restore that version.");
    } finally {
      setRestoring(null);
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border px-4 py-3">
        <h2 className="flex items-center gap-1.5 font-semibold"><History className="h-4 w-4" /> Version history</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Restoring puts a version back into your draft. Nothing changes on the live site until you publish.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {error ? <p className="mb-2 text-xs text-destructive">{error}</p> : null}
        {!versions.length ? (
          <p className="px-1 py-8 text-center text-sm text-muted-foreground">
            No versions yet. One is saved every time you publish.
          </p>
        ) : null}

        <ul className="space-y-2">
          {versions.map((version) => (
            <li key={version.id} className={cn("rounded-lg border", compareId === version.id ? "border-[#b88a4a]" : "border-border")}>
              <div className="p-3">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-muted px-1.5 py-0.5 text-xs font-semibold">v{version.version_number}</span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    {version.source === "steward" ? <Bot className="h-3 w-3" /> : <User className="h-3 w-3" />}
                    {version.source === "steward" ? "Steward" : version.source === "restore" ? "Restore" : "Manual"}
                  </span>
                  <span className="ml-auto text-xs text-muted-foreground">{formatDateTime(version.created_at)}</span>
                </div>
                {version.change_summary ? <p className="mt-1.5 text-sm">{version.change_summary}</p> : null}
                <div className="mt-2 flex gap-2">
                  <Button size="sm" variant="ghost" className="h-7" onClick={() => setCompareId(compareId === version.id ? null : version.id)}>
                    {compareId === version.id ? "Hide comparison" : "Compare with draft"}
                  </Button>
                  <Button size="sm" variant="outline" className="h-7 gap-1" disabled={restoring === version.id} onClick={() => restore(version.id)}>
                    <RotateCcw className="h-3 w-3" /> {restoring === version.id ? "Restoring…" : "Restore"}
                  </Button>
                </div>
              </div>
              {compareId === version.id && diff ? (
                <div className="border-t border-border bg-muted/30 p-3">
                  <p className="mb-2 text-xs text-muted-foreground">
                    What your current draft changes compared with v{version.version_number}:
                  </p>
                  <ChangeReview diff={diff} />
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
