import { BarChart3 } from "lucide-react";
import { EmptyState } from "@/components/dashboard/empty-state";
import { SectionHeader } from "@/components/dashboard/section-header";

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <SectionHeader title="User detail" description={`User record: ${id}`} />
      <EmptyState icon={BarChart3} title="User profile shell" description="Profile, role, permissions, status, activity, and linked participant records will appear here." />
    </div>
  );
}
