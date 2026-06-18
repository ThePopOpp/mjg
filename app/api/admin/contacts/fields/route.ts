import { NextResponse } from "next/server";
import { requireParticipantManager } from "@/lib/user-management/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  try {
    await requireParticipantManager(request);
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("contact_field_definitions")
      .select("*")
      .order("display_order", { ascending: true });
    if (error) throw error;
    return NextResponse.json({ fields: data ?? [] });
  } catch (err) {
    return NextResponse.json({ error: "Failed to load fields." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const actor = await requireParticipantManager(request, body.actionToken);
    if (!["super_admin", "admin"].includes(actor.role)) {
      return NextResponse.json({ error: "Admin permission required." }, { status: 403 });
    }
    const supabase = createSupabaseAdminClient();

    const fieldKey = (body.field_label as string)
      .toLowerCase().trim().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");

    const { data, error } = await supabase
      .from("contact_field_definitions")
      .insert({
        field_key:     fieldKey,
        field_label:   body.field_label,
        field_type:    body.field_type ?? "text",
        field_options: body.field_options ?? [],
        is_required:   body.is_required ?? false,
        applies_to:    body.applies_to ?? ["contact", "lead"],
        display_order: body.display_order ?? 0,
      })
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json({ field: data });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to create field.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
