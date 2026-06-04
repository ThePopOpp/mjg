import { SectionHeader } from "@/components/dashboard/section-header";
import { ParticipantsTabs } from "@/components/participants/participants-tabs";
import { TagsSegmentsDashboard } from "@/components/tags-segments/tags-segments-dashboard";
import { getPilotDashboardData } from "@/lib/dashboard/pilot-data";

export default async function ParticipantTagsSegmentsPage() {
  const data = await getPilotDashboardData();

  return (
    <div className="space-y-6">
      <SectionHeader title="Participants" description="View tag counts, filter participants, and build CRM-style stewardship segments." />
      <ParticipantsTabs active="tags-segments" />
      <TagsSegmentsDashboard tags={data.tags as any[]} participants={data.participants as any[]} />
      {data.error ? <p className="text-sm text-destructive">{data.error}</p> : null}
    </div>
  );
}
