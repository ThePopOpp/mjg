// Plan Builder types. Hand-maintained to match migration 202607160040 — this repo
// has no generated Supabase types, so a column change here needs a matching edit.
// Rows stay snake_case (as they come back from Supabase), matching lib/project-manager/types.ts.

export type PlanType = "basic" | "premium";
export type PlanVisibility = "private" | "team";
export type PlanStatus = "active" | "archived";
export type PlanView = "grid" | "board";
export type PlanMemberRole = "owner" | "editor" | "member" | "viewer";
export type TaskStatus = "not_started" | "in_progress" | "waiting" | "blocked" | "complete";
export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type TemplateSource = "app" | "shared" | "mine";

export type Plan = {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  plan_type: PlanType;
  visibility: PlanVisibility;
  status: PlanStatus;
  owner_id: string;
  default_view: PlanView;
  color: string;
  icon: string;
  cover_url: string | null;
  start_date: string | null;
  target_date: string | null;
  template_id: string | null;
  template_slug: string | null;
  client_id: string | null;
  project_id: string | null;
  settings: Record<string, unknown>;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
};

export type PlanGroup = {
  id: string;
  plan_id: string;
  name: string;
  description: string | null;
  position: number;
  color: string | null;
  is_collapsed: boolean;
};

export type PlanLabel = {
  id: string;
  plan_id: string;
  name: string;
  color: string;
  position: number;
};

export type PlanMember = {
  id: string;
  plan_id: string;
  user_id: string;
  role: PlanMemberRole;
  created_at: string;
};

export type ChecklistItem = {
  id: string;
  task_id: string;
  title: string;
  is_complete: boolean;
  position: number;
};

export type PlanTask = {
  id: string;
  plan_id: string;
  group_id: string | null;
  parent_task_id: string | null;
  title: string;
  description: string | null;
  notes: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  progress: number;
  start_date: string | null;
  due_date: string | null;
  estimated_minutes: number | null;
  actual_minutes: number | null;
  is_milestone: boolean;
  position: number;
  created_by: string | null;
  completed_by: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
};

// A task joined with its assignees, labels and checklist. Grid and Board both render
// this exact shape from the same fetch — they are two presentations of one record set.
export type PlanTaskDetail = PlanTask & {
  assignee_ids: string[];
  label_ids: string[];
  checklist: ChecklistItem[];
};

export type PlanTemplate = {
  id: string;
  slug: string | null;
  name: string;
  description: string | null;
  category: string;
  plan_type: PlanType;
  visibility: "app" | "shared" | "private";
  preview_url: string | null;
  badge: string | null;
  template_data: TemplateData;
  is_system_template: boolean;
  created_by: string | null;
};

export type TemplateData = {
  views?: PlanView[];
  groups?: Array<{ key?: string; name: string; description?: string; color?: string }>;
  labels?: Array<{ name: string; color?: string }>;
  tasks?: Array<{
    title: string;
    group_key?: string;
    description?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    start_offset_days?: number;
    due_offset_days?: number;
    is_milestone?: boolean;
    checklist?: string[];
  }>;
};

export type PlanPerson = {
  id: string;
  name: string;
  email: string;
};

// Everything /dashboard/plans/[planId] needs, resolved server-side in one pass.
export type PlanWorkspaceData = {
  plan: Plan;
  groups: PlanGroup[];
  labels: PlanLabel[];
  tasks: PlanTaskDetail[];
  members: Array<PlanMember & { person: PlanPerson | null }>;
  people: PlanPerson[];
  access: PlanAccess;
};

export type PlanAccess = {
  canView: boolean;
  canEdit: boolean;
  canManage: boolean;
};

export type PlanSummary = Plan & {
  task_count: number;
  completed_count: number;
  member_count: number;
  owner: PlanPerson | null;
  // Resolved server-side per plan so the index can show owner-only actions without
  // re-deriving permissions on the client. The API re-checks regardless.
  can_manage: boolean;
};
