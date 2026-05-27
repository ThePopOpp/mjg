import { CircleUserRound } from "lucide-react";
import { EmptyState } from "@/components/dashboard/empty-state";
import { SectionHeader } from "@/components/dashboard/section-header";

export default async function ParticipantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <SectionHeader title="Participant detail" description={`Participant record: ${id}`} />
      <EmptyState
        icon={CircleUserRound}
        title="Participant profile shell"
        description="This detail view will show contact info, Check-In results, journey status, consent, notes, tags, and related activity."
      />
    </div>
  );
}
