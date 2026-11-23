import { SectionHeader } from "@/components/dashboard/section-header";
import { SocialTabs } from "@/components/social-media/social-tabs";
import { SocialSettings } from "@/components/social-media/social-settings";
import { listAccounts } from "@/lib/social-media/data";
import { IntegrationsCard } from "@/components/social-media/integrations-card";
import { getMetricoolConfig } from "@/lib/site-integrations";

export const dynamic = "force-dynamic";
export const metadata = { title: "Settings — Social Media — MJG" };

export default async function SocialSettingsPage() {
  const [accounts, metricool] = await Promise.all([listAccounts(), getMetricoolConfig().catch(() => ({ enabled: false, hash: null }))]);
  return (
    <div className="space-y-6">
      <SectionHeader eyebrow="Social Media" title="Settings" description="Connect your platforms — enter credentials, profile URLs, and mark accounts active so you can publish to them." />
      <SocialTabs active="settings" />
      <SocialSettings initialAccounts={accounts} />
      <IntegrationsCard initial={metricool} />
    </div>
  );
}
