import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/user-management/auth";
import { logUserActivity } from "@/lib/user-management/repository";
import {
  LegalPublishBlocked,
  publishLegalDocument,
  restoreLegalVersion,
  unpublishLegalDocument,
} from "@/lib/legal/data";

function errStatus(m: string) {
  return /authentication/i.test(m) ? 401 : /permission|required/i.test(m) ? 403 : 500;
}

/**
 * Publish, unpublish, or restore a version into the draft.
 *
 * A blocked publish returns 422 with the offending placeholders, not 500: the
 * request was understood and deliberately refused. This is where the package's
 * "Do not publish this draft with placeholders" is actually enforced.
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const body = await request.json().catch(() => ({}));
    const actor = await requireSuperAdmin(request, body?.actionToken);
    const { id } = await params;
    const action = body?.action === "unpublish" ? "unpublish" : body?.action === "restore" ? "restore" : "publish";

    if (action === "restore") {
      if (typeof body?.versionId !== "string") {
        return NextResponse.json({ error: "versionId is required to restore." }, { status: 400 });
      }
      const document = await restoreLegalVersion(id, body.versionId, actor.id);
      await logUserActivity({
        actorUserId: actor.id,
        action: "legal_document_version_restored",
        entityType: "legal_document",
        entityId: id,
        metadata: { slug: document.slug, versionId: body.versionId },
      });
      return NextResponse.json({ document });
    }

    const document =
      action === "unpublish"
        ? await unpublishLegalDocument(id, actor.id)
        : await publishLegalDocument(id, actor.id);

    await logUserActivity({
      actorUserId: actor.id,
      action: action === "unpublish" ? "legal_document_unpublished" : "legal_document_published",
      entityType: "legal_document",
      entityId: id,
      metadata: {
        slug: document.slug,
        publicPath: document.publicPath,
        effectiveDate: document.effective_date,
      },
    });

    return NextResponse.json({ document });
  } catch (error) {
    if (error instanceof LegalPublishBlocked) {
      return NextResponse.json({ error: error.message, issues: error.issues }, { status: 422 });
    }
    const m = error instanceof Error ? error.message : "Failed to change the legal document.";
    return NextResponse.json({ error: m }, { status: errStatus(m) });
  }
}
