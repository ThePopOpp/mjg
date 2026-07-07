import { notFound } from "next/navigation";
import { PilotShell } from "@/components/pilot/pilot-shell";
import { SurveyForm } from "@/components/pilot/survey-form";
import { getFormBySlug } from "@/lib/pilot/forms-data";
import { surveyTypeForSlug, type SurveyDefinition } from "@/lib/pilot/form-types";

export const dynamic = "force-dynamic";

// Custom (builder-created) surveys. The two seeded surveys keep their own static
// routes (/surveys/general, /surveys/pastor-elder), which take precedence.
export default async function CustomSurveyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const form = await getFormBySlug(slug);
  if (!form || form.kind !== "survey" || form.status !== "published" || !form.published_definition) notFound();
  const def = form.published_definition as SurveyDefinition;
  return (
    <PilotShell eyebrow="Feedback" title={form.title} description={form.description ?? ""}>
      <SurveyForm surveyType={surveyTypeForSlug(slug)} fields={def.fields} />
    </PilotShell>
  );
}
