import { SectionHeader } from "@/components/dashboard/section-header";
import { DmInbox } from "@/components/direct-messages/dm-inbox";
import { getCurrentProfile } from "@/lib/auth/server";
import { ROLES } from "@/lib/rbac/roles";

export const dynamic = "force-dynamic";

export default async function DirectMessagesPage() {
  const profile = await getCurrentProfile();
  const canStart = profile?.role === ROLES.SUPER_ADMIN || profile?.role === ROLES.ADMIN;

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Direct Messages"
        description="Private conversations with your team. Search, filter by date, flag importance, and pick up where you left off."
      />
      <DmInbox canStart={canStart} />
    </div>
  );
}
