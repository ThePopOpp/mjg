import { Settings } from "lucide-react";
import { EmptyState } from "@/components/dashboard/empty-state";
import { SectionHeader } from "@/components/dashboard/section-header";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <SectionHeader title="Settings" description="Manage dashboard preferences, Supabase-backed configuration, and admin defaults." />
      <EmptyState icon={Settings} title="Settings foundation" description="Organization settings, defaults, and integrations will live here." />
    </div>
  );
}
