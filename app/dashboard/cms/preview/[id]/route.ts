import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/user-management/auth";
import { getCmsPageWithDraft } from "@/lib/cms/data";
import { renderCmsPageHtml } from "@/lib/cms/render";
import { draftBlocks } from "@/lib/cms/types";

export const dynamic = "force-dynamic";

// Super-Admin-only draft preview (route handlers aren't wrapped by the CMS page
// guard, so it authenticates itself via the session). Renders the EDITABLE draft.
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireSuperAdmin(request);
  } catch {
    return new NextResponse("Forbidden — Super Admin only.", { status: 403 });
  }
  const { id } = await params;
  const page = await getCmsPageWithDraft(id);
  if (!page) return new NextResponse("Page not found.", { status: 404 });

  const html = renderCmsPageHtml({ title: page.title }, draftBlocks(page.draft_content), { draft: true });
  return new NextResponse(html, { headers: { "content-type": "text/html; charset=utf-8" } });
}
