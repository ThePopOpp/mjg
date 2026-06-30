import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/user-management/auth";
import { logUserActivity } from "@/lib/user-management/repository";
import { createCmsPage, listCmsPages } from "@/lib/cms/data";

function errStatus(m: string) { return /authentication/i.test(m) ? 401 : /permission|required/i.test(m) ? 403 : 500; }

export async function GET(request: Request) {
  try {
    await requireSuperAdmin(request);
    return NextResponse.json({ pages: await listCmsPages() });
  } catch (error) {
    const m = error instanceof Error ? error.message : "Failed to load CMS pages.";
    return NextResponse.json({ error: m }, { status: errStatus(m) });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const actor = await requireSuperAdmin(request, body?.actionToken);
    const page = await createCmsPage({
      title: body.title, slug: body.slug, page_type: body.page_type, description: body.description, actorUserId: actor.id,
    });
    await logUserActivity({ actorUserId: actor.id, action: "cms_page_created", entityType: "cms_page", entityId: page.id, metadata: { title: page.title, slug: page.slug } });
    return NextResponse.json({ page });
  } catch (error) {
    const m = error instanceof Error ? error.message : "Failed to create CMS page.";
    return NextResponse.json({ error: m }, { status: errStatus(m) });
  }
}
