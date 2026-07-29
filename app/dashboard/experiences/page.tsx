import Link from "next/link";
import { redirect } from "next/navigation";
import { Settings2 } from "lucide-react";
import { SectionHeader } from "@/components/dashboard/section-header";
import { Button } from "@/components/ui/button";
import { ExperiencesList } from "@/components/experiences/experiences-list";
import { NewExperienceButton } from "@/components/experiences/new-experience-button";
import { getCurrentProfile } from "@/lib/auth/server";
import { can, PERMISSIONS } from "@/lib/rbac/permissions";
import { getExperiencesData, getFacilitators } from "@/lib/experiences/repository";

export const dynamic = "force-dynamic";

export default async function ExperiencesPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=/dashboard/experiences");
  if (!can(profile.role, PERMISSIONS.MANAGE_EXPERIENCES)) redirect("/access-restricted");

  const [{ experiences, emailEvents }, facilitators] = await Promise.all([getExperiencesData(), getFacilitators()]);
  const facilitatorOptions = facilitators.map((f: any) => ({ id: f.id, name: f.full_name || `${f.first_name ?? ""} ${f.last_name ?? ""}`.trim() || f.email }));

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
      <ExperiencesList experiences={experiences} emailEvents={emailEvents} facilitators={facilitatorOptions} />
    </div>
  );
}
