import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { SectionHeader } from "@/components/dashboard/section-header";
import { ExperienceTypesEditor } from "@/components/experiences/experience-types-editor";
import { getCurrentProfile } from "@/lib/auth/server";
import { can, PERMISSIONS } from "@/lib/rbac/permissions";
import { getAllTypesWithSteps, getEmailTemplateOptions } from "@/lib/experiences/repository";

export const dynamic = "force-dynamic";

export default async function ExperienceTypesPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=/dashboard/experiences/types");
  if (!can(profile.role, PERMISSIONS.MANAGE_EXPERIENCES)) redirect("/access-restricted");

  const [types, templates] = await Promise.all([getAllTypesWithSteps(), getEmailTemplateOptions()]);

  return (
    <div className="space-y-6">
      <Link href="/dashboard/experiences" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Experiences
      </Link>
      <SectionHeader
        title="Experience Types"
        description="Configure the programs facilitators run — and the different email that goes out each week."
      />
      <ExperienceTypesEditor
        types={types.map((t) => ({
          id: t.id,
          name: t.name,
          description: t.description,
          default_frequency: t.default_frequency,
          default_duration_weeks: t.default_duration_weeks,
          steps: t.steps.map((s) => ({ step_number: s.step_number, label: s.label, email_template_id: s.email_template_id })),
        }))}
        templates={templates.map((tpl: any) => ({ id: tpl.id, name: tpl.name }))}
      />
    </div>
  );
}
