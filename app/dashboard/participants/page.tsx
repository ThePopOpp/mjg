import { SectionHeader } from "@/components/dashboard/section-header";
import { ParticipantsTable } from "@/components/participants/participants-table";
import { getPilotDashboardData } from "@/lib/dashboard/pilot-data";

export default async function ParticipantsPage() {
  const data = await getPilotDashboardData();

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Participants"
        description="Manage Created for More pilot contacts, Check-In progress, tags, notes, and consent records."
      />
      <ParticipantsTable participants={data.participants as any[]} />
      {data.error ? <p className="text-sm text-destructive">{data.error}</p> : null}
    </div>
  );
}
