"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * One horizontal row that slides: scroll-snap, swipe, trackpad, arrow buttons and
 * keyboard (the buttons are real buttons). `visible` is how many cards show at
 * desktop width, e.g. 3.5 leaves half a card peeking to signal there's more.
 * Narrower screens show fewer: `mobile` (default 1.2) on phones, up to 2.5 on tablets.
 */
export function Rail({ visible, mobile = 1.2, label, children, className, controls = "header" }: { visible: number; mobile?: number; label: string; children: React.ReactNode; className?: string; controls?: "header" | "overlay" | "none" }) {
  const ref = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: true });

  const measure = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setEdges({ start: el.scrollLeft <= 4, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 });
  }, []);

  useEffect(() => {
    measure();
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [measure, children]);

  const page = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: reduce ? "auto" : "smooth" });
  };

  const style = { "--v-lg": String(visible), "--v-md": String(Math.min(visible, 2.5)), "--v-sm": String(Math.min(visible, mobile)) } as React.CSSProperties;

  return (
    <div className={cn("relative", className)}>
      {controls !== "none" && !(edges.start && edges.end) ? (
        // Phones swipe, so the arrows show from tablet width up.
        <div className={cn("hidden gap-1 sm:flex", controls === "header" ? "absolute -top-11 right-0" : "pointer-events-none absolute inset-y-0 left-0 right-0 z-10 items-center justify-between px-1")}>
          <button
            type="button"
            onClick={() => page(-1)}
            disabled={edges.start}
            aria-label={`Previous ${label}`}
            className="pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full border bg-card text-foreground shadow-sm transition hover:bg-muted disabled:opacity-35"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => page(1)}
            disabled={edges.end}
            aria-label={`Next ${label}`}
            className="pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full border bg-card text-foreground shadow-sm transition hover:bg-muted disabled:opacity-35"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      ) : null}
      <div
        ref={ref}
        onScroll={measure}
        role="region"
        aria-label={label}
        tabIndex={0}
        style={style}
        className={cn(
          "flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:scroll-auto",
          "[--v:var(--v-sm)] sm:[--v:var(--v-md)] lg:[--v:var(--v-lg)]",
          "[scrollbar-width:thin] [scrollbar-color:#b88a4a66_transparent] [&>*]:shrink-0 [&>*]:snap-start [&>*]:basis-[calc((100%_-_(var(--v)_-_1)_*_1rem)_/_var(--v))]",
        )}
      >
        {children}
      </div>
    </div>
  );
}
