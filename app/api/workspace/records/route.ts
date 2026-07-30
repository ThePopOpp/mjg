import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/user-management/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type Hit = { recordType: string; recordId: string; label: string; sublabel: string | null; href: string };

export async function GET(request: Request) {
  try {
    await requireSuperAdmin(request);
    const url = new URL(request.url);
    const type = url.searchParams.get("type") ?? "plan";
    const q = (url.searchParams.get("q") ?? "").trim();
    const like = `%${q.replace(/[%_]/g, "")}%`;
    const supabase = createSupabaseAdminClient();
    const results: Hit[] = [];

    if (type === "plan") {
      let query = supabase.from("plans").select("id,name,status").order("updated_at", { ascending: false }).limit(20);
      if (q) query = query.ilike("name", like);
      const { data } = await query;
      for (const r of data ?? []) results.push({ recordType: "plan", recordId: r.id, label: r.name || "Untitled plan", sublabel: r.status ?? null, href: `/dashboard/plans/${r.id}` });
    } else if (type === "participant") {
      let query = supabase.from("participants").select("id,first_name,last_name,email").order("created_at", { ascending: false }).limit(20);
      if (q) query = query.or(`first_name.ilike.${like},last_name.ilike.${like},email.ilike.${like}`);
      const { data } = await query;
      for (const r of data ?? []) results.push({ recordType: "participant", recordId: r.id, label: `${r.first_name ?? ""} ${r.last_name ?? ""}`.trim() || r.email || "Participant", sublabel: r.email ?? null, href: `/dashboard/participants/${r.id}` });
    } else if (type === "booking") {
      let query = supabase.from("booking_events").select("id,title,status,start_at").order("start_at", { ascending: false }).limit(20);
      if (q) query = query.ilike("title", like);
      const { data } = await query;
      for (const r of data ?? []) results.push({ recordType: "booking", recordId: r.id, label: r.title || "Booking", sublabel: r.start_at ? new Date(r.start_at).toLocaleDateString() : (r.status ?? null), href: `/dashboard/bookings` });
    }

    return NextResponse.json({ ok: true, results });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Record search failed.";
    const status = message.includes("permission") || message.includes("Authentication") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
