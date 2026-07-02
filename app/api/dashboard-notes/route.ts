import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/user-management/auth";
import { sendSmtpEmail } from "@/lib/email/smtp";
import {
  listNotes, unreadCount, createNote, updateStatus, markRead, getNote, addComment, listShareRecipients,
  type DashboardNote,
} from "@/lib/dashboard-notes/data";

function errStatus(m: string) { return /authentication/i.test(m) ? 401 : /permission|required|super/i.test(m) ? 403 : 500; }
const appUrl = () => (process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "");

async function notifyRecipients(note: DashboardNote, authorName: string) {
  if (!note.recipient_emails.length) return;
  const link = `${appUrl()}${note.route || "/dashboard"}`;
  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#1a1a1a">
      <p><strong>${authorName || "A teammate"}</strong> shared a dashboard edit request with you.</p>
      <p style="margin:12px 0;padding:12px 14px;background:#f5f2ea;border-radius:8px;white-space:pre-wrap">${escapeHtml(note.note)}</p>
      <p style="font-size:13px;color:#5f6d66">Page: <strong>${escapeHtml(note.page_title || note.route || "—")}</strong> · ${note.type} · ${note.priority} priority</p>
      ${note.route ? `<p><a href="${link}" style="display:inline-block;background:#315f43;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none;font-weight:700">Open the page</a></p>` : ""}
    </div>`;
  await Promise.allSettled(
    note.recipient_emails.map((to) => sendSmtpEmail({ to, subject: `Dashboard edit request: ${note.page_title || note.route || "review"}`, html })),
  );
}
function escapeHtml(s: string) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

export async function GET(request: Request) {
  try {
    const actor = await requireSuperAdmin(request);
    const url = new URL(request.url);
    const scope = (url.searchParams.get("scope") as "inbox" | "shared" | "all") || "inbox";
    const me = (actor.email ?? "").toLowerCase();
    const [notes, unread, recipients] = await Promise.all([listNotes(scope, me), unreadCount(me), listShareRecipients()]);
    return NextResponse.json({ notes, unread, me, recipients: recipients.filter((r) => r.email !== me) });
  } catch (error) {
    const m = error instanceof Error ? error.message : "Failed to load notes.";
    return NextResponse.json({ error: m }, { status: errStatus(m) });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const actor = await requireSuperAdmin(request, body?.actionToken);
    const me = (actor.email ?? "").toLowerCase();
    const name = (actor as { full_name?: string }).full_name || me;

    switch (body.action) {
      case "create": {
        const p = body.payload ?? {};
        const note = await createNote({
          route: p.route, pageTitle: p.pageTitle, note: String(p.note ?? ""), type: p.type, priority: p.priority,
          recipientEmails: Array.isArray(p.recipientEmails) ? p.recipientEmails : [], screenshotUrl: p.screenshotUrl ?? null,
          actorUserId: actor.id, actorEmail: me, actorName: name,
        });
        notifyRecipients(note, name).catch(() => {});
        return NextResponse.json({ note });
      }
      case "update_status":
        return NextResponse.json({ note: await updateStatus(String(body.id), String(body.status)) });
      case "mark_read":
        await markRead(String(body.id), me); return NextResponse.json({ ok: true });
      case "get_note":
        return NextResponse.json(await getNote(String(body.id), me));
      case "add_comment":
        return NextResponse.json({ comment: await addComment(String(body.id), { email: me, name }, String(body.comment ?? "")) });
      default:
        return NextResponse.json({ error: "Unknown action." }, { status: 400 });
    }
  } catch (error) {
    const m = error instanceof Error ? error.message : "Action failed.";
    return NextResponse.json({ error: m }, { status: errStatus(m) });
  }
}
