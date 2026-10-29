import { SectionHeader } from "@/components/dashboard/section-header";
import { ChurchesAdmin } from "@/components/churches/churches-admin";
import { requirePagePermission } from "@/lib/rbac/guard";
import { PERMISSIONS } from "@/lib/rbac/permissions";
import { listChurchAdmins, listChurches, listFacilitatorApplications } from "@/lib/churches/repository";
import { listChurchAdminApplications } from "@/lib/churches/applications";

export const dynamic = "force-dynamic";

// Super Admin: churches, church admins, and the church admin + facilitator applications.
export default async function ChurchesPage() {
  await requirePagePermission(PERMISSIONS.MANAGE_CHURCHES, "/dashboard/churches");
  const [churches, admins, adminApplications, facilitatorApplications] = await Promise.all([
    listChurches({ includeArchived: true }),
    listChurchAdmins(),
    listChurchAdminApplications(),
    listFacilitatorApplications(),
  ]);
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Churches"
        description="Churches groups can belong to, who administers each one, and the applications waiting for a decision. Church admins approve facilitators for their own church."
      />
      <ChurchesAdmin churches={churches} admins={admins} adminApplications={adminApplications} facilitatorApplications={facilitatorApplications} />
    </div>
  );
}
