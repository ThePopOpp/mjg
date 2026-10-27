"use client";

import { useMemo, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { List, Map as MapIcon, Search, X } from "lucide-react";
import { FieldSelect } from "@/components/ui/field-select";
import { GroupsMap, type MapPoint } from "@/components/maps/groups-map";
import type { TileConfig } from "@/lib/maps/config";
import { AUDIENCES, DAYS, FORMATS, TIMES_OF_DAY, type PublicGroup } from "@/lib/facilitator-groups/shared";
import { GroupCard } from "./group-card";
import { cn } from "@/lib/utils";

export type FinderFilters = { near: string; radius: string; day: string; tod: string; format: string; audience: string; open: boolean };

const RADII = ["10", "25", "50", "100"];

/** Airbnb-style finder: filter bar, card list and a sticky map. Filters live in the URL. */
export function GroupFinder({
  groups, tiles, center, filters, nearNotFound,
}: {
  groups: PublicGroup[];
  tiles: TileConfig;
  center: { lat: number; lng: number } | null;
  filters: FinderFilters;
  nearNotFound: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  const [near, setNear] = useState(filters.near);
  const [hovered, setHovered] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<"list" | "map">("list");

  function apply(next: Partial<FinderFilters>) {
    const f = { ...filters, near, ...next };
    const qs = new URLSearchParams();
    if (f.near.trim()) qs.set("near", f.near.trim());
    if (f.near.trim() && f.radius && f.radius !== "25") qs.set("radius", f.radius);
    if (f.day) qs.set("day", f.day);
    if (f.tod) qs.set("time", f.tod);
    if (f.format) qs.set("format", f.format);
    if (f.audience) qs.set("for", f.audience);
    if (f.open) qs.set("open", "1");
    const s = qs.toString();
    startTransition(() => router.push(s ? `${pathname}?${s}` : pathname, { scroll: false }));
  }

  const points: MapPoint[] = useMemo(
    () =>
      groups
        .filter((g) => g.lat != null && g.lng != null)
        .map((g) => ({
          id: g.id,
          lat: g.lat!,
          lng: g.lng!,
          exact: g.exact,
          label: g.spotsLeft > 0 ? `${g.spotsLeft} open` : "Full",
          title: g.title,
          href: `/groups/${g.slug}`,
        })),
    [groups],
  );
  const active = [filters.day, filters.tod, filters.format, filters.audience].filter(Boolean).length + (filters.open ? 1 : 0) + (filters.near ? 1 : 0);
  const online = groups.filter((g) => g.lat == null).length;

  return (
    <div>
      {/* Filters */}
      <div className="z-20 border-b bg-background/95 backdrop-blur lg:sticky lg:top-[60px]">
        <div className="mx-auto flex w-full max-w-[1400px] flex-wrap items-center gap-2 px-5 py-3 sm:px-8">
          <form
            onSubmit={(e) => { e.preventDefault(); apply({ near }); }}
            className="flex w-full items-center gap-2 rounded-md border bg-card px-3 sm:w-auto sm:min-w-[15rem] sm:max-w-sm sm:flex-1"
          >
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              value={near}
              onChange={(e) => setNear(e.target.value)}
              placeholder="City or ZIP"
              aria-label="City or ZIP"
              className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            {near ? <button type="button" aria-label="Clear location" onClick={() => { setNear(""); apply({ near: "" }); }}><X className="h-4 w-4 text-muted-foreground" /></button> : null}
          </form>
          {filters.near ? (
            <FieldSelect className="h-10 min-w-[9rem] flex-1 sm:flex-none sm:w-28" value={filters.radius || "25"} onChange={(v) => apply({ radius: v })} options={RADII.map((r) => ({ value: r, label: `${r} miles` }))} />
          ) : null}
          <FieldSelect className="h-10 min-w-[9rem] flex-1 sm:flex-none sm:w-36" value={filters.day} onChange={(v) => apply({ day: v })} options={[{ value: "", label: "Any day" }, ...DAYS.map((d, i) => ({ value: String(i), label: d }))]} />
          <FieldSelect className="h-10 min-w-[9rem] flex-1 sm:flex-none sm:w-36" value={filters.tod} onChange={(v) => apply({ tod: v })} options={[{ value: "", label: "Any time" }, ...Object.entries(TIMES_OF_DAY).map(([value, label]) => ({ value, label }))]} />
          <FieldSelect className="h-10 min-w-[9rem] flex-1 sm:flex-none sm:w-40" value={filters.format} onChange={(v) => apply({ format: v })} options={[{ value: "", label: "In person or online" }, ...Object.entries(FORMATS).map(([value, label]) => ({ value, label }))]} />
          <FieldSelect className="h-10 min-w-[9rem] flex-1 sm:flex-none sm:w-36" value={filters.audience} onChange={(v) => apply({ audience: v })} options={[{ value: "", label: "Anyone" }, ...Object.entries(AUDIENCES).map(([value, label]) => ({ value, label }))]} />
          <button
            type="button"
            onClick={() => apply({ open: !filters.open })}
            aria-pressed={filters.open}
            className={cn("h-10 flex-1 rounded-md border px-3 text-sm transition-colors sm:flex-none", filters.open ? "border-gold bg-gold/10 text-foreground" : "bg-card text-muted-foreground hover:border-gold")}
          >
            Open spots only
          </button>
          {active ? (
            <button type="button" onClick={() => { setNear(""); apply({ near: "", day: "", tod: "", format: "", audience: "", open: false }); }} className="h-10 px-2 text-sm text-gold-deep underline-offset-4 hover:underline dark:text-gold-light">
              Clear all
            </button>
          ) : null}
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-[1400px] gap-6 px-5 py-6 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)]">
        {/* List */}
        <div className={cn(mobileView === "map" && "hidden lg:block", pending && "opacity-60 transition-opacity")}>
          <p className="mb-4 text-sm text-muted-foreground" aria-live="polite">
            {groups.length} group{groups.length === 1 ? "" : "s"}
            {filters.near && !nearNotFound ? ` within ${filters.radius || 25} miles of ${filters.near}` : ""}
            {online && points.length ? ` · ${online} online` : ""}
          </p>
          {nearNotFound ? (
            <p className="mb-4 rounded-md border border-dashed p-3 text-sm text-muted-foreground">
              We couldn&rsquo;t place &ldquo;{filters.near}&rdquo; on the map, so these are groups whose area matches it. Try a ZIP code or &ldquo;City, ST&rdquo;.
            </p>
          ) : null}
          {groups.length ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              {groups.map((g) => <GroupCard key={g.id} group={g} selected={hovered === g.id} onHover={setHovered} />)}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed p-10 text-center">
              <p className="font-display text-xl">No groups match yet</p>
              <p className="mt-2 text-sm text-muted-foreground">Try a different day or time, widen the distance, or clear the filters.</p>
            </div>
          )}
        </div>

        {/* Map */}
        <div className={cn("lg:block", mobileView === "list" && "hidden")}>
          <div className="sticky top-[8.5rem] h-[70vh] overflow-hidden rounded-xl border lg:h-[calc(100vh-10rem)]">
            {points.length || center ? (
              <GroupsMap points={points} tiles={tiles} center={center} selectedId={hovered} />
            ) : (
              <div className="flex h-full items-center justify-center bg-muted/40 p-6 text-center text-sm text-muted-foreground">
                {groups.length ? "These groups meet online." : "Groups will appear on the map as they're listed."}
              </div>
            )}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Circles show the general area. Exact addresses are shared once your spot is confirmed.</p>
        </div>
      </div>

      {/* Phone: list / map toggle */}
      <button
        type="button"
        onClick={() => setMobileView(mobileView === "list" ? "map" : "list")}
        className="fixed bottom-6 left-1/2 z-30 inline-flex -translate-x-1/2 items-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-semibold text-background shadow-lg lg:hidden"
      >
        {mobileView === "list" ? <><MapIcon className="h-4 w-4" /> Map</> : <><List className="h-4 w-4" /> List</>}
      </button>
    </div>
  );
}
