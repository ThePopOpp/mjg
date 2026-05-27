import { Waves } from "lucide-react";
import { EmptyState } from "@/components/dashboard/empty-state";
import { SectionHeader } from "@/components/dashboard/section-header";

export default function WavesPage() {
  return (
    <div className="space-y-6">
      <SectionHeader title="Waves" description="Track Wave 0 through Wave 3 invitations, opt-ins, completions, and follow-up readiness." />
      <EmptyState icon={Waves} title="Wave management foundation" description="Wave counts, cohorts, and launch readiness controls will live here." />
    </div>
  );
}
