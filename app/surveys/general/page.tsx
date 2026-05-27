import { GENERAL_SURVEY_FIELDS } from "@/lib/pilot/constants";
import { PilotShell } from "@/components/pilot/pilot-shell";
import { SurveyForm } from "@/components/pilot/survey-form";

export default function GeneralSurveyPage() {
  return (
    <PilotShell
      eyebrow="Final feedback"
      title="Created for More 7-Day Stewardship Pilot Feedback"
      description="Thank you for walking through the pilot. Please be honest. Encouragement is helpful, but honest feedback is even more valuable."
    >
      <SurveyForm surveyType="general" fields={GENERAL_SURVEY_FIELDS} />
    </PilotShell>
  );
}
