import { NextResponse } from "next/server";
import { requireAdminManager } from "@/lib/user-management/auth";
import { deleteBookPage, updateBookPage, type BookPageInput } from "@/lib/books/repository";

function errorResponse(error: unknown, fallback: string) {
  const message = error instanceof Error ? error.message : fallback;
  const status = /authentication|required|denied|permission/i.test(message) ? 401 : 400;
  return NextResponse.json({ error: message }, { status });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string; pageId: string }> }) {
  try {
    const { id, pageId } = await params;
    const body = await request.json();
    await requireAdminManager(request, body.actionToken);
    const book = await updateBookPage(id, pageId, body as BookPageInput);
    return NextResponse.json({ book });
  } catch (error) {
    return errorResponse(error, "Unable to update page.");
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string; pageId: string }> }) {
  try {
    const { id, pageId } = await params;
    const body = await request.json().catch(() => ({}));
    await requireAdminManager(request, body.actionToken ?? request.headers.get("x-mjg-action-token") ?? undefined);
    const book = await deleteBookPage(id, pageId);
    return NextResponse.json({ book });
  } catch (error) {
    return errorResponse(error, "Unable to delete page.");
  }
}
