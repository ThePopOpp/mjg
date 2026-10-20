import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

// The member's conversation list.
//
// Registered by the member's own browser on their first message, not by the
// agent: the browser knows both the session id and what they typed, and the
// member's session authenticates it. Nothing here needs the service credential,
// and the agent never writes to this table.
//
// Only a title is stored — their own first words, trimmed. Not a summary a
// model wrote about them, and not the conversation.

export const dynamic = "force-dynamic";

/** Long enough to recognise, short enough not to become a transcript. */
const TITLE_MAX = 70;

export async function GET() {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: "Sign in to continue." }, { status: 401 });

  const db = createSupabaseAdminClient();
  const { data } = await db
    .from("steward_conversations")
    .select("session_id, title, last_active_at")
    .eq("profile_id", profile.id)
    .order("last_active_at", { ascending: false })
    .limit(20);

  return NextResponse.json({
    conversations: (data ?? []).map((row) => ({
      sessionId: row.session_id as string,
      title: row.title as string,
      lastActiveAt: row.last_active_at as string,
    })),
  });
}

export async function POST(request: Request) {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: "Sign in to continue." }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const sessionId = typeof body?.sessionId === "string" ? body.sessionId.trim() : "";
  const rawTitle = typeof body?.title === "string" ? body.title.trim() : "";
  if (!sessionId) return NextResponse.json({ error: "sessionId is required." }, { status: 400 });

  const title = rawTitle
    ? rawTitle.length > TITLE_MAX
      ? `${rawTitle.slice(0, TITLE_MAX - 1).trimEnd()}…`
      : rawTitle
    : "New conversation";

  const db = createSupabaseAdminClient();

  // Scoped to this member on both sides: a guessed session id belonging to
  // someone else updates nothing, because the lookup checks ownership and the
  // insert sets profile_id from the verified session.
  const { data: existing } = await db
    .from("steward_conversations")
    .select("id, profile_id")
    .eq("session_id", sessionId)
    .maybeSingle();

  if (existing) {
    if (existing.profile_id !== profile.id) {
      return NextResponse.json({ error: "Not permitted." }, { status: 403 });
    }
    await db
      .from("steward_conversations")
      .update({ last_active_at: new Date().toISOString() })
      .eq("id", existing.id as string);
    return NextResponse.json({ ok: true });
  }

  await db.from("steward_conversations").insert({
    profile_id: profile.id,
    session_id: sessionId,
    title,
  });

  return NextResponse.json({ ok: true });
}
