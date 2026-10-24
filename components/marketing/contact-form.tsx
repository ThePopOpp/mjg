"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Check, Loader2, Mail, MapPin, Phone } from "lucide-react";
import type { ContactContent } from "@/lib/marketing/content/scopes/page-contact";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MARKETING_FONT_VARS } from "@/lib/marketing/fonts";
import { cn } from "@/lib/utils";
import { Eyebrow, Heading, keepTogether } from "./primitives";

// /contact: the four topic cards and the form's Topic select are one value, so
// picking a card fills the select and vice versa. ?topic= preselects it
// (?topic=facilitator lands on Church or Group). Storing the message needs the
// visitor's consent (required box, as on the previous page); the updates box is
// optional and starts unchecked, so sending a message never subscribes anyone.

const ALIASES: Record<string, string> = { facilitator: "church", group: "church", account: "steward", speaking: "media" };

function topicFrom(param: string | null, topics: ContactContent["topics"]): string {
  const id = param ? (ALIASES[param.toLowerCase()] ?? param.toLowerCase()) : "";
  return topics.some((t) => t.id === id) ? id : (topics[0]?.id ?? "general");
}

export function ContactExperience({ content }: { content: ContactContent }) {
  return (
    // useSearchParams needs a Suspense boundary; the fallback is the same layout with the default topic.
    <Suspense fallback={<ContactInner content={content} param={null} />}>
      <ContactWithParams content={content} />
    </Suspense>
  );
}

function ContactWithParams({ content }: { content: ContactContent }) {
  const params = useSearchParams();
  return <ContactInner content={content} param={params.get("topic")} />;
}

function ContactInner({ content, param }: { content: ContactContent; param: string | null }) {
  const [topic, setTopic] = useState(() => topicFrom(param, content.topics));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => setTopic(topicFrom(param, content.topics)), [param, content.topics]);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const label = content.topics.find((t) => t.id === topic)?.label ?? topic;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/public/join-journey", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          form_type: "contact",
          first_name: form.get("first_name"),
          last_name: form.get("last_name"),
          full_name: [form.get("first_name"), form.get("last_name")].filter(Boolean).join(" "),
          email: form.get("email"),
          phone: form.get("phone"),
          topic,
          subject: label,
          organization: form.get("organization"),
          message: form.get("message"),
          marketing_opt_in: form.get("marketing_opt_in") === "on",
          marketing_opt_in_text: content.marketingOptIn,
          storage_consent: form.get("storage_consent") === "on",
          storage_consent_text: content.storageConsent,
          source: "contact-page",
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

  const field =
    "h-12 w-full rounded-md border border-input bg-background px-3.5 text-[15px] outline-none transition-colors placeholder:text-muted-foreground focus:border-gold focus:ring-2 focus:ring-gold/30";
  const labelCls = "mb-1.5 block text-[13px] font-semibold";

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_1.05fr] lg:gap-14">
      {/* Topics + separation note */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-gold-deep dark:text-gold-light">{content.topicsLabel}</p>
        <div role="radiogroup" aria-label={content.topicsLabel} className="mt-4 grid gap-3 sm:grid-cols-2">
          {content.topics.map((t) => {
            const on = t.id === topic;
            return (
              <button
                key={t.id}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => {
                  setTopic(t.id);
                  setDone(false);
                }}
                className={cn(
                  "rounded-xl border bg-card p-5 text-left transition-colors",
                  on ? "border-gold ring-1 ring-gold" : "hover:border-gold/60",
                )}
              >
                <span className="block font-display text-lg leading-snug">{t.label}</span>
                <span className="mt-1.5 block text-pretty text-[14px] leading-relaxed text-muted-foreground">{keepTogether(t.description)}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-8 rounded-xl border-l-4 border-gold bg-muted/60 p-5 sm:p-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-gold-deep dark:text-gold-light">{content.separationTitle}</p>
          <div className="mt-3 space-y-3 text-pretty text-[14px] leading-relaxed text-muted-foreground">
            {content.separationBody
              .split(/\n\s*\n/)
              .filter(Boolean)
              .map((p) => (
                <p key={p}>{p}</p>
              ))}
          </div>
        </div>

        <div className="mt-6 rounded-xl border bg-card p-5 sm:p-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-gold-deep dark:text-gold-light">{content.directLabel}</p>
          <ul className="mt-4 space-y-3 text-[15px]">
            {content.phone ? (
              <li className="flex items-start gap-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden />
                <a href={`tel:+1${content.phone.replace(/\D/g, "")}`} className="underline-offset-4 hover:underline">
                  {content.phone}
                </a>
              </li>
            ) : null}
            {/* Each inbox with what it is for: support first, then privacy requests. */}
            {[
              { address: content.email, label: content.emailLabel },
              { address: content.privacyEmail, label: content.privacyLabel },
            ]
              .filter((e) => e.address)
              .map((e) => (
                <li key={e.address} className="flex items-start gap-3">
                  <Mail className="mt-1 h-4 w-4 shrink-0 text-gold" aria-hidden />
                  <span className="min-w-0">
                    <a href={`mailto:${e.address}`} className="break-all underline-offset-4 hover:underline">
                      {e.address}
                    </a>
                    {e.label ? <span className="mt-0.5 block text-pretty text-[13.5px] leading-snug text-muted-foreground">{e.label}</span> : null}
                  </span>
                </li>
              ))}
            {content.address ? (
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden />
                <a href={content.mapUrl || undefined} target="_blank" rel="noopener noreferrer" className="whitespace-pre-line underline-offset-4 hover:underline">
                  {content.address}
                </a>
              </li>
            ) : null}
          </ul>
        </div>
      </div>

      {/* Form card */}
      <div className="rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
        {done ? (
          <div className="py-8 text-center" role="status">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gold text-white">
              <Check className="h-6 w-6" />
            </span>
            <p className="mt-4 font-display text-2xl">{content.successTitle}</p>
            <p className="mx-auto mt-2 max-w-sm text-pretty text-[15px] leading-relaxed text-muted-foreground">{content.successBody}</p>
            <button
              type="button"
              onClick={() => setDone(false)}
              className="mt-6 text-[15px] font-semibold text-gold-deep underline-offset-4 hover:underline dark:text-gold-light"
            >
              {content.resetLabel}
            </button>
          </div>
        ) : (
          <>
            <Eyebrow>{content.formEyebrow}</Eyebrow>
            <Heading title={content.formTitle} className="mt-3 text-[28px] sm:text-[32px]" />
            <form onSubmit={submit} className="mt-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="contact-first-name" className={labelCls}>
                    First name *
                  </label>
                  <input id="contact-first-name" name="first_name" required autoComplete="given-name" className={field} />
                </div>
                <div>
                  <label htmlFor="contact-last-name" className={labelCls}>
                    Last name
                  </label>
                  <input id="contact-last-name" name="last_name" autoComplete="family-name" className={field} />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="contact-email" className={labelCls}>
                    Email *
                  </label>
                  <input id="contact-email" name="email" type="email" required autoComplete="email" className={field} />
                </div>
                <div>
                  <label htmlFor="contact-phone" className={labelCls}>
                    Phone <span className="font-normal text-muted-foreground">(optional)</span>
                  </label>
                  <input id="contact-phone" name="phone" type="tel" autoComplete="tel" className={field} />
                </div>
              </div>
              <div>
                <label htmlFor="contact-topic" className={labelCls}>
                  Topic *
                </label>
                {/* The branded select (not the browser's), styled like the fields around it. Its
                    list renders in a portal outside the marketing layout, so it carries the fonts. */}
                <Select value={topic} onValueChange={setTopic}>
                  <SelectTrigger
                    id="contact-topic"
                    className="h-12 rounded-md border-input bg-background px-3.5 text-[15px] shadow-none focus:border-gold focus:ring-2 focus:ring-gold/30 focus:ring-offset-0 [&>svg]:opacity-70"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className={cn(MARKETING_FONT_VARS, "font-marketing")}>
                    {content.topics.map((t) => (
                      <SelectItem
                        key={t.id}
                        value={t.id}
                        className="py-2.5 text-[15px] focus:bg-[#b88a4a]/15 focus:text-foreground data-[state=checked]:font-semibold [&_svg]:text-gold"
                      >
                        {/* "General Question" → "General question", as in the mockup's select. */}
                        {t.label.charAt(0) + t.label.slice(1).toLowerCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label htmlFor="contact-organization" className={labelCls}>
                  Organization or Church <span className="font-normal text-muted-foreground">(optional)</span>
                </label>
                <input id="contact-organization" name="organization" autoComplete="organization" className={field} />
              </div>
              <div>
                <label htmlFor="contact-message" className={labelCls}>
                  Message *
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  required
                  rows={5}
                  className={cn(field, "h-auto min-h-[132px] resize-y py-3 leading-relaxed")}
                />
              </div>
              <label className="flex gap-3 text-left text-[13px] leading-relaxed text-muted-foreground">
                <input type="checkbox" name="storage_consent" required className="mt-1 h-4 w-4 shrink-0 accent-[#b88a4a]" />
                <span>{content.storageConsent} *</span>
              </label>
              <label className="flex gap-3 text-left text-[13px] leading-relaxed text-muted-foreground">
                <input type="checkbox" name="marketing_opt_in" className="mt-1 h-4 w-4 shrink-0 accent-[#b88a4a]" />
                <span>{content.marketingOptIn}</span>
              </label>

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
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {content.submitLabel}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
