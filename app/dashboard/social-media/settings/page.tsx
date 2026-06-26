import { SectionHeader } from "@/components/dashboard/section-header";
import { SocialTabs } from "@/components/social-media/social-tabs";
import { SocialSettings } from "@/components/social-media/social-settings";
import { listAccounts } from "@/lib/social-media/data";

export const dynamic = "force-dynamic";
export const metadata = { title: "Settings — Social Media — MJG" };

export default async function SocialSettingsPage() {
  const accounts = await listAccounts();
  return (
    <div className="space-y-6">
      <SectionHeader eyebrow="Social Media" title="Settings" description="Connect your platforms — enter credentials, profile URLs, and mark accounts active so you can publish to them." />
      <SocialTabs active="settings" />
      <SocialSettings initialAccounts={accounts} />
    </div>
  );
}
