import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type {
  LinkOption, ProjectItemAttachment, ProjectItemLink, ProjectLinkOptions, ProjectManagerData,
  ProjectScheduleDependency, ProjectScheduleItem, ProjectTemplate, ProjectTemplateTask,
} from "./types";

function participantCount(value: string | null | undefined) {
  return String(value || "").split(",").map((s) => s.trim()).filter(Boolean).length;
}

export type PmViewer = { id: string; role: string; email: string };

function groupKeyOf(i: Pick<ProjectScheduleItem, "schedule_group_key" | "project_title" | "title" | "type">) {
  return i.schedule_group_key || i.project_title || (i.type === "project" ? i.title : "Ungrouped");
}
const splitEmails = (s?: string | null) => String(s || "").split(/[,\s]+/).map((x) => x.trim().toLowerCase()).filter(Boolean);

type VisRule = { visibility: string; visible_roles: string[]; created_by: string | null; emails: string[] };
function ruleOf(i: ProjectScheduleItem): VisRule {
  return {
    visibility: i.visibility ?? "team",
    visible_roles: i.visible_roles ?? [],
    created_by: i.created_by ?? null,
    emails: [...splitEmails(i.assignee), ...splitEmails(i.participants)],
  };
}

// Visibility is controlled at the PROJECT level; tasks/phases/milestones inherit
// their project's rule. An item is visible if (its project's) visibility is
// 'team', the viewer is the creator, the viewer's role is listed ('roles'), or
// the viewer's email is one of the project's assignee/participants ('roles' adds
// this as a union; 'users' is email-only). 'private' is strict (creator only,
// no super-admin override). Ungrouped items default to team.
export function filterVisibleItems<T extends ProjectScheduleItem>(items: T[], viewer: PmViewer): T[] {
  const myEmail = (viewer.email || "").trim().toLowerCase();
  const projects = new Map<string, VisRule>();
  for (const i of items) {
    if (i.type === "project") {
      const key = i.schedule_group_key || i.project_title || i.title;
      if (key) projects.set(key, ruleOf(i));
    }
  }
  const canView = (i: ProjectScheduleItem) => {
    const r: VisRule = i.type === "project"
      ? ruleOf(i)
      : projects.get(groupKeyOf(i)) ?? { visibility: "team", visible_roles: [], created_by: null, emails: [] };
    if (r.visibility === "team") return true;
    if (r.created_by && r.created_by === viewer.id) return true; // creator always sees their own
    if (r.visibility === "private") return false;
    if (r.visibility === "roles") return r.visible_roles.includes(viewer.role) || (!!myEmail && r.emails.includes(myEmail));
    if (r.visibility === "users") return !!myEmail && r.emails.includes(myEmail);
    return true;
  };
  return items.filter(canView);
}

// Attach lightweight computed counts (participants) used by hover badges.
export function decorateScheduleItems(items: ProjectScheduleItem[]): ProjectScheduleItem[] {
  return items.map((item) => ({ ...item, association_counts: { participants: participantCount(item.participants) } }));
}

export async function loadProjectManagerData(boardId = "default", viewer?: PmViewer): Promise<ProjectManagerData> {
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

  const all = decorateScheduleItems((items.data || []) as ProjectScheduleItem[]);
  const decorated = viewer ? filterVisibleItems(all, viewer) : all;
  const itemIds = decorated.map((i) => i.id);
  const visibleSet = new Set(itemIds);

  // Only keep dependencies whose endpoints are both visible to this viewer.
  const allDeps = (dependencies.data || []) as ProjectScheduleDependency[];
  const visibleDeps = viewer ? allDeps.filter((d) => visibleSet.has(d.source_item_id) && visibleSet.has(d.target_item_id)) : allDeps;

  let attachments: ProjectItemAttachment[] = [];
  let links: ProjectItemLink[] = [];
  if (itemIds.length) {
    const [att, lnk] = await Promise.all([
      supabase.from("project_item_attachments").select("*").in("item_id", itemIds).order("created_at", { ascending: true }),
      supabase.from("project_item_links").select("*").in("item_id", itemIds).order("created_at", { ascending: true }),
    ]);
    attachments = (att.data || []) as ProjectItemAttachment[];
    links = (lnk.data || []) as ProjectItemLink[];
  }

  return {
    items: decorated,
    dependencies: visibleDeps,
    templates: (templates.data || []) as ProjectTemplate[],
    templateTasks: (templateTasks.data || []) as ProjectTemplateTask[],
    attachments,
    links,
  };
}

// ── Attachments ────────────────────────────────────────────────────────────────
export async function addItemAttachment(input: {
  item_id: string; kind: "photo" | "audio" | "file"; url: string;
  file_name?: string | null; mime_type?: string | null; size_bytes?: number | null; uploaded_by?: string | null;
}): Promise<ProjectItemAttachment> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from("project_item_attachments").insert({
    item_id: input.item_id, kind: input.kind, url: input.url,
    file_name: input.file_name ?? null, mime_type: input.mime_type ?? null,
    size_bytes: input.size_bytes ?? null, uploaded_by: input.uploaded_by ?? null,
  }).select("*").single();
  if (error) throw error;
  return data as unknown as ProjectItemAttachment;
}
export async function deleteItemAttachment(id: string): Promise<void> {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("project_item_attachments").delete().eq("id", id);
  if (error) throw error;
}

// ── Links (people associations) ──────────────────────────────────────────────────
export async function addItemLink(input: {
  item_id: string; link_type: "user" | "participant" | "contact"; target_id: string;
  display_name?: string | null; email?: string | null; phone?: string | null; created_by?: string | null;
}): Promise<ProjectItemLink> {
  const supabase = createSupabaseAdminClient();
  const row: Record<string, unknown> = {
    item_id: input.item_id, link_type: input.link_type,
    display_name: input.display_name ?? null, email: input.email ?? null, phone: input.phone ?? null,
    created_by: input.created_by ?? null,
  };
  if (input.link_type === "user") row.profile_id = input.target_id;
  else if (input.link_type === "participant") row.participant_id = input.target_id;
  else row.contact_id = input.target_id;
  const { data, error } = await supabase.from("project_item_links").insert(row).select("*").single();
  if (error) throw error;
  return data as unknown as ProjectItemLink;
}
export async function deleteItemLink(id: string): Promise<void> {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("project_item_links").delete().eq("id", id);
  if (error) throw error;
}

// Options for the link picker — users, participants, and contacts.
export async function loadProjectLinkOptions(): Promise<ProjectLinkOptions> {
  const supabase = createSupabaseAdminClient();
  const [u, p, c] = await Promise.all([
    supabase.from("profiles").select("id, full_name, email").in("status", ["active", "invited"]).order("full_name").limit(500),
    supabase.from("participants").select("id, first_name, last_name, email, phone").order("created_at", { ascending: false }).limit(500),
    supabase.from("contacts").select("id, first_name, last_name, email, phone").eq("status", "active").order("created_at", { ascending: false }).limit(500),
  ]);
  const name = (a?: string | null, b?: string | null) => `${a ?? ""} ${b ?? ""}`.trim();
  const users: LinkOption[] = (u.data || []).map((r) => ({ id: r.id, name: r.full_name || r.email || "User", email: r.email ?? null, phone: null }));
  const participants: LinkOption[] = (p.data || []).map((r) => ({ id: r.id, name: name(r.first_name, r.last_name) || r.email || "Participant", email: r.email ?? null, phone: r.phone ?? null }));
  const contacts: LinkOption[] = (c.data || []).map((r) => ({ id: r.id, name: name(r.first_name, r.last_name) || r.email || "Contact", email: r.email ?? null, phone: r.phone ?? null }));
  return { users, participants, contacts };
}
