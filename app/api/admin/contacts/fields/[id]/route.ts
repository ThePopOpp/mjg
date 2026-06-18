import { NextResponse } from "next/server";
import { requireParticipantManager } from "@/lib/user-management/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const actor = await requireParticipantManager(request, body.actionToken);
    if (!["super_admin", "admin"].includes(actor.role)) {
      return NextResponse.json({ error: "Admin permission required." }, { status: 403 });
    }
    const supabase = createSupabaseAdminClient();
    const { actionToken, ...fields } = body;
    const { data, error } = await supabase
      .from("contact_field_definitions")
      .update(fields)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json({ field: data });
  } catch (err) {
    return NextResponse.json({ error: "Failed to update field." }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const actor = await requireParticipantManager(request, body.actionToken);
    if (!["super_admin", "admin"].includes(actor.role)) {
      return NextResponse.json({ error: "Admin permission required." }, { status: 403 });
    }
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.from("contact_field_definitions").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: "Failed to delete field." }, { status: 500 });
  }
}
