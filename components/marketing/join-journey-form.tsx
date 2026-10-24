"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Loader2 } from "lucide-react";
import type { JoinFormContent } from "@/lib/marketing/content/scopes/global";
import { SMS_OPT_IN_DISCLOSURE } from "@/lib/sms/constants";
import { cn } from "@/lib/utils";

// Join the Journey (home §10 and /join). Creates the participant and their
// account exactly as the old modal did, but records the consent the visitor
// actually gave: email is required to join, SMS is a separate, optional box
// that shows the approved A2P disclosure word for word, and the anonymous-
// feedback and follow-up permissions are optional boxes that start unticked.

/** Bump when the consent wording or the meaning of a box changes. Stored with every consent event. */
const CONSENT_VERSION = "join-2026-10-2";

export function JoinJourneyForm({
  content,
  source,
  tone = "dark",
  className,
}: {
  content: JoinFormContent;
  /** Where the signup came from, e.g. "homepage", "join-page". */
  source: string;
  tone?: "dark" | "light";
  className?: string;
}) {
  const [interests, setInterests] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const dark = tone === "dark";

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/public/join-journey", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          form_type: "join_the_journey",
          first_name: form.get("first_name"),
          last_name: form.get("last_name"),
          email: form.get("email"),
          phone: form.get("phone"),
          email_consent: form.get("email_consent") === "on",
          email_consent_text: content.emailConsent,
          sms_consent: form.get("sms_consent") === "on",
          anonymous_feedback_permission: form.get("feedback_consent") === "on",
          anonymous_feedback_permission_text: content.feedbackConsent,
          follow_up_permission: form.get("follow_up_consent") === "on",
          follow_up_permission_text: content.followUpConsent,
          interests: interests.map((id) => content.interests.find((i) => i.id === id)?.label ?? id),
          consent_version: CONSENT_VERSION,
          source,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) throw new Error(json.error || "Something went wrong. Please try again.");
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const field = cn(
    "h-12 w-full rounded-md border px-3.5 text-[15px] outline-none transition-colors focus:border-gold focus:ring-2 focus:ring-gold/30",
    dark ? "border-white/15 bg-white/[0.06] text-[#f4f1ea] placeholder:text-band-muted" : "border-input bg-background placeholder:text-muted-foreground",
  );
  const check = "mt-1 h-4 w-4 shrink-0 accent-[#b88a4a]";
  const small = dark ? "text-band-text" : "text-muted-foreground";

  if (done) {
    return (
      <div className={cn("text-center", className)} role="status">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gold text-white">
          <Check className="h-6 w-6" />
        </span>
        <p className="mt-4 font-display text-2xl">{content.successTitle}</p>
        <p className={cn("mx-auto mt-2 max-w-md text-[15px] leading-relaxed", small)}>{content.successBody}</p>
        {content.successCta.label ? (
          <Link
            href={content.successCta.href}
            className="mt-6 inline-flex h-12 items-center rounded-md bg-gold px-6 text-[15px] font-semibold text-white no-underline hover:bg-gold-hover"
          >
            {content.successCta.label}
          </Link>
        ) : null}
      </div>
    );
  }

  return (
    <form onSubmit={submit} className={cn("space-y-3", className)} noValidate={false}>
      <div className="grid gap-3 sm:grid-cols-2">
        <input name="first_name" required autoComplete="given-name" placeholder="First name" aria-label="First name" className={field} />
        <input name="last_name" required autoComplete="family-name" placeholder="Last name" aria-label="Last name" className={field} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <input name="email" type="email" required autoComplete="email" placeholder="Email address" aria-label="Email address" className={field} />
        <input name="phone" type="tel" required autoComplete="tel" placeholder="Mobile phone" aria-label="Mobile phone" className={field} />
      </div>

      {content.interests.length ? (
        <fieldset className="min-w-0 pt-1">
          <legend className={cn("mb-2 text-[13px]", small)}>{content.interestsLabel}</legend>
          {/* One row where the form column is wide enough (xl up); a tidy 2×2 below that. */}
          <div className="grid grid-cols-2 gap-1.5 xl:flex xl:flex-nowrap">
            {content.interests.map((i) => {
              const on = interests.includes(i.id);
              return (
                <button
                  key={i.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setInterests((v) => (on ? v.filter((x) => x !== i.id) : [...v, i.id]))}
                  className={cn(
                    "shrink-0 whitespace-nowrap rounded-full border px-3 py-1.5 text-[12.5px] font-medium transition-colors",
                    on
                      ? "border-gold bg-gold text-white"
                      : dark
                        ? "border-white/20 text-[#f4f1ea] hover:border-gold-light"
                        : "border-border hover:border-gold",
                  )}
                >
                  {i.label}
                </button>
              );
            })}
          </div>
        </fieldset>
      ) : null}

      <label className={cn("flex gap-3 pt-1 text-left text-[13px] leading-relaxed", small)}>
        <input type="checkbox" name="email_consent" required className={check} />
        <span>{content.emailConsent}</span>
      </label>
      <label className={cn("flex gap-3 text-left text-[13px] leading-relaxed", small)}>
        <input type="checkbox" name="sms_consent" className={check} />
        <span>
          <span className={dark ? "text-[#f4f1ea]" : "text-foreground"}>Optional: also send me occasional text messages.</span>{" "}
          {SMS_OPT_IN_DISCLOSURE}
        </span>
      </label>
      <label className={cn("flex gap-3 text-left text-[13px] leading-relaxed", small)}>
        <input type="checkbox" name="feedback_consent" className={check} />
        <span>{content.feedbackConsent}</span>
      </label>
      <label className={cn("flex gap-3 text-left text-[13px] leading-relaxed", small)}>
        <input type="checkbox" name="follow_up_consent" className={check} />
        <span>{content.followUpConsent}</span>
      </label>

      {error ? (
        <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive dark:text-red-300">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={busy}
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-gold px-6 text-[15px] font-semibold text-white transition-colors hover:bg-gold-hover disabled:opacity-70"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {content.submitLabel}
      </button>
      {content.finePrint ? (
        <p className={cn("text-center text-[12px] leading-relaxed", small)}>
          {content.finePrint}{" "}
          <Link href="/privacy" className="underline underline-offset-2">
            Privacy
          </Link>
        </p>
      ) : null}
    </form>
  );
}
