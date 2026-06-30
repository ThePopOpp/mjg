import { notFound } from "next/navigation";
import { getCmsPageWithDraft } from "@/lib/cms/data";
import { draftBlocks } from "@/lib/cms/types";
import { CmsEditor } from "@/components/cms/cms-editor";

export const dynamic = "force-dynamic";
export const metadata = { title: "CMS Editor — MJG Dashboard" };

export default async function CmsEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const page = await getCmsPageWithDraft(id);
  if (!page) notFound();

  return (
    <CmsEditor
      page={{ id: page.id, title: page.title, slug: page.slug, status: page.status }}
      initialBlocks={draftBlocks(page.draft_content)}
    />
  );
}
