"use client";

// Inline AI actions inside an editable field (spec §34).
//
// A suggestion is shown, never applied silently: Mike sees the proposed text and
// clicks Use it or Discard. "Undo" restores the previous value for as long as
// the field stays open.

import * as React from "react";
import { Sparkles, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDashboardActionToken } from "@/components/layout/dashboard-action-token";

const ACTIONS: { mode: string; label: string }[] = [
  { mode: "rewrite", label: "Rewrite" },
  { mode: "shorten", label: "Shorten" },
  { mode: "expand", label: "Expand" },
  { mode: "clearer", label: "Make clearer" },
  { mode: "conversational", label: "More conversational" },
  { mode: "cta", label: "Improve CTA" },
  { mode: "seo", label: "Improve for search" },
  { mode: "grammar", label: "Fix grammar" },
  { mode: "brand", label: "Match brand voice" },
];

export function InlineAiActions({
  text,
  onReplace,
  fieldLabel,
  pageTitle,
  blockLabel,
}: {
  text: string;
  onReplace: (value: string) => void;
  fieldLabel: string;
  pageTitle: string;
  blockLabel: string;
}) {
  const token = useDashboardActionToken();
  const [open, setOpen] = React.useState(false);
  const [busy, setBusy] = React.useState("");
  const [suggestion, setSuggestion] = React.useState<string | null>(null);
  const [previous, setPrevious] = React.useState<string | null>(null);
  const [error, setError] = React.useState("");

  async function run(mode: string) {
    setBusy(mode);
    setError("");
    setSuggestion(null);
    try {
      const res = await fetch("/api/admin/website/assist", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-mjg-action-token": token },
        body: JSON.stringify({ mode, text, fieldLabel, pageTitle, blockLabel, actionToken: token }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error || "Could not rewrite that text.");
      setSuggestion(String(body.text ?? ""));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not rewrite that text.");
    } finally {
      setBusy("");
    }
  }

  if (!text.trim()) return null;

  return (
    <div className="mt-2">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-md border border-border px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-muted"
        >
          <Sparkles className="h-3 w-3 text-[#b88a4a]" /> Ask Steward
        </button>
        {previous !== null ? (
          <button
            type="button"
            onClick={() => { onReplace(previous); setPrevious(null); }}
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-muted"
          >
            <Undo2 className="h-3 w-3" /> Undo
          </button>
        ) : null}
      </div>

      {open ? (
        <div className="mt-2 rounded-lg border border-border bg-muted/40 p-2.5">
          <div className="flex flex-wrap gap-1.5">
            {ACTIONS.map((a) => (
              <button
                key={a.mode}
                type="button"
                disabled={Boolean(busy)}
                onClick={() => void run(a.mode)}
                className="rounded-md bg-background px-2 py-1 text-xs font-medium hover:bg-[#b88a4a]/10 disabled:opacity-50"
              >
                {busy === a.mode ? "Working…" : a.label}
              </button>
            ))}
          </div>
          {error ? <p className="mt-2 text-xs text-destructive">{error}</p> : null}
          {suggestion !== null ? (
            <div className="mt-2.5 rounded-md border border-[#b88a4a]/40 bg-background p-2.5">
              <p className="whitespace-pre-wrap text-sm">{suggestion}</p>
              <div className="mt-2 flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  className="h-7"
                  onClick={() => { setPrevious(text); onReplace(suggestion); setSuggestion(null); setOpen(false); }}
                >
                  Use it
                </Button>
                <Button type="button" size="sm" variant="ghost" className="h-7" onClick={() => setSuggestion(null)}>
                  Discard
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
