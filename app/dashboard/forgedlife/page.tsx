import { SectionHeader } from "@/components/dashboard/section-header";
import { ForgedLifeAdmin } from "@/components/forgedlife/forgedlife-admin";
import { requirePagePermission } from "@/lib/rbac/guard";
import { PERMISSIONS } from "@/lib/rbac/permissions";
import { getForgedOverview } from "@/lib/forgedlife/admin";

export const dynamic = "force-dynamic";

// Super Admin: what theforged.life has sent — access requests, churches, groups, the event log and the switches.
export default async function ForgedLifePage() {
  await requirePagePermission(PERMISSIONS.MANAGE_FORGEDLIFE, "/dashboard/forgedlife");
  const data = await getForgedOverview();
  return (
    <div className="space-y-6">
      <SectionHeader
        title="ForgedLife"
        description="People, churches and groups shared from ForgedLife by people who consented. Nothing reaches MJG members, churches or Find a Group until it's approved here."
      />
      <ForgedLifeAdmin data={data} />
    </div>
  );
}
