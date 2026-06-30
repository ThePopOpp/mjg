import { SectionHeader } from "@/components/dashboard/section-header";
import { listCmsPages } from "@/lib/cms/data";
import { CmsPagesList } from "@/components/cms/cms-pages-list";

export const dynamic = "force-dynamic";
export const metadata = { title: "CMS — MJG Dashboard" };

export default async function CmsPage() {
  const pages = await listCmsPages();
  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Super Admin"
        title="CMS"
        description="Manage frontend pages — create pages and edit their details here. The block editor, live preview, and publishing arrive in the next phases. Super Admin only."
      />
      <CmsPagesList initialPages={pages} />
    </div>
  );
}
