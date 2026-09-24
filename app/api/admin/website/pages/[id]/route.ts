import { NextRequest, NextResponse } from "next/server";
import { actionTokenOf, fail, requireWebsiteActor } from "@/lib/website/http";
import { deletePage, getPageOrThrow, listVersions, pageDependencies, updatePageMeta } from "@/lib/website/data";
import { listChangeSets } from "@/lib/website/change-sets";

export const dynamic = "force-dynamic";

/** The whole editing context for one page, in a single round trip. */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireWebsiteActor(request);
    const { id } = await params;
    const [page, versions, dependencies, changeSets] = await Promise.all([
      getPageOrThrow(id),
      listVersions(id),
      pageDependencies(id),
      listChangeSets({ pageId: id, limit: 20 }),
    ]);
    return NextResponse.json({ page, versions, dependencies, changeSets });
  } catch (error) {
    return fail(error, "Could not load that page.");
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const actor = await requireWebsiteActor(request, actionTokenOf(body));
    const page = await updatePageMeta(id, { ...body, actionToken: undefined, actorId: actor.id });
    return NextResponse.json({ page });
  } catch (error) {
    return fail(error, "Could not save those page settings.");
  }
}

/**
 * Soft delete by default. `hard: true` requires the exact page title typed back
 * (spec §19) and is only offered behind the Owner confirmation dialog.
 */
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const actor = await requireWebsiteActor(request, actionTokenOf(body));
    await deletePage(id, { actorId: actor.id, hard: body?.hard === true, confirmTitle: body?.confirmTitle });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return fail(error, "Could not delete that page.");
  }
}
