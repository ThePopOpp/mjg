import { SectionHeader } from "@/components/dashboard/section-header";
import { SocialTabs } from "@/components/social-media/social-tabs";
import { SocialTemplateManager } from "@/components/social-media/social-template-manager";
import { getSocialTemplateData } from "@/lib/social-media/data";

export const dynamic = "force-dynamic";
export const metadata = { title: "Templates — Social Media — MJG" };

export default async function SocialTemplatesPage() {
  const { templates } = await getSocialTemplateData();
  return (
    <div className="space-y-6">
      <SectionHeader eyebrow="Social Media" title="Templates" description="Your library of reusable post templates. Use one to compose a post, or open it in the Block Editor." />
      <SocialTabs active="templates" />
      <SocialTemplateManager initialTemplates={templates} />
    </div>
  );
}
