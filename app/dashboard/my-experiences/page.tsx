import { redirect } from "next/navigation";
import { SectionHeader } from "@/components/dashboard/section-header";
import { FacilitatorExperiences } from "@/components/facilitator/facilitator-experiences";
import { getCurrentProfile } from "@/lib/auth/server";
import { canAccessPortal } from "@/lib/rbac/roles";
import { getTeamResults } from "@/lib/facilitator/team";
import { getFacilitatorExperiences } from "@/lib/facilitator/experiences";
import { getExperienceTypes } from "@/lib/experiences/repository";

export const dynamic = "force-dynamic";

export default async function MyExperiencesPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=/dashboard/my-experiences");
  if (!canAccessPortal(profile.role)) redirect("/access-restricted");

  const [{ experiences, emailEvents }, types, results] = await Promise.all([
    getFacilitatorExperiences(profile.id),
    getExperienceTypes(),
    getTeamResults(profile.id),
  ]);

  return (
    <div className="space-y-6">
      <SectionHeader title="Experiences" description="The experiences assigned to your team, plus surveys, form history, and check-in results." />
      <FacilitatorExperiences
        experiences={experiences}
        emailEvents={emailEvents}
        types={types.map((t) => ({ id: t.id, name: t.name, category: t.category, defaultFrequency: t.default_frequency, defaultDurationWeeks: t.default_duration_weeks }))}
        results={results}
      />
    </div>
  );
}
