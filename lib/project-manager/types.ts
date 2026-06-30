export type ScheduleItemType = "project" | "phase" | "task" | "milestone";
export type ScheduleStatus = "pending" | "scheduled" | "in_progress" | "waiting" | "delayed" | "blocked" | "needs_approval" | "complete" | "canceled";
export type SchedulePriority = "low" | "normal" | "high" | "urgent" | "critical" | "blocking_closeout";
export type DependencyType = "finish_to_start" | "start_to_start" | "finish_to_finish" | "start_to_finish";

export type ProjectScheduleItem = {
  id: string;
  board_id: string | null;
  project_id: string | null;
  client_project_id: string | null;
  type: ScheduleItemType;
  project_title: string | null;
  title: string;
  phase: string | null;
  assignee: string | null;
  client: string | null;
  participants: string | null;
  dependencies: string | null;
  start_date: string;
  end_date: string;
  status: ScheduleStatus;
  priority: SchedulePriority | null;
  progress: number;
  notify: boolean;
  description: string | null;
  forms: string | null;
  punch: string | null;
  client_visible: boolean | null;
  internal_notes: string | null;
  is_blocked: boolean | null;
  blocker_reason: string | null;
  sort_order: number | null;
  visible_on_gantt: boolean | null;
  schedule_group_key: string | null;
  template_slug: string | null;
  template_name: string | null;
  duration_minutes: number | null;
  metadata: Record<string, unknown> | null;
  created_by: string | null;
  visibility: ItemVisibility;
  visible_roles: string[];
  association_counts?: { participants: number };
};

export type ItemVisibility = "team" | "private" | "roles" | "users";

export type ProjectScheduleDependency = {
  id: string;
  board_id: string | null;
  project_id: string | null;
  client_project_id: string | null;
  source_item_id: string;
  target_item_id: string;
  dependency_type: DependencyType;
  lag_days: number;
  auto_shift: boolean;
  notes: string | null;
};

export type ProjectTemplate = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string | null;
  suggested_duration_days: number;
  is_active: boolean;
};

export type ProjectTemplateTask = {
  id: string;
  template_id: string;
  phase_name: string;
  task_key: string;
  task_name: string;
  description: string | null;
  offset_days: number;
  duration_minutes: number;
  dependency_keys: string[];
  suggested_roles: string[];
  client_visible: boolean;
  priority: SchedulePriority;
  sort_order: number;
};

export type ProjectItemAttachment = {
  id: string;
  item_id: string;
  kind: "photo" | "audio" | "file";
  url: string;
  file_name: string | null;
  mime_type: string | null;
  size_bytes: number | null;
  caption: string | null;
  uploaded_by: string | null;
  created_at?: string;
};

export type LinkType = "user" | "participant" | "contact";

export type ProjectItemLink = {
  id: string;
  item_id: string;
  link_type: LinkType;
  profile_id: string | null;
  participant_id: string | null;
  contact_id: string | null;
  display_name: string | null;
  email: string | null;
  phone: string | null;
  created_at?: string;
};

export type LinkOption = { id: string; name: string; email: string | null; phone: string | null };
export type ProjectLinkOptions = { users: LinkOption[]; participants: LinkOption[]; contacts: LinkOption[] };

export type ProjectManagerData = {
  items: ProjectScheduleItem[];
  dependencies: ProjectScheduleDependency[];
  templates: ProjectTemplate[];
  templateTasks: ProjectTemplateTask[];
  attachments: ProjectItemAttachment[];
  links: ProjectItemLink[];
};
