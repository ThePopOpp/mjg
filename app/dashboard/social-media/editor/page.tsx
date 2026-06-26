import { SectionHeader } from "@/components/dashboard/section-header";
import { SocialTabs } from "@/components/social-media/social-tabs";
import { SocialPostBuilder } from "@/components/social-media/social-post-builder";
import { getTemplate } from "@/lib/social-media/data";

export const dynamic = "force-dynamic";
export const metadata = { title: "Block Editor — Social Media — MJG" };

export default async function SocialEditorPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const { id } = await searchParams;
  const template = id ? await getTemplate(id) : null;

  return (
    <div className="space-y-6">
      <SectionHeader eyebrow="Social Media" title="Block Editor" description="Build reusable post templates with drag-and-drop blocks. Reorder blocks, preview the composed post, and save to your template library." />
      <SocialTabs active="editor" />
      <SocialPostBuilder initialTemplate={template} />
    </div>
  );
}
