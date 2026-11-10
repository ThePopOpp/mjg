import { NextResponse } from "next/server";
import { requireUserManager } from "@/lib/user-management/auth";
import { deleteEmailTemplate } from "@/lib/email/templates";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const STATUSES = ["draft", "active", "archived"];

// Quick actions on several templates at once. Updates only the named fields, so a template's
// slug, preview text and body are never rewritten by a status or category change.
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const actor = await requireUserManager(request, body.actionToken);
    const ids: string[] = Array.isArray(body.ids) ? body.ids.filter((id: unknown) => typeof id === "string").slice(0, 200) : [];
    if (!ids.length) return NextResponse.json({ error: "Select at least one template." }, { status: 400 });

    if (body.action === "delete") {
      for (const id of ids) await deleteEmailTemplate(id);
      return NextResponse.json({ ok: true, count: ids.length });
    }

    const patch: Record<string, unknown> = { updated_by: actor.id, updated_at: new Date().toISOString() };
    if (body.action === "archive") patch.status = "archived";
    else if (body.action === "update") {
      if (typeof body.status === "string") {
        if (!STATUSES.includes(body.status)) return NextResponse.json({ error: "Unknown status." }, { status: 400 });
        patch.status = body.status;
      }
      if (typeof body.category === "string" && body.category.trim()) patch.category = body.category.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
      if (typeof body.isTest === "boolean") patch.is_test = body.isTest;
      if (Object.keys(patch).length === 2) return NextResponse.json({ error: "Nothing to change." }, { status: 400 });
    } else {
      return NextResponse.json({ error: "Unknown action." }, { status: 400 });
    }

    const { error } = await createSupabaseAdminClient().from("email_templates").update(patch).in("id", ids);
    if (error) throw error;
    return NextResponse.json({ ok: true, count: ids.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Bulk action failed.";
    const status = message.includes("permission") || message.includes("required") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
