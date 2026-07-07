import { PilotShell } from "@/components/pilot/pilot-shell";
import { SurveyForm } from "@/components/pilot/survey-form";
import { resolveSurveyFields } from "@/lib/pilot/forms-data";

export const dynamic = "force-dynamic";

export default async function GeneralSurveyPage() {
  const fields = await resolveSurveyFields("general");
  return (
    <PilotShell
      eyebrow="Final feedback"
      title="Created for More 7-Day Stewardship Pilot Feedback"
      description="Thank you for walking through the pilot. Please be honest. Encouragement is helpful, but honest feedback is even more valuable."
    >
      <SurveyForm surveyType="general" fields={fields} />
    </PilotShell>
  );
}
