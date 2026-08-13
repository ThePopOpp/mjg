import { redirect } from "next/navigation";
import { SectionHeader } from "@/components/dashboard/section-header";
import { ExperienceWizard } from "@/components/experiences/experience-wizard";
import { getCurrentProfile } from "@/lib/auth/server";
import { can, PERMISSIONS } from "@/lib/rbac/permissions";
import { getAllTypesWithSteps, getEmailTemplateOptions, getFacilitators } from "@/lib/experiences/repository";

export const dynamic = "force-dynamic";

export default async function NewExperiencePage({ searchParams }: { searchParams: Promise<{ preview?: string }> }) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=/dashboard/experiences/new");
  if (!can(profile.role, PERMISSIONS.MANAGE_EXPERIENCES)) redirect("/access-restricted");

  const { preview } = await searchParams;
  const [types, templates, facilitators] = await Promise.all([
    getAllTypesWithSteps(),
    getEmailTemplateOptions(),
    getFacilitators(),
  ]);

  return (
    <div className="space-y-6">
      <SectionHeader title="New Experience" description="Set up a program and send its email sequence to recipients." />
      <ExperienceWizard
        types={types.map((t) => ({
          id: t.id,
          name: t.name,
          category: t.category,
          defaultFrequency: t.default_frequency,
          defaultDurationWeeks: t.default_duration_weeks,
          steps: t.steps
            .slice()
            .sort((a, b) => a.step_number - b.step_number)
            .map((s) => ({
              stepNumber: s.step_number,
              emailTemplateId: s.email_template_id,
              offsetValue: s.offset_value,
              offsetUnit: s.offset_unit,
            })),
        }))}
        templates={templates.map((tpl: any) => ({ id: tpl.id, name: tpl.name }))}
        facilitators={facilitators.map((f: any) => ({
          id: f.id,
          name: f.full_name || `${f.first_name ?? ""} ${f.last_name ?? ""}`.trim() || f.email,
        }))}
        previewId={preview ?? null}
      />
    </div>
  );
}
