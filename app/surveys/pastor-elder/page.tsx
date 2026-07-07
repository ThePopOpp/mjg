import { PilotShell } from "@/components/pilot/pilot-shell";
import { SurveyForm } from "@/components/pilot/survey-form";
import { resolveSurveyFields } from "@/lib/pilot/forms-data";

export const dynamic = "force-dynamic";

export default async function PastorElderSurveyPage() {
  const fields = await resolveSurveyFields("pastor-elder");
  return (
    <PilotShell
      eyebrow="Pastor / Elder feedback"
      title="Pastor / Elder Feedback - Created for More 7-Day Stewardship Pilot"
      description="Thank you for taking time to review the pilot. I am asking for discernment so this can become biblically grounded, pastorally helpful, and practically useful."
    >
      <SurveyForm surveyType="pastor_elder" fields={fields} />
    </PilotShell>
  );
}
