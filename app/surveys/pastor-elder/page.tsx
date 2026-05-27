import { PASTOR_ELDER_SURVEY_FIELDS } from "@/lib/pilot/constants";
import { PilotShell } from "@/components/pilot/pilot-shell";
import { SurveyForm } from "@/components/pilot/survey-form";

export default function PastorElderSurveyPage() {
  return (
    <PilotShell
      eyebrow="Pastor / Elder feedback"
      title="Pastor / Elder Feedback - Created for More 7-Day Stewardship Pilot"
      description="Thank you for taking time to review the pilot. I am asking for discernment so this can become biblically grounded, pastorally helpful, and practically useful."
    >
      <SurveyForm surveyType="pastor_elder" fields={PASTOR_ELDER_SURVEY_FIELDS} />
    </PilotShell>
  );
}
