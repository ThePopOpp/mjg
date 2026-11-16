"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

// A horizontal row with the site's own scrollbar.
//
// The native bar is hidden (its thumb length is fixed by the browser to the
// visible fraction, and it can't follow the theme everywhere). In its place: a
// thin hairline track and a SHORT gold handle that slides with the row, can be
// dragged, and can be clicked anywhere on the track to jump. Arrow buttons page
// through. Keyboard and trackpad scrolling still work on the row itself.

const THUMB = 64; // px — deliberately short, independent of how much content there is

export function HorizontalScroller({ children, label, className }: { children: ReactNode; label: string; className?: string }) {
  const rowRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [scrollable, setScrollable] = useState(false);
  const drag = useRef<{ startX: number; startProgress: number } | null>(null);

  const measure = useCallback(() => {
    const row = rowRef.current;
    if (!row) return;
    const max = row.scrollWidth - row.clientWidth;
    setScrollable(max > 2);
    setProgress(max > 0 ? row.scrollLeft / max : 0);
  }, []);

  useEffect(() => {
    measure();
    const row = rowRef.current;
    if (!row) return;
    const ro = new ResizeObserver(measure);
    ro.observe(row);
    if (row.firstElementChild) ro.observe(row.firstElementChild);
    return () => ro.disconnect();
  }, [measure]);

  const scrollToProgress = (p: number, smooth = false) => {
    const row = rowRef.current;
    if (!row) return;
    const left = Math.max(0, Math.min(1, p)) * (row.scrollWidth - row.clientWidth);
    row.scrollTo({ left, behavior: smooth ? "smooth" : "auto" });
  };

  const page = (dir: 1 | -1) => {
    const row = rowRef.current;
    if (row) row.scrollBy({ left: dir * row.clientWidth * 0.8, behavior: "smooth" });
  };

  const travel = () => Math.max(1, (trackRef.current?.clientWidth ?? 0) - THUMB);

  return (
    <div className={className}>
      <div
        ref={rowRef}
        onScroll={measure}
        tabIndex={0}
        role="region"
        aria-label={label}
        className="-mx-5 overflow-x-auto px-5 pb-2 outline-none [scrollbar-width:none] focus-visible:ring-2 focus-visible:ring-gold/40 sm:-mx-8 sm:px-8 [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>

      {scrollable ? (
        <div className="mt-4 flex items-center gap-3">
          <button
            type="button"
            onClick={() => page(-1)}
            disabled={progress <= 0.001}
            aria-label="Scroll left"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border bg-card text-foreground transition-colors hover:border-gold hover:text-gold-deep disabled:pointer-events-none disabled:opacity-35 dark:hover:text-gold-light"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {/* Decorative: the row itself is the scrollable, keyboard-reachable control. */}
          <div
            ref={trackRef}
            aria-hidden
            className="relative h-4 flex-1 cursor-pointer touch-none"
            onPointerDown={(e) => {
              const track = trackRef.current;
              if (!track || e.target !== track) return;
              const x = e.clientX - track.getBoundingClientRect().left - THUMB / 2;
              scrollToProgress(x / travel(), true);
            }}
          >
            <div className="pointer-events-none absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-border" />
            <div
              className="absolute top-1/2 h-1.5 -translate-y-1/2 cursor-grab rounded-full bg-gold transition-[height] hover:h-2 active:cursor-grabbing dark:bg-gold-light"
              style={{ width: THUMB, left: `${progress * 100}%`, transform: `translate(-${progress * THUMB}px, -50%)` }}
              onPointerDown={(e) => {
                e.preventDefault();
                (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
                drag.current = { startX: e.clientX, startProgress: progress };
              }}
              onPointerMove={(e) => {
                if (!drag.current) return;
                scrollToProgress(drag.current.startProgress + (e.clientX - drag.current.startX) / travel());
              }}
              onPointerUp={() => {
                drag.current = null;
              }}
              onPointerCancel={() => {
                drag.current = null;
              }}
            />
          </div>

          <button
            type="button"
            onClick={() => page(1)}
            disabled={progress >= 0.999}
            aria-label="Scroll right"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border bg-card text-foreground transition-colors hover:border-gold hover:text-gold-deep disabled:pointer-events-none disabled:opacity-35 dark:hover:text-gold-light"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      ) : null}
    </div>
  );
}
