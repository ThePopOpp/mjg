"use client";

// "Edit a page" — pick any page on the website, describe the change in your own
// words (typed or spoken), and send it.
//
// Where it goes depends on what kind of page it is, and the panel says so BEFORE
// you start writing rather than after you press send:
//
//   Editor-managed page → Steward reads the page, proposes a change set, and
//                         applies it to the draft for preview and publishing.
//   Code-owned page     → the description is queued as a developer request.
//                         Nothing can rewrite a hand-built page from here, and
//                         pretending otherwise would waste Mike's time.

import * as React from "react";
import Link from "next/link";
import { AlertTriangle, Bot, Check, Code2, ExternalLink, FileText, Loader2, PanelsTopLeft, Send, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AgentChat } from "@/components/ai-agent/agent-chat";
import { useDashboardActionToken } from "@/components/layout/dashboard-action-token";
import { CODE_OWNED_PAGES, codeOwnedToPickable, findCodeOwnedPage, type PickablePage } from "@/lib/website/frontend-pages";
import { STATUS_PILL } from "./constants";
import type { WebsitePageSummary } from "@/lib/website/types";

// Declared at module scope on purpose. React may discard a useMemo result, and a
// fresh lazy() would remount the editor and lose whatever had been typed or
// dictated into it.
const RichTextInput = React.lazy(() =>
  import("./rich-text-input").then((m) => ({ default: m.RichTextInput })),
);

const EXAMPLES = [
  "Change the hero headline to something about Kingdom Stewardship, and make the button say “Explore the Blueprint”.",
  "Add a frequently asked questions section at the bottom with three questions about how the Blueprint works.",
  "Rewrite the opening paragraph so it is warmer and shorter, and remove the sentence about pricing.",
  "Add a section explaining the Stewardship Blueprint, with a button linking to the Blueprint page.",
];

export function EditAPage({ pages }: { pages: WebsitePageSummary[] }) {
  const token = useDashboardActionToken();

  const [selectedId, setSelectedId] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [stewardPrompt, setStewardPrompt] = React.useState<string | null>(null);
  const [queueing, setQueueing] = React.useState(false);
  const [queued, setQueued] = React.useState<string | null>(null);
  const [error, setError] = React.useState("");

  const managed: PickablePage[] = pages
    .filter((p) => p.status !== "archived")
    .map((p) => ({
      id: p.id,
      kind: "managed" as const,
      label: p.title,
      path: `/${p.slug}`,
      group: "Managed in the Editor",
      status: p.status,
    }));

  const codeOwned = CODE_OWNED_PAGES.map(codeOwnedToPickable);
  const selected =
    managed.find((p) => p.id === selectedId) ?? codeOwned.find((p) => p.id === selectedId) ?? null;
  const codePage = selectedId ? findCodeOwnedPage(selectedId) : undefined;

  const groups = React.useMemo(() => {
    const map = new Map<string, PickablePage[]>();
    for (const p of [...managed, ...codeOwned]) {
      if (!map.has(p.group)) map.set(p.group, []);
      map.get(p.group)!.push(p);
    }
    return Array.from(map.entries());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pages]);

  function reset() {
    setDescription("");
    setQueued(null);
    setError("");
  }

  async function queueForDeveloper() {
    if (!codePage) return;
    setQueueing(true);
    setError("");
    try {
      const res = await fetch("/api/admin/dev-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-mjg-action-token": token },
        body: JSON.stringify({
          actionToken: token,
          sourceType: "manual",
          title: `Website edit: ${codePage.label}`,
          body: `**Page:** ${codePage.label} (${codePage.path})\n**Built in:** ${codePage.source}\n\n**Requested change**\n\n${description.trim()}`,
          pageTarget: codePage.path,
          requestKind: "website_page_edit",
          priority: "medium",
          metadata: { origin: "frontend_editor", pageKind: "code", source: codePage.source },
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok || body?.ok === false) throw new Error(body?.error || "Could not queue that request.");
      setQueued(codePage.label);
      setDescription("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not queue that request.");
    } finally {
      setQueueing(false);
    }
  }

  function sendToSteward() {
    if (!selected || selected.kind !== "managed") return;
    setStewardPrompt(
      `Please edit the website page "${selected.label}" (${selected.path}).\n\n` +
        `Read it first with website_get_page, then propose the change below into the draft so I can preview it.\n\n` +
        `What I want changed:\n${description.trim()}`,
    );
  }

  const canSend = Boolean(selected && description.trim().length > 3);

  return (
    <div className="space-y-5">
      <div className="max-w-3xl">
        <h2 className="text-lg font-semibold">Edit a page</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose a page, describe what you want changed in your own words — type it or speak it — and send it. Nothing
          goes live from here: changes to Editor pages land in a draft for you to preview first.
        </p>
      </div>

      {/* 1 — choose the page */}
      <div className="max-w-2xl">
        <label htmlFor="page-picker" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Which page?
        </label>
        <select
          id="page-picker"
          value={selectedId}
          onChange={(e) => { setSelectedId(e.target.value); reset(); }}
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="">Choose a page…</option>
          {groups.map(([group, items]) => (
            <optgroup key={group} label={group}>
              {items.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label} — {p.path}
                  {p.status && p.status !== "published" ? ` (${p.status})` : ""}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        {!managed.length ? (
          <p className="mt-1.5 text-xs text-muted-foreground">
            No Editor pages yet — everything listed is built in code. Create one on the Pages tab to get the full
            describe-and-preview workflow.
          </p>
        ) : null}
      </div>

      {/* 2 — what happens for this page */}
      {selected ? (
        <div
          className={cn(
            "max-w-3xl rounded-lg border p-4",
            selected.kind === "managed"
              ? "border-[#b88a4a]/40 bg-[#b88a4a]/5"
              : "border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30",
          )}
        >
          <div className="flex items-start gap-3">
            {selected.kind === "managed" ? (
              <PanelsTopLeft className="mt-0.5 h-4 w-4 shrink-0 text-[#b88a4a]" />
            ) : (
              <Code2 className="mt-0.5 h-4 w-4 shrink-0 text-amber-700 dark:text-amber-400" />
            )}
            <div className="min-w-0 flex-1">
              <p className="flex flex-wrap items-center gap-2 text-sm font-medium">
                {selected.label}
                <code className="rounded bg-background/70 px-1.5 py-0.5 text-xs">{selected.path}</code>
                {selected.status ? (
                  <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold uppercase", STATUS_PILL[selected.status as keyof typeof STATUS_PILL])}>
                    {selected.status}
                  </span>
                ) : null}
              </p>

              {selected.kind === "managed" ? (
                <p className="mt-1.5 text-sm text-muted-foreground">
                  Steward will read this page, propose your change, and apply it to the draft. You preview it and decide
                  whether to publish — nothing reaches the live site on its own.
                </p>
              ) : (
                <>
                  <p className="mt-1.5 text-sm text-amber-900 dark:text-amber-200">
                    This page is built in code ({selected.source}), so it has no editable sections. Describing a change
                    here queues it for a developer rather than editing the page.
                  </p>
                  <p className="mt-1.5 text-xs text-amber-900/80 dark:text-amber-200/80">
                    To edit a page like this yourself, it first has to be rebuilt as an Editor page.
                  </p>
                </>
              )}

              <div className="mt-2.5 flex flex-wrap gap-2">
                {selected.kind === "managed" ? (
                  <Button asChild size="sm" variant="outline" className="h-7 gap-1">
                    <Link href={`/dashboard/cms/editor/pages/${selected.id}`}>
                      <FileText className="h-3 w-3" /> Open in the editor
                    </Link>
                  </Button>
                ) : null}
                <Button asChild size="sm" variant="ghost" className="h-7 gap-1">
                  <a href={selected.path} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3 w-3" /> View the page
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* 3 — describe the change */}
      {selected ? (
        <div className="max-w-3xl space-y-3">
          <React.Suspense
            fallback={<div className="h-48 animate-pulse rounded-lg border border-input bg-muted/40" />}
          >
            <RichTextInput
              label="What should change?"
              value={description}
              onChange={setDescription}
              rows={9}
              placeholder={
                selected.kind === "managed"
                  ? "Describe the change in plain English. For example: change the hero headline, add a section about the Stewardship Blueprint below it, and make the button link to the Blueprint page."
                  : "Describe the change you want a developer to make to this page."
              }
              hint="Click Dictate to speak instead of typing. You can keep typing while it listens."
            />
          </React.Suspense>

          {!description.trim() ? (
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Or start from an example
              </p>
              <div className="flex flex-wrap gap-1.5">
                {EXAMPLES.map((example) => (
                  <button
                    key={example}
                    type="button"
                    onClick={() => setDescription(example)}
                    className="rounded-full border border-border px-3 py-1 text-left text-xs text-muted-foreground transition-colors hover:border-[#b88a4a] hover:text-foreground"
                  >
                    {example.length > 68 ? `${example.slice(0, 68)}…` : example}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {error ? <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p> : null}

          {queued ? (
            <p className="flex items-center gap-2 rounded-md border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200">
              <Check className="h-4 w-4 shrink-0" />
              Queued for a developer — &ldquo;{queued}&rdquo;. It will show up in the development queue.
            </p>
          ) : null}

          <div className="flex flex-wrap items-center gap-2">
            {selected.kind === "managed" ? (
              <Button onClick={sendToSteward} disabled={!canSend} className="gap-1.5">
                <Bot className="h-4 w-4" /> Send to Steward
              </Button>
            ) : (
              <Button onClick={queueForDeveloper} disabled={!canSend || queueing} className="gap-1.5">
                {queueing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Queue for a developer
              </Button>
            )}
            {description ? (
              <Button variant="ghost" onClick={() => setDescription("")}>Clear</Button>
            ) : null}
            {!canSend && description.trim() ? (
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <AlertTriangle className="h-3 w-3" /> Add a little more detail.
              </span>
            ) : null}
          </div>
        </div>
      ) : null}

      {/* Steward, pre-loaded with the page and the instruction */}
      {stewardPrompt && selected ? (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setStewardPrompt(null)} aria-hidden />
          <div className="relative z-10 w-full max-w-2xl">
            <button
              onClick={() => setStewardPrompt(null)}
              aria-label="Close"
              className="absolute -right-3 -top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card shadow hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </button>
            <AgentChat
              title="Steward"
              subtitle={selected.label}
              audio
              initialMessage={stewardPrompt}
              extraContext={
                `The user is editing the website page "${selected.label}" (id: ${selected.id}, address: ${selected.path}). ` +
                "Read it with website_get_page before proposing anything, then use website_propose_change or " +
                "website_edit_section so the change lands in the draft for review. Do not publish unless asked."
              }
              placeholder="Add more detail or answer Steward…"
              heightClassName="h-[70vh] min-h-[440px]"
              emptyTitle="Working on it"
              emptyHint="Reading the page…"
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
