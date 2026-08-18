import { redirect } from "next/navigation";
import { SectionHeader } from "@/components/dashboard/section-header";
import { FacilitatorExperiences } from "@/components/facilitator/facilitator-experiences";
import { getCurrentProfile } from "@/lib/auth/server";
import { canAccessPortal } from "@/lib/rbac/roles";
import { getTeamResults, getFacilitatorTeam } from "@/lib/facilitator/team";
import { getFacilitatorExperiences } from "@/lib/facilitator/experiences";
import { getFacilitatorAllowedTypeIds } from "@/lib/facilitator/access";
import { getExperienceTypes } from "@/lib/experiences/repository";

export const dynamic = "force-dynamic";

export default async function MyExperiencesPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=/dashboard/my-experiences");
  if (!canAccessPortal(profile.role)) redirect("/access-restricted");

  const [{ experiences, emailEvents }, types, results, team, allowedTypeIds] = await Promise.all([
    getFacilitatorExperiences(profile.id),
    getExperienceTypes(),
    getTeamResults(profile.id),
    getFacilitatorTeam(profile.id),
    getFacilitatorAllowedTypeIds(profile.id),
  ]);
  const teamMembers = team.participants
    .filter((p) => p.email)
    .map((p) => ({ name: `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim(), email: String(p.email) }));
  // Super Admins control which challenges a facilitator can start/see.
  const allowed = new Set(allowedTypeIds);
  const sixWcTypeId = types.find((t) => t.slug === "six-week-challenge")?.id ?? null;
  const canStartChallenge = Boolean(sixWcTypeId && allowed.has(sixWcTypeId));
  const allowedTypes = types.filter((t) => allowed.has(t.id));

  return (
    <div className="space-y-6">
      <SectionHeader title="Experiences" description="The experiences assigned to your team, plus surveys, form history, and check-in results." />
      <FacilitatorExperiences
        experiences={experiences}
        emailEvents={emailEvents}
        types={allowedTypes.map((t) => ({ id: t.id, name: t.name, category: t.category, defaultFrequency: t.default_frequency, defaultDurationWeeks: t.default_duration_weeks }))}
        results={results}
        teamMembers={teamMembers}
        canStartChallenge={canStartChallenge}
      />
    </div>
  );
}
