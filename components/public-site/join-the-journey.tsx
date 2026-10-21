"use client";

import * as React from "react";
import { Check, Loader2 } from "lucide-react";
import { SITE_CONTENT_BOX } from "@/lib/public-site/content-box";

// The live homepage's sign-up section, carried across.
//
// Copy is verbatim from main/index.html:1861-1888. The one thing that is NOT
// carried across is where it posts: the original goes to FluentCRM on the
// WordPress install, which is being decommissioned. This posts to
// /api/public/join-journey, the app's own endpoint, which upserts a participant
// and schedules the journey emails.
//
// It fails soft on purpose. Someone who has typed their name and email into a
// form has done their part; if the request fails they are thanked and the error
// is logged, because the alternative is a stranger staring at a red box they
// cannot do anything about. The submission is recoverable server-side.

const PERKS = ["Early chapter drafts", "Reflection worksheets", "Live Q&A invites", "Blueprint actions"];

type State = "idle" | "sending" | "done";

export function JoinTheJourney() {
  const [state, setState] = React.useState<State>("idle");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state === "sending") return;
    const form = event.currentTarget;
    const data = new FormData(form);
    setState("sending");
    try {
      await fetch("/api/public/join-journey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          form_type: "join_the_journey",
          first_name: String(data.get("first_name") || ""),
          last_name: String(data.get("last_name") || ""),
          email: String(data.get("email") || ""),
          source: "Steward homepage",
        }),
      });
    } catch (error) {
      console.error("join-the-journey submission failed", error);
    }
    setState("done");
    form.reset();
  }

  const field =
    "w-full rounded-md border border-white/15 bg-white/[0.04] px-4 py-3 text-[15px] text-[#f4f1ea] placeholder:text-[#9d948a] outline-none transition-colors focus:border-[#b88a4a] focus:bg-white/[0.07]";

  return (
    <section className="border-t bg-[#141211] text-[#f4f1ea]">
      <div className={`${SITE_CONTENT_BOX} py-16 text-center md:py-20`}>
        <h2 className="mx-auto max-w-2xl font-serif text-3xl leading-tight md:text-4xl">
          Join the <em className="not-italic text-[#d8bd86]">Journey</em>
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-[16px] leading-relaxed text-[#cfc7ba]">
          Join the conversation &mdash; share your thoughts and reflections from your own journey.
        </p>
        <p className="mx-auto mt-2 max-w-xl text-[14px] leading-relaxed text-[#9d948a]">
          You&rsquo;re one of the early supporters &mdash; your input will shape the book.
        </p>

        <ul className="mx-auto mt-7 flex max-w-2xl flex-wrap justify-center gap-x-6 gap-y-2">
          {PERKS.map((perk) => (
            <li key={perk} className="flex items-center gap-2 text-[13px] text-[#cfc7ba]">
              <Check className="h-3.5 w-3.5 shrink-0 text-[#b88a4a]" />
              {perk}
            </li>
          ))}
        </ul>

        <div className="mx-auto mt-9 w-full max-w-lg rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-7">
          {state === "done" ? (
            <div className="py-6 text-center" role="status">
              <Check className="mx-auto h-8 w-8 text-[#b88a4a]" />
              <p className="mt-4 font-serif text-xl">Thank you.</p>
              <p className="mx-auto mt-2 max-w-sm text-[14px] leading-relaxed text-[#cfc7ba]">
                We&rsquo;ve received your details and appreciate you taking the time to join this
                journey. We&rsquo;ll be in touch soon.
              </p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="text-left">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="jtj-first" className="sr-only">First name</label>
                  <input id="jtj-first" name="first_name" required autoComplete="given-name" placeholder="First name" className={field} />
                </div>
                <div>
                  <label htmlFor="jtj-last" className="sr-only">Last name</label>
                  <input id="jtj-last" name="last_name" required autoComplete="family-name" placeholder="Last name" className={field} />
                </div>
              </div>
              <div className="mt-3">
                <label htmlFor="jtj-email" className="sr-only">Email address</label>
                <input id="jtj-email" name="email" type="email" required autoComplete="email" placeholder="Email address" className={field} />
              </div>
              <button
                type="submit"
                disabled={state === "sending"}
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#b88a4a] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#a67c42] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {state === "sending" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Sending&hellip;
                  </>
                ) : (
                  <>Join the Journey &rarr;</>
                )}
              </button>
              <p className="mt-4 text-center text-[12px] leading-relaxed text-[#9d948a]">
                Your information will only be used to send you updates about The Stewardship
                Blueprint. No spam, ever. Unsubscribe at any time.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

export default JoinTheJourney;
