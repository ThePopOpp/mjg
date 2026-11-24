"use client";

// Interactive pieces of /speaking (components/marketing/pages/speaking.tsx):
// the click-to-play interview, buttons that report a cta_click, and the
// invitation form. Analytics follow the brief: page view (automatic), video
// play, hero CTA clicks and form_success — a submit only counts once the server
// has stored it.

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { readAttribution, trackEvent } from "@/components/analytics/site-analytics";
import type { Cta, MediaValue } from "@/lib/marketing/content/kit";
import type { SpeakingInquiryContent } from "@/lib/marketing/content/scopes/page-speaking";
import { cn } from "@/lib/utils";
import { buttonClass, type ButtonVariant } from "./primitives";
import { ClickToPlay } from "./video";

export function SpeakingVideo({ embed, poster, label }: { embed: string; poster: MediaValue; label: string }) {
  return <ClickToPlay embed={embed} poster={poster} label={label} ratio="16/9" onPlay={() => trackEvent("video_play")} className="shadow-[0_30px_90px_rgba(0,0,0,0.25)]" />;
}

/** An in-page anchor button (#invite, #watch) that records a cta_click. */
export function TrackedButton({ cta, variant = "primary" }: { cta: Cta; variant?: ButtonVariant }) {
  if (!cta?.label || !cta.href) return null;
  return (
    <a href={cta.href} onClick={() => trackEvent("cta_click")} className={buttonClass(variant)}>
      {cta.label}
    </a>
  );
}

const field =
  "h-12 w-full rounded-md border border-input bg-background px-3.5 text-[15px] outline-none transition-colors placeholder:text-muted-foreground focus:border-gold focus:ring-2 focus:ring-gold/30 aria-[invalid=true]:border-destructive";
const labelCls = "mb-1.5 block text-[13px] font-semibold";
const optional = <span className="font-normal text-muted-foreground">(optional)</span>;

type Errors = Partial<Record<string, string>>;

export function SpeakingInquiryForm({ content }: { content: SpeakingInquiryContent }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const typeId = String(form.get("invitation_type") ?? "");
    setBusy(true);
    setError(null);
    setErrors({});
    try {
      const res = await fetch("/api/public/speaking-inquiry", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          email: form.get("email"),
          organization: form.get("organization"),
          invitation_type: typeId,
          invitation_type_label: content.invitationTypes.find((t) => t.id === typeId)?.label ?? typeId,
          message: form.get("message"),
          website: form.get("org_website"),
          timeframe: form.get("timeframe"),
          location: form.get("location"),
          audience_size: form.get("audience_size"),
          phone: form.get("phone"),
          consent: form.get("consent") === "on",
          consent_text: content.consent,
          marketing_opt_in: form.get("marketing_opt_in") === "on",
          marketing_opt_in_text: content.marketingOptIn,
          // Honeypot: real people never see or fill this.
          company_url: form.get("company_url"),
          page_url: window.location.href,
          referrer: document.referrer || null,
          attribution: readAttribution(),
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) {
        if (json.fields) setErrors(json.fields as Errors);
        throw new Error(json.error || "Something went wrong. Please try again.");
      }
      trackEvent("form_success");
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-2xl border bg-card px-6 py-12 text-center shadow-sm sm:px-10" role="status">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gold text-white">
          <Check className="h-6 w-6" aria-hidden />
        </span>
        <p className="mt-4 font-display text-2xl">{content.successTitle}</p>
        <p className="mx-auto mt-2 max-w-md text-pretty text-[15px] leading-relaxed text-muted-foreground">{content.successBody}</p>
      </div>
    );
  }

  const err = (name: string) =>
    errors[name] ? (
      <p id={`speak-${name}-error`} className="mt-1.5 text-[13px] text-destructive dark:text-red-300">
        {errors[name]}
      </p>
    ) : null;
  const invalid = (name: string) => (errors[name] ? { "aria-invalid": true, "aria-describedby": `speak-${name}-error` } : {});

  return (
    <form onSubmit={submit} className="relative space-y-4 rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="speak-name" className={labelCls}>
            Your Name *
          </label>
          <input id="speak-name" name="name" required maxLength={120} autoComplete="name" className={field} {...invalid("name")} />
          {err("name")}
        </div>
        <div>
          <label htmlFor="speak-email" className={labelCls}>
            Email Address *
          </label>
          <input id="speak-email" name="email" type="email" required maxLength={200} autoComplete="email" className={field} {...invalid("email")} />
          {err("email")}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="speak-organization" className={labelCls}>
            Organization or Podcast Name *
          </label>
          <input id="speak-organization" name="organization" required maxLength={160} autoComplete="organization" className={field} {...invalid("organization")} />
          {err("organization")}
        </div>
        <div>
          <label htmlFor="speak-type" className={labelCls}>
            Invitation Type *
          </label>
          <select id="speak-type" name="invitation_type" required defaultValue="" className={cn(field, "appearance-auto")} {...invalid("invitation_type")}>
            <option value="" disabled>
              Choose one…
            </option>
            {content.invitationTypes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
          {err("invitation_type")}
        </div>
      </div>
      <div>
        <label htmlFor="speak-message" className={labelCls}>
          Tell Me About Your Audience and the Conversation You Envision *
        </label>
        <textarea
          id="speak-message"
          name="message"
          required
          rows={5}
          maxLength={4000}
          className={cn(field, "h-auto min-h-[132px] resize-y py-3 leading-relaxed")}
          {...invalid("message")}
        />
        {err("message")}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="speak-website" className={labelCls}>
            Organization / Podcast Website {optional}
          </label>
          <input id="speak-website" name="org_website" inputMode="url" maxLength={300} placeholder="https://" className={field} {...invalid("website")} />
          {err("website")}
        </div>
        <div>
          <label htmlFor="speak-timeframe" className={labelCls}>
            Preferred Date or Timeframe {optional}
          </label>
          <input id="speak-timeframe" name="timeframe" maxLength={160} className={field} />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="speak-location" className={labelCls}>
            Location / Virtual Format {optional}
          </label>
          <input id="speak-location" name="location" maxLength={160} className={field} />
        </div>
        <div>
          <label htmlFor="speak-audience" className={labelCls}>
            Estimated Audience Size {optional}
          </label>
          <input id="speak-audience" name="audience_size" maxLength={60} className={field} />
        </div>
      </div>
      <div className="sm:w-1/2 sm:pr-2">
        <label htmlFor="speak-phone" className={labelCls}>
          Phone Number {optional}
        </label>
        <input id="speak-phone" name="phone" type="tel" maxLength={40} autoComplete="tel" className={field} />
      </div>

      {/* Honeypot, hidden from people and assistive tech. */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="speak-company-url">Company URL</label>
        <input id="speak-company-url" name="company_url" tabIndex={-1} autoComplete="off" />
      </div>

      <label className="flex gap-3 pt-1 text-left text-[13px] leading-relaxed text-muted-foreground">
        <input type="checkbox" name="consent" required className="mt-1 h-4 w-4 shrink-0 accent-[#b88a4a]" />
        <span>
          {content.consent}{" "}
          <a href="/privacy" target="_blank" className="font-medium text-gold-deep underline underline-offset-4 dark:text-gold-light">
            Privacy Policy
          </a>{" "}
          *
        </span>
      </label>
      {err("consent")}
      {content.marketingOptIn ? (
        <label className="flex gap-3 text-left text-[13px] leading-relaxed text-muted-foreground">
          <input type="checkbox" name="marketing_opt_in" className="mt-1 h-4 w-4 shrink-0 accent-[#b88a4a]" />
          <span>{content.marketingOptIn}</span>
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
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-gold px-6 text-[15px] font-semibold text-white transition-colors hover:bg-gold-hover disabled:opacity-60"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
        {content.submitLabel}
      </button>
    </form>
  );
}
