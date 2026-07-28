import { redirect } from "next/navigation";
import { SectionHeader } from "@/components/dashboard/section-header";
import { DmSettingsCard } from "@/components/direct-messages/dm-settings-card";
import { FrequencyCard } from "@/components/facilitator/frequency-card";
import { getCurrentProfile } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

export default async function PreferencesPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=/dashboard/preferences");

  return (
    <div className="space-y-6">
      <SectionHeader title="Settings" description="Manage how and how often you're notified." />
      <div className="grid gap-4 md:grid-cols-2">
        {/* Notifications + Messages (email / SMS / push) — self-contained. */}
        <DmSettingsCard />
        <FrequencyCard />
      </div>
    </div>
  );
}
