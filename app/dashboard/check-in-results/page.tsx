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
import { LeadershipResults } from "@/components/leadership-check-in/leadership-results";
import { countLeadershipStarts, listLeadershipSubmissions } from "@/lib/leadership-check-in/submissions";

export const dynamic = "force-dynamic";

export default async function CheckInResultsPage() {
  const [data, submissions, profile, leadership, leadershipStarts] = await Promise.all([
    getPilotDashboardData(),
    listCheckInSubmissions(),
    getCurrentProfile(),
    listLeadershipSubmissions(),
    countLeadershipStarts(),
  ]);
  const isSuperAdmin = profile?.role === ROLES.SUPER_ADMIN;

  return (
    <div className="space-y-6">
      <SectionHeader title="Check-In Results" description="Review stewardship scores and completion trends, and build the Created for More Check-In." />
      <Tabs defaultValue="created-for-more" className="w-full">
        <TabsList>
          <TabsTrigger value="created-for-more">Created for More{submissions.length ? ` (${submissions.length})` : ""}</TabsTrigger>
          <TabsTrigger value="leadership">Leadership{leadership.length ? ` (${leadership.filter((s) => !s.test).length})` : ""}</TabsTrigger>
          <TabsTrigger value="results">Pilot Check-Ins</TabsTrigger>
          <TabsTrigger value="builder">Builder</TabsTrigger>
        </TabsList>
        <TabsContent value="created-for-more" className="mt-4 space-y-4">
          {isSuperAdmin && <McpReadableToggle assessment="created-for-more" />}
          <CreatedForMoreResults submissions={submissions} />
        </TabsContent>
        <TabsContent value="leadership" className="mt-4 space-y-4">
          {isSuperAdmin && <McpReadableToggle assessment="leadership-check-in" />}
          <LeadershipResults submissions={leadership} starts={leadershipStarts} />
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
