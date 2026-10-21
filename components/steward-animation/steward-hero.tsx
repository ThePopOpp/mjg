"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

// The hero: the live three.js layer, with the page's opening words over it.
//
// `ssr: false` because the scene touches window, matchMedia and a canvas. The
// headline is NOT inside the dynamic import — it renders server-side with the
// rest of the page, so the first paint has the words and the animation arrives
// behind them. The reverse would mean a hero that is briefly empty, which is
// the worst version of this.
const StewardHeroScene = dynamic(
  () => import("./steward-hero-scene").then((m) => m.StewardHeroScene),
  { ssr: false },
);

export function StewardHero() {
  return (
    <section className="relative isolate overflow-hidden border-b bg-[#141211] text-[#f4f1ea]">
      {/* The animation sits behind everything and is decorative. */}
      <StewardHeroScene className="pointer-events-none absolute inset-0" energy={0.35} />

      {/* A floor under the text so it stays readable over the brightest part of
          the particle field, in both themes. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 40%, rgba(20,18,17,0.35) 0%, rgba(20,18,17,0.62) 55%, rgba(20,18,17,0.92) 100%)",
        }}
      />

      <div className="relative mx-auto w-full max-w-[1160px] px-8 pb-28 pt-20 text-center md:pb-36 md:pt-24">
        <span className="inline-flex items-center gap-2 rounded-full border border-[#b88a4a]/50 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-[#d8bd86]">
          <span aria-hidden>✦</span> You were created for more
        </span>

        <h1 className="mx-auto mt-7 max-w-4xl font-serif text-[clamp(2.4rem,6vw,4.5rem)] leading-[1.08]">
          What kind of life are you{" "}
          <em className="not-italic text-[#d8bd86]">actually building?</em>
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-[17px] leading-relaxed text-[#cfc7ba]">
          Most people don&rsquo;t drift on purpose. Life simply gets full. Steward is a personal
          guide for designing and living a life that matters — and keeping it honest.
        </p>

        <div className="mt-9 mx-auto grid w-full max-w-[20rem] grid-cols-1 gap-3 sm:inline-grid sm:w-auto sm:max-w-none sm:grid-cols-2">
          <Link
            href="/steward"
            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#b88a4a] px-6 py-3 text-sm font-semibold text-white no-underline transition-colors hover:bg-[#a67c42]"
          >
            Talk to Steward <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/created-for-more-check-in"
            className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-white/25 px-6 py-3 text-sm font-semibold text-[#f4f1ea] no-underline transition-colors hover:bg-white/10"
          >
            Take the Check-In
          </Link>
        </div>

        <p className="mt-10 text-[12.5px] text-[#9d948a]">
          Michael J. Gauthier · Life Design · Stewardship · Faith
        </p>
      </div>
    </section>
  );
}

export default StewardHero;
