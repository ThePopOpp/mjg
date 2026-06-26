import { SectionHeader } from "@/components/dashboard/section-header";
import { loadBookingManagerData, loadStaffOptions } from "@/lib/booking/data";
import { BookingsClient } from "./bookings-client";

export const dynamic = "force-dynamic";
export const metadata = { title: "Bookings & Events — MJG Dashboard" };

export default async function BookingsPage() {
  const [data, staff] = await Promise.all([loadBookingManagerData(), loadStaffOptions()]);

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Workspace"
        title="Bookings & Events"
        description="Take 1:1 appointments and run group events — with public scheduling pages, availability rules, lead capture, and registrations."
      />
      <BookingsClient initialData={data} staffOptions={staff} />
    </div>
  );
}
