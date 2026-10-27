import { NextResponse } from "next/server";
import { requireActiveProfile } from "@/lib/user-management/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { findOrCreateConversation, sendMessage } from "@/lib/direct-messages/data";
import { getFinderSettings, getGroup, isGroupAdmin } from "@/lib/facilitator-groups/repository";
import { groupError } from "@/lib/facilitator-groups/http";

// Message a group's facilitator from its listing. It lands in their MJG Direct Messages (with
// the usual push/email alert), so neither side's email address is ever shown. Anyone signed in
// may start this one conversation — it's the only DM a participant can open with a facilitator
// they aren't grouped with yet; replies then work like any other thread.

const NEW_THREADS_PER_DAY = 5;
const MESSAGES_PER_MINUTE = 5;

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const me = await requireActiveProfile(request, body.actionToken);
    const text = String(body.message ?? "").trim();
    if (!text) throw new Error("Write a message first.");
    if (text.length > 2000) throw new Error("Keep the message under 2,000 characters.");

    const settings = await getFinderSettings();
    if (settings.mode !== "open" && !isGroupAdmin(me.role)) throw new Error("Messaging opens when group sign-ups open.");
    const group = await getGroup(id);
    if (!group || (group.status !== "published" && !isGroupAdmin(me.role))) throw new Error("Group not found.");
    if (group.facilitatorId === me.id) throw new Error("That's your own group.");

    const supabase = createSupabaseAdminClient();
    const minuteAgo = new Date(Date.now() - 60_000).toISOString();
    const { count: recent } = await supabase.from("dm_messages").select("id", { count: "exact", head: true }).eq("sender_id", me.id).gte("created_at", minuteAgo);
    if ((recent ?? 0) >= MESSAGES_PER_MINUTE) throw new Error("You're sending messages too quickly — try again in a minute.");

    // Is there already a thread with this facilitator? If not, this starts a new one (rate-limited).
    const { data: mine } = await supabase.from("dm_participants").select("conversation_id").eq("user_id", me.id);
    const myIds = (mine ?? []).map((r) => r.conversation_id);
    let isNew = true;
    if (myIds.length) {
      const { data: shared } = await supabase.from("dm_participants").select("conversation_id").eq("user_id", group.facilitatorId).in("conversation_id", myIds).limit(1);
      isNew = !shared?.length;
    }
    if (isNew) {
      const dayAgo = new Date(Date.now() - 86_400_000).toISOString();
      const { count } = await supabase.from("dm_conversations").select("id", { count: "exact", head: true }).eq("created_by", me.id).gte("created_at", dayAgo);
      if ((count ?? 0) >= NEW_THREADS_PER_DAY) throw new Error("You've reached today's limit for contacting new facilitators. Try again tomorrow.");
    }

    const conversationId = await findOrCreateConversation(me.id, group.facilitatorId);
    await sendMessage(me.id, conversationId, { body: `About your group "${group.title}":\n\n${text}` });
    return NextResponse.json({ ok: true, conversationId });
  } catch (error) {
    return groupError(error, "Unable to send your message.");
  }
}
