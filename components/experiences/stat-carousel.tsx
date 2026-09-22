"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type StatItem = {
  key: string;
  icon: LucideIcon;
  label: string;
  value: string;
  detail: string;
};

const AUTO_ADVANCE_MS = 4000;

/**
 * A single row of stat cards that slides on its own and pauses while you're looking at it.
 *
 * Auto-advance stops on hover, on keyboard focus, and while the row is being dragged or
 * scrolled by hand, so it never fights the reader. It also stays still for anyone who has
 * asked for reduced motion — an element that moves by itself is exactly what that setting is
 * meant to suppress — and they can still scroll or use the arrows.
 */
export function StatCarousel({ items }: { items: StatItem[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReducedMotion(query.matches);
    apply();
    query.addEventListener("change", apply);
    return () => query.removeEventListener("change", apply);
  }, []);

  const updateEdges = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 4);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    updateEdges();
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateEdges, { passive: true });
    window.addEventListener("resize", updateEdges);
    return () => {
      el.removeEventListener("scroll", updateEdges);
      window.removeEventListener("resize", updateEdges);
    };
  }, [updateEdges]);

  const step = useCallback((direction: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    // One card's width, so a nudge lands cleanly on the next card rather than mid-card.
    const card = el.querySelector<HTMLElement>("[data-stat-card]");
    const amount = card ? card.offsetWidth + 12 : el.clientWidth * 0.8;
    const nearEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
    // Loop back to the start once the last card is in view, so it runs continuously.
    if (direction === 1 && nearEnd) el.scrollTo({ left: 0, behavior: "smooth" });
    else el.scrollBy({ left: amount * direction, behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (paused || reducedMotion || items.length < 2) return;
    const timer = setInterval(() => step(1), AUTO_ADVANCE_MS);
    return () => clearInterval(timer);
  }, [paused, reducedMotion, items.length, step]);

  return (
    <div
      className="group/carousel relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
    >
      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="region"
        aria-label="Automation stats"
      >
        {items.map((item) => (
          <Card
            key={item.key}
            data-stat-card
            className="w-[240px] shrink-0 snap-start sm:w-[260px]"
          >
            <CardContent className="p-4">
              <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <item.icon className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{item.label}</span>
              </p>
              <p className="mt-1 truncate text-lg font-semibold" title={item.value}>{item.value}</p>
              <p className="truncate text-xs text-muted-foreground" title={item.detail}>{item.detail}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Arrows appear on hover — which is also when auto-advance is paused. */}
      <NudgeButton side="left" disabled={atStart} onClick={() => step(-1)} />
      <NudgeButton side="right" disabled={atEnd && items.length < 2} onClick={() => step(1)} />
    </div>
  );
}

function NudgeButton({
  side,
  disabled,
  onClick,
}: {
  side: "left" | "right";
  disabled: boolean;
  onClick: () => void;
}) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={side === "left" ? "Previous stats" : "Next stats"}
      className={cn(
        "absolute top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border bg-background/95 shadow-sm backdrop-blur transition-opacity",
        "opacity-0 group-hover/carousel:opacity-100 focus-visible:opacity-100 sm:flex",
        side === "left" ? "-left-3" : "-right-3",
        disabled && "pointer-events-none opacity-0",
      )}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}
