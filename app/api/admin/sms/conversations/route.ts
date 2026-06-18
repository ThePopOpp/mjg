import { NextResponse } from "next/server";
import { requireParticipantManager } from "@/lib/user-management/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

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

    if (search) {
      query = query.or(`contact_name.ilike.%${search}%,contact_number.ilike.%${search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ conversations: data ?? [] });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch conversations.";
    const status = message.includes("required") || message.includes("permission") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
