import { BarChart3 } from "lucide-react";
import { EmptyState } from "@/components/dashboard/empty-state";
import { SectionHeader } from "@/components/dashboard/section-header";

export default function UserManagementPage() {
  return (
    <div className="space-y-6">
      <SectionHeader title="User Management" description="Invite admins, team members, content reviewers, Pastor/Elder reviewers, and future participants." />
      <EmptyState
        icon={BarChart3}
        title="User management flow"
        description="The next pass will add role filters, invitations, edit forms, status controls, and protected role-based actions."
      />
    </div>
  );
}
