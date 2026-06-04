import { SectionHeader } from "@/components/dashboard/section-header";
import { TagsSegmentsDashboard } from "@/components/tags-segments/tags-segments-dashboard";
import { getPilotDashboardData } from "@/lib/dashboard/pilot-data";

export default async function TagsSegmentsPage() {
  const data = await getPilotDashboardData();

  return (
    <div className="space-y-6">
      <SectionHeader title="Tags & Segments" description="View tag counts, filter participants, and build CRM-style stewardship segments." />
      <TagsSegmentsDashboard tags={data.tags as any[]} participants={data.participants as any[]} />
      {data.error ? <p className="text-sm text-destructive">{data.error}</p> : null}
    </div>
  );
}
