import { createSupabaseAdminClient } from "@/lib/supabase/admin";

// Direct Messages data layer (service-role admin client; the API authorizes the
// requester as a participant). 1:1 today, group-ready.

export type DmImportance = "normal" | "important" | "urgent";

export type DmPerson = { id: string; name: string; email: string };
export type DmConversationSummary = {
  id: string;
  other: DmPerson | null;
  last_message_at: string | null;
  last_message_preview: string | null;
  last_sender_id: string | null;
  unread: number;
};
export type DmMessage = {
  id: string;
  sender_id: string | null;
  body: string;
  importance: DmImportance;
  attachments: unknown[];
  created_at: string;
  mine: boolean;
};

type ProfileRow = { id: string; first_name: string | null; last_name: string | null; email: string | null };
type EmbeddedProfile = ProfileRow | ProfileRow[] | null;

function personName(p: { first_name?: string | null; last_name?: string | null; email?: string | null }): string {
  return [p.first_name, p.last_name].filter(Boolean).join(" ").trim() || (p.email ?? "Unknown");
}

// Supabase types an embedded to-one relation as an array; normalize to one row.
function pickProfile(embedded: EmbeddedProfile): ProfileRow | null {
  if (!embedded) return null;
  return Array.isArray(embedded) ? embedded[0] ?? null : embedded;
}

/** Conversations the user is in, newest first, with unread counts. */
export async function listConversations(
  userId: string,
  filter?: { search?: string; from?: string; to?: string },
): Promise<DmConversationSummary[]> {
  const supabase = createSupabaseAdminClient();

  const { data: mine } = await supabase.from("dm_participants").select("conversation_id, last_read_at").eq("user_id", userId);
  const convIds = (mine ?? []).map((r) => r.conversation_id);
  if (!convIds.length) return [];

  let convQuery = supabase
    .from("dm_conversations")
    .select("id, last_message_at, last_message_preview, last_sender_id")
    .in("id", convIds)
    .eq("status", "active")
    .order("last_message_at", { ascending: false, nullsFirst: false });
  if (filter?.from) convQuery = convQuery.gte("last_message_at", filter.from);
  if (filter?.to) convQuery = convQuery.lte("last_message_at", filter.to);
  const { data: convos } = await convQuery;
  if (!convos?.length) return [];

  const ids = convos.map((c) => c.id);
  // Other participants (the person on the other side of each conversation).
  const { data: others } = await supabase
    .from("dm_participants")
    .select("conversation_id, profiles:user_id(id, first_name, last_name, email)")
    .in("conversation_id", ids)
    .neq("user_id", userId);
  const otherByConv = new Map<string, DmPerson>();
  for (const row of (others ?? []) as unknown as { conversation_id: string; profiles: EmbeddedProfile }[]) {
    const p = pickProfile(row.profiles);
    if (p) otherByConv.set(row.conversation_id, { id: p.id, name: personName(p), email: p.email ?? "" });
  }

  // Per-conversation unread for this user.
  const unreadByConv = new Map<string, number>();
  const { data: unreadRows } = await supabase.rpc("dm_conversation_unread", { p_user: userId });
  for (const r of (unreadRows ?? []) as { conversation_id: string; unread: number }[]) unreadByConv.set(r.conversation_id, r.unread);

  let list: DmConversationSummary[] = convos.map((c) => ({
    id: c.id,
    other: otherByConv.get(c.id) ?? null,
    last_message_at: c.last_message_at,
    last_message_preview: c.last_message_preview,
    last_sender_id: c.last_sender_id,
    unread: unreadByConv.get(c.id) ?? 0,
  }));

  const q = filter?.search?.trim().toLowerCase();
  if (q) {
    list = list.filter(
      (c) =>
        c.other?.name.toLowerCase().includes(q) ||
        c.other?.email.toLowerCase().includes(q) ||
        (c.last_message_preview ?? "").toLowerCase().includes(q),
    );
  }
  return list;
}

/** Verify the user participates in a conversation. */
export async function isParticipant(userId: string, conversationId: string): Promise<boolean> {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("dm_participants")
    .select("conversation_id")
    .eq("conversation_id", conversationId)
    .eq("user_id", userId)
    .maybeSingle();
  return Boolean(data);
}

/** Full thread + the other participant; marks the conversation read for the user. */
export async function getThread(userId: string, conversationId: string) {
  const supabase = createSupabaseAdminClient();
  if (!(await isParticipant(userId, conversationId))) return null;

  const { data: messages } = await supabase
    .from("dm_messages")
    .select("id, sender_id, body, importance, attachments, created_at")
    .eq("conversation_id", conversationId)
    .is("deleted_at", null)
    .order("created_at", { ascending: true })
    .limit(500);

  const { data: otherRow } = await supabase
    .from("dm_participants")
    .select("profiles:user_id(id, first_name, last_name, email)")
    .eq("conversation_id", conversationId)
    .neq("user_id", userId)
    .maybeSingle();
  const op = pickProfile((otherRow as unknown as { profiles: EmbeddedProfile } | null)?.profiles ?? null);
  const other: DmPerson | null = op ? { id: op.id, name: personName(op), email: op.email ?? "" } : null;

  // Mark read.
  await supabase
    .from("dm_participants")
    .update({ last_read_at: new Date().toISOString() })
    .eq("conversation_id", conversationId)
    .eq("user_id", userId);

  const thread: DmMessage[] = (messages ?? []).map((m) => ({
    id: m.id,
    sender_id: m.sender_id,
    body: m.body,
    importance: (m.importance as DmImportance) ?? "normal",
    attachments: Array.isArray(m.attachments) ? m.attachments : [],
    created_at: m.created_at,
    mine: m.sender_id === userId,
  }));
  return { conversation: { id: conversationId, other }, messages: thread };
}

/** Send a message into a conversation the user participates in. */
export async function sendMessage(
  userId: string,
  conversationId: string,
  input: { body: string; importance?: DmImportance; attachments?: unknown[] },
) {
  const supabase = createSupabaseAdminClient();
  if (!(await isParticipant(userId, conversationId))) throw new Error("You are not a participant in this conversation.");
  const body = input.body.trim();
  const attachments = input.attachments ?? [];
  if (!body && !attachments.length) throw new Error("Message is empty.");

  const { data: message, error } = await supabase
    .from("dm_messages")
    .insert({ conversation_id: conversationId, sender_id: userId, body, importance: input.importance ?? "normal", attachments })
    .select("id, created_at")
    .single();
  if (error) throw error;

  const preview = body ? body.slice(0, 140) : "📎 Attachment";
  await supabase
    .from("dm_conversations")
    .update({ last_message_at: message.created_at, last_message_preview: preview, last_sender_id: userId, updated_at: message.created_at })
    .eq("id", conversationId);
  // Sender has implicitly read their own message.
  await supabase.from("dm_participants").update({ last_read_at: message.created_at }).eq("conversation_id", conversationId).eq("user_id", userId);

  return { id: message.id, created_at: message.created_at };
}

/** Find or create a 1:1 conversation between two users. */
export async function findOrCreateConversation(creatorId: string, otherUserId: string): Promise<string> {
  const supabase = createSupabaseAdminClient();
  if (creatorId === otherUserId) throw new Error("You cannot message yourself.");

  // Find an existing conversation both users share.
  const { data: mine } = await supabase.from("dm_participants").select("conversation_id").eq("user_id", creatorId);
  const myIds = (mine ?? []).map((r) => r.conversation_id);
  if (myIds.length) {
    const { data: shared } = await supabase
      .from("dm_participants")
      .select("conversation_id")
      .eq("user_id", otherUserId)
      .in("conversation_id", myIds);
    if (shared?.length) return shared[0].conversation_id;
  }

  const { data: conv, error } = await supabase
    .from("dm_conversations")
    .insert({ created_by: creatorId })
    .select("id")
    .single();
  if (error) throw error;
  await supabase.from("dm_participants").insert([
    { conversation_id: conv.id, user_id: creatorId },
    { conversation_id: conv.id, user_id: otherUserId },
  ]);
  return conv.id;
}

/** Active profiles the user can start a DM with (everyone but themselves). */
export async function listMessageableUsers(userId: string, search?: string): Promise<DmPerson[]> {
  const supabase = createSupabaseAdminClient();
  let query = supabase
    .from("profiles")
    .select("id, first_name, last_name, email")
    .eq("status", "active")
    .neq("id", userId)
    .order("first_name", { ascending: true })
    .limit(50);
  const q = search?.trim();
  if (q) query = query.or(`first_name.ilike.%${q}%,last_name.ilike.%${q}%,email.ilike.%${q}%`);
  const { data } = await query;
  return (data ?? []).map((p) => ({ id: p.id, name: personName(p), email: p.email ?? "" }));
}

/** Total unread messages for a user (powers bell / nav / FAB / dashboard badges). */
export async function getUnreadCount(userId: string): Promise<number> {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase.rpc("dm_unread_count", { p_user: userId });
  return typeof data === "number" ? data : 0;
}

/** Lightweight DM stats for the dashboard cards. */
export async function getDmStats(userId: string): Promise<{ unread: number; activeConversations: number; awaitingReply: number }> {
  const convos = await listConversations(userId);
  const unread = convos.reduce((sum, c) => sum + c.unread, 0);
  // "Awaiting your reply" = the last message in a conversation was from the other person.
  const awaitingReply = convos.filter((c) => c.last_sender_id && c.last_sender_id !== userId).length;
  return { unread, activeConversations: convos.length, awaitingReply };
}
