import { NextResponse } from "next/server";
import { findOrCreateConversation, listConversations, sendMessage } from "@/lib/direct-messages/data";
import { requireActiveProfile } from "@/lib/user-management/auth";
import { ROLES } from "@/lib/rbac/roles";

function fail(error: unknown, fallback: string) {
  const message = error instanceof Error ? error.message : fallback;
  const status = message.includes("Authentication required") ? 401 : message.toLowerCase().includes("permission") || message.toLowerCase().includes("required") ? 403 : 400;
  return NextResponse.json({ error: message }, { status });
}

export async function GET(request: Request) {
  try {
    const me = await requireActiveProfile(request);
    const url = new URL(request.url);
    const conversations = await listConversations(me.id, {
      search: url.searchParams.get("search") ?? undefined,
      from: url.searchParams.get("from") ?? undefined,
      to: url.searchParams.get("to") ?? undefined,
    });
    return NextResponse.json({ ok: true, conversations, me: { id: me.id, email: me.email } });
  } catch (error) {
    return fail(error, "Failed to load conversations.");
  }
}

// Start a new conversation. v1: only admins can initiate (invited users reply).
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const me = await requireActiveProfile(request, body.actionToken);
    if (me.role !== ROLES.SUPER_ADMIN && me.role !== ROLES.ADMIN) {
      throw new Error("Starting a new conversation requires admin permission.");
    }
    if (!body.otherUserId) throw new Error("Choose someone to message.");
    const conversationId = await findOrCreateConversation(me.id, body.otherUserId);
    if (typeof body.body === "string" && body.body.trim()) {
      await sendMessage(me.id, conversationId, { body: body.body, importance: body.importance });
    }
    return NextResponse.json({ ok: true, conversationId });
  } catch (error) {
    return fail(error, "Failed to start conversation.");
  }
}
