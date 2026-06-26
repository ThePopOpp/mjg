import Link from "next/link";
import { ArrowRight, CalendarDays, Globe, MapPin } from "lucide-react";
import { loadPublicEvents } from "@/lib/booking/data";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Events — Michael J. Gauthier",
  description: "Upcoming events, webinars, and gatherings with Michael J. Gauthier.",
};

function fmt(iso: string, tz: string) {
  return new Date(iso).toLocaleString([], { timeZone: tz, weekday: "long", month: "long", day: "numeric", hour: "numeric", minute: "2-digit" });
}

export default async function EventsIndexPage() {
  const events = await loadPublicEvents().catch(() => []);

  return (
    <main className="min-h-screen bg-background px-4 py-16">
      <div className="mx-auto w-full max-w-2xl">
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Gather</p>
          <h1 className="mt-2 font-serif text-3xl font-semibold">Upcoming events</h1>
        </div>

        {events.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">No upcoming events right now. Please check back soon.</div>
        ) : (
          <div className="space-y-3">
            {events.map((e) => {
              const Icon = e.location_type === "online" ? Globe : MapPin;
              const full = e.capacity != null && (e.registered_count ?? 0) >= e.capacity;
              return (
                <Link key={e.id} href={`/events/${e.slug}`} className="group flex gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/50">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><CalendarDays className="h-5 w-5" /></span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2"><span className="font-semibold">{e.title}</span>{full && <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400">Waitlist</span>}</div>
                    <div className="mt-0.5 text-xs text-muted-foreground">{fmt(e.start_at, e.timezone)}</div>
                    <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><Icon className="h-3 w-3" />{e.location_type === "online" ? "Online" : e.location_name || "In person"}</div>
                    {e.summary && <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground">{e.summary}</p>}
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 self-center text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
