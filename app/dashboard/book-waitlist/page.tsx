import { SectionHeader } from "@/components/dashboard/section-header";
import { BookWaitlistAdmin } from "@/components/book-waitlist/book-waitlist-admin";
import { getBookWaitlistStats, listBookWaitlist } from "@/lib/book-waitlist/repository";

export const dynamic = "force-dynamic";

export default async function BookWaitlistPage() {
  const [requests, stats] = await Promise.all([listBookWaitlist(), getBookWaitlistStats()]);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Book Waitlist"
        description="Everyone waiting on The Life You're Building — who they are, whether they have an MJG account, and how they'd like to read it."
      />
      <BookWaitlistAdmin requests={requests} stats={stats} />
    </div>
  );
}
