"use client";

// The three registered blocks that need browser behaviour: tabbed panels and the
// two forms. Everything else in the registry renders on the server with no
// client JavaScript at all (spec §59).
//
// The forms post to /api/public/join-journey, the endpoint the marketing site
// already uses, so submissions land in Form Submissions alongside every other
// public form. Blocks never define their own fields or destinations (spec §53).

import * as React from "react";
import { cn } from "@/lib/utils";
import { RichText, Section, SectionHeader, asItems, text, type SectionProps } from "./section";

export function TabsBlock({ props }: { props: Record<string, unknown> }) {
  const items = asItems(props.items).filter((i) => text(i.label).trim());
  const [active, setActive] = React.useState(0);
  if (!items.length) return null;
  const centered = (props.align ?? "left") === "center";

  return (
    <Section block={props as SectionProps}>
      <SectionHeader title={text(props.title)} centered={centered} />
      <div className={cn("mt-8", centered && "text-left")}>
        <div role="tablist" aria-label={text(props.title) || "Sections"} className="flex flex-wrap gap-2 border-b border-border">
          {items.map((item, i) => (
            <button
              key={i}
              role="tab"
              type="button"
              id={`tab-${i}`}
              aria-selected={active === i}
              aria-controls={`tabpanel-${i}`}
              onClick={() => setActive(i)}
              className={cn(
                "-mb-px rounded-t-md px-4 py-2.5 text-sm font-semibold transition-colors",
                active === i
                  ? "border-b-2 border-[#b88a4a] text-[#b88a4a]"
                  : "border-b-2 border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {text(item.label)}
            </button>
          ))}
        </div>
        {items.map((item, i) => (
          <div key={i} role="tabpanel" id={`tabpanel-${i}`} aria-labelledby={`tab-${i}`} hidden={active !== i} className="pt-6">
            <RichText content={text(item.content)} />
          </div>
        ))}
      </div>
    </Section>
  );
}

type FormState = "idle" | "sending" | "sent" | "error";

function useFormPost(formType: string) {
  const [state, setState] = React.useState<FormState>("idle");
  const [error, setError] = React.useState("");

  const submit = React.useCallback(
    async (payload: Record<string, string>) => {
      setState("sending");
      setError("");
      try {
        const res = await fetch("/api/public/join-journey", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, form_type: formType }),
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok || body?.ok === false) throw new Error(body?.error || "Something went wrong. Please try again.");
        setState("sent");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
        setState("error");
      }
    },
    [formType],
  );

  return { state, error, submit };
}

const FIELD =
  "h-11 w-full rounded-md border border-input bg-background px-3 text-[15px] outline-none focus-visible:ring-2 focus-visible:ring-[#b88a4a]";

export function ContactFormBlock({ props }: { props: Record<string, unknown> }) {
  const { state, error, submit } = useFormPost("website_contact");
  const centered = (props.align ?? "left") === "center";
  const successMessage = text(props.successMessage) || "Thank you — your message is on its way.";

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    await submit({
      first_name: String(data.get("first_name") ?? ""),
      last_name: String(data.get("last_name") ?? ""),
      email: String(data.get("email") ?? ""),
      phone: String(data.get("phone") ?? ""),
      message: String(data.get("message") ?? ""),
    });
  }

  return (
    <Section block={props as SectionProps}>
      <SectionHeader title={text(props.title)} description={text(props.description)} centered={centered} />
      <div className={cn("mt-8 max-w-xl", centered && "mx-auto text-left")}>
        {state === "sent" ? (
          <p role="status" className="rounded-lg border border-[#b88a4a]/40 bg-[#b88a4a]/10 px-4 py-3 text-[15px]">
            {successMessage}
          </p>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="cf-first" className="mb-1.5 block text-sm font-medium">First name</label>
                <input id="cf-first" name="first_name" required autoComplete="given-name" className={FIELD} />
              </div>
              <div>
                <label htmlFor="cf-last" className="mb-1.5 block text-sm font-medium">Last name</label>
                <input id="cf-last" name="last_name" required autoComplete="family-name" className={FIELD} />
              </div>
            </div>
            <div>
              <label htmlFor="cf-email" className="mb-1.5 block text-sm font-medium">Email</label>
              <input id="cf-email" name="email" type="email" required autoComplete="email" className={FIELD} />
            </div>
            <div>
              <label htmlFor="cf-phone" className="mb-1.5 block text-sm font-medium">Phone <span className="font-normal text-muted-foreground">(optional)</span></label>
              <input id="cf-phone" name="phone" type="tel" autoComplete="tel" className={FIELD} />
            </div>
            <div>
              <label htmlFor="cf-message" className="mb-1.5 block text-sm font-medium">Message</label>
              <textarea id="cf-message" name="message" required rows={5} className={cn(FIELD, "h-auto py-2.5")} />
            </div>
            {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
            <button
              type="submit"
              disabled={state === "sending"}
              className="inline-flex h-12 items-center rounded-md bg-[#b88a4a] px-6 text-base font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {state === "sending" ? "Sending…" : text(props.submitLabel) || "Send message"}
            </button>
          </form>
        )}
      </div>
    </Section>
  );
}

export function NewsletterBlock({ props }: { props: Record<string, unknown> }) {
  const { state, error, submit } = useFormPost("website_newsletter");
  const centered = (props.align ?? "left") === "center";

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    await submit({
      first_name: String(data.get("first_name") ?? ""),
      email: String(data.get("email") ?? ""),
    });
  }

  return (
    <Section block={props as SectionProps}>
      <SectionHeader title={text(props.title)} description={text(props.description)} centered={centered} />
      <div className={cn("mt-6 max-w-xl", centered && "mx-auto")}>
        {state === "sent" ? (
          <p role="status" className="rounded-lg border border-[#b88a4a]/40 bg-[#b88a4a]/10 px-4 py-3 text-[15px]">
            You&rsquo;re on the list — thank you.
          </p>
        ) : (
          <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row">
            <div className="sr-only-wrap flex-1">
              <label htmlFor="nl-first" className="sr-only">First name</label>
              <input id="nl-first" name="first_name" placeholder="First name" autoComplete="given-name" className={FIELD} />
            </div>
            <div className="flex-1">
              <label htmlFor="nl-email" className="sr-only">Email address</label>
              <input id="nl-email" name="email" type="email" required placeholder="Email address" autoComplete="email" className={FIELD} />
            </div>
            <button
              type="submit"
              disabled={state === "sending"}
              className="inline-flex h-11 shrink-0 items-center justify-center rounded-md bg-[#b88a4a] px-6 text-[15px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {state === "sending" ? "Sending…" : text(props.submitLabel) || "Keep me posted"}
            </button>
          </form>
        )}
        {error ? <p role="alert" className="mt-2 text-sm text-destructive">{error}</p> : null}
        {text(props.consentNote) ? <p className="mt-3 text-xs text-muted-foreground">{text(props.consentNote)}</p> : null}
      </div>
    </Section>
  );
}
