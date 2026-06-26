import { SectionHeader } from "@/components/dashboard/section-header";
import { SocialTabs } from "@/components/social-media/social-tabs";
import { SocialComposer } from "@/components/social-media/social-composer";
import { listAccounts, listActiveTemplates } from "@/lib/social-media/data";

export const dynamic = "force-dynamic";
export const metadata = { title: "Compose — Social Media — MJG" };

export default async function SocialComposePage({ searchParams }: { searchParams: Promise<{ template?: string }> }) {
  const { template } = await searchParams;
  const [accounts, templates] = await Promise.all([listAccounts(), listActiveTemplates()]);
  const activeAccounts = accounts.filter((a) => a.is_active);

  return (
    <div className="space-y-6">
      <SectionHeader eyebrow="Social Media" title="Compose" description="Write a post (or start from a template), then save it as a draft, schedule it, or publish now." />
      <SocialTabs active="compose" />
      <SocialComposer accounts={activeAccounts} templates={templates} initialTemplateId={template} />
    </div>
  );
}
