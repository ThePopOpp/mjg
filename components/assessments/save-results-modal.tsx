"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, Loader2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import type { AutosaveStatus } from "@/components/assessments/use-assessment-autosave";
import { STEWARD_HANDOFF_SECONDS, stewardHandoffHref } from "@/lib/assessments/steward-handoff";

/** Shown to signed-out visitors when their results appear. They save with their name
 *  and email first — the results are then on our server under that email, so a forgotten
 *  password or a different device can't lose them, and Steward finds them once they sign
 *  in with it. Signing in or registering here lands them in Steward, where
 *  PendingAssessmentClaimer (root layout) attaches the waiting results to the account. */
export function SaveResultsModal({
  open,
  onOpenChange,
  label,
  assessment,
  onSaveAsGuest,
  guestEmail,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  label: string;
  assessment: string;
  /** Resolves to an error message, or null once saved. */
  onSaveAsGuest: (name: string, email: string) => Promise<string | null>;
  guestEmail: string | null;
}) {
  const next = encodeURIComponent(stewardHandoffHref(assessment));
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setError(await onSaveAsGuest(name, email));
    setSaving(false);
  }

  const emailParam = guestEmail ? `&email=${encodeURIComponent(guestEmail)}` : "";
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md gap-0 p-0">
        <div className="space-y-3 px-6 pb-2 pt-6 text-center">
          <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#b88a4a]/15 text-[#b88a4a]">
            {guestEmail ? <Check className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
          </span>
          <DialogTitle className="text-pretty font-serif text-2xl">{guestEmail ? "Your results are saved" : "Save your results"}</DialogTitle>
          <DialogDescription className="mx-auto max-w-[22rem] text-pretty text-sm leading-6">
            {guestEmail ? (
              <>Saved under <strong className="text-foreground">{guestEmail}</strong>. Sign in or create a free account with that email to talk with Steward about them.</>
            ) : (
              <>Enter your name and email to keep your {label} results, so Steward can use them to guide your conversations.</>
            )}
          </DialogDescription>
        </div>
        {guestEmail ? null : (
          <form onSubmit={submit} className="space-y-3 px-6 pt-3">
            <div className="space-y-1.5 text-left">
              <Label htmlFor="save-results-name">Name</Label>
              <Input id="save-results-name" value={name} onChange={(e) => setName(e.target.value)} required autoComplete="name" />
            </div>
            <div className="space-y-1.5 text-left">
              <Label htmlFor="save-results-email">Email</Label>
              <Input id="save-results-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
            </div>
            {error ? <p className="rounded-md bg-destructive/10 p-2.5 text-sm text-destructive">{error}</p> : null}
            <Button type="submit" className="w-full" disabled={saving || !name.trim() || !email.trim()}>
              {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…</> : "Save my results"}
            </Button>
          </form>
        )}
        <div className="px-6 pb-4 pt-4">
          {guestEmail ? null : <p className="mb-2 text-center text-xs text-muted-foreground">Already have an account, or want one now?</p>}
          <div className="grid grid-cols-2 gap-3">
            <Button asChild variant={guestEmail ? "default" : "outline"} className="w-full">
              <Link href={`/register?next=${next}${emailParam}`}>Create account</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href={`/login?next=${next}${emailParam}`}>Sign in</Link>
            </Button>
          </div>
        </div>
        <div className="border-t px-6 py-3 text-center">
          <button type="button" onClick={() => onOpenChange(false)} className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
            {guestEmail ? "Back to my results" : "Continue without saving"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** Once saved, counts down and opens Steward about these results — once per page
 *  visit, so going back to review answers doesn't send them again. */
function useStewardHandoff(saved: boolean, assessment: string) {
  const router = useRouter();
  const href = stewardHandoffHref(assessment);
  const [left, setLeft] = useState<number | null>(null);
  const started = useRef(false);

  useEffect(() => {
    if (!saved || started.current) return;
    started.current = true;
    router.prefetch(href);
    setLeft(STEWARD_HANDOFF_SECONDS);
  }, [saved, href, router]);

  useEffect(() => {
    if (left === null) return;
    if (left <= 0) {
      router.push(href);
      return;
    }
    const t = setTimeout(() => setLeft((n) => (n === null ? null : n - 1)), 1000);
    return () => clearTimeout(t);
  }, [left, href, router]);

  return { href, left, stay: () => setLeft(null) };
}

/** One line under the results: saved to the account (then on to Steward), or not yet. */
export function AutosaveNote({ status, onSignIn, onRetry, assessment }: { status: AutosaveStatus; onSignIn: () => void; onRetry: () => void; assessment: string }) {
  const handoff = useStewardHandoff(status === "saved", assessment);
  if (status === "idle") return null;
  return (
    <div className="flex flex-col items-center justify-between gap-3 rounded-lg border border-[#b88a4a]/40 bg-[#b88a4a]/[0.06] px-4 py-3 text-sm sm:flex-row">
      {status === "saving" ? (
        <p className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Saving to your account…</p>
      ) : status === "saved" ? (
        <>
          <div className="space-y-1 text-center sm:text-left">
            <p className="flex items-center justify-center gap-2 sm:justify-start"><Check className="h-4 w-4 shrink-0 text-[#b88a4a]" /> Saved to your account. Steward can see these results.</p>
            {handoff.left !== null ? (
              <p className="text-muted-foreground" aria-live="polite">
                Taking you to Steward in {handoff.left}s ·{" "}
                <button type="button" onClick={handoff.stay} className="underline-offset-4 hover:text-foreground hover:underline">Stay on this page</button>
              </p>
            ) : null}
          </div>
          <Button asChild size="sm" variant={handoff.left !== null ? "default" : "outline"} className="shrink-0">
            <Link href={handoff.href}>Talk to Steward about them <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </>
      ) : status === "error" ? (
        <>
          <p className="text-muted-foreground">We couldn&rsquo;t save your results to your account.</p>
          <Button size="sm" variant="outline" className="shrink-0" onClick={onRetry}>Try again</Button>
        </>
      ) : status === "guest-saved" ? (
        <>
          <p className="flex items-center gap-2 text-muted-foreground"><Check className="h-4 w-4 shrink-0 text-[#b88a4a]" /> Saved under your email. Sign in to talk with Steward about them.</p>
          <Button size="sm" className="shrink-0" onClick={onSignIn}>Talk to Steward</Button>
        </>
      ) : (
        <>
          <p className="text-muted-foreground">Not saved yet. Add your name and email to keep these results.</p>
          <Button size="sm" className="shrink-0" onClick={onSignIn}>Save my results</Button>
        </>
      )}
    </div>
  );
}
