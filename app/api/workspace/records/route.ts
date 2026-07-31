import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/user-management/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type Hit = { recordType: string; recordId: string; label: string; sublabel: string | null; href: string };

// Create a real Plan so a Project Tracker row lives in both Workspace and Plans.
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const actor = await requireSuperAdmin(request, body.actionToken);
    const name = String(body.name ?? "").trim();
    if (!name) return NextResponse.json({ error: "A name is required." }, { status: 400 });
    if (body.type !== "plan") return NextResponse.json({ error: "Only plans can be created here." }, { status: 400 });
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase.from("plans").insert({ name, owner_id: actor.id, created_by: actor.id }).select("id").single();
    if (error) throw error;
    return NextResponse.json({ ok: true, recordId: data.id, label: name, href: `/dashboard/plans/${data.id}` });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create record.";
    const status = message.includes("permission") || message.includes("Authentication") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

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
    } else if (type === "project") {
      // Project Manager "projects" are distinct project_title/project_id on schedule items.
      const { data } = await supabase.from("project_schedule_items").select("project_id,project_title").not("project_id", "is", null).limit(400);
      const seen = new Set<string>();
      for (const r of data ?? []) {
        const pid = (r as any).project_id as string;
        const title = (r as any).project_title as string | null;
        if (!pid || seen.has(pid)) continue;
        if (q && !(title ?? "").toLowerCase().includes(q.toLowerCase())) continue;
        seen.add(pid);
        results.push({ recordType: "project", recordId: pid, label: title || "Project", sublabel: null, href: `/dashboard/project-manager` });
        if (results.length >= 20) break;
      }
    } else if (type === "workspace") {
      let query = supabase.from("workspace_documents").select("id,title").is("deleted_at", null).order("updated_at", { ascending: false }).limit(20);
      if (q) query = query.ilike("title", like);
      const { data } = await query;
      for (const r of data ?? []) results.push({ recordType: "workspace", recordId: r.id, label: r.title || "Untitled", sublabel: null, href: `/dashboard/workspace/${r.id}` });
    }

    return NextResponse.json({ ok: true, results });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Record search failed.";
    const status = message.includes("permission") || message.includes("Authentication") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
