import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireParticipantManager } from "@/lib/user-management/auth";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const actor = await requireParticipantManager();
    const { id } = await context.params;
    const body = await request.json();
    const action = String(body.action ?? "");
    const now = new Date().toISOString();

    const updates =
      action === "show"
        ? { hidden_at: null, removed_at: null, deleted_at: null, actioned_by: actor.id, action_reason: "shown" }
        : action === "hide"
          ? { hidden_at: now, actioned_by: actor.id, action_reason: "hidden" }
          : action === "remove"
            ? { removed_at: now, actioned_by: actor.id, action_reason: "removed" }
            : action === "delete"
              ? { deleted_at: now, actioned_by: actor.id, action_reason: "deleted" }
              : null;

    if (!updates) return NextResponse.json({ error: "Unknown form submission action." }, { status: 400 });

    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase.from("form_submissions").update(updates).eq("id", id).select("*").single();
    if (error) throw error;
    return NextResponse.json({ ok: true, submission: data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Form submission action failed.";
    return NextResponse.json({ error: message }, { status: message.includes("permission") ? 403 : 500 });
  }
}
