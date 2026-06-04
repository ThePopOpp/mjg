import { SectionHeader } from "@/components/dashboard/section-header";
import { CheckInResultsDashboard } from "@/components/check-in/check-in-results-dashboard";
import { getPilotDashboardData } from "@/lib/dashboard/pilot-data";

export default async function CheckInResultsPage() {
  const data = await getPilotDashboardData();

  return (
    <div className="space-y-6">
      <SectionHeader title="Check-In Results" description="Review stewardship scores, lowest scoring areas, ranges, and completion trends." />
      <CheckInResultsDashboard checkIns={data.checkIns as any[]} />
    </div>
  );
}
