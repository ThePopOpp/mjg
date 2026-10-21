"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AUTHORED_TOTAL } from "./steward-script";
import { StewardStage } from "./steward-stage";

// Option one: the demo plays itself.
//
// The composition is driven by a looping wall clock — 0 → 37s → 0, forever — so
// someone who lands here and does nothing still sees Steward listen, think,
// propose wording and have it approved. That sequence is the entire pitch.
//
// WHY THE DEMO IS IN A FRAME AND NOT BEHIND THE HEADLINE
// -----------------------------------------------------
// The composition is a whole application, navigation bar included. Run it
// full-bleed under a marketing headline and the page has two navigation bars,
// one real and one painted, about sixty pixels apart — and the headline lands
// on top of the conversation it is supposed to be showing off. Framing it as a
// product panel says "this is the thing" instead of "this is the page", and the
// panel's background is the hero's background, so the frame reads as a window
// rather than a box pasted on.
//
// Three things the loop does on purpose:
//   - Pauses off-screen and in a background tab. This re-renders a React tree
//     and uploads 700 particle positions sixty times a second; doing that
//     behind another tab is a fan-noise complaint.
//   - Accumulates its own elapsed time rather than reading the clock, so a
//     paused interval is not replayed as a jump on resume.
//   - Renders a still frame, with no loop and no WebGL context, when the
//     operating system has been asked for reduced motion.

/** The frame to hold still on: just after approval, when the wording has been written. */
const STILL_AT = 34.6;

export function StewardHeroAutoplay() {
  const hostRef = React.useRef<HTMLDivElement>(null);
  const [reduced, setReduced] = React.useState<boolean | null>(null);
  const [t, setT] = React.useState(0);

  React.useEffect(() => {
    const q = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(q.matches);
    const on = (e: MediaQueryListEvent) => setReduced(e.matches);
    q.addEventListener("change", on);
    return () => q.removeEventListener("change", on);
  }, []);

  React.useEffect(() => {
    if (reduced !== false) return;
    const host = hostRef.current;
    if (!host) return;

    let frame = 0;
    let elapsed = 0;
    let last = performance.now();
    let onScreen = true;
    let visible = true;

    const tick = (now: number) => {
      // Capped so a long pause, or one slow frame, advances at most 100ms.
      elapsed += Math.min((now - last) / 1000, 0.1);
      last = now;
      setT(elapsed % AUTHORED_TOTAL);
      frame = requestAnimationFrame(tick);
    };
    const start = () => {
      if (frame) return;
      last = performance.now();
      frame = requestAnimationFrame(tick);
    };
    const stop = () => {
      if (!frame) return;
      cancelAnimationFrame(frame);
      frame = 0;
    };
    const sync = () => (onScreen && visible ? start() : stop());

    const io = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        sync();
      },
      { threshold: 0 },
    );
    io.observe(host);

    const onVis = () => {
      visible = document.visibilityState === "visible";
      sync();
    };
    document.addEventListener("visibilitychange", onVis);

    sync();
    return () => {
      stop();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [reduced]);

  return (
    <section ref={hostRef} className="relative isolate overflow-hidden border-b bg-[#141211] text-[#f4f1ea]">
      {/* A gold bloom behind the panel, so it sits in light rather than on a flat field. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[70%]"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 20%, rgba(184,138,74,0.16) 0%, rgba(184,138,74,0.05) 45%, rgba(0,0,0,0) 72%)",
        }}
      />

      <div className="relative mx-auto w-full max-w-[1160px] px-6 pb-0 pt-14 md:px-8 md:pt-20">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#b88a4a]/50 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-[#d8bd86]">
            <span aria-hidden>✦</span> You were created for more
          </span>

          <h1 className="mx-auto mt-6 max-w-3xl font-serif text-[clamp(2.1rem,5.2vw,4rem)] leading-[1.08]">
            What kind of life are you{" "}
            <em className="not-italic text-[#d8bd86]">actually building?</em>
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-[16px] leading-relaxed text-[#cfc7ba] md:text-[17px]">
            Steward listens, helps you think it through, and proposes the words. You decide what
            goes in your Blueprint.
          </p>

          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              href="/steward"
              className="inline-flex items-center gap-2 rounded-md bg-[#b88a4a] px-6 py-3 text-sm font-semibold text-white no-underline transition-colors hover:bg-[#a67c42]"
            >
              Talk to Steward <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/created-for-more-check-in"
              className="inline-flex items-center gap-2 rounded-md border border-white/25 px-6 py-3 text-sm font-semibold text-[#f4f1ea] no-underline transition-colors hover:bg-white/10"
            >
              Take the Check-In
            </Link>
          </div>
        </div>

        {/* The product panel.
            Portrait on phones and landscape from `md` up — the stage reads its
            container's shape and renders the phone or the desktop composition
            to match, so this one rule picks the right one. */}
        <div className="relative mt-12 md:mt-16">
          <div className="overflow-hidden rounded-t-2xl border border-white/[0.08] shadow-[0_-1px_0_rgba(255,255,255,0.06),0_30px_80px_-20px_rgba(0,0,0,0.8)]">
            {reduced === null ? (
              <div className="aspect-[9/16] w-full bg-[#141211] md:aspect-[16/9]" />
            ) : (
              <StewardStage
                className="aspect-[9/16] w-full md:aspect-[16/9]"
                t={reduced ? STILL_AT : t}
                particles={!reduced}
                tilt={!reduced}
              />
            )}
          </div>

          {/* The panel runs off the bottom of the section into the next one,
              which is what keeps it from looking like a boxed screenshot. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-14 md:h-24"
            style={{ background: "linear-gradient(to bottom, rgba(20,18,17,0) 0%, #141211 100%)" }}
          />
        </div>
      </div>
    </section>
  );
}

export default StewardHeroAutoplay;
