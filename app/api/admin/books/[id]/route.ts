import { NextResponse } from "next/server";
import { requireAdminManager } from "@/lib/user-management/auth";
import { deleteBook, updateBook, type BookInput } from "@/lib/books/repository";

function errorResponse(error: unknown, fallback: string) {
  const message = error instanceof Error ? error.message : fallback;
  const duplicate = /duplicate|unique/i.test(message);
  const status = duplicate ? 409 : /authentication|required|denied|permission/i.test(message) ? 401 : 400;
  return NextResponse.json({ error: duplicate ? "That slug is already in use." : message }, { status });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    await requireAdminManager(request, body.actionToken);
    const book = await updateBook(id, body as BookInput);
    return NextResponse.json({ book });
  } catch (error) {
    return errorResponse(error, "Unable to update book.");
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    await requireAdminManager(request, body.actionToken ?? request.headers.get("x-mjg-action-token") ?? undefined);
    await deleteBook(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return errorResponse(error, "Unable to delete book.");
  }
}
