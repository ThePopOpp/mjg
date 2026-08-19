import { cn } from "@/lib/utils";

/**
 * Wraps a group of stat / metric cards. On mobile it's a single horizontal
 * snap-scrolling row (a slider) so the cards never stack into a tall column;
 * at >=sm it lays out as the normal grid passed in `className`
 * (e.g. "grid gap-4 md:grid-cols-4").
 *
 * It stays display:grid at every breakpoint — on mobile `grid-flow-col` +
 * `auto-cols-[78%]` put each card in one scrollable row (with a peek of the
 * next); at >=sm `sm:grid-flow-row` returns to the authored grid — so it
 * composes with any grid-cols-* classes without a flex/grid conflict.
 *
 * Usage: replace a stat-card container
 *   <div className="grid gap-4 md:grid-cols-4">…</div>
 * with
 *   <StatCardRow className="grid gap-4 md:grid-cols-4">…</StatCardRow>
 */
export function StatCardRow({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        // mobile: single horizontal snap-scrolling row (gap comes from `className`)
        "grid grid-flow-col auto-cols-[78%] overflow-x-auto snap-x snap-mandatory pb-2 [&>*]:snap-center",
        // >=sm: revert to the authored grid
        "sm:grid-flow-row sm:auto-cols-auto sm:snap-none sm:overflow-visible sm:pb-0",
        className,
      )}
    >
      {children}
    </div>
  );
}
