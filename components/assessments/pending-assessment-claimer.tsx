"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, X } from "lucide-react";
import { postAssessment, readPending, removePending } from "@/components/assessments/use-assessment-autosave";

// Attaches results a visitor finished while signed out, once they're signed in.
// Mounted in the root layout so it runs wherever sign-in or registration lands
// them. Does nothing unless this browser has results waiting; a 401 means they're
// still signed out, so the results keep waiting.
export function PendingAssessmentClaimer() {
  const [saved, setSaved] = useState<string[]>([]);

  useEffect(() => {
    const pending = readPending();
    if (!pending.length) return;
    let cancelled = false;
    (async () => {
      const labels: string[] = [];
      for (const p of pending) {
        try {
          const res = await postAssessment(p.assessment, p.answers, p.attemptId);
          if (res.status === 401) return; // still signed out
          // Saved, or can never be saved (unknown, incomplete, someone else's): stop holding it.
          if (res.status < 500) removePending(p.attemptId);
          if (res.status < 300) labels.push(p.label);
        } catch {
          return; // offline — try again on the next page
        }
      }
      if (!cancelled && labels.length) setSaved(labels);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!saved.length) return null;
  return (
    <div role="status" className="fixed bottom-4 left-4 right-4 z-[70] mx-auto max-w-md rounded-lg border border-[#b88a4a]/50 bg-card p-4 text-sm text-foreground shadow-lg sm:right-auto">
      <div className="flex items-start gap-3">
        <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#b88a4a]" />
        <div className="min-w-0 flex-1">
          <p className="text-pretty">Your {saved.join(" and ")} results are saved to your account.</p>
          <Link href="/steward" className="mt-1 inline-block font-medium text-[#b88a4a] hover:underline">
            Talk to Steward about them →
          </Link>
        </div>
        <button type="button" onClick={() => setSaved([])} aria-label="Dismiss" className="text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
