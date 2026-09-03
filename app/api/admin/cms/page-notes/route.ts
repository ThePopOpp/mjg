import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/user-management/auth";
import { logUserActivity } from "@/lib/user-management/repository";
import { listPageNotes, createPageNote, updatePageNote, deletePageNote, reassignPageNote } from "@/lib/cms/page-notes";
import { listShareRecipients } from "@/lib/dashboard-notes/data";
import { sendSmtpEmail } from "@/lib/email/smtp";

function errStatus(m: string) { return /authentication/i.test(m) ? 401 : /permission|required|super/i.test(m) ? 403 : 500; }

// Owner always gets an email when a frontend edit request is filed. Overridable via env.
const ALWAYS_NOTIFY = (process.env.EDIT_REQUEST_NOTIFY_EMAIL || "jwaters@qallus.co").trim().toLowerCase();
const appUrl = () => (process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "");
function escapeHtml(s: string) { return String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

async function notifyOwner(note: any, authorEmail: string, authorName: string) {
  if (!ALWAYS_NOTIFY || ALWAYS_NOTIFY === (authorEmail ?? "").toLowerCase()) return;
  const el = note.element_ref || note.descriptor || "";
  const link = note.page_url || `${appUrl()}/dashboard/cms`;
  const html = `<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#1a1a1a">
    <p><strong>${escapeHtml(authorName || "A teammate")}</strong> filed a frontend edit request.</p>
    ${el ? `<p style="font-size:13px;color:#5f6d66">Element: <strong>${escapeHtml(el)}</strong></p>` : ""}
    <p style="margin:12px 0;padding:12px 14px;background:#f5f2ea;border-radius:8px;white-space:pre-wrap">${escapeHtml(note.note || "")}</p>
    <p style="font-size:13px;color:#5f6d66">Page: <strong>${escapeHtml(note.page_label || note.page_slug || "—")}</strong> · ${escapeHtml(note.change_type || "edit")} · ${escapeHtml(note.priority || "")} priority</p>
    <p><a href="${escapeHtml(link)}" style="display:inline-block;background:#111;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none;font-weight:700">Open in dashboard</a></p>
  </div>`;
  await sendSmtpEmail({ to: ALWAYS_NOTIFY, subject: `Frontend edit request: ${note.page_label || note.page_slug || "review"}`, html });
}

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
    notifyOwner(note, actor.email ?? "", (actor as { full_name?: string }).full_name || actor.email || "").catch(() => {});
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
