"use client";

import * as React from "react";
import { AUTHORED_TOTAL } from "./steward-script";
import { StewardStage } from "./steward-stage";

// Option one: the demo plays itself.
//
// The composition is driven by a looping wall clock — 0 → 37s → 0, forever — so
// someone who lands here and does nothing still sees Steward listen, think,
// propose wording and have it approved. That sequence is the entire pitch.
//
// WHY THIS CARRIES NO HEADLINE
// ----------------------------
// It used to. So does the section directly beneath it, which is the live
// homepage's opening — and the page read "What kind of life are you actually
// building?" twice, sixty pixels apart. The words belong in one place, and the
// better place is the section written for them. This is the demo, full stop:
// the page shows first and tells second.
//
// It is the width of the navigation BAR, not the window, so it starts at the
// logo and ends at the theme toggle. And it is `contain` rather than `cover`,
// so the composition is never cropped — the conversation runs close to the
// edges of the stage and a crop takes live text off them.
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
    <section ref={hostRef} className="relative isolate overflow-hidden border-b bg-[#141211]">
      {/* A gold bloom behind the panel, so it sits in light rather than on a flat field. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 75% at 50% 35%, rgba(184,138,74,0.16) 0%, rgba(184,138,74,0.05) 45%, rgba(0,0,0,0) 72%)",
        }}
      />

      {/* Same box as the navigation bar — max-w-[1160px] with 2rem gutters. */}
      <div className="relative mx-auto w-full max-w-[1160px] px-8 py-8 md:py-12">
        <div className="overflow-hidden rounded-2xl border border-white/[0.08] shadow-[0_30px_80px_-24px_rgba(0,0,0,0.85)]">
          {reduced === null ? (
            <div className="aspect-[9/16] w-full bg-[#141211] md:aspect-video" />
          ) : (
            <StewardStage
              className="aspect-[9/16] w-full md:aspect-video"
              fit="contain"
              t={reduced ? STILL_AT : t}
              particles={!reduced}
              tilt={!reduced}
            />
          )}
        </div>
      </div>
    </section>
  );
}

export default StewardHeroAutoplay;
