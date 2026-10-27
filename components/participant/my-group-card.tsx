import Link from "next/link";
import { ArrowRight, CalendarDays, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { listMyReservations } from "@/lib/facilitator-groups/reservations";
import { getFinderSettings } from "@/lib/facilitator-groups/repository";
import { STATUS_LABELS, scheduleLabel } from "@/lib/facilitator-groups/shared";

// Participant dashboard: the group(s) they've joined or asked to join, with the meeting place
// once confirmed — or a nudge to Find a Group.
export async function MyGroupCard({ profileId }: { profileId: string }) {
  const [mine, finder] = await Promise.all([listMyReservations(profileId).catch(() => []), getFinderSettings()]);
  if (!mine.length && finder.mode === "hidden") return null;

  return (
    <div className="space-y-4 border-t pt-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold tracking-tight">My Group</h2>
        <Button asChild size="sm" variant={mine.length ? "outline" : "default"}>
          <Link href="/groups">{mine.length ? "Browse groups" : "Find a group"} <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
        </Button>
      </div>
      {mine.length ? (
        <div className="grid gap-3 md:grid-cols-2">
          {mine.map(({ reservation, group, place, facilitatorName }) => (
            <div key={reservation.id} className="rounded-xl border p-4">
              <div className="flex items-start justify-between gap-2">
                <Link href={`/groups/${group.slug}`} className="font-semibold text-foreground hover:underline">{group.title}</Link>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${reservation.status === "confirmed" ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}>
                  {STATUS_LABELS[reservation.status]}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">Led by {facilitatorName}</p>
              <p className="mt-3 flex items-center gap-2 text-sm"><CalendarDays className="h-4 w-4 text-primary" /> {scheduleLabel(group)}</p>
              <p className="mt-1 flex items-start gap-2 text-sm">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                {place ?? (group.format === "online" ? "Online" : `${[group.city, group.state].filter(Boolean).join(", ")} — the address is shared once you're confirmed`)}
              </p>
              <Link href="/dashboard/direct-messages" className="mt-3 inline-block text-sm text-primary hover:underline">Message {facilitatorName.split(" ")[0]}</Link>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          {finder.mode === "open"
            ? "You're not in a group yet. Find one that fits your schedule and save your spot."
            : `You're not in a group yet. Browse the groups forming now — sign-ups open ${finder.opensLabel ?? "soon"}.`}
        </p>
      )}
    </div>
  );
}
