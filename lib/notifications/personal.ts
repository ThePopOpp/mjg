import { createSupabaseAdminClient } from "@/lib/supabase/admin";

// Personal dashboard notifications: a `notifications` row with user_id set is
// addressed to that one person. It shows only in their dashboard (the alert
// strip at the top of every page) until they dismiss it or it's resolved.
// Shared lists (pilot dashboard, user management, notifications_list) only
// show rows with no user_id.

export type PersonalNotification = { id: string; type: string; title: string; message: string; href: string | null; createdAt: string };

export async function createPersonalNotification(input: {
  userId: string;
  type: string;
  title: string;
  message: string;
  href?: string;
  metadata?: Record<string, unknown>;
}) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("notifications").insert({
    user_id: input.userId,
    type: input.type,
    title: input.title,
    message: input.message,
    destination: "dashboard",
    status: "queued",
    metadata: { ...(input.metadata ?? {}), href: input.href ?? null },
  });
  if (error) console.error("[notifications] personal insert failed", error.message);
}

export async function listMyUnread(userId: string): Promise<PersonalNotification[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("notifications")
    .select("id, type, title, message, metadata, created_at")
    .eq("user_id", userId)
    .eq("destination", "dashboard")
    .is("read_at", null)
    .order("created_at", { ascending: false })
    .limit(10);
  if (error) throw error;
  return (data ?? []).map((n) => ({
    id: n.id,
    type: n.type,
    title: n.title,
    message: n.message,
    href: ((n.metadata as { href?: string } | null)?.href) ?? null,
    createdAt: n.created_at,
  }));
}

/** Dismiss one of your own notifications. */
export async function markMineRead(userId: string, id: string) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", id).eq("user_id", userId).is("read_at", null);
  if (error) throw error;
}

/** Resolve every unread personal notification about one thing (e.g. an application that was decided). */
export async function resolvePersonalNotifications(type: string, key: string, value: string) {
  const supabase = createSupabaseAdminClient();
  await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("type", type)
    .not("user_id", "is", null)
    .is("read_at", null)
    .contains("metadata", { [key]: value });
}
