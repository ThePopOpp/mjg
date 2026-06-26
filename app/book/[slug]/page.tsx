import { notFound } from "next/navigation";
import { loadBookingTypeBySlug } from "@/lib/booking/data";
import { BookWidget } from "./book-widget";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const type = await loadBookingTypeBySlug(slug, { publicOnly: true }).catch(() => null);
  if (!type) return { title: "Booking not found" };
  return { title: `Book: ${type.name} — Michael J. Gauthier`, description: type.description || undefined };
}

export default async function BookTypePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const type = await loadBookingTypeBySlug(slug, { publicOnly: true });
  if (!type) notFound();

  return (
    <main className="min-h-screen bg-background px-4 py-12">
      <div className="mx-auto w-full max-w-3xl">
        <BookWidget
          slug={type.slug}
          name={type.name}
          description={type.description}
          durationMinutes={type.duration_minutes}
          locationType={type.location_type}
          locationDetails={type.location_details}
          hostName={type.host_name}
          color={type.color}
          timezone={type.timezone}
          questions={type.questions ?? []}
        />
      </div>
    </main>
  );
}
