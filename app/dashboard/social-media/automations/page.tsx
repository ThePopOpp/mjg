import { SectionHeader } from "@/components/dashboard/section-header";
import { SocialTabs } from "@/components/social-media/social-tabs";
import { SocialAutomations } from "@/components/social-media/social-automations";
import { getSocialTemplateData } from "@/lib/social-media/data";

export const dynamic = "force-dynamic";
export const metadata = { title: "Automations — Social Media — MJG" };

export default async function SocialAutomationsPage() {
  const { templates, automations } = await getSocialTemplateData();
  return (
    <div className="space-y-6">
      <SectionHeader eyebrow="Social Media" title="Automations" description="Map post templates to events (a blog post publishes, an event goes live) to auto-draft social posts." />
      <SocialTabs active="automations" />
      <SocialAutomations templates={templates} initialAutomations={automations} />
    </div>
  );
}
