import { SectionHeader } from "@/components/dashboard/section-header";
import { SurveyResponsesDashboard } from "@/components/surveys/survey-responses-dashboard";
import { SurveyBuilder } from "@/components/pilot/survey-builder";
import { getPilotDashboardData } from "@/lib/dashboard/pilot-data";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { getCurrentProfile } from "@/lib/auth/server";
import { ROLES } from "@/lib/rbac/roles";

export const dynamic = "force-dynamic";

export default async function SurveysPage() {
  const [data, profile] = await Promise.all([getPilotDashboardData(), getCurrentProfile()]);

  return (
    <div className="space-y-6">
      <SectionHeader title="Surveys" description="Monitor responses and build the participant surveys (general + Pastor/Elder, plus your own)." />
      <Tabs defaultValue="responses" className="w-full">
        <TabsList>
          <TabsTrigger value="responses">Responses</TabsTrigger>
          <TabsTrigger value="builder">Builder</TabsTrigger>
        </TabsList>
        <TabsContent value="responses" className="mt-4">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <SurveyResponsesDashboard surveys={data.surveys as any[]} />
        </TabsContent>
        <TabsContent value="builder" className="mt-4">
          <SurveyBuilder canSetMcpReadable={profile?.role === ROLES.SUPER_ADMIN} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
