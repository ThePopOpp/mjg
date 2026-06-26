import { NextResponse } from "next/server";
import { requireParticipantManager } from "@/lib/user-management/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  try {
    await requireParticipantManager(request);
    const supabase = createSupabaseAdminClient();
    const [templates, tasks] = await Promise.all([
      supabase
        .from("project_templates")
        .select("id,name,slug,description,category,suggested_duration_days,is_active")
        .eq("is_active", true)
        .order("name", { ascending: true }),
      supabase.from("project_template_tasks").select("*").order("sort_order", { ascending: true }),
    ]);
    if (templates.error) throw templates.error;
    if (tasks.error) throw tasks.error;
    return NextResponse.json({ templates: templates.data || [], tasks: tasks.data || [] });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Templates load failed";
    return NextResponse.json({ message: msg }, { status: /authentication/i.test(msg) ? 401 : /permission|required/i.test(msg) ? 403 : 500 });
  }
}
