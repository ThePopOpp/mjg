"use client";

import Link from "next/link";
import { AlertTriangle, ArrowRight, Check, Loader2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import type { AutosaveStatus } from "@/components/assessments/use-assessment-autosave";

// Where people land after signing in or registering from the modal. Their waiting
// results are attached there by PendingAssessmentClaimer (mounted in the root layout).
const AFTER_SIGN_IN = "/dashboard";

/** Shown to signed-out visitors when their results appear: sign in or lose them. */
export function SaveResultsModal({ open, onOpenChange, label }: { open: boolean; onOpenChange: (open: boolean) => void; label: string }) {
  const next = encodeURIComponent(AFTER_SIGN_IN);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md gap-0 p-0">
        <div className="space-y-3 px-6 pb-2 pt-6 text-center">
          <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#b88a4a]/15 text-[#b88a4a]">
            <MessageCircle className="h-5 w-5" />
          </span>
          <DialogTitle className="text-pretty font-serif text-2xl">Save your results</DialogTitle>
          <DialogDescription className="mx-auto max-w-[22rem] text-pretty text-sm leading-6">
            Sign in or create a free account to keep your {label} results, so Steward can use them to guide your conversations.
          </DialogDescription>
          <p className="mx-auto flex max-w-[22rem] items-start gap-2 rounded-md border border-[#b88a4a]/40 bg-[#b88a4a]/10 px-3 py-2 text-left text-[13px] leading-5">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#b88a4a]" />
            <span className="text-pretty">If you don&rsquo;t, your results will be lost when you leave this page.</span>
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 px-6 pb-4 pt-4">
          <Button asChild className="w-full">
            <Link href={`/register?next=${next}`}>Create account</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href={`/login?next=${next}`}>Sign in</Link>
          </Button>
        </div>
        <div className="border-t px-6 py-3 text-center">
          <button type="button" onClick={() => onOpenChange(false)} className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
            Continue without saving
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** One line under the results: saved to the account (with a way to Steward), or not yet. */
export function AutosaveNote({ status, onSignIn, onRetry }: { status: AutosaveStatus; onSignIn: () => void; onRetry: () => void }) {
  if (status === "idle") return null;
  return (
    <div className="flex flex-col items-center justify-between gap-3 rounded-lg border border-[#b88a4a]/40 bg-[#b88a4a]/[0.06] px-4 py-3 text-sm sm:flex-row">
      {status === "saving" ? (
        <p className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Saving to your account…</p>
      ) : status === "saved" ? (
        <>
          <p className="flex items-center gap-2"><Check className="h-4 w-4 shrink-0 text-[#b88a4a]" /> Saved to your account. Steward can see these results.</p>
          <Button asChild size="sm" variant="outline" className="shrink-0">
            <Link href="/steward">Talk to Steward about them <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </>
      ) : status === "error" ? (
        <>
          <p className="text-muted-foreground">We couldn&rsquo;t save your results to your account.</p>
          <Button size="sm" variant="outline" className="shrink-0" onClick={onRetry}>Try again</Button>
        </>
      ) : (
        <>
          <p className="text-muted-foreground">Not saved yet. Sign in to keep these results.</p>
          <Button size="sm" className="shrink-0" onClick={onSignIn}>Save my results</Button>
        </>
      )}
    </div>
  );
}
