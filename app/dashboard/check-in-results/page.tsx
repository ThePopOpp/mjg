import { SectionHeader } from "@/components/dashboard/section-header";
import { CheckInResultsDashboard } from "@/components/check-in/check-in-results-dashboard";
import { CreatedForMoreResults } from "@/components/check-in/created-for-more-results";
import { CheckInBuilder } from "@/components/pilot/check-in-builder";
import { getPilotDashboardData } from "@/lib/dashboard/pilot-data";
import { listCheckInSubmissions } from "@/lib/check-in/submissions";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { McpReadableToggle } from "@/components/assessments/mcp-readable-toggle";
import { getCurrentProfile } from "@/lib/auth/server";
import { ROLES } from "@/lib/rbac/roles";

export const dynamic = "force-dynamic";

export default async function CheckInResultsPage() {
  const [data, submissions, profile] = await Promise.all([getPilotDashboardData(), listCheckInSubmissions(), getCurrentProfile()]);
  const isSuperAdmin = profile?.role === ROLES.SUPER_ADMIN;

  return (
    <div className="space-y-6">
      <SectionHeader title="Check-In Results" description="Review stewardship scores and completion trends, and build the Created for More Check-In." />
      <Tabs defaultValue="created-for-more" className="w-full">
        <TabsList>
          <TabsTrigger value="created-for-more">Created for More{submissions.length ? ` (${submissions.length})` : ""}</TabsTrigger>
          <TabsTrigger value="results">Pilot Check-Ins</TabsTrigger>
          <TabsTrigger value="builder">Builder</TabsTrigger>
        </TabsList>
        <TabsContent value="created-for-more" className="mt-4 space-y-4">
          {isSuperAdmin && <McpReadableToggle assessment="created-for-more" />}
          <CreatedForMoreResults submissions={submissions} />
        </TabsContent>
        <TabsContent value="results" className="mt-4">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <CheckInResultsDashboard checkIns={data.checkIns as any[]} />
        </TabsContent>
        <TabsContent value="builder" className="mt-4 space-y-4">
          {isSuperAdmin && <McpReadableToggle assessment="check-in" />}
          <CheckInBuilder />
        </TabsContent>
      </Tabs>
    </div>
  );
}
