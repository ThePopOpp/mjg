import { redirect } from "next/navigation";
import { SectionHeader } from "@/components/dashboard/section-header";
import { AutomationStatusView } from "@/components/experiences/automation-status";
import { getCurrentProfile } from "@/lib/auth/server";
import { can, PERMISSIONS } from "@/lib/rbac/permissions";
import { getAutomationStatus, listGroups } from "@/lib/experiences/automation";

export const dynamic = "force-dynamic";

export default async function EmailAutomationPage({
  searchParams,
}: {
  searchParams: Promise<{ group?: string }>;
}) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=/dashboard/experiences/automation");
  if (!can(profile.role, PERMISSIONS.MANAGE_EXPERIENCES)) redirect("/access-restricted");

  const { group } = await searchParams;
  const groups = await listGroups();
  // Default to the most recent group so the page is useful on first load.
  const selectedId = group ?? groups[0]?.id ?? null;
  const status = selectedId ? await getAutomationStatus(selectedId) : null;

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Email Automation"
        description="Pick a group to see which emails have gone out, which are queued, and whether anything needs attention."
      />
      <AutomationStatusView groups={groups} status={status} />
    </div>
  );
}
