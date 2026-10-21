"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
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
// THE POINT OF THIS VERSION IS READING SPEED
// ------------------------------------------
// Steward's replies type themselves out, and so do the member's two questions.
// On a clock those beats run at whatever pace they were authored at. Here the
// reader sets it — hold still and the sentence stops mid-word; scroll back and
// it un-types. So three things are tuned for reading rather than for drama:
//
//   - The composition is `contain` inside the navigation bar's own width. It is
//     never cropped, so the composer — where the typing happens — is always on
//     screen. Cropping it was the actual reason the typing looked missing.
//   - The caption sits BELOW the demo, not over it. Nothing covers the
//     conversation at the moment it is being written.
//   - 130px of scroll per authored second, up from 95. The two typing beats run
//     2.5s and 1.9s; at the old rate they were about one flick of a wheel.
//
// And T eases toward the scroll target rather than snapping to it: a trackpad
// delivers scroll in coarse jumps, and without easing the picture stutters
// against a page that looks smooth.
//
// This carries no headline, for the same reason the autoplay version does not:
// the live homepage's opening sits directly beneath it and owns those words.

const PX_PER_SECOND = { desktop: 130, phone: 68 };

/** Scroll distance for the whole sequence at a given viewport width. */
function scrubFor(width: number) {
  return Math.round(AUTHORED_TOTAL * (width < 768 ? PX_PER_SECOND.phone : PX_PER_SECOND.desktop));
}

/** Height of the site's sticky navigation, so the stage sits under it rather than behind it. */
const NAV_PX = 61;

/**
 * Where the scrub stops, in authored seconds.
 *
 * Short of the full 37 on purpose. The composition's last beat pulls the camera
 * back so a loop can restart — right for a loop, wrong for a scroll, because
 * nothing restarts here. Ending at 35.4 leaves the final frame on the approved
 * wording at conversation zoom, which is the note to finish on.
 */
const SCRUB_END = 35.4;

/** The still frame for reduced motion: just after approval. */
const STILL_AT = 34.6;

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
    <section
      ref={sectionRef}
      className="relative isolate border-b bg-[#141211] text-[#f4f1ea]"
      style={{ height: reduced ? undefined : `calc(100vh + ${scrub}px)` }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-screen"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 40%, rgba(184,138,74,0.13) 0%, rgba(184,138,74,0.04) 50%, rgba(0,0,0,0) 75%)",
        }}
      />

      <div
        className="sticky w-full overflow-hidden"
        style={{ top: NAV_PX, height: `calc(100vh - ${NAV_PX}px)` }}
      >
        {/* The navigation bar's own box, so the demo starts at the logo and ends
            at the theme toggle. The stage takes whatever height is left after
            the caption and contains itself inside it, which is what guarantees
            nothing is cropped at any window size. */}
        <div className="relative mx-auto flex h-full w-full max-w-[1160px] flex-col px-8 py-5 md:py-7">
          <div className="relative min-h-0 flex-1">
            {reduced === null ? null : (
              <StewardStage
                className="absolute inset-0 h-full w-full"
                fit="contain"
                t={reduced ? STILL_AT : t}
                particleTime={reduced ? undefined : t + drift}
                particles={!reduced}
                tilt={!reduced}
              />
            )}
          </div>

          {/* The caption band. A fixed minimum height so the stage above does not
              resize every time the text wraps to a different number of lines —
              a demo that grows and shrinks as you scroll is worse than a little
              empty space under a short caption. */}
          <div className="relative mt-5 flex min-h-[5.5rem] shrink-0 items-start md:min-h-[5rem]">
            {/* pr-24 on a phone: the site's help button sits bottom-right and
                the last line of a caption wraps underneath it otherwise. */}
            <div
              className="pr-24 transition-opacity duration-200 md:pr-0"
              style={{ opacity: reduced ? 1 : clamp(progress * 24, 0, 1) }}
            >
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#d8bd86]">
                {caption.title}
              </p>
              <p className="mt-1.5 max-w-2xl text-[15px] leading-relaxed text-[#e8e2d8] md:mt-2 md:text-[17px]">
                {caption.body}
              </p>
            </div>

            {/* The invitation, until it has been taken. */}
            {reduced ? null : (
              <p
                className="absolute inset-x-0 top-1 flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.16em] text-[#9d948a] transition-opacity duration-200"
                style={{ opacity: clamp(1 - progress * 24, 0, 1) }}
              >
                Scroll to watch it work <ChevronDown className="h-4 w-4 animate-bounce" />
              </p>
            )}
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
  );
}

export default StewardHeroScroll;
