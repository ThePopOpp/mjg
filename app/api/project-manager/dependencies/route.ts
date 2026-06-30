import { NextRequest, NextResponse } from "next/server";
import { requireParticipantManager } from "@/lib/user-management/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { filterVisibleItems } from "@/lib/project-manager/data";
import type { ProjectScheduleDependency, ProjectScheduleItem } from "@/lib/project-manager/types";

const dependencyTypes = new Set(["finish_to_start", "start_to_start", "finish_to_finish", "start_to_finish"]);

function errStatus(msg: string) {
  return /authentication/i.test(msg) ? 401 : /permission|required/i.test(msg) ? 403 : 500;
}

function normalizeDependency(body: Record<string, unknown>) {
  const source = String(body.source_item_id || "");
  const target = String(body.target_item_id || "");
  if (!source || !target) throw new Error("Source and target schedule item ids are required.");
  if (source === target) throw new Error("A schedule item cannot depend on itself.");
  const dependencyType = dependencyTypes.has(String(body.dependency_type)) ? String(body.dependency_type) : "finish_to_start";

  return {
    board_id: body.board_id ? String(body.board_id) : "default",
    source_item_id: source,
    target_item_id: target,
    dependency_type: dependencyType,
    lag_days: Number.isFinite(Number(body.lag_days)) ? Number(body.lag_days) : 0,
    auto_shift: Boolean(body.auto_shift),
    notes: body.notes ? String(body.notes) : null,
  };
}

export async function GET(request: NextRequest) {
  try {
    const actor = await requireParticipantManager(request);
    const supabase = createSupabaseAdminClient();
    const boardId = request.nextUrl.searchParams.get("board_id") || "default";
    const [depsRes, itemsRes] = await Promise.all([
      supabase.from("project_schedule_dependencies").select("*").eq("board_id", boardId).order("created_at", { ascending: true }),
      supabase.from("project_schedule_items").select("*").eq("board_id", boardId),
    ]);
    if (depsRes.error) throw depsRes.error;
    if (itemsRes.error) throw itemsRes.error;
    const visibleIds = new Set(filterVisibleItems((itemsRes.data || []) as ProjectScheduleItem[], { id: actor.id, role: actor.role }).map((i) => i.id));
    const dependencies = ((depsRes.data || []) as ProjectScheduleDependency[]).filter((d) => visibleIds.has(d.source_item_id) && visibleIds.has(d.target_item_id));
    return NextResponse.json({ dependencies });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Dependencies load failed";
    return NextResponse.json({ message: msg }, { status: errStatus(msg) });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    await requireParticipantManager(request, body?.actionToken);
    const supabase = createSupabaseAdminClient();
    const payload = normalizeDependency(body);
    const { data, error } = await supabase.from("project_schedule_dependencies").insert(payload).select().single();
    if (error) throw error;
    return NextResponse.json({ dependency: data });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Dependency create failed";
    return NextResponse.json({ message: msg }, { status: errStatus(msg) });
  }
}
