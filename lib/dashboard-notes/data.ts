// Dashboard Edits — data layer for the Review FAB (dashboard_notes + comments).
// Service-role admin client behind the Super-Admin API guard. Inbox scoping =
// created-by-me ∪ shared-with-me. See docs/features/dashboard-review-fab-portable.md.

import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type DashboardNote = {
  id: string;
  route: string | null;
  page_title: string | null;
  note: string;
  type: string;
  priority: string;
  status: string;
  created_by: string | null;
  created_by_email: string | null;
  created_by_name: string | null;
  recipient_emails: string[];
  read_by: string[];
  screenshot_url: string | null;
  shared: boolean;
  created_at: string;
  updated_at: string;
};
export type DashboardNoteComment = {
  id: string; note_id: string; author_email: string | null; author_name: string | null; body: string; created_at: string;
};

const lc = (s: string | null | undefined) => (s ?? "").trim().toLowerCase();

export async function listNotes(scope: "inbox" | "shared" | "all", me: string): Promise<DashboardNote[]> {
  const sb = createSupabaseAdminClient();
  let q = sb.from("dashboard_notes").select("*").order("created_at", { ascending: false }).limit(300);
  const email = lc(me);
  if (scope === "shared") q = q.contains("recipient_emails", [email]);
  else if (scope === "inbox") q = q.or(`created_by_email.eq.${email},recipient_emails.cs.{${email}}`);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data ?? []) as DashboardNote[];
}

export async function unreadCount(me: string): Promise<number> {
  const sb = createSupabaseAdminClient();
  const email = lc(me);
  const { count, error } = await sb
    .from("dashboard_notes")
    .select("id", { count: "exact", head: true })
    .contains("recipient_emails", [email])
    .not("read_by", "cs", `{${email}}`);
  if (error) return 0;
  return count ?? 0;
}

export type CreateNoteInput = {
  route?: string | null; pageTitle?: string | null; note: string;
  type?: string; priority?: string; recipientEmails?: string[]; screenshotUrl?: string | null;
  actorUserId?: string | null; actorEmail?: string | null; actorName?: string | null;
};

export async function createNote(input: CreateNoteInput): Promise<DashboardNote> {
  const sb = createSupabaseAdminClient();
  const author = lc(input.actorEmail);
  const recipients = Array.from(new Set((input.recipientEmails ?? []).map(lc).filter((e) => e && e !== author)));
  const { data, error } = await sb
    .from("dashboard_notes")
    .insert({
      route: input.route ?? null, page_title: input.pageTitle ?? null, note: input.note,
      type: input.type || "edit", priority: input.priority || "medium",
      created_by: input.actorUserId ?? null, created_by_email: author, created_by_name: input.actorName ?? null,
      recipient_emails: recipients, read_by: author ? [author] : [], screenshot_url: input.screenshotUrl ?? null,
      shared: recipients.length > 0,
    })
    .select("*").single();
  if (error) throw new Error(error.message);
  return data as DashboardNote;
}

export async function updateStatus(id: string, status: string): Promise<DashboardNote> {
  const sb = createSupabaseAdminClient();
  const { data, error } = await sb.from("dashboard_notes").update({ status, updated_at: new Date().toISOString() }).eq("id", id).select("*").single();
  if (error) throw new Error(error.message);
  return data as DashboardNote;
}

export async function markRead(id: string, me: string): Promise<void> {
  const sb = createSupabaseAdminClient();
  const email = lc(me);
  const { data } = await sb.from("dashboard_notes").select("read_by").eq("id", id).maybeSingle();
  const readBy: string[] = (data?.read_by as string[]) ?? [];
  if (email && !readBy.includes(email)) {
    await sb.from("dashboard_notes").update({ read_by: [...readBy, email] }).eq("id", id);
  }
}

export async function getNote(id: string, me: string): Promise<{ note: DashboardNote; comments: DashboardNoteComment[] }> {
  const sb = createSupabaseAdminClient();
  await markRead(id, me);
  const [{ data: note, error }, { data: comments }] = await Promise.all([
    sb.from("dashboard_notes").select("*").eq("id", id).single(),
    sb.from("dashboard_note_comments").select("*").eq("note_id", id).order("created_at", { ascending: true }),
  ]);
  if (error) throw new Error(error.message);
  return { note: note as DashboardNote, comments: (comments ?? []) as DashboardNoteComment[] };
}

export async function addComment(id: string, author: { email: string; name?: string | null }, body: string): Promise<DashboardNoteComment> {
  const sb = createSupabaseAdminClient();
  const { data, error } = await sb
    .from("dashboard_note_comments")
    .insert({ note_id: id, author_email: lc(author.email), author_name: author.name ?? null, body })
    .select("*").single();
  if (error) throw new Error(error.message);
  return data as DashboardNoteComment;
}

export async function listShareRecipients(): Promise<{ email: string; name: string }[]> {
  const sb = createSupabaseAdminClient();
  const { data } = await sb.from("profiles").select("email, full_name, role, status").eq("role", "super_admin").eq("status", "active").order("full_name");
  return (data ?? []).map((p) => ({ email: lc(p.email as string), name: (p.full_name as string) || (p.email as string) })).filter((p) => p.email);
}
