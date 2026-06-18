import { NextResponse } from "next/server";
import { requireParticipantManager } from "@/lib/user-management/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const body = await request.json();
    const actor = await requireParticipantManager(request, body.actionToken);
    const { id } = await params;
    const supabase = createSupabaseAdminClient();

    const allowed: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (body.notes !== undefined) allowed.notes = body.notes;
    if (body.status) allowed.status = body.status;

    await supabase.from("calls").update(allowed).eq("id", id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update call.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
