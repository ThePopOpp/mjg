"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { readAttribution, trackEvent } from "@/components/analytics/site-analytics";
import { MARKETING_CONSENT_TEXT, THANK_YOU_PATH } from "@/lib/annual-retreat/config";

// Email (required), first name (optional) and the optional, unticked follow-up
// permission. Nothing else is collected. One attempt id per visit, so a retry
// after a network error is recognised by the server and never sends twice.

type Copy = { button: string; emailLabel: string; nameLabel: string; note: string; sending: string };

function newAttemptId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID().replaceAll("-", "") : `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`;
}

export function RetreatRequestForm({ copy, id = "request" }: { copy: Copy; id?: string }) {
  const router = useRouter();
  const attempt = useRef<string>("");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [optIn, setOptIn] = useState(false);
  const [busy, setBusy] = useState(false);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    attempt.current = newAttemptId();
  }, []);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (busy) return;
    const form = e.currentTarget;
    const local: Record<string, string> = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) local.email = "Please enter a valid email address.";
    setFields(local);
    setError(null);
    if (local.email) {
      form.querySelector<HTMLInputElement>(`#${id}-email`)?.focus();
      return;
    }
    if (!attempt.current) attempt.current = newAttemptId();
    setBusy(true);
    try {
      const res = await fetch("/api/public/annual-retreat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          firstName: firstName.trim(),
          marketingOptIn: optIn,
          website: (form.elements.namedItem("website") as HTMLInputElement | null)?.value ?? "",
          attemptId: attempt.current,
          pageUrl: window.location.pathname + window.location.search,
          attribution: readAttribution(),
        }),
      });
      const json = (await res.json().catch(() => ({}))) as { ok?: boolean; email?: string; fields?: Record<string, string>; error?: string };
      if (!res.ok || !json.ok) {
        if (json.fields) setFields(json.fields);
        setError(json.error ?? (json.fields ? null : "Something went wrong. Please try again."));
        setBusy(false);
        return;
      }
      trackEvent("retreat_request");
      if (optIn) trackEvent("retreat_optin");
      // Status only: no name or email ever goes in the URL.
      router.push(`${THANK_YOU_PATH}?email=${json.email === "sent" ? "sent" : "failed"}`);
    } catch {
      setError("We couldn't reach the server. Check your connection and try again; you won't receive the email twice.");
      setBusy(false);
    }
  };

  const input =
    "mt-1.5 block w-full rounded-lg border border-[#d9cfbd] bg-white px-3.5 py-3 text-[16px] text-[#111111] shadow-sm outline-none transition placeholder:text-[#8f958f] focus:border-[#b9975a] focus:ring-2 focus:ring-[#c9aa70]/40 dark:border-[#3a382f] dark:bg-[#191a17] dark:text-[#f3efe7]";

  return (
    <form id={id} onSubmit={submit} noValidate className="space-y-4" aria-describedby={`${id}-note`}>
      <div>
        <label htmlFor={`${id}-email`} className="text-sm font-semibold">
          {copy.emailLabel} <span aria-hidden className="text-[#9a7a45]">*</span>
        </label>
        <input
          id={`${id}-email`}
          type="email"
          name="email"
          autoComplete="email"
          inputMode="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={fields.email ? true : undefined}
          aria-describedby={fields.email ? `${id}-email-error` : undefined}
          className={input}
          maxLength={200}
        />
        {fields.email ? (
          <p id={`${id}-email-error`} className="mt-1.5 text-sm font-medium text-[#a12d2d] dark:text-[#f0a29b]">
            {fields.email}
          </p>
        ) : null}
      </div>
      <div>
        <label htmlFor={`${id}-name`} className="text-sm font-semibold">
          {copy.nameLabel}
        </label>
        <input
          id={`${id}-name`}
          type="text"
          name="firstName"
          autoComplete="given-name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          aria-invalid={fields.firstName ? true : undefined}
          className={input}
          maxLength={80}
        />
        {fields.firstName ? <p className="mt-1.5 text-sm font-medium text-[#a12d2d] dark:text-[#f0a29b]">{fields.firstName}</p> : null}
      </div>

      {/* Honeypot: hidden from people, tempting to bots. */}
      <div aria-hidden className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden">
        <label htmlFor={`${id}-website`}>Website</label>
        <input id={`${id}-website`} type="text" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <label htmlFor={`${id}-optin`} className="flex cursor-pointer items-start gap-3 rounded-lg border border-[#e6dcc9] bg-[#fffdf8] p-3.5 text-[14.5px] leading-snug dark:border-[#33312a] dark:bg-[#16170f]">
        <input
          id={`${id}-optin`}
          type="checkbox"
          checked={optIn}
          onChange={(e) => setOptIn(e.target.checked)}
          className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer rounded border-[#b9975a] accent-[#b9975a]"
        />
        <span>{MARKETING_CONSENT_TEXT}</span>
      </label>

      {error ? (
        <p role="alert" className="rounded-lg border border-[#ecc8c4] bg-[#fbeeec] px-3.5 py-2.5 text-sm text-[#8a2424] dark:border-[#5a2a27] dark:bg-[#2a1716] dark:text-[#f0b3ad]">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={busy}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#c9aa70] px-6 py-3.5 text-[16px] font-semibold text-[#10110f] shadow-sm transition hover:bg-[#b9975a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10110f] focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-80 dark:focus-visible:ring-[#e2ca9a] dark:focus-visible:ring-offset-[#10110f]"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden /> : null}
        {busy ? copy.sending : copy.button}
      </button>

      <p id={`${id}-note`} className="text-[13.5px] text-[#5f6d66] dark:text-[#a7b0aa]">
        {copy.note.replace(/See our Privacy Policy\.?$/, "")}
        {/Privacy Policy/.test(copy.note) ? (
          <>
            See our{" "}
            <Link href="/privacy" className="font-medium text-[#111111] underline underline-offset-2 dark:text-[#f3efe7]">
              Privacy Policy
            </Link>
            .
          </>
        ) : null}
      </p>
    </form>
  );
}
