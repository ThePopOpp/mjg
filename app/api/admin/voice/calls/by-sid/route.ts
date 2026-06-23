import { NextResponse } from "next/server";
import { requireParticipantManager } from "@/lib/user-management/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

// Update a call by its Twilio CallSid — used by the softphone to attach notes
// taken during a call, since the browser knows the SID but not the DB row id.
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const actor = await requireParticipantManager(request, body.actionToken);
    const callSid = String(body.callSid ?? "").trim();
    if (!callSid) return NextResponse.json({ error: "callSid is required." }, { status: 400 });

    const supabase = createSupabaseAdminClient();
    const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (body.notes !== undefined) update.notes = body.notes;
    if (actor?.id) update.handled_by = actor.id;

    const { error } = await supabase.from("calls").update(update).eq("twilio_call_sid", callSid);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update call.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
