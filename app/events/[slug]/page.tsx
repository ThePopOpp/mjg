import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CalendarDays, Clock, Globe, MapPin, Users } from "lucide-react";
import { loadEventBySlug } from "@/lib/booking/data";
import { EventRegisterForm } from "./register-form";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await loadEventBySlug(slug, { publicOnly: true }).catch(() => null);
  if (!event) return { title: "Event not found" };
  return { title: `${event.title} — Michael J. Gauthier`, description: event.summary || undefined };
}

function fmtRange(startIso: string, endIso: string | null, tz: string) {
  const start = new Date(startIso).toLocaleString([], { timeZone: tz, weekday: "long", month: "long", day: "numeric", hour: "numeric", minute: "2-digit" });
  if (!endIso) return start;
  const end = new Date(endIso).toLocaleTimeString([], { timeZone: tz, hour: "numeric", minute: "2-digit" });
  return `${start} – ${end}`;
}

export default async function EventDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await loadEventBySlug(slug, { publicOnly: true });
  if (!event) notFound();

  const Icon = event.location_type === "online" ? Globe : MapPin;
  const full = event.capacity != null && (event.registered_count ?? 0) >= event.capacity;
  const closed = event.registration_closes_at ? new Date(event.registration_closes_at) < new Date() : false;
  const spotsLeft = event.capacity != null ? Math.max(0, event.capacity - (event.registered_count ?? 0)) : null;

  return (
    <main className="min-h-screen bg-background px-4 py-12">
      <div className="mx-auto w-full max-w-3xl">
        <Link href="/events" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> All events</Link>

        {event.cover_image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={event.cover_image_url} alt={event.title} className="mb-6 aspect-[2/1] w-full rounded-2xl border border-border object-cover" />
        )}

        <div className="md:grid md:grid-cols-[1fr_320px] md:gap-8">
          <div>
            <h1 className="font-serif text-3xl font-semibold leading-tight">{event.title}</h1>
            {event.summary && <p className="mt-2 text-lg text-muted-foreground">{event.summary}</p>}

            <div className="mt-5 space-y-2.5 text-sm">
              <div className="flex items-center gap-2.5"><CalendarDays className="h-4 w-4 text-primary" /> {fmtRange(event.start_at, event.end_at, event.timezone)}</div>
              <div className="flex items-center gap-2.5"><Clock className="h-4 w-4 text-primary" /> {event.timezone.replace(/_/g, " ")}</div>
              <div className="flex items-center gap-2.5"><Icon className="h-4 w-4 text-primary" /> {event.location_type === "online" ? "Online event" : [event.location_name, event.location_address].filter(Boolean).join(" · ") || "In person"}</div>
              {event.host_name && <div className="flex items-center gap-2.5"><Users className="h-4 w-4 text-primary" /> Hosted by {event.host_name}</div>}
            </div>

            {event.description && <div className="mt-6 whitespace-pre-wrap border-t border-border pt-6 text-sm leading-relaxed text-muted-foreground">{event.description}</div>}
          </div>

          {/* Registration rail */}
          <div className="mt-6 md:mt-0">
            <div className="rounded-2xl border border-border bg-card p-5 md:sticky md:top-6">
              {event.registration_required ? (
                <EventRegisterForm
                  slug={event.slug}
                  customFields={event.custom_fields ?? []}
                  full={full}
                  closed={closed}
                  spotsLeft={spotsLeft}
                />
              ) : (
                <div className="text-center text-sm text-muted-foreground">
                  <p className="font-medium text-foreground">No registration needed</p>
                  <p className="mt-1">Just show up — we look forward to seeing you there.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
