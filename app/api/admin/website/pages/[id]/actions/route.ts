import { NextRequest, NextResponse } from "next/server";
import { actionTokenOf, fail, requireWebsiteActor } from "@/lib/website/http";
import {
  archivePage, duplicatePage, listVersions, pageDependencies, publishPage, restorePage, restoreVersion, unpublishPage,
} from "@/lib/website/data";
import { createPreviewToken, revokePreviewTokens } from "@/lib/website/preview";

export const dynamic = "force-dynamic";

/**
 * The page lifecycle verbs (spec §47). One endpoint, one `action` field — every
 * one of them is audited and reversible inside the data layer.
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const actor = await requireWebsiteActor(request, actionTokenOf(body));

    switch (String(body.action)) {
      case "publish": {
        const { page, version, issues } = await publishPage(id, { actorId: actor.id, summary: body.summary });
        return NextResponse.json({ page, version, issues });
      }
      case "unpublish":
        return NextResponse.json({ page: await unpublishPage(id, { actorId: actor.id }) });
      case "archive":
        return NextResponse.json({ page: await archivePage(id, { actorId: actor.id }) });
      case "restore":
        return NextResponse.json({ page: await restorePage(id, { actorId: actor.id }) });
      case "duplicate":
        return NextResponse.json({ page: await duplicatePage(id, { actorId: actor.id, title: body.title }) });
      case "restoreVersion": {
        const page = await restoreVersion(String(body.versionId), { actorId: actor.id });
        return NextResponse.json({ page, versions: await listVersions(id) });
      }
      case "createPreviewLink":
        return NextResponse.json({ preview: await createPreviewToken(id, { actorId: actor.id, hours: body.hours }) });
      case "revokePreviewLinks":
        await revokePreviewTokens(id);
        return NextResponse.json({ ok: true });
      case "dependencies":
        return NextResponse.json({ dependencies: await pageDependencies(id) });
      default:
        throw new Error("Unknown page action.");
    }
  } catch (error) {
    return fail(error, "That page action could not be completed.");
  }
}
