import Link from "next/link";
import { redirect } from "next/navigation";
import { SectionHeader } from "@/components/dashboard/section-header";
import { ChurchAdminApplicationForm, FacilitatorApplicationForm } from "@/components/churches/my-church";
import { getCurrentProfile } from "@/lib/auth/server";
import { ROLES } from "@/lib/rbac/roles";
import { adminChurchIdsFor, listChurches, listFacilitatorApplications } from "@/lib/churches/repository";
import { listChurchAdminApplications } from "@/lib/churches/applications";

export const dynamic = "force-dynamic";

// My Church: a facilitator asks their church to approve them; anyone signed in can ask to be a
// church admin. Someone who already administers a church gets a link to their church page.
export default async function MyChurchPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=/dashboard/my-church");
  if (profile.role === ROLES.CHURCH_ADMIN) redirect("/dashboard/church");

  const isFacilitator = profile.role === ROLES.FACILITATOR;
  const [churches, facilitatorApps, adminApps, adminOf] = await Promise.all([
    listChurches(),
    isFacilitator ? listFacilitatorApplications({ profileId: profile.id }) : Promise.resolve([]),
    listChurchAdminApplications({ profileId: profile.id }),
    adminChurchIdsFor(profile.id),
  ]);
  const options = churches.map((c) => ({ id: c.id, name: c.name, place: [c.city, c.state].filter(Boolean).join(", ") }));

  return (
    <div className="space-y-6">
      <SectionHeader title="My Church" description="Connect your group to your church." />
      {adminOf.length ? (
        <p className="text-sm">
          You're a church admin. <Link href="/dashboard/church" className="font-medium text-[#b88a4a] hover:underline">Review facilitator applications →</Link>
        </p>
      ) : null}
      <div className="grid gap-6 lg:grid-cols-2">
        {isFacilitator ? (
          <FacilitatorApplicationForm
            churches={options}
            applications={facilitatorApps.map((a) => ({ id: a.id, churchName: a.churchName, status: a.status, createdAt: a.createdAt, note: a.note }))}
          />
        ) : null}
        <ChurchAdminApplicationForm
          churches={options.filter((c) => !adminOf.includes(c.id))}
          applications={adminApps.map((a) => ({ id: a.id, churchName: a.churchName, status: a.status, createdAt: a.createdAt, note: a.decisionNote }))}
        />
      </div>
    </div>
  );
}
