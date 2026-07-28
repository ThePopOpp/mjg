import { NextResponse } from "next/server";
import { requireActiveProfile } from "@/lib/user-management/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const FREQUENCIES = new Set(["immediate", "daily", "weekly"]);

// Self-service general preferences. Currently persists notification "frequency" into
// user_preferences.dashboard_preferences.notify_frequency (preserving other keys).
export async function GET(request: Request) {
  try {
    const me = await requireActiveProfile(request);
    const supabase = createSupabaseAdminClient();
    const { data } = await supabase.from("user_preferences").select("dashboard_preferences").eq("user_id", me.id).maybeSingle();
    const frequency = data?.dashboard_preferences?.notify_frequency ?? "immediate";
    return NextResponse.json({ frequency });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load preferences.";
    return NextResponse.json({ error: message }, { status: 403 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const me = await requireActiveProfile(request, body.actionToken);
    const frequency = String(body.frequency ?? "");
    if (!FREQUENCIES.has(frequency)) return NextResponse.json({ error: "Invalid frequency." }, { status: 400 });

    const supabase = createSupabaseAdminClient();
    const { data: existing } = await supabase.from("user_preferences").select("dashboard_preferences").eq("user_id", me.id).maybeSingle();
    const merged = { ...(existing?.dashboard_preferences ?? {}), notify_frequency: frequency };
    if (existing) {
      await supabase.from("user_preferences").update({ dashboard_preferences: merged }).eq("user_id", me.id);
    } else {
      await supabase.from("user_preferences").insert({ user_id: me.id, dashboard_preferences: merged });
    }
    return NextResponse.json({ ok: true, frequency });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save preferences.";
    const status = message.includes("profile") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
