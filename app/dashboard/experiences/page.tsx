import Link from "next/link";
import { redirect } from "next/navigation";
import { Settings2 } from "lucide-react";
import { SectionHeader } from "@/components/dashboard/section-header";
import { Button } from "@/components/ui/button";
import { ExperiencesList } from "@/components/experiences/experiences-list";
import { NewExperienceButton } from "@/components/experiences/new-experience-button";
import { StartChallengeAdminLauncher } from "@/components/experiences/start-challenge-admin-modal";
import { getCurrentProfile } from "@/lib/auth/server";
import { can, PERMISSIONS } from "@/lib/rbac/permissions";
import { getExperiencesData, getFacilitators } from "@/lib/experiences/repository";
import { getChallengeTypes } from "@/lib/facilitator/access";

export const dynamic = "force-dynamic";

export default async function ExperiencesPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=/dashboard/experiences");
  if (!can(profile.role, PERMISSIONS.MANAGE_EXPERIENCES)) redirect("/access-restricted");

  const [{ experiences, emailEvents }, facilitators, challengeTypes] = await Promise.all([getExperiencesData(), getFacilitators(), getChallengeTypes()]);
  const facilitatorOptions = facilitators.map((f: any) => ({ id: f.id, name: f.full_name || `${f.first_name ?? ""} ${f.last_name ?? ""}`.trim() || f.email }));
  const typeOptions = challengeTypes.map((t) => ({ id: t.id, name: t.name }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <SectionHeader
          title="Experiences"
          description="Build multi-week programs, add attendees, and let the sequence send itself to recipients on schedule."
        />
        <div className="flex items-center gap-2">
          <Link href="/dashboard/experiences/types">
            <Button variant="outline" size="sm"><Settings2 className="mr-2 h-4 w-4" /> Experience Types</Button>
          </Link>
          <NewExperienceButton />
        </div>
      </div>

      {typeOptions.length ? (
        <div className="rounded-xl border border-primary/30 bg-primary/[0.03] p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold">Start a new challenge or series</p>
              <p className="text-sm text-muted-foreground">Pick a challenge, add recipients, invite them, choose the start date, and set who can see it.</p>
            </div>
            <StartChallengeAdminLauncher types={typeOptions} facilitators={facilitatorOptions} />
          </div>
        </div>
      ) : null}

      <ExperiencesList experiences={experiences} emailEvents={emailEvents} facilitators={facilitatorOptions} />
    </div>
  );
}
