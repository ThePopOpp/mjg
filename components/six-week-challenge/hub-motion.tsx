"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Clock, Play } from "lucide-react";
import { cn } from "@/lib/utils";

// Client pieces for the 6-Week Challenge hub: the scroll-in reveal and the video slider.

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * Fades its children up the first time they scroll into view. Content is visible by
 * default (no JS, reduced motion, or already on screen); only blocks that start below
 * the fold are held back, and only until they're reached.
 */
export function Reveal({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [pending, setPending] = useState(false);

  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.92) return;
    setPending(true);
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setPending(false);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      className={cn("transition-[opacity,transform] duration-700 ease-out", pending && "translate-y-4 opacity-0", className)}
    >
      {children}
    </div>
  );
}

export type SliderVideo = {
  slug: string;
  badge: string;
  title: string;
  durationLabel: string | null;
  available: boolean;
};

/** Small linked cards in a horizontal, snap-scrolling row with a gold scrollbar and arrow buttons. */
export function VideoSlider({ videos }: { videos: SliderVideo[] }) {
  const track = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  const measure = () => {
    const el = track.current;
    if (!el) return;
    setEdges({ start: el.scrollLeft <= 4, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 });
  };
  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const nudge = (dir: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: dir * Math.max(240, el.clientWidth * 0.75), behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <div className="relative">
      <div className="mb-3 flex justify-end gap-2">
        {([[-1, ChevronLeft, "Previous videos", edges.start], [1, ChevronRight, "Next videos", edges.end]] as const).map(([dir, Icon, label, disabled]) => (
          <button
            key={label}
            type="button"
            aria-label={label}
            onClick={() => nudge(dir)}
            disabled={disabled}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border bg-card text-foreground transition-all hover:border-gold hover:text-gold disabled:pointer-events-none disabled:opacity-35 motion-safe:active:scale-95"
          >
            <Icon className="h-4 w-4" />
          </button>
        ))}
      </div>
      <div
        ref={track}
        onScroll={measure}
        className="brand-scroll -mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-1 pb-4 motion-reduce:scroll-auto"
      >
        {videos.map((v, i) => (
          <Link
            key={v.slug}
            href={`/6-week-challenge/videos/${v.slug}`}
            className="group flex w-[210px] shrink-0 snap-start flex-col justify-between gap-4 rounded-xl border bg-card p-4 no-underline shadow-sm transition-all duration-300 hover:border-gold hover:shadow-md motion-safe:hover:-translate-y-1"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-gold">{v.badge}</span>
              <span className="text-[11px] tabular-nums text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
            </div>
            <p className="text-pretty font-serif text-[17px] font-semibold leading-snug text-foreground">{v.title}</p>
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                {v.available ? (
                  v.durationLabel ? <><Clock className="h-3.5 w-3.5" /> {v.durationLabel}</> : "Watch now"
                ) : (
                  "Coming soon"
                )}
              </span>
              <span
                className={cn(
                  "inline-flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300",
                  v.available ? "bg-[#b88a4a]/15 text-gold group-hover:bg-gold group-hover:text-white motion-safe:group-hover:scale-110" : "bg-muted text-muted-foreground",
                )}
              >
                <Play className="ml-0.5 h-3.5 w-3.5 fill-current" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
