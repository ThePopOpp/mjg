import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/user-management/auth";
import { logUserActivity } from "@/lib/user-management/repository";
import { listPageNotes, createPageNote, updatePageNote, deletePageNote, reassignPageNote } from "@/lib/cms/page-notes";
import { listShareRecipients } from "@/lib/dashboard-notes/data";

function errStatus(m: string) { return /authentication/i.test(m) ? 401 : /permission|required|super/i.test(m) ? 403 : 500; }

export async function GET(request: Request) {
  try {
    await requireSuperAdmin(request);
    const url = new URL(request.url);
    const pageSlug = url.searchParams.get("page") || undefined;
    const [notes, recipients] = await Promise.all([listPageNotes(pageSlug), listShareRecipients()]);
    return NextResponse.json({ notes, recipients });
  } catch (error) {
    const m = error instanceof Error ? error.message : "Failed to load page notes.";
    return NextResponse.json({ error: m }, { status: errStatus(m) });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const actor = await requireSuperAdmin(request, body?.actionToken);
    const note = await createPageNote({
      pageSlug: String(body.pageSlug),
      pageLabel: body.pageLabel ?? null,
      pageUrl: body.pageUrl ?? null,
      descriptor: body.descriptor,
      note: String(body.note ?? ""),
      changeType: body.changeType,
      priority: body.priority,
      actorUserId: actor.id,
      actorEmail: actor.email ?? null,
    });
    await logUserActivity({ actorUserId: actor.id, action: "cms_page_note_created", entityType: "cms_page_note", entityId: note.id, metadata: { page: note.page_slug, element: note.element_ref } }).catch(() => {});
    return NextResponse.json({ note });
  } catch (error) {
    const m = error instanceof Error ? error.message : "Failed to save note.";
    return NextResponse.json({ error: m }, { status: errStatus(m) });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    await requireSuperAdmin(request, body?.actionToken);
    if (body.action === "reassign") {
      return NextResponse.json({ note: await reassignPageNote(String(body.id), String(body.email)) });
    }
    const note = await updatePageNote(String(body.id), {
      note: body.note, change_type: body.changeType, priority: body.priority, status: body.status,
    });
    return NextResponse.json({ note });
  } catch (error) {
    const m = error instanceof Error ? error.message : "Failed to update note.";
    return NextResponse.json({ error: m }, { status: errStatus(m) });
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    const token = request.headers.get("x-mjg-action-token");
    await requireSuperAdmin(request, token);
    if (!id) throw new Error("Missing note id.");
    await deletePageNote(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const m = error instanceof Error ? error.message : "Failed to delete note.";
    return NextResponse.json({ error: m }, { status: errStatus(m) });
  }
}
