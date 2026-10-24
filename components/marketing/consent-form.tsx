"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Loader2 } from "lucide-react";
import { CONSENT_COPY, type ConsentKind, type ConsentMode } from "@/lib/public-site/consent";

// The SMS / email opt-in and opt-out form. Posts to /api/public/<kind>/<mode>
// with { phone | email, firstName? }, exactly as the previous HTML page did.

const FIELD =
  "h-12 w-full rounded-md border border-input bg-background px-3.5 text-[15px] outline-none transition-colors placeholder:text-muted-foreground focus:border-gold focus:ring-2 focus:ring-gold/30";
const LABEL = "mb-1.5 block text-[13px] font-semibold";
const LINK = "text-gold-deep underline underline-offset-2 dark:text-gold-light";

export function ConsentForm({ kind, mode }: { kind: ConsentKind; mode: ConsentMode }) {
  const copy = CONSENT_COPY[kind][mode];
  const isOptIn = mode === "opt-in";
  const isSms = kind === "sms";
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload: Record<string, string> = { [isSms ? "phone" : "email"]: String(form.get("contact") ?? "").trim() };
    if (isOptIn) payload.firstName = String(form.get("firstName") ?? "").trim();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/public/${kind}/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Something went wrong. Please try again.");
      setDone(true);
    } catch (err) {
      setError(err instanceof TypeError ? "Network error. Please try again." : err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="py-3 text-center" role="status">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border-2 border-gold text-gold">
          <Check className="h-6 w-6" />
        </span>
        <p className="mt-4 font-display text-2xl">{copy.successTitle}</p>
        <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{copy.successBody}</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {isOptIn ? (
        <div>
          <label htmlFor="firstName" className={LABEL}>
            First name <span className="font-normal text-muted-foreground">(optional)</span>
          </label>
          <input id="firstName" name="firstName" type="text" autoComplete="given-name" placeholder="Your first name" className={FIELD} />
        </div>
      ) : null}
      <div>
        <label htmlFor="contact" className={LABEL}>
          {isSms ? "Mobile number" : "Email address"}
        </label>
        <input
          id="contact"
          name="contact"
          type={isSms ? "tel" : "email"}
          required
          autoComplete={isSms ? "tel" : "email"}
          placeholder={isSms ? "+1 (555) 000-0000" : "you@example.com"}
          className={FIELD}
        />
      </div>

      {/* A2P 10DLC disclosure. Wording is deliberate — see lib/public-site/consent.ts. */}
      {isOptIn ? (
        <label className="flex gap-3 pt-1 text-left text-[13px] leading-relaxed text-muted-foreground">
          <input type="checkbox" required className="mt-1 h-4 w-4 shrink-0 accent-[#b88a4a]" />
          <span>
            {isSms ? (
              <>
                I agree to receive text messages from <strong className="text-foreground">Michael J. Gauthier</strong> (Created for More) at the number
                provided, including messages sent by an automatic telephone dialing system. Consent is not a condition of any purchase. Message
                frequency varies. Msg &amp; data rates may apply. Reply <strong className="text-foreground">STOP</strong> to unsubscribe or{" "}
                <strong className="text-foreground">HELP</strong> for help.
              </>
            ) : (
              <>
                I agree to receive emails from <strong className="text-foreground">Michael J. Gauthier</strong> (Created for More) at the address
                provided. Email frequency varies, and I can unsubscribe at any time using the link in any message.
              </>
            )}{" "}
            See our{" "}
            <Link href="/privacy" className={LINK}>
              Privacy Policy
            </Link>{" "}
            and{" "}
            <Link href="/terms" className={LINK}>
              Terms of Service
            </Link>
            .
          </span>
        </label>
      ) : null}

      {error ? (
        <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive dark:text-red-300">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={busy}
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-foreground px-6 text-[15px] font-semibold text-background transition-opacity hover:opacity-90 disabled:opacity-55"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {busy ? "Working…" : copy.submit}
      </button>
    </form>
  );
}
