import { NextRequest, NextResponse } from "next/server";
import { requireParticipantManager } from "@/lib/user-management/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { decorateScheduleItems, filterVisibleItems } from "@/lib/project-manager/data";
import type { ProjectScheduleItem } from "@/lib/project-manager/types";

const statuses = new Set(["pending", "scheduled", "in_progress", "waiting", "delayed", "blocked", "needs_approval", "complete", "canceled"]);
const priorities = new Set(["low", "normal", "high", "urgent", "critical", "blocking_closeout"]);
const types = new Set(["project", "phase", "task", "milestone"]);
const visibilities = new Set(["team", "private", "roles"]);
const validRoles = new Set(["super_admin", "admin", "team_member", "content_reviewer", "pastor_elder_reviewer"]);

function errStatus(msg: string) {
  return /authentication/i.test(msg) ? 401 : /permission|required/i.test(msg) ? 403 : 500;
}

function normalizeItem(body: Record<string, unknown>) {
  const title = String(body.title || "").trim();
  const start = String(body.start_date || body.start || "").trim();
  const end = String(body.end_date || body.end || start).trim();
  if (!title) throw new Error("Schedule item title is required.");
  if (!start || !end) throw new Error("Start and end dates are required.");

  const status = statuses.has(String(body.status)) ? String(body.status) : "scheduled";
  const priority = priorities.has(String(body.priority)) ? String(body.priority) : "normal";
  const type = types.has(String(body.type)) ? String(body.type) : "task";

  // Visibility is project-level; tasks/phases/milestones always store 'team'
  // (they inherit their project's rules at read time).
  const visibility = type === "project" && visibilities.has(String(body.visibility)) ? String(body.visibility) : "team";
  const visible_roles = visibility === "roles" && Array.isArray(body.visible_roles)
    ? (body.visible_roles as unknown[]).map(String).filter((r) => validRoles.has(r))
    : [];

  return {
    visibility,
    visible_roles,
    board_id: body.board_id ? String(body.board_id) : "default",
    type,
    project_title: body.project_title ? String(body.project_title) : null,
    title,
    phase: body.phase ? String(body.phase) : null,
    assignee: body.assignee ? String(body.assignee) : null,
    client: body.client ? String(body.client) : null,
    participants: body.participants ? String(body.participants) : null,
    dependencies: body.dependencies ? String(body.dependencies) : null,
    start_date: start,
    end_date: end,
    status,
    priority,
    progress: Math.max(0, Math.min(100, Number(body.progress) || 0)),
    notify: Boolean(body.notify),
    description: body.description ? String(body.description) : null,
    forms: body.forms ? String(body.forms) : null,
    punch: body.punch ? String(body.punch) : null,
    client_visible: Boolean(body.client_visible),
    internal_notes: body.internal_notes ? String(body.internal_notes) : null,
    is_blocked: Boolean(body.is_blocked),
    blocker_reason: body.blocker_reason ? String(body.blocker_reason) : null,
    sort_order: Number.isFinite(Number(body.sort_order)) ? Number(body.sort_order) : 0,
    visible_on_gantt: body.visible_on_gantt !== false,
    schedule_group_key: body.schedule_group_key ? String(body.schedule_group_key) : body.project_title ? String(body.project_title) : null,
    template_slug: body.template_slug ? String(body.template_slug) : null,
    template_name: body.template_name ? String(body.template_name) : null,
    duration_minutes: Number.isFinite(Number(body.duration_minutes)) ? Number(body.duration_minutes) : null,
    metadata: body.metadata && typeof body.metadata === "object" ? body.metadata : {},
  };
}

export async function GET(request: NextRequest) {
  try {
    const actor = await requireParticipantManager(request);
    const supabase = createSupabaseAdminClient();
    const boardId = request.nextUrl.searchParams.get("board_id") || "default";
    const { data, error } = await supabase
      .from("project_schedule_items")
      .select("*")
      .eq("board_id", boardId)
      .order("start_date", { ascending: true })
      .order("sort_order", { ascending: true });
    if (error) throw error;
    const items = decorateScheduleItems((data || []) as ProjectScheduleItem[]);
    const visible = filterVisibleItems(items, { id: actor.id, role: actor.role });
    return NextResponse.json({ items: visible });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Schedule items load failed";
    return NextResponse.json({ message: msg }, { status: errStatus(msg) });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const actor = await requireParticipantManager(request, body?.actionToken);
    const supabase = createSupabaseAdminClient();
    const payload = { ...normalizeItem(body), created_by: actor.id };
    const { data, error } = await supabase.from("project_schedule_items").insert(payload).select().single();
    if (error) throw error;
    return NextResponse.json({ item: data });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Schedule item create failed";
    return NextResponse.json({ message: msg }, { status: errStatus(msg) });
  }
}
