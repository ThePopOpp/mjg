import { redirect } from "next/navigation";
import { SectionHeader } from "@/components/dashboard/section-header";
import { ExperienceWizard } from "@/components/experiences/experience-wizard";
import { getCurrentProfile } from "@/lib/auth/server";
import { can, PERMISSIONS } from "@/lib/rbac/permissions";
import { getExperienceTypes, getFacilitators } from "@/lib/experiences/repository";

export const dynamic = "force-dynamic";

export default async function NewExperiencePage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=/dashboard/experiences/new");
  if (!can(profile.role, PERMISSIONS.MANAGE_EXPERIENCES)) redirect("/access-restricted");

  const [types, facilitators] = await Promise.all([getExperienceTypes(), getFacilitators()]);

  return (
    <div className="space-y-6">
      <SectionHeader title="New Experience" description="Set up a program and send its email sequence to recipients." />
      <ExperienceWizard
        types={types.map((t) => ({
          id: t.id,
          name: t.name,
          defaultFrequency: t.default_frequency,
          defaultDurationWeeks: t.default_duration_weeks,
        }))}
        facilitators={facilitators.map((f: any) => ({
          id: f.id,
          name: f.full_name || `${f.first_name ?? ""} ${f.last_name ?? ""}`.trim() || f.email,
        }))}
      />
    </div>
  );
}
