import { notFound } from "next/navigation";
import { getPage, listVersions, pageDependencies } from "@/lib/website/data";
import { listChangeSets } from "@/lib/website/change-sets";
import { PageEditor } from "@/components/website/page-editor";

export const dynamic = "force-dynamic";

// Super-Admin-only via app/dashboard/cms/layout.tsx.
export default async function WebsitePageEditor({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const page = await getPage(id);
  if (!page) notFound();

  const [versions, dependencies, changeSets] = await Promise.all([
    listVersions(id),
    pageDependencies(id),
    listChangeSets({ pageId: id, limit: 20 }),
  ]);

  return <PageEditor initial={{ page, versions, dependencies, changeSets }} />;
}
