import { NextResponse } from "next/server";
import { requireParticipantManager } from "@/lib/user-management/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await requireParticipantManager(request);
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase.from("contacts").select("*").eq("id", id).single();
    if (error) throw error;
    return NextResponse.json({ contact: data });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Not found.";
    return NextResponse.json({ error: msg }, { status: 404 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    await requireParticipantManager(request, body.actionToken);
    const supabase = createSupabaseAdminClient();
    const { actionToken, ...fields } = body;
    const { data, error } = await supabase
      .from("contacts")
      .update(fields)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json({ contact: data });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to update contact.";
    return NextResponse.json({ error: msg }, { status: msg.includes("required") ? 403 : 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    await requireParticipantManager(request, body.actionToken);
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.from("contacts").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to delete contact.";
    return NextResponse.json({ error: msg }, { status: msg.includes("required") ? 403 : 500 });
  }
}
