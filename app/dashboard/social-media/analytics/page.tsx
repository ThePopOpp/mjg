import { SectionHeader } from "@/components/dashboard/section-header";
import { SocialTabs } from "@/components/social-media/social-tabs";
import { SocialAnalytics } from "@/components/social-media/social-analytics";
import { getSocialReport } from "@/lib/social-media/data";

export const dynamic = "force-dynamic";
export const metadata = { title: "Analytics — Social Media — MJG" };

export default async function SocialAnalyticsPage() {
  const report = await getSocialReport(30);
  return (
    <div className="space-y-6">
      <SectionHeader eyebrow="Social Media" title="Analytics" description="Posting cadence, engagement, and top content across your platforms." />
      <SocialTabs active="analytics" />
      <SocialAnalytics initialReport={report} />
    </div>
  );
}
