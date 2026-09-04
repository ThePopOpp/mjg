import { NextResponse } from "next/server";
import { requireAdminManager } from "@/lib/user-management/auth";
import { addBookPage, reorderBookPages, type BookPageInput } from "@/lib/books/repository";

function errorResponse(error: unknown, fallback: string) {
  const message = error instanceof Error ? error.message : fallback;
  const status = /authentication|required|denied|permission/i.test(message) ? 401 : 400;
  return NextResponse.json({ error: message }, { status });
}

// Append a page to a book.
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    await requireAdminManager(request, body.actionToken);
    const book = await addBookPage(id, body as BookPageInput);
    return NextResponse.json({ book });
  } catch (error) {
    return errorResponse(error, "Unable to add page.");
  }
}

// Persist a new page order: { pageIds: string[] }.
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    await requireAdminManager(request, body.actionToken);
    if (!Array.isArray(body.pageIds)) throw new Error("pageIds must be an array.");
    const book = await reorderBookPages(id, body.pageIds as string[]);
    return NextResponse.json({ book });
  } catch (error) {
    return errorResponse(error, "Unable to reorder pages.");
  }
}
