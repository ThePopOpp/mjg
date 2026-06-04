import { SectionHeader } from "@/components/dashboard/section-header";
import { SurveyResponsesDashboard } from "@/components/surveys/survey-responses-dashboard";
import { getPilotDashboardData } from "@/lib/dashboard/pilot-data";

export default async function SurveysPage() {
  const data = await getPilotDashboardData();

  return (
    <div className="space-y-6">
      <SectionHeader title="Surveys" description="Monitor general survey and Pastor/Elder survey distribution, completions, and feedback themes." />
      <SurveyResponsesDashboard surveys={data.surveys as any[]} />
    </div>
  );
}
