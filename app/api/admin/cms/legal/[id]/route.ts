import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/user-management/auth";
import { logUserActivity } from "@/lib/user-management/repository";
import { getLegalDocument, listLegalVersions, saveLegalDraft } from "@/lib/legal/data";

function errStatus(m: string) {
  return /authentication/i.test(m) ? 401 : /permission|required/i.test(m) ? 403 : 500;
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireSuperAdmin(request);
    const { id } = await params;
    const document = await getLegalDocument(id);
    if (!document) return NextResponse.json({ error: "Legal document not found." }, { status: 404 });
    return NextResponse.json({ document, versions: await listLegalVersions(id) });
  } catch (error) {
    const m = error instanceof Error ? error.message : "Failed to load the legal document.";
    return NextResponse.json({ error: m }, { status: errStatus(m) });
  }
}

/** Saves the draft only. Publishing is a separate, gated endpoint. */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const body = await request.json();
    const actor = await requireSuperAdmin(request, body?.actionToken);
    const { id } = await params;

    if (typeof body?.draft_md !== "string") {
      return NextResponse.json({ error: "draft_md is required." }, { status: 400 });
    }

    // An empty string means "clear the date"; undefined means "leave it alone".
    let effectiveDate: string | null | undefined;
    if (body.effective_date === null || body.effective_date === "") effectiveDate = null;
    else if (typeof body.effective_date === "string") {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(body.effective_date)) {
        return NextResponse.json({ error: "effective_date must be YYYY-MM-DD." }, { status: 400 });
      }
      effectiveDate = body.effective_date;
    }

    const document = await saveLegalDraft(
      id,
      {
        draft_md: body.draft_md,
        effective_date: effectiveDate,
        title: typeof body.title === "string" ? body.title : undefined,
        summary: typeof body.summary === "string" ? body.summary : undefined,
      },
      actor.id,
    );

    await logUserActivity({
      actorUserId: actor.id,
      action: "legal_document_draft_saved",
      entityType: "legal_document",
      entityId: id,
      metadata: {
        slug: document.slug,
        placeholders: document.readiness.placeholderCount,
        draftMarkers: document.readiness.draftMarkerCount,
      },
    });

    return NextResponse.json({ document });
  } catch (error) {
    const m = error instanceof Error ? error.message : "Failed to save the legal document.";
    return NextResponse.json({ error: m }, { status: errStatus(m) });
  }
}
