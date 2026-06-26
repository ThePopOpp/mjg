import Link from "next/link";
import { ArrowRight, Clock, Phone, Video, MapPin } from "lucide-react";
import { loadPublicBookingTypes } from "@/lib/booking/data";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Book a time — Michael J. Gauthier",
  description: "Schedule a consultation, partnership call, or discovery call with Michael J. Gauthier.",
};

const ICONS: Record<string, typeof Video> = { video: Video, phone: Phone, in_person: MapPin, custom: Clock };

export default async function BookIndexPage() {
  const types = await loadPublicBookingTypes().catch(() => []);

  return (
    <main className="min-h-screen bg-background px-4 py-16">
      <div className="mx-auto w-full max-w-2xl">
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Schedule</p>
          <h1 className="mt-2 font-serif text-3xl font-semibold">Book a time</h1>
          <p className="mt-2 text-sm text-muted-foreground">Choose the kind of conversation you&apos;d like to have.</p>
        </div>

        {types.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">No booking options are open right now. Please check back soon.</div>
        ) : (
          <div className="space-y-3">
            {types.map((t) => {
              const Icon = ICONS[t.location_type] ?? Clock;
              return (
                <Link key={t.id} href={`/book/${t.slug}`} className="group flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/50">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-white" style={{ background: t.color || "#0f766e" }}><Icon className="h-5 w-5" /></span>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold">{t.name}</div>
                    <div className="mt-0.5 text-xs text-muted-foreground">{t.duration_minutes} min{t.host_name ? ` · ${t.host_name}` : ""}{t.description ? ` · ${t.description}` : ""}</div>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
