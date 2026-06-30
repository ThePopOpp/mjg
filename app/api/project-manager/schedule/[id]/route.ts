import { NextRequest, NextResponse } from "next/server";
import { requireParticipantManager } from "@/lib/user-management/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

function errStatus(msg: string) {
  return /authentication/i.test(msg) ? 401 : /permission|required/i.test(msg) ? 403 : 500;
}

// Strip non-column / read-only fields a client might echo back.
function cleanPatch(body: Record<string, unknown>) {
  const { actionToken, id, association_counts, created_at, ...patch } = body;
  void actionToken; void id; void association_counts; void created_at;
  return patch;
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const actor = await requireParticipantManager(request, body?.actionToken);
    const supabase = createSupabaseAdminClient();
    const patch: Record<string, unknown> = cleanPatch(body);

    // When an item is first made private/role-limited and has no creator yet,
    // stamp this actor as the creator so they retain access to their own item.
    if (typeof patch.visibility === "string" && patch.visibility !== "team") {
      const { data: existing } = await supabase.from("project_schedule_items").select("created_by").eq("id", id).maybeSingle();
      if (existing && !existing.created_by) patch.created_by = actor.id;
    }

    const { data, error } = await supabase
      .from("project_schedule_items")
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json({ item: data });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Schedule item update failed";
    return NextResponse.json({ message: msg }, { status: errStatus(msg) });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    await requireParticipantManager(request, body?.actionToken);
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.from("project_schedule_items").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Schedule item delete failed";
    return NextResponse.json({ message: msg }, { status: errStatus(msg) });
  }
}
