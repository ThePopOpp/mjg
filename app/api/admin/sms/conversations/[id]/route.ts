import { NextResponse } from "next/server";
import { requireParticipantManager } from "@/lib/user-management/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const actor = await requireParticipantManager(request);
    const { id } = await params;
    const supabase = createSupabaseAdminClient();

    const { data: conversation, error: convError } = await supabase
      .from("sms_conversations")
      .select(`
        id, twilio_number, contact_number, contact_name,
        last_message_at, unread_count, status,
        participant_id, profile_id,
        participants(id, first_name, last_name, email, phone, sms_opt_in),
        profiles(id, full_name, email, phone, sms_opt_in)
      `)
      .eq("id", id)
      .single();

    if (convError) throw new Error(convError.message);

    const { data: messages, error: msgError } = await supabase
      .from("sms_messages")
      .select("id, direction, body, status, twilio_message_sid, media_urls, sent_by, sent_at, delivered_at, created_at, profiles(full_name)")
      .eq("conversation_id", id)
      .order("created_at", { ascending: true });

    if (msgError) throw new Error(msgError.message);

    // Mark as read
    await supabase
      .from("sms_conversations")
      .update({ unread_count: 0, updated_at: new Date().toISOString() })
      .eq("id", id);

    return NextResponse.json({ conversation, messages: messages ?? [] });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch conversation.";
    const status = message.includes("required") || message.includes("permission") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireParticipantManager(request);
    const { id } = await params;
    const body = await request.json();
    const supabase = createSupabaseAdminClient();

    const allowed: Record<string, unknown> = {};
    if (body.status) allowed.status = body.status;
    if (body.contact_name !== undefined) allowed.contact_name = body.contact_name;
    allowed.updated_at = new Date().toISOString();

    await supabase.from("sms_conversations").update(allowed).eq("id", id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update conversation.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
