import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SITE_CONTENT_BOX } from "@/lib/public-site/content-box";

// Section one: what Steward is, before the demo shows it working.
//
// The page's running order is intro → demo → the Blueprint pitch, so this has
// to do its job in about fifty words: name the thing, say what it is for, and
// get out of the way of the animation underneath it.
//
// It carries the page's <h1>. The animation below has no heading of its own,
// and section three's "What Kind of Life Are You Actually Building?" is an
// <h2> — one h1 per page, and on this page it belongs to the product.
//
// Typeface is Fraunces (`font-serif` in the design system), per the brief.

export function StewardAgentIntro() {
  return (
    <section className="border-b">
      <div className={`${SITE_CONTENT_BOX} py-16 text-center md:py-20`}>
        <span className="inline-flex items-center gap-2 rounded-full border border-[#b88a4a]/40 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-[#b88a4a]">
          Steward AI Agent
        </span>

        <h1 className="mx-auto mt-6 max-w-4xl font-serif text-[clamp(2.1rem,5.2vw,4rem)] font-medium leading-[1.08]">
          A guide for the decisions you keep{" "}
          <em className="not-italic text-[#b88a4a]">putting off.</em>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-[17px] leading-relaxed text-muted-foreground">
          Steward is a personal AI guide, grounded in the Stewardship Blueprint.
        </p>

        <p className="mx-auto mt-4 max-w-2xl text-[16px] leading-relaxed text-muted-foreground">
          Say it out loud and be heard. Work a decision through with questions instead of answers.
          Or turn it into one step you&rsquo;ll actually take this week. Steward knows what
          you&rsquo;ve already decided you stand on&mdash;and it proposes the words rather than
          writing them. Nothing reaches your Blueprint until you approve it.
        </p>

        <div className="mt-8 mx-auto grid w-full max-w-[20rem] grid-cols-1 gap-3 sm:inline-grid sm:w-auto sm:max-w-none sm:grid-cols-2">
          <Link
            href="/steward"
            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#b88a4a] px-6 py-3 text-sm font-semibold text-white no-underline transition-colors hover:bg-[#a67c42]"
          >
            Talk to Steward <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/steward/pricing"
            className="inline-flex w-full items-center justify-center gap-2 rounded-md border px-6 py-3 text-sm font-semibold no-underline transition-colors hover:bg-muted"
          >
            Prices &amp; Plans
          </Link>
        </div>
      </div>
    </section>
  );
}

export default StewardAgentIntro;
