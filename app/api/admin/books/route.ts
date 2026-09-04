import { NextResponse } from "next/server";
import { requireAdminManager } from "@/lib/user-management/auth";
import { createBook, listBooks, type BookInput } from "@/lib/books/repository";

function errorResponse(error: unknown, fallback: string) {
  const message = error instanceof Error ? error.message : fallback;
  const duplicate = /duplicate|unique/i.test(message);
  const status = duplicate ? 409 : /authentication|required|denied|permission/i.test(message) ? 401 : 400;
  return NextResponse.json({ error: duplicate ? "That slug is already in use." : message }, { status });
}

// List every book with its pages (admin) — used to refresh the Book Studio after edits.
export async function GET(request: Request) {
  try {
    await requireAdminManager(request, request.headers.get("x-mjg-action-token") ?? undefined);
    const books = await listBooks();
    return NextResponse.json({ books });
  } catch (error) {
    return errorResponse(error, "Unable to load books.");
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await requireAdminManager(request, body.actionToken);
    const book = await createBook(body as BookInput);
    return NextResponse.json({ book });
  } catch (error) {
    return errorResponse(error, "Unable to create book.");
  }
}
