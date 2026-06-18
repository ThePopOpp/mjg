import { NextResponse } from "next/server";
import { requireParticipantManager, requireAdminManager } from "@/lib/user-management/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { extractSmsFields, buildSmsSlug } from "@/lib/sms/templates";

export async function GET(request: Request) {
  try {
    await requireParticipantManager(request);
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") ?? "active";

    const supabase = createSupabaseAdminClient();
    let query = supabase
      .from("sms_templates")
      .select("id, name, slug, body, available_fields, category, status, created_at, updated_at")
      .order("updated_at", { ascending: false });

    if (status !== "all") query = query.eq("status", status);

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json({ templates: data ?? [] });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch templates.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const actor = await requireAdminManager(request, body.actionToken);

    const name = String(body.name ?? "").trim();
    const templateBody = String(body.body ?? "").trim();
    const category = String(body.category ?? "general");
    const status = body.status === "active" ? "active" : "draft";
    const existingId: string | null = body.id ?? null;

    if (!name) return NextResponse.json({ error: "Template name is required." }, { status: 400 });
    if (!templateBody) return NextResponse.json({ error: "Template body is required." }, { status: 400 });

    const fields = extractSmsFields(templateBody);
    const slug = buildSmsSlug(name);
    const supabase = createSupabaseAdminClient();

    if (existingId) {
      const { error } = await supabase
        .from("sms_templates")
        .update({ name, body: templateBody, category, status, available_fields: fields, slug, updated_by: actor.id, updated_at: new Date().toISOString() })
        .eq("id", existingId);
      if (error) throw error;
      return NextResponse.json({ ok: true, id: existingId });
    }

    const { data, error } = await supabase
      .from("sms_templates")
      .insert({ name, slug, body: templateBody, category, status, available_fields: fields, created_by: actor.id, updated_by: actor.id })
      .select("id")
      .single();
    if (error) throw error;

    return NextResponse.json({ ok: true, id: data.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save template.";
    const httpStatus = message.includes("required") || message.includes("permission") ? 403 : 500;
    return NextResponse.json({ error: message }, { status: httpStatus });
  }
}
