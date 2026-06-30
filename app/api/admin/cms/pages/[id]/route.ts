import { NextRequest, NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/user-management/auth";
import { logUserActivity } from "@/lib/user-management/repository";
import { deleteCmsPage, updateCmsPage } from "@/lib/cms/data";

function errStatus(m: string) { return /authentication/i.test(m) ? 401 : /permission|required/i.test(m) ? 403 : 500; }

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const actor = await requireSuperAdmin(request, body?.actionToken);
    const page = await updateCmsPage(id, {
      title: body.title, slug: body.slug, page_type: body.page_type, description: body.description,
      status: body.status, assigned_roles: body.assigned_roles, actorUserId: actor.id,
    });
    await logUserActivity({ actorUserId: actor.id, action: "cms_page_updated", entityType: "cms_page", entityId: id, metadata: { status: page.status } });
    return NextResponse.json({ page });
  } catch (error) {
    const m = error instanceof Error ? error.message : "Failed to update CMS page.";
    return NextResponse.json({ error: m }, { status: errStatus(m) });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const actor = await requireSuperAdmin(request, body?.actionToken);
    await deleteCmsPage(id);
    await logUserActivity({ actorUserId: actor.id, action: "cms_page_deleted", entityType: "cms_page", entityId: id });
    return NextResponse.json({ ok: true });
  } catch (error) {
    const m = error instanceof Error ? error.message : "Failed to delete CMS page.";
    return NextResponse.json({ error: m }, { status: errStatus(m) });
  }
}
