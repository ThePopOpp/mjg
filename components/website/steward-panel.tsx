"use client";

// The Steward panel inside the page editor (spec §13, §50).
//
// Two halves: the proposals Steward has made for THIS page (apply to draft /
// reject / publish), and the chat itself. Steward always reads the page first,
// proposes, and leaves the decision here — nothing on this panel publishes
// without an explicit click.

import * as React from "react";
import { Bot, Check, Eye, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AgentChat } from "@/components/ai-agent/agent-chat";
import { useDashboardActionToken } from "@/components/layout/dashboard-action-token";
import { websiteApi } from "./api";
import { ChangeReview } from "./change-review";
import { RISK_PILL, relativeTime } from "./constants";
import type { PageDiff } from "@/lib/website/diff";
import type { WebsiteChangeSet, WebsitePage } from "@/lib/website/types";

const QUICK_PROMPTS = [
  "Improve the hero.",
  "Rewrite this page to be easier to understand.",
  "Add a frequently asked questions section.",
  "Add a closing call to action.",
  "Improve the SEO title and description.",
  "Add Stewardship Blueprint content.",
  "Add a booking section.",
  "Check this page for broken links.",
];

export function StewardPanel({
  page,
  changeSets,
  onChanged,
}: {
  page: WebsitePage;
  changeSets: WebsiteChangeSet[];
  onChanged: () => void;
}) {
  const token = useDashboardActionToken();
  const [busy, setBusy] = React.useState<string | null>(null);
  const [error, setError] = React.useState("");
  const [openId, setOpenId] = React.useState<string | null>(null);
  const [diffs, setDiffs] = React.useState<Record<string, PageDiff>>({});

  const pending = changeSets.filter((c) => c.status === "proposed" || c.status === "draft_applied");

  async function loadDiff(id: string) {
    if (diffs[id]) return;
    try {
      const { diff } = await websiteApi.changeSet(token, id);
      setDiffs((d) => ({ ...d, [id]: diff }));
    } catch {
      /* the summary is still shown; the detailed diff is a nicety */
    }
  }

  async function act(id: string, action: "apply" | "approve" | "reject") {
    setBusy(id + action);
    setError("");
    try {
      await websiteApi.changeSetAction(token, id, action);
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not act on that change.");
    } finally {
      setBusy(null);
    }
  }

  // Steward is told exactly which page is open so "this page" is never ambiguous.
  const context =
    `The user is editing the website page "${page.title}" (id: ${page.id}, address: /${page.slug}, ` +
    `status: ${page.status}${page.is_legal ? ", LEGAL PAGE" : ""}${page.is_protected ? ", PROTECTED PAGE" : ""}). ` +
    "When they say \"this page\", \"the page\" or \"the hero\", they mean this one. Read it with website_get_page before " +
    "proposing anything, and propose changes with website_propose_change so they land in the draft for review.";

  return (
    <div className="flex h-full flex-col">
      {pending.length ? (
        <div className="max-h-[45%] overflow-y-auto border-b border-border p-3">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Waiting for you ({pending.length})
          </h3>
          {error ? <p className="mb-2 text-xs text-destructive">{error}</p> : null}
          <ul className="space-y-2">
            {pending.map((cs) => (
              <li key={cs.id} className="rounded-lg border border-border">
                <div className="p-3">
                  <div className="flex items-center gap-2">
                    <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide", RISK_PILL[cs.risk])}>
                      {cs.risk} risk
                    </span>
                    <span className="ml-auto text-xs text-muted-foreground">{relativeTime(cs.created_at)}</span>
                  </div>
                  {cs.prompt ? <p className="mt-1.5 text-xs italic text-muted-foreground">&ldquo;{cs.prompt}&rdquo;</p> : null}
                  <p className="mt-1.5 text-sm">{cs.summary}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {cs.status === "draft_applied" ? "Applied to your draft — preview it, then publish when you are happy." : "Not applied yet."}
                  </p>

                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <Button
                      size="sm" variant="ghost" className="h-7 gap-1"
                      onClick={() => { setOpenId(openId === cs.id ? null : cs.id); void loadDiff(cs.id); }}
                    >
                      <Eye className="h-3 w-3" /> {openId === cs.id ? "Hide" : "What changes"}
                    </Button>
                    {cs.status === "proposed" ? (
                      <Button size="sm" variant="outline" className="h-7 gap-1" disabled={busy === cs.id + "apply"} onClick={() => act(cs.id, "apply")}>
                        {busy === cs.id + "apply" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />} Apply to draft
                      </Button>
                    ) : null}
                    <Button size="sm" className="h-7 gap-1" disabled={busy === cs.id + "approve"} onClick={() => act(cs.id, "approve")}>
                      {busy === cs.id + "approve" ? <Loader2 className="h-3 w-3 animate-spin" /> : null} Publish
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 gap-1 text-muted-foreground" disabled={busy === cs.id + "reject"} onClick={() => act(cs.id, "reject")}>
                      <X className="h-3 w-3" /> Reject
                    </Button>
                  </div>
                </div>
                {openId === cs.id ? (
                  <div className="border-t border-border bg-muted/30 p-3">
                    {diffs[cs.id] ? <ChangeReview diff={diffs[cs.id]} /> : <p className="text-xs text-muted-foreground">Loading the comparison…</p>}
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex items-center gap-1.5 border-b border-border px-4 py-2.5">
          <Bot className="h-4 w-4 text-[#b88a4a]" />
          <h3 className="text-sm font-semibold">Ask Steward</h3>
          <span className="ml-auto text-[11px] text-muted-foreground">Draft-first</span>
        </div>
        <div className="min-h-0 flex-1">
          <AgentChat
            title="Steward"
            subtitle={page.title}
            audio
            extraContext={context}
            suggestions={QUICK_PROMPTS}
            placeholder="Ask Steward to change this page…"
            heightClassName="h-full min-h-[320px]"
            emptyTitle="Ask Steward to change this page"
            emptyHint="I read the page first, then propose a change you can preview. I never publish without your approval."
          />
        </div>
      </div>
    </div>
  );
}
