import { NextResponse } from "next/server";
import { requireParticipantManager } from "@/lib/user-management/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { buildConversationContact, phoneKey, smsDirectoryByPhone } from "@/lib/sms/contacts";

export async function GET(request: Request) {
  try {
    await requireParticipantManager(request);
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") ?? "active";
    const search = searchParams.get("search") ?? "";
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "50"), 100);
    const offset = parseInt(searchParams.get("offset") ?? "0");

    const supabase = createSupabaseAdminClient();
    let query = supabase
      .from("sms_conversations")
      .select(`
        id, twilio_number, contact_number, contact_name,
        last_message_at, last_message_preview, unread_count, status,
        participant_id, profile_id,
        participants(first_name, last_name, email),
        profiles(full_name, email)
      `)
      .eq("status", status)
      .order("last_message_at", { ascending: false, nullsFirst: false })
      .range(offset, offset + limit - 1);

    const { data, error } = await query;
    if (error) throw error;

    // Resolve each thread's other party against profiles/participants/contacts by phone, so
    // the inbox shows a name, photo and email even when the stored contact_name is null or
    // the row was created before that person had an account.
    const directory = await smsDirectoryByPhone();
    const conversations = (data ?? []).map((c: any) => ({
      ...c,
      contact: buildConversationContact(c.contact_number, c.contact_name, directory),
    }));

    // Search also matches a resolved name/email that isn't stored on the row itself.
    const q = search.trim().toLowerCase();
    const filtered = q
      ? conversations.filter((c: any) =>
          [c.contact?.name, c.contact?.email, c.contact_number, c.contact_name]
            .filter(Boolean)
            .some((v: string) => String(v).toLowerCase().includes(q)) ||
          phoneKey(c.contact_number).includes(q.replace(/\D/g, "")),
        )
      : conversations;

    return NextResponse.json({ conversations: filtered });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch conversations.";
    const status = message.includes("required") || message.includes("permission") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
