import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { findOrCreateConversation } from "@/lib/direct-messages/data";

// Shared plumbing for system DM alerts (Check-In, Energy Audit, …). Extracted from
// check-in-alert.ts so every alert badges the bell the same way.

const NOTIFIER_EMAIL = "system-notifications@michaeljgauthier.com";

type Admin = ReturnType<typeof createSupabaseAdminClient>;

/**
 * A hidden "MJG Notifications" profile used only as the sender of system DM alerts, so the
 * DM bell badges cleanly (no cross-user confusion). profiles.id is FK'd to auth.users, so it
 * needs a real (non-login) auth user. Created once, then reused.
 */
export async function getNotifierId(supabase: Admin): Promise<string | null> {
  const { data: existing } = await supabase.from("profiles").select("id").eq("email", NOTIFIER_EMAIL).maybeSingle();
  if (existing?.id) return existing.id;

  // Create (or find) the backing auth user — email confirmed but no password, so it can't log in.
  let authId: string | null = null;
  const { data: created, error: authErr } = await supabase.auth.admin.createUser({
    email: NOTIFIER_EMAIL,
    email_confirm: true,
    user_metadata: { system_notifier: true },
  });
  if (created?.user) authId = created.user.id;
  else {
    const { data: list } = await supabase.auth.admin.listUsers();
    authId = list?.users?.find((u: any) => (u.email ?? "").toLowerCase() === NOTIFIER_EMAIL)?.id ?? null;
    if (!authId) {
      console.error("[system-dm] notifier auth user failed", authErr?.message);
      return null;
    }
  }

  const { error } = await supabase.from("profiles").upsert(
    {
      id: authId,
      auth_user_id: authId,
      email: NOTIFIER_EMAIL,
      first_name: "MJG",
      last_name: "Notifications",
      full_name: "MJG Notifications",
      role: "participant",
      status: "inactive",
    },
    { onConflict: "id" },
  );
  if (error) {
    console.error("[system-dm] notifier profile create failed", error.message);
    return null;
  }
  return authId;
}

/**
 * Badge a recipient's DM bell with a system alert — inserts the message directly (no DM
 * email of its own, since callers send their own styled email).
 */
export async function dmBadge(supabase: Admin, notifierId: string, recipientId: string, body: string) {
  if (notifierId === recipientId) return;
  const convId = await findOrCreateConversation(notifierId, recipientId);
  const { data: msg } = await supabase
    .from("dm_messages")
    .insert({ conversation_id: convId, sender_id: notifierId, body, importance: "important", attachments: [] })
    .select("id, created_at")
    .single();
  if (!msg) return;
  await supabase
    .from("dm_conversations")
    .update({
      last_message_at: msg.created_at,
      last_message_preview: body.slice(0, 140),
      last_sender_id: notifierId,
      updated_at: msg.created_at,
    })
    .eq("id", convId);
  // Mark the notifier (sender) read; leave the recipient unread so their bell badges.
  await supabase.from("dm_participants").update({ last_read_at: msg.created_at }).eq("conversation_id", convId).eq("user_id", notifierId);
}
