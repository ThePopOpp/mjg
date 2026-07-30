import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/user-management/auth";
import { updateDocument, deleteDocument } from "@/lib/workspace/repository";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const actor = await requireSuperAdmin(request, body.actionToken);
    await updateDocument(
      id,
      {
        title: typeof body.title === "string" ? body.title : undefined,
        content: body.content !== undefined ? body.content : undefined,
        folderId: body.folderId !== undefined ? (body.folderId || null) : undefined,
        scope: body.scope === "shared" || body.scope === "personal" ? body.scope : undefined,
        status: typeof body.status === "string" ? body.status : undefined,
      },
      actor.id,
    );
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save document.";
    const status = message.includes("permission") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    await requireSuperAdmin(request, body.actionToken);
    await deleteDocument(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to delete document.";
    const status = message.includes("permission") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
