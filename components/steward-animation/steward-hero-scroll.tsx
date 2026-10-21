"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";
import { AUTHORED_TOTAL } from "./steward-script";
import { StewardStage } from "./steward-stage";
import { clamp } from "./motion";

// Option two: the scrollbar is the playhead.
//
// A tall section with a pinned viewport inside it. How far you have scrolled
// through that section IS the time in the composition, so scrolling down plays
// the demo and scrolling up rewinds it, frame for frame, to wherever you stop.
// Reaching the end unpins the viewport and the page carries on normally.
//
// This is possible at all because the scene is a pure function of time: there
// is no playback state to rewind, nothing to re-sequence, and no way for the
// picture to disagree with the scrollbar. The same component that autoplays on
// the other candidate is handed a different number here and does the rest.
//
// WHY THE HEADLINE IS ABOVE THE ANIMATION AND NOT OVER IT
// -------------------------------------------------------
// The composition is a whole application and the first thing it renders is its
// own welcome screen, in large type, dead centre. A headline laid over that
// collides with it word for word — both sets of text are centred, both are
// large, and the result is unreadable. The words get their own screen, and
// scrolling moves from the claim into the evidence.
//
// Two refinements that are not decoration:
//   - T eases toward the scroll target rather than snapping to it. A trackpad
//     delivers scroll in coarse jumps and the camera moves are slow; without
//     easing the picture stutters against a page that looks smooth.
//   - The particle field runs on its own clock. If everything froze the moment
//     you stopped scrolling, a held frame would read as a crash, not a pause.

/**
 * Scroll distance, in pixels, for the whole 37 seconds.
 *
 * ~95px per authored second on a desktop: low enough that the beats do not
 * drag, high enough that the typing and camera moves are readable rather than
 * flicked past. Phones get roughly half, because the same distance that is two
 * flicks of a wheel is a dozen thumb swipes, and a hero nobody can get past is
 * worse than one nobody watches.
 */
const PX_PER_SECOND = { desktop: 95, phone: 48 };

/** Scroll distance for the whole sequence at a given viewport width. */
function scrubFor(width: number) {
  return Math.round(AUTHORED_TOTAL * (width < 768 ? PX_PER_SECOND.phone : PX_PER_SECOND.desktop));
}

/**
 * Where the caption track hands over to the closing call, as a fraction of the
 * scrub. Placed after the approval beat lands (~T=35) so the moment the whole
 * demo builds to is read with its own caption rather than under a pair of
 * buttons.
 */
const HANDOFF = 0.97;

/**
 * Where the scrub stops, in authored seconds.
 *
 * Short of the full 37 on purpose. The composition's last beat pulls the camera
 * back to the whole application so the loop can restart — which is right for a
 * loop and wrong for a scroll, because nothing restarts here. Ending at 35.4
 * leaves the final frame on the approved wording at conversation zoom, which is
 * the note to finish on, and keeps the demo's own navigation bar out of a frame
 * that already has the site's real one at the top of it.
 */
const SCRUB_END = 35.4;

/** Height of the site's sticky navigation, so the stage can sit under it rather than behind it. */
const NAV_PX = 61;

/** What is happening, in the viewer's language, keyed to the authored beats. */
const CAPTIONS: { from: number; to: number; title: string; body: string }[] = [
  { from: 0, to: 4.4, title: "Start where you are", body: "Three ways in: say it out loud, think it through, or turn it into one step." },
  { from: 4.4, to: 12.0, title: "It listens first", body: "Talk, don't type. No advice back unless you ask for it." },
  { from: 12.0, to: 24.0, title: "It helps you think", body: "Questions, options and trade-offs — not a lecture, and not a plan you didn't ask for." },
  { from: 24.0, to: 32.2, title: "It finds the one step", body: "Something you can actually do this week, drawn from what you just said." },
  { from: 32.2, to: AUTHORED_TOTAL + 1, title: "You approve the words", body: "Steward proposes the wording. Nothing is written to your Blueprint until you say yes." },
];

export function StewardHeroScroll() {
  const sectionRef = React.useRef<HTMLDivElement>(null);
  const [reduced, setReduced] = React.useState<boolean | null>(null);
  const [t, setT] = React.useState(0);
  const [drift, setDrift] = React.useState(0);
  const [progress, setProgress] = React.useState(0);
  const [scrub, setScrub] = React.useState(() => scrubFor(1440));

  React.useEffect(() => {
    const q = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(q.matches);
    const on = (e: MediaQueryListEvent) => setReduced(e.matches);
    q.addEventListener("change", on);
    return () => q.removeEventListener("change", on);
  }, []);

  React.useEffect(() => {
    if (reduced !== false) return;
    const section = sectionRef.current;
    if (!section) return;

    let frame = 0;
    let current = 0;
    let target = 0;
    let ambient = 0;
    let last = performance.now();
    let onScreen = true;
    let visible = true;

    const measure = () => {
      setScrub(scrubFor(window.innerWidth));
      const rect = section.getBoundingClientRect();
      // The travel available to the pinned viewport: the section's height minus
      // the one screen it stays pinned for.
      const travel = Math.max(rect.height - window.innerHeight, 1);
      const p = clamp((NAV_PX - rect.top) / travel, 0, 1);
      target = p * SCRUB_END;
      setProgress(p);
    };

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      ambient += dt;
      setDrift(ambient);

      // Frame-rate independent easing: the same convergence at 60Hz and 120Hz.
      const k = 1 - Math.pow(0.0001, dt);
      const gap = target - current;
      current = Math.abs(gap) < 0.004 ? target : current + gap * k;
      setT(current);

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

    const onScroll = () => measure();
    const io = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        sync();
      },
      { threshold: 0 },
    );
    io.observe(section);
    const onVis = () => {
      visible = document.visibilityState === "visible";
      sync();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    document.addEventListener("visibilitychange", onVis);
    measure();
    current = target;
    sync();

    return () => {
      stop();
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [reduced]);

  const caption = CAPTIONS.find((k) => t >= k.from && t < k.to) ?? CAPTIONS[CAPTIONS.length - 1];

  return (
    <>
      {/* The claim. Its own screen, so it never fights the demo's own words. */}
      <section className="relative isolate overflow-hidden bg-[#141211] text-[#f4f1ea]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 70% at 50% 35%, rgba(184,138,74,0.15) 0%, rgba(184,138,74,0.04) 50%, rgba(0,0,0,0) 75%)",
          }}
        />
        <div className="relative mx-auto flex min-h-[calc(72vh-61px)] w-full max-w-[1160px] flex-col items-center justify-center px-6 py-20 text-center md:px-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#b88a4a]/50 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-[#d8bd86]">
            <span aria-hidden>✦</span> You were created for more
          </span>

          <h1 className="mx-auto mt-6 max-w-3xl font-serif text-[clamp(2.1rem,5.2vw,4rem)] leading-[1.08]">
            What kind of life are you{" "}
            <em className="not-italic text-[#d8bd86]">actually building?</em>
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-[16px] leading-relaxed text-[#cfc7ba] md:text-[17px]">
            Most people don&rsquo;t drift on purpose. Life simply gets full. Steward is a personal
            guide for designing and living a life that matters.
          </p>

          <p className="mt-12 flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.16em] text-[#9d948a]">
            Scroll to watch it work <ChevronDown className="h-4 w-4 animate-bounce" />
          </p>
        </div>
      </section>

      {/* The demo, scrubbed. */}
      <section
        ref={sectionRef}
        className="relative isolate border-b bg-[#141211] text-[#f4f1ea]"
        style={{ height: reduced ? undefined : `calc(100vh + ${scrub}px)` }}
      >
        <div
          className="sticky w-full overflow-hidden"
          style={{ top: NAV_PX, height: `calc(100vh - ${NAV_PX}px)` }}
        >
          {/* On a desktop the demo runs full bleed: the camera is zoomed into
              the conversation for all but a second of the runtime, so the
              interface fills the frame and reads as immersion.

              On a phone it cannot. The authored phone composition pans but
              never zooms — the whole app always fits the stage — so its own
              navigation bar is on screen the entire time, directly beneath the
              site's real one. Framing it as a device says "this is the app on a
              phone" and the two bars stop competing. It is also inset to its
              exact aspect ratio, because cropping a 390px-wide layout sideways
              cuts live text off both edges. */}
          <div className="absolute inset-x-6 top-3 aspect-[9/16] overflow-hidden rounded-2xl border border-white/10 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.9)] md:inset-0 md:aspect-auto md:rounded-none md:border-0 md:shadow-none">
            {reduced === null ? null : reduced ? (
              <StewardStage className="h-full w-full" t={34.6} particles={false} tilt={false} />
            ) : (
              <StewardStage className="h-full w-full" t={t} particleTime={t + drift} />
            )}
          </div>

          {/* A floor for the caption. It has to go nearly solid at the bottom:
              the demo's own composer and legal line sit exactly there, and at
              anything less they read straight through the caption. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-[55%] md:block"
            style={{
              background:
                "linear-gradient(to bottom, rgba(20,18,17,0) 0%, rgba(20,18,17,0.35) 32%, rgba(20,18,17,0.80) 58%, rgba(20,18,17,0.96) 78%, #141211 100%)",
            }}
          />

          {/* Caption track — what is happening, in the viewer's language. */}
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0"
            style={{ opacity: reduced ? 1 : clamp((HANDOFF - progress) * 22, 0, 1) }}
          >
            <div className="mx-auto w-full max-w-[1160px] px-6 pb-6 md:px-8 md:pb-14">
              <div className="max-w-lg pr-24 md:pr-0">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#d8bd86]">
                  {caption.title}
                </p>
                <p className="mt-1.5 text-[15px] leading-relaxed text-[#e8e2d8] md:mt-2 md:text-[19px]">
                  {caption.body}
                </p>
              </div>
            </div>
          </div>

          {/* The closing call, as the sequence lands. */}
          <div
            className="absolute inset-x-0 bottom-0"
            style={{
              opacity: clamp((progress - HANDOFF) * 22, 0, 1),
              pointerEvents: progress > HANDOFF + 0.02 ? "auto" : "none",
            }}
          >
            <div className="mx-auto flex w-full max-w-[1160px] flex-wrap justify-center gap-3 px-6 pb-12 md:px-8 md:pb-14">
              <Link
                href="/steward"
                className="inline-flex items-center gap-2 rounded-md bg-[#b88a4a] px-6 py-3 text-sm font-semibold text-white no-underline transition-colors hover:bg-[#a67c42]"
              >
                Talk to Steward <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/created-for-more-check-in"
                className="inline-flex items-center gap-2 rounded-md border border-white/25 bg-[#141211]/50 px-6 py-3 text-sm font-semibold text-[#f4f1ea] no-underline backdrop-blur-sm transition-colors hover:bg-white/10"
              >
                Take the Check-In
              </Link>
            </div>
          </div>

          {/* Where you are in the sequence. */}
          {reduced ? null : (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[3px] bg-white/10">
              <div className="h-full bg-[#b88a4a]" style={{ width: `${progress * 100}%` }} />
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export default StewardHeroScroll;
