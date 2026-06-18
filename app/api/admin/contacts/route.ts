import { NextResponse } from "next/server";
import { requireParticipantManager } from "@/lib/user-management/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  try {
    const actor = await requireParticipantManager(request);
    const { searchParams } = new URL(request.url);
    const type    = searchParams.get("type") ?? "contact";
    const status  = searchParams.get("status") ?? "";
    const search  = searchParams.get("search") ?? "";
    const page    = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit   = Math.min(100, parseInt(searchParams.get("limit") ?? "50"));
    const offset  = (page - 1) * limit;

    const supabase = createSupabaseAdminClient();
    let query = supabase
      .from("contacts")
      .select("*", { count: "exact" })
      .eq("type", type)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) query = query.eq("status", status);
    if (search) {
      query = query.or(
        `first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%,company.ilike.%${search}%`
      );
    }

    const { data, count, error } = await query;
    if (error) throw error;

    return NextResponse.json({ data: data ?? [], total: count ?? 0, page, limit });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to load contacts.";
    return NextResponse.json({ error: msg }, { status: msg.includes("required") ? 403 : 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const actor = await requireParticipantManager(request, body.actionToken);
    const supabase = createSupabaseAdminClient();

    const { actionToken, ...fields } = body;
    const { data, error } = await supabase
      .from("contacts")
      .insert({ ...fields, created_by: actor.id })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ contact: data });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to create contact.";
    return NextResponse.json({ error: msg }, { status: msg.includes("required") ? 403 : 500 });
  }
}
