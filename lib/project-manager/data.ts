import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { ProjectManagerData, ProjectScheduleDependency, ProjectScheduleItem, ProjectTemplate, ProjectTemplateTask } from "./types";

function participantCount(value: string | null | undefined) {
  return String(value || "").split(",").map((s) => s.trim()).filter(Boolean).length;
}

// Attach lightweight computed counts (participants) used by hover badges.
export function decorateScheduleItems(items: ProjectScheduleItem[]): ProjectScheduleItem[] {
  return items.map((item) => ({ ...item, association_counts: { participants: participantCount(item.participants) } }));
}

export async function loadProjectManagerData(boardId = "default"): Promise<ProjectManagerData> {
  const supabase = createSupabaseAdminClient();

  const [items, dependencies, templates, templateTasks] = await Promise.all([
    supabase
      .from("project_schedule_items")
      .select("*")
      .eq("board_id", boardId)
      .order("start_date", { ascending: true })
      .order("sort_order", { ascending: true }),
    supabase
      .from("project_schedule_dependencies")
      .select("*")
      .eq("board_id", boardId)
      .order("created_at", { ascending: true }),
    supabase
      .from("project_templates")
      .select("id,name,slug,description,category,suggested_duration_days,is_active")
      .eq("is_active", true)
      .order("name", { ascending: true }),
    supabase
      .from("project_template_tasks")
      .select("*")
      .order("sort_order", { ascending: true }),
  ]);

  for (const result of [items, dependencies, templates, templateTasks]) {
    if (result.error) throw result.error;
  }

  return {
    items: decorateScheduleItems((items.data || []) as ProjectScheduleItem[]),
    dependencies: (dependencies.data || []) as ProjectScheduleDependency[],
    templates: (templates.data || []) as ProjectTemplate[],
    templateTasks: (templateTasks.data || []) as ProjectTemplateTask[],
  };
}
