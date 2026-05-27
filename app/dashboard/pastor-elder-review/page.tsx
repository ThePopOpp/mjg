import { CircleUserRound } from "lucide-react";
import { EmptyState } from "@/components/dashboard/empty-state";
import { SectionHeader } from "@/components/dashboard/section-header";

export default function PastorElderReviewPage() {
  return (
    <div className="space-y-6">
      <SectionHeader title="Pastor/Elder Review" description="Coordinate limited reviewer access, feedback assignments, and ministry partnership signals." />
      <EmptyState icon={CircleUserRound} title="Reviewer workflow" description="This section will support assigned review items and restricted Pastor/Elder reviewer access." />
    </div>
  );
}
