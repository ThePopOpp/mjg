import { NextRequest, NextResponse } from "next/server";
import { requireParticipantManager } from "@/lib/user-management/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

function errStatus(msg: string) {
  return /authentication/i.test(msg) ? 401 : /permission|required/i.test(msg) ? 403 : 500;
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    await requireParticipantManager(request, body?.actionToken);
    const { actionToken, id: _id, ...patch } = body;
    void actionToken; void _id;
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("project_schedule_dependencies")
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json({ dependency: data });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Dependency update failed";
    return NextResponse.json({ message: msg }, { status: errStatus(msg) });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    await requireParticipantManager(request, body?.actionToken);
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.from("project_schedule_dependencies").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Dependency delete failed";
    return NextResponse.json({ message: msg }, { status: errStatus(msg) });
  }
}
