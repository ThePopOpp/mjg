import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SITE_CONTENT_BOX } from "@/components/public-site/site-shell";

// The live homepage's opening section, carried across.
//
// Copy is verbatim from main/index.html:1605-1610 — this is the positioning
// that is already working, and a review page is the wrong place to quietly
// rewrite it.
//
// The one deliberate change is the media: the live page opens with an audio
// player, and this has the video in its place. It sits directly under the
// Steward demo, so the page runs show → tell → detail.

const VIMEO_ID = "1237401025";
const VIMEO_HASH = "c37d5b82d1";

export function StewardHomepageLead() {
  return (
    <section className="border-b">
      <div className={`${SITE_CONTENT_BOX} py-16 text-center md:py-20`}>
        <span className="inline-flex items-center gap-2 rounded-full border border-[#b88a4a]/40 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-[#b88a4a]">
          You Were Created For More
        </span>

        <h1 className="mx-auto mt-6 max-w-4xl font-serif text-[clamp(2.1rem,5.2vw,4rem)] font-medium leading-[1.08]">
          What Kind of Life Are You{" "}
          <em className="not-italic text-[#b88a4a]">Actually Building?</em>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-[17px] leading-relaxed text-muted-foreground">
          Most people don&rsquo;t intentionally drift. Life simply gets full.
        </p>
        <p className="mx-auto mt-4 max-w-2xl text-[16px] leading-relaxed text-muted-foreground">
          Stewardship Blueprint is a whole-life framework designed to help you stop drifting and
          faithfully steward what God has entrusted to you&mdash;your faith, relationships, health,
          joy, resources, habits, energy, influence, and legacy.
        </p>

        <div className="mt-8 mx-auto grid w-full max-w-[20rem] grid-cols-1 gap-3 sm:inline-grid sm:w-auto sm:max-w-none sm:grid-cols-2">
          <Link
            href="/created-for-more-check-in"
            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-foreground px-6 py-3 text-sm font-semibold text-background no-underline transition-opacity hover:opacity-90"
          >
            Take the Created for More Check-In
          </Link>
          <Link
            href="/steward"
            className="inline-flex w-full items-center justify-center gap-2 rounded-md border px-6 py-3 text-sm font-semibold no-underline transition-colors hover:bg-muted"
          >
            Talk to Steward <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <p className="mt-14 text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
          The Stewardship Blueprint
        </p>

        {/* 16:9 by aspect-ratio rather than the old padding-top trick, and
            `loading="lazy"` so Vimeo's player is not fetched for someone who
            never scrolls this far. */}
        <div className="mx-auto mt-5 w-full max-w-3xl overflow-hidden rounded-xl border bg-black shadow-sm">
          <iframe
            src={`https://player.vimeo.com/video/${VIMEO_ID}?h=${VIMEO_HASH}&title=0&byline=0&portrait=0&dnt=1`}
            title="The Stewardship Blueprint"
            loading="lazy"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            className="aspect-video h-auto w-full border-0"
          />
        </div>

        <p className="mt-6 text-[13px] text-muted-foreground">
          By Michael J. Gauthier &middot; Life Design &middot; Stewardship &middot; Faith
        </p>
      </div>
    </section>
  );
}

export default StewardHomepageLead;
