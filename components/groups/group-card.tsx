import Link from "next/link";
import { CalendarDays, Globe, MapPin, Users } from "lucide-react";
import { FORMATS, scheduleLabel, type PublicGroup } from "@/lib/facilitator-groups/shared";
import { cn } from "@/lib/utils";

export function spotsText(g: Pick<PublicGroup, "spotsLeft" | "capacity">) {
  if (g.spotsLeft <= 0) return "Full · waitlist";
  return `${g.spotsLeft} of ${g.capacity} spot${g.capacity === 1 ? "" : "s"} open`;
}

export function startLabel(date: string | null) {
  if (!date) return null;
  return new Date(`${date}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function Initials({ name, photo, className }: { name: string; photo?: string | null; className?: string }) {
  if (photo) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={photo} alt="" className={cn("rounded-full object-cover", className)} />;
  }
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");
  return <span className={cn("flex items-center justify-center rounded-full bg-foreground font-display text-background", className)} aria-hidden>{initials || "?"}</span>;
}

/** A Find a Group listing card (list view + facilitator profile). */
export function GroupCard({ group, selected, onHover }: { group: PublicGroup; selected?: boolean; onHover?: (id: string | null) => void }) {
  const full = group.spotsLeft <= 0;
  return (
    <Link
      href={`/groups/${group.slug}`}
      onMouseEnter={onHover ? () => onHover(group.id) : undefined}
      onMouseLeave={onHover ? () => onHover(null) : undefined}
      className={cn(
        "group block rounded-xl border bg-card p-5 no-underline transition-colors hover:border-gold",
        selected && "border-gold ring-1 ring-gold/40",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {group.startDate ? (
            <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-gold-deep dark:text-gold-light">
              Starts {startLabel(group.startDate)}
            </p>
          ) : null}
          <h3 className="text-pretty font-display text-xl leading-snug text-foreground group-hover:text-gold-deep dark:group-hover:text-gold-light">{group.title}</h3>
        </div>
        <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold", full ? "bg-muted text-muted-foreground" : "bg-gold/15 text-gold-deep dark:text-gold-light")}>
          {spotsText(group)}
        </span>
      </div>

      <ul className="mt-4 grid gap-1.5 text-[14px] text-muted-foreground">
        <li className="flex items-center gap-2"><CalendarDays className="h-4 w-4 shrink-0 text-gold" /> {scheduleLabel(group)}</li>
        <li className="flex items-center gap-2">
          {group.format === "online" ? <Globe className="h-4 w-4 shrink-0 text-gold" /> : <MapPin className="h-4 w-4 shrink-0 text-gold" />}
          <span className="truncate">
            {group.areaLabel}
            {group.format === "hybrid" ? " · or online" : ""}
            {group.distanceMiles != null ? ` · ${group.distanceMiles < 1 ? "<1" : Math.round(group.distanceMiles)} mi` : ""}
          </span>
        </li>
        <li className="flex items-center gap-2"><Users className="h-4 w-4 shrink-0 text-gold" /> {FORMATS[group.format]} · {group.durationWeeks} weeks</li>
      </ul>

      <div className="mt-4 flex items-center gap-2.5 border-t pt-3">
        <Initials name={group.facilitator.name} photo={group.facilitator.photoUrl} className="h-8 w-8 text-xs" />
        <p className="min-w-0 truncate text-sm">
          <span className="text-foreground">{group.facilitator.name}</span>
          {group.churchOrg || group.facilitator.churchOrg ? <span className="text-muted-foreground"> · {group.churchOrg || group.facilitator.churchOrg}</span> : null}
        </p>
      </div>
    </Link>
  );
}
