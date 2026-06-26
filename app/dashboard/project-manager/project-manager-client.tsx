"use client";

import * as React from "react";
import {
  Bell, CalendarDays, Camera, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, Columns3, Contact,
  Copy, EyeOff, FileDown, FileText, GanttChartSquare, LayoutTemplate, List as ListIcon, Loader2, Mic,
  Paperclip, Plus, Pencil, Save, StickyNote, Table2, Trash2, User, UserPlus, Users, UsersRound, X, Link2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FieldSelect, type FieldSelectOption } from "@/components/ui/field-select";
import { DatePicker } from "@/components/ui/date-picker";
import { cn } from "@/lib/utils";
import { useDashboardActionToken } from "@/components/layout/dashboard-action-token";
import type {
  DependencyType, LinkType, ProjectItemAttachment, ProjectItemLink, ProjectLinkOptions,
  ProjectManagerData, ProjectScheduleDependency, ProjectScheduleItem,
  ProjectTemplate, ProjectTemplateTask, SchedulePriority, ScheduleStatus, ScheduleItemType,
} from "@/lib/project-manager/types";

// ── helpers ──────────────────────────────────────────────────────────────────
const dayMs = 86400000;
function dateOnly(s: string) { return (s || "").slice(0, 10); }
function todayStr() { return new Date().toISOString().slice(0, 10); }
function fmtDate(s: string) { if (!s) return "—"; const d = new Date(`${dateOnly(s)}T00:00:00Z`); return d.toLocaleDateString([], { month: "short", day: "numeric", timeZone: "UTC" }); }

const STATUSES: ScheduleStatus[] = ["pending", "scheduled", "in_progress", "waiting", "delayed", "blocked", "needs_approval", "complete", "canceled"];
const PRIORITIES: SchedulePriority[] = ["low", "normal", "high", "urgent", "critical", "blocking_closeout"];
const TYPES: ScheduleItemType[] = ["project", "phase", "task", "milestone"];
const DEP_TYPES: DependencyType[] = ["finish_to_start", "start_to_start", "finish_to_finish", "start_to_finish"];

const statusClass: Record<string, string> = {
  pending: "bg-muted text-muted-foreground",
  scheduled: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  in_progress: "bg-primary/15 text-primary",
  waiting: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  delayed: "bg-orange-500/15 text-orange-600 dark:text-orange-400",
  blocked: "bg-red-500/15 text-red-600 dark:text-red-400",
  needs_approval: "bg-purple-500/15 text-purple-600 dark:text-purple-400",
  complete: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  canceled: "bg-muted text-muted-foreground line-through",
};
const priorityClass: Record<string, string> = {
  low: "text-muted-foreground", normal: "text-foreground", high: "text-amber-600 dark:text-amber-400",
  urgent: "text-orange-600 dark:text-orange-400", critical: "text-red-600 dark:text-red-400",
  blocking_closeout: "text-red-700 dark:text-red-400 font-semibold",
};
const label = (s: string) => s.replace(/_/g, " ");
const cap = (s: string) => { const w = label(s); return w.charAt(0).toUpperCase() + w.slice(1); };
const opts = (arr: string[]): FieldSelectOption[] => arr.map((v) => ({ value: v, label: cap(v) }));

const STATUS_FILTER_OPTS: FieldSelectOption[] = [{ value: "", label: "All statuses" }, ...opts(STATUSES)];
const STATUS_OPTS = opts(STATUSES);
const PRIORITY_OPTS = opts(PRIORITIES);
const TYPE_OPTS = opts(TYPES);
const DEP_TYPE_OPTS = opts(DEP_TYPES);

type ProjectView = "list" | "table" | "kanban" | "gantt" | "calendar" | "templates" | "my_tasks";
const VIEWS: { key: ProjectView; label: string; icon: React.ElementType }[] = [
  { key: "list", label: "List", icon: ListIcon },
  { key: "table", label: "Table", icon: Table2 },
  { key: "kanban", label: "Kanban", icon: Columns3 },
  { key: "gantt", label: "Gantt", icon: GanttChartSquare },
  { key: "calendar", label: "Calendar", icon: CalendarDays },
  { key: "templates", label: "Templates", icon: LayoutTemplate },
  { key: "my_tasks", label: "My Tasks", icon: User },
];

type ItemDraft = {
  id?: string; type: ScheduleItemType; title: string; project_title: string; phase: string;
  assignee: string; participants: string; client: string; start_date: string; end_date: string;
  status: ScheduleStatus; priority: SchedulePriority; progress: number; description: string;
  internal_notes: string; notify: boolean; client_visible: boolean; is_blocked: boolean; blocker_reason: string;
};
function toDraft(item?: ProjectScheduleItem): ItemDraft {
  return {
    id: item?.id, type: item?.type ?? "task", title: item?.title ?? "", project_title: item?.project_title ?? "",
    phase: item?.phase ?? "", assignee: item?.assignee ?? "", participants: item?.participants ?? "",
    client: item?.client ?? "", start_date: dateOnly(item?.start_date ?? todayStr()), end_date: dateOnly(item?.end_date ?? todayStr()),
    status: item?.status ?? "scheduled", priority: (item?.priority ?? "normal") as SchedulePriority, progress: item?.progress ?? 0,
    description: item?.description ?? "", internal_notes: item?.internal_notes ?? "", notify: Boolean(item?.notify),
    client_visible: Boolean(item?.client_visible), is_blocked: Boolean(item?.is_blocked), blocker_reason: item?.blocker_reason ?? "",
  };
}

export function ProjectManagerClient({
  initialData, staffOptions, currentUserName, linkOptions,
}: {
  initialData: ProjectManagerData;
  staffOptions: string[];
  currentUserName: string;
  linkOptions: ProjectLinkOptions;
}) {
  const token = useDashboardActionToken();
  const [items, setItems] = React.useState<ProjectScheduleItem[]>(initialData.items);
  const [deps, setDeps] = React.useState<ProjectScheduleDependency[]>(initialData.dependencies);
  const [templates] = React.useState<ProjectTemplate[]>(initialData.templates);
  const [templateTasks] = React.useState<ProjectTemplateTask[]>(initialData.templateTasks);
  const [attachments, setAttachments] = React.useState<ProjectItemAttachment[]>(initialData.attachments);
  const [links, setLinks] = React.useState<ProjectItemLink[]>(initialData.links);
  const [view, setView] = React.useState<ProjectView>("list");
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("");
  const [editing, setEditing] = React.useState<ItemDraft | null>(null);
  const [applyTpl, setApplyTpl] = React.useState<ProjectTemplate | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const reload = React.useCallback(async () => {
    try {
      const [s, d] = await Promise.all([
        fetch("/api/project-manager/schedule", { headers: { "x-mjg-action-token": token } }).then((r) => r.json()),
        fetch("/api/project-manager/dependencies", { headers: { "x-mjg-action-token": token } }).then((r) => r.json()),
      ]);
      if (s.items) setItems(s.items);
      if (d.dependencies) setDeps(d.dependencies);
    } catch { /* keep current */ }
  }, [token]);

  async function send(url: string, method: string, body: Record<string, unknown>) {
    const res = await fetch(url, { method, headers: { "content-type": "application/json" }, body: JSON.stringify({ ...body, actionToken: token }) });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.message || json.error || "Request failed.");
    return json;
  }

  async function saveItem(draft: ItemDraft) {
    setBusy(true); setError(null);
    try {
      const payload = { ...draft, schedule_group_key: draft.project_title || null };
      if (draft.id) await send(`/api/project-manager/schedule/${draft.id}`, "PATCH", payload);
      else await send("/api/project-manager/schedule", "POST", payload);
      setEditing(null);
      await reload();
    } catch (err) { setError(err instanceof Error ? err.message : "Save failed."); }
    finally { setBusy(false); }
  }

  async function deleteItem(id: string) {
    if (!window.confirm("Delete this item? Its dependencies are removed too.")) return;
    setBusy(true);
    try { await send(`/api/project-manager/schedule/${id}`, "DELETE", {}); await reload(); }
    catch (err) { setError(err instanceof Error ? err.message : "Delete failed."); }
    finally { setBusy(false); }
  }

  async function quickStatus(item: ProjectScheduleItem, status: ScheduleStatus) {
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, status } : i)));
    try { await send(`/api/project-manager/schedule/${item.id}`, "PATCH", { status }); } catch { reload(); }
  }

  // Gantt drag/resize persistence — optimistic, then reload to pick up any dependency auto-shifts.
  async function moveItem(id: string, start_date: string, end_date: string) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, start_date, end_date } : i)));
    try { await send(`/api/project-manager/schedule/${id}`, "PATCH", { start_date, end_date }); await reload(); }
    catch (err) { setError(err instanceof Error ? err.message : "Move failed."); reload(); }
  }

  // Generic optimistic field patch (used by Gantt FAB: complete/cancel/hide).
  async function quickPatch(item: ProjectScheduleItem, patch: Record<string, unknown>) {
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, ...patch } : i)));
    try { await send(`/api/project-manager/schedule/${item.id}`, "PATCH", patch); } catch { reload(); }
  }

  async function duplicateItem(item: ProjectScheduleItem) {
    setError(null);
    try {
      const draft = toDraft(item);
      await send("/api/project-manager/schedule", "POST", {
        ...draft, id: undefined, title: `${item.title} (copy)`,
        schedule_group_key: item.schedule_group_key || item.project_title || null,
      });
      await reload();
    } catch (err) { setError(err instanceof Error ? err.message : "Duplicate failed."); }
  }

  // Attachments: pick a file → upload to mjg-media → record on the item. Used by the
  // FAB (Add photo/audio) and the editor's attachment buttons.
  function pickAndUpload(itemId: string, kind: "photo" | "audio" | "file") {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = kind === "photo" ? "image/*" : kind === "audio" ? "audio/*" : "image/*,audio/*,video/*,application/pdf";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      setBusy(true); setError(null);
      try {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("folder", "project-manager");
        const up = await fetch("/api/admin/uploads", { method: "POST", headers: { "x-mjg-action-token": token }, body: fd });
        const uj = await up.json().catch(() => ({}));
        if (!up.ok) throw new Error(uj.error || "Upload failed.");
        const res = await send("/api/project-manager/attachments", "POST", {
          item_id: itemId, kind, url: uj.url, file_name: uj.name, mime_type: uj.type, size_bytes: uj.size,
        });
        setAttachments((prev) => [...prev, res.attachment]);
      } catch (err) { setError(err instanceof Error ? err.message : "Upload failed."); }
      finally { setBusy(false); }
    };
    input.click();
  }

  async function deleteAttachment(id: string) {
    try { await send(`/api/project-manager/attachments/${id}`, "DELETE", {}); setAttachments((prev) => prev.filter((a) => a.id !== id)); }
    catch (err) { setError(err instanceof Error ? err.message : "Delete failed."); }
  }

  async function addLink(itemId: string, opt: { link_type: LinkType; id: string; name: string; email: string | null; phone: string | null }) {
    try {
      const res = await send("/api/project-manager/links", "POST", {
        item_id: itemId, link_type: opt.link_type, target_id: opt.id, display_name: opt.name, email: opt.email, phone: opt.phone,
      });
      setLinks((prev) => [...prev, res.link]);
    } catch (err) { setError(err instanceof Error ? err.message : "Link failed."); }
  }

  async function removeLink(id: string) {
    try { await send(`/api/project-manager/links/${id}`, "DELETE", {}); setLinks((prev) => prev.filter((l) => l.id !== id)); }
    catch (err) { setError(err instanceof Error ? err.message : "Unlink failed."); }
  }

  async function addDependency(targetId: string, sourceId: string, dependency_type: DependencyType, lag_days: number, auto_shift: boolean) {
    await send("/api/project-manager/dependencies", "POST", { source_item_id: sourceId, target_item_id: targetId, dependency_type, lag_days, auto_shift });
    await reload();
  }
  async function removeDependency(id: string) {
    await send(`/api/project-manager/dependencies/${id}`, "DELETE", {});
    await reload();
  }

  async function applyTemplate(tpl: ProjectTemplate, project_title: string, start_date: string) {
    setBusy(true); setError(null);
    try {
      await send("/api/project-manager/apply-template", "POST", { template_id: tpl.id, project_title, start_date });
      setApplyTpl(null); setView("list");
      await reload();
    } catch (err) { setError(err instanceof Error ? err.message : "Apply failed."); }
    finally { setBusy(false); }
  }

  // ── filtering ──
  const visible = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((i) => {
      if (statusFilter && i.status !== statusFilter) return false;
      if (q && !`${i.title} ${i.project_title ?? ""} ${i.phase ?? ""} ${i.assignee ?? ""}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [items, search, statusFilter]);

  const myItems = React.useMemo(() => {
    const me = currentUserName.trim().toLowerCase();
    if (!me) return [];
    return items.filter((i) => `${i.assignee ?? ""} ${i.participants ?? ""}`.toLowerCase().includes(me));
  }, [items, currentUserName]);

  const incomingDeps = (itemId: string) => deps.filter((d) => d.target_item_id === itemId);

  return (
    <div>
      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap items-center rounded-lg border border-border bg-card p-0.5 text-xs">
          {VIEWS.map((v) => (
            <button key={v.key} onClick={() => setView(v.key)} className={cn("flex items-center gap-1.5 rounded-md px-3 py-1.5 font-medium", view === v.key ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground")}>
              <v.icon className="h-3.5 w-3.5" />{v.label}
            </button>
          ))}
        </div>
        {view !== "templates" && (
          <>
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search…" className="h-8 w-44" />
            <div className="w-40"><FieldSelect value={statusFilter} onChange={setStatusFilter} options={STATUS_FILTER_OPTS} className="h-8" /></div>
          </>
        )}
        <div className="ml-auto flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => setView("templates")}><LayoutTemplate className="h-3.5 w-3.5" /> Templates</Button>
          <Button size="sm" onClick={() => setEditing(toDraft())}><Plus className="h-3.5 w-3.5" /> New item</Button>
        </div>
      </div>

      {error && <div className="mb-3 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>}

      {view === "list" && <ListView items={visible} onEdit={(i) => setEditing(toDraft(i))} onDelete={deleteItem} depCount={(id) => incomingDeps(id).length} />}
      {view === "table" && <TableView items={visible} onEdit={(i) => setEditing(toDraft(i))} onDelete={deleteItem} />}
      {view === "kanban" && <KanbanView items={visible} onEdit={(i) => setEditing(toDraft(i))} onStatus={quickStatus} />}
      {view === "gantt" && (
        <GanttView
          items={visible} deps={deps}
          onEdit={(i) => setEditing(toDraft(i))} onMove={moveItem}
          onDuplicate={duplicateItem} onPatch={quickPatch} onDelete={deleteItem}
          onAttach={pickAndUpload}
        />
      )}
      {view === "calendar" && <CalendarView items={visible} onEdit={(i) => setEditing(toDraft(i))} />}
      {view === "my_tasks" && <ListView items={myItems} onEdit={(i) => setEditing(toDraft(i))} onDelete={deleteItem} depCount={(id) => incomingDeps(id).length} emptyLabel={currentUserName ? `No tasks assigned to ${currentUserName}.` : "Your profile name is not set."} />}
      {view === "templates" && <TemplatesView templates={templates} tasks={templateTasks} onApply={setApplyTpl} />}

      {editing && (
        <ItemEditor
          draft={editing} setDraft={setEditing} onSave={saveItem} onClose={() => setEditing(null)} busy={busy}
          staffOptions={staffOptions} allItems={items}
          incoming={editing.id ? incomingDeps(editing.id) : []}
          itemsById={Object.fromEntries(items.map((i) => [i.id, i]))}
          onAddDep={addDependency} onRemoveDep={removeDependency}
          attachments={editing.id ? attachments.filter((a) => a.item_id === editing.id) : []}
          links={editing.id ? links.filter((l) => l.item_id === editing.id) : []}
          linkOptions={linkOptions}
          onUpload={pickAndUpload} onRemoveAttachment={deleteAttachment}
          onAddLink={addLink} onRemoveLink={removeLink}
        />
      )}
      {applyTpl && (
        <ApplyTemplateModal template={applyTpl} taskCount={templateTasks.filter((t) => t.template_id === applyTpl.id).length} busy={busy} onClose={() => setApplyTpl(null)} onApply={applyTemplate} />
      )}
    </div>
  );
}

// ── views ──────────────────────────────────────────────────────────────────
function StatusPill({ status }: { status: string }) {
  return <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium capitalize", statusClass[status] ?? "bg-muted text-muted-foreground")}>{label(status)}</span>;
}
function Progress({ value }: { value: number }) {
  return <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} /></div>;
}

function groupByProject(items: ProjectScheduleItem[]) {
  const map = new Map<string, ProjectScheduleItem[]>();
  for (const i of items) {
    const key = i.schedule_group_key || i.project_title || "Ungrouped";
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(i);
  }
  return Array.from(map.entries());
}

function ListView({ items, onEdit, onDelete, depCount, emptyLabel }: { items: ProjectScheduleItem[]; onEdit: (i: ProjectScheduleItem) => void; onDelete: (id: string) => void; depCount: (id: string) => number; emptyLabel?: string }) {
  const [collapsed, setCollapsed] = React.useState<Record<string, boolean>>({});
  const groups = groupByProject(items);
  if (!items.length) return <Empty label={emptyLabel ?? "No items yet. Create one or apply a template."} />;
  return (
    <div className="space-y-3">
      {groups.map(([name, group]) => {
        const done = group.filter((i) => i.status === "complete").length;
        const open = !collapsed[name];
        return (
          <div key={name} className="overflow-hidden rounded-xl border border-border">
            <button onClick={() => setCollapsed((c) => ({ ...c, [name]: !c[name] }))} className="flex w-full items-center gap-2 bg-card px-4 py-2.5 text-left">
              {open ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
              <span className="font-semibold">{name}</span>
              <span className="text-xs text-muted-foreground">{done}/{group.length} complete</span>
            </button>
            {open && (
              <div className="divide-y divide-border">
                {group.map((i) => (
                  <div key={i.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/30">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-medium">{i.title}</span>
                        {i.type !== "task" && <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] capitalize text-muted-foreground">{i.type}</span>}
                        {depCount(i.id) > 0 && <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground"><Link2 className="h-3 w-3" />{depCount(i.id)}</span>}
                      </div>
                      <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                        {i.phase && <span>{i.phase}</span>}
                        {i.assignee && <span>· {i.assignee}</span>}
                        <span>· {fmtDate(i.start_date)}–{fmtDate(i.end_date)}</span>
                        <span className={cn("· capitalize", priorityClass[i.priority ?? "normal"])}>· {label(i.priority ?? "normal")}</span>
                      </div>
                    </div>
                    <div className="hidden w-24 sm:block"><Progress value={i.progress} /></div>
                    <StatusPill status={i.status} />
                    <button onClick={() => onEdit(i)} className="text-muted-foreground hover:text-primary"><Pencil className="h-3.5 w-3.5" /></button>
                    <button onClick={() => onDelete(i.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function TableView({ items, onEdit, onDelete }: { items: ProjectScheduleItem[]; onEdit: (i: ProjectScheduleItem) => void; onDelete: (id: string) => void }) {
  const [sort, setSort] = React.useState<{ key: keyof ProjectScheduleItem; dir: 1 | -1 }>({ key: "start_date", dir: 1 });
  const sorted = React.useMemo(() => {
    return [...items].sort((a, b) => {
      const av = String(a[sort.key] ?? ""); const bv = String(b[sort.key] ?? "");
      return av < bv ? -sort.dir : av > bv ? sort.dir : 0;
    });
  }, [items, sort]);
  if (!items.length) return <Empty label="No items yet." />;
  const head = (key: keyof ProjectScheduleItem, text: string) => (
    <th className="cursor-pointer px-3 py-2 text-left font-semibold" onClick={() => setSort((s) => ({ key, dir: s.key === key && s.dir === 1 ? -1 : 1 }))}>{text}</th>
  );
  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead className="border-b border-border bg-muted/30 text-[11px] uppercase tracking-wide text-muted-foreground">
          <tr>{head("title", "Title")}{head("project_title", "Project")}{head("phase", "Phase")}{head("assignee", "Assignee")}{head("status", "Status")}{head("priority", "Priority")}{head("start_date", "Start")}{head("end_date", "End")}<th className="px-3 py-2 text-left font-semibold">Progress</th><th /></tr>
        </thead>
        <tbody className="divide-y divide-border">
          {sorted.map((i) => (
            <tr key={i.id} className="hover:bg-muted/30">
              <td className="px-3 py-2 font-medium">{i.title}</td>
              <td className="px-3 py-2 text-muted-foreground">{i.project_title || "—"}</td>
              <td className="px-3 py-2 text-muted-foreground">{i.phase || "—"}</td>
              <td className="px-3 py-2 text-muted-foreground">{i.assignee || "—"}</td>
              <td className="px-3 py-2"><StatusPill status={i.status} /></td>
              <td className={cn("px-3 py-2 capitalize", priorityClass[i.priority ?? "normal"])}>{label(i.priority ?? "normal")}</td>
              <td className="whitespace-nowrap px-3 py-2 text-muted-foreground">{fmtDate(i.start_date)}</td>
              <td className="whitespace-nowrap px-3 py-2 text-muted-foreground">{fmtDate(i.end_date)}</td>
              <td className="px-3 py-2"><div className="flex items-center gap-2"><div className="w-16"><Progress value={i.progress} /></div><span className="text-[11px] text-muted-foreground">{i.progress}%</span></div></td>
              <td className="px-3 py-2"><div className="flex gap-2"><button onClick={() => onEdit(i)} className="text-muted-foreground hover:text-primary"><Pencil className="h-3.5 w-3.5" /></button><button onClick={() => onDelete(i.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button></div></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function KanbanView({ items, onEdit, onStatus }: { items: ProjectScheduleItem[]; onEdit: (i: ProjectScheduleItem) => void; onStatus: (i: ProjectScheduleItem, s: ScheduleStatus) => void }) {
  const [dragId, setDragId] = React.useState<string | null>(null);
  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {STATUSES.map((s) => {
        const col = items.filter((i) => i.status === s);
        return (
          <div key={s} className="flex w-64 shrink-0 flex-col rounded-xl border border-border bg-card"
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => { const it = items.find((x) => x.id === dragId); if (it && it.status !== s) onStatus(it, s); setDragId(null); }}>
            <div className="flex items-center justify-between border-b border-border px-3 py-2">
              <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium capitalize", statusClass[s])}>{label(s)}</span>
              <span className="text-[11px] text-muted-foreground">{col.length}</span>
            </div>
            <div className="flex-1 space-y-2 p-2">
              {col.map((i) => (
                <div key={i.id} draggable onDragStart={() => setDragId(i.id)} onClick={() => onEdit(i)} className="cursor-grab rounded-lg border border-border bg-background p-2.5 active:cursor-grabbing">
                  <div className="text-sm font-medium">{i.title}</div>
                  {i.project_title && <div className="mt-0.5 text-[11px] text-muted-foreground">{i.project_title}</div>}
                  <div className="mt-1.5 flex items-center justify-between text-[10px] text-muted-foreground">
                    <span>{fmtDate(i.start_date)}–{fmtDate(i.end_date)}</span>
                    <span className={cn("capitalize", priorityClass[i.priority ?? "normal"])}>{label(i.priority ?? "normal")}</span>
                  </div>
                </div>
              ))}
              {!col.length && <div className="py-6 text-center text-[11px] text-muted-foreground">Drop here</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CalendarView({ items, onEdit }: { items: ProjectScheduleItem[]; onEdit: (i: ProjectScheduleItem) => void }) {
  const [month, setMonth] = React.useState(() => { const d = new Date(); return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1)); });
  const year = month.getUTCFullYear(); const mon = month.getUTCMonth();
  const first = new Date(Date.UTC(year, mon, 1));
  const startDow = first.getUTCDay();
  const gridStart = new Date(first); gridStart.setUTCDate(1 - startDow);
  const cells = Array.from({ length: 42 }, (_, k) => { const d = new Date(gridStart); d.setUTCDate(gridStart.getUTCDate() + k); return d.toISOString().slice(0, 10); });
  const monthLabel = month.toLocaleDateString([], { month: "long", year: "numeric", timeZone: "UTC" });
  const itemsOn = (day: string) => items.filter((i) => dateOnly(i.start_date) <= day && day <= dateOnly(i.end_date));
  return (
    <div className="rounded-xl border border-border">
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <div className="font-semibold">{monthLabel}</div>
        <div className="flex items-center gap-1">
          <button onClick={() => setMonth(new Date(Date.UTC(year, mon - 1, 1)))} className="rounded p-1 hover:bg-muted"><ChevronLeft className="h-4 w-4" /></button>
          <button onClick={() => { const d = new Date(); setMonth(new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1))); }} className="rounded px-2 py-1 text-xs hover:bg-muted">Today</button>
          <button onClick={() => setMonth(new Date(Date.UTC(year, mon + 1, 1)))} className="rounded p-1 hover:bg-muted"><ChevronRight className="h-4 w-4" /></button>
        </div>
      </div>
      <div className="grid grid-cols-7 border-b border-border text-center text-[11px] font-medium text-muted-foreground">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => <div key={d} className="py-1.5">{d}</div>)}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((day) => {
          const inMonth = Number(day.slice(5, 7)) === mon + 1;
          const dayItems = itemsOn(day);
          const isToday = day === todayStr();
          return (
            <div key={day} className={cn("min-h-[84px] border-b border-r border-border p-1 last:border-r-0", !inMonth && "bg-muted/30")}>
              <div className={cn("mb-1 text-right text-[10px]", isToday ? "font-bold text-primary" : "text-muted-foreground")}>{Number(day.slice(8, 10))}</div>
              <div className="space-y-0.5">
                {dayItems.slice(0, 3).map((i) => (
                  <button key={i.id} onClick={() => onEdit(i)} className={cn("block w-full truncate rounded px-1 py-0.5 text-left text-[10px]", statusClass[i.status])}>{i.title}</button>
                ))}
                {dayItems.length > 3 && <div className="text-[10px] text-muted-foreground">+{dayItems.length - 3} more</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Gantt ────────────────────────────────────────────────────────────────────
const GANTT_ROW_H = 34;     // px per row (label + bar lane)
const GANTT_HEAD_H = 44;    // px timeline header (two tiers)
const GANTT_LABEL_W = 224;  // px left label column

type GanttZoom = "hour" | "day" | "week" | "month";
const ZOOM: Record<GanttZoom, { label: string; pxPerDay: number; snapMin: number }> = {
  hour: { label: "Hour", pxPerDay: 24 * 26, snapMin: 15 },
  day: { label: "Day", pxPerDay: 40, snapMin: 60 },
  week: { label: "Week", pxPerDay: 18, snapMin: 1440 },
  month: { label: "Month", pxPerDay: 6, snapMin: 1440 },
};

type GanttRow =
  | { kind: "group"; key: string; name: string }
  | { kind: "item"; key: string; item: ProjectScheduleItem };

// Drag works in milliseconds so the Gantt supports hour/minute precision.
type DragState = {
  id: string; mode: "move" | "l" | "r"; startX: number;
  s0: number; e0: number; curS: number; curE: number; moved: boolean;
};

const parseMs = (s: string) => Date.parse(s);
function startOfDayUTC(ms: number) { const d = new Date(ms); return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()); }
function floorUnit(ms: number, kind: string) {
  const d = new Date(ms);
  switch (kind) {
    case "hour": return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), d.getUTCHours());
    case "day": return startOfDayUTC(ms);
    case "week": { const sod = startOfDayUTC(ms); return sod - new Date(sod).getUTCDay() * dayMs; }
    case "month": return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1);
    default: return Date.UTC(d.getUTCFullYear(), 0, 1); // year
  }
}
function nextUnit(ms: number, kind: string) {
  const d = new Date(ms);
  switch (kind) {
    case "hour": return ms + 3600000;
    case "day": return ms + dayMs;
    case "week": return ms + 7 * dayMs;
    case "month": return Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1);
    default: return Date.UTC(d.getUTCFullYear() + 1, 0, 1);
  }
}
function unitTicks(from: number, to: number, kind: string) {
  const out: { ms: number; next: number }[] = [];
  let u = floorUnit(from, kind); let guard = 0;
  while (u < to && guard++ < 4000) { const n = nextUnit(u, kind); out.push({ ms: u, next: n }); u = n; }
  return out;
}
function fmtMs(ms: number) { return new Date(ms).toLocaleString([], { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", timeZone: "UTC" }); }
function humanDur(ms: number) {
  const total = Math.max(0, Math.round(ms / 60000));
  const d = Math.floor(total / 1440), h = Math.floor((total % 1440) / 60), m = total % 60;
  const parts: string[] = [];
  if (d) parts.push(`${d} day${d > 1 ? "s" : ""}`);
  if (h) parts.push(`${h} hr`);
  if (m) parts.push(`${m} min`);
  return parts.join(" ") || "0 min";
}
function humanDelta(ms: number) { return `${ms > 0 ? "+" : ms < 0 ? "−" : ""}${humanDur(Math.abs(ms))}`; }

// Export a project's schedule items as CSV (download) or PDF (print window).
function exportGanttProject(item: ProjectScheduleItem, all: ProjectScheduleItem[], format: "csv" | "pdf") {
  const key = item.schedule_group_key || item.project_title || "Ungrouped";
  const group = all.filter((i) => (i.schedule_group_key || i.project_title || "Ungrouped") === key);
  const head = ["Title", "Type", "Phase", "Assignee", "Status", "Priority", "Start", "End", "Progress"];
  const rows = group.map((i) => [i.title, i.type, i.phase ?? "", i.assignee ?? "", i.status, i.priority ?? "", dateOnly(i.start_date), dateOnly(i.end_date), `${i.progress}%`]);
  if (format === "csv") {
    const csv = [head, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`;
    a.download = `${key}.csv`; a.click();
  } else {
    const w = window.open("", "_blank"); if (!w) return;
    w.document.write(`<html><head><title>${key}</title><style>body{font-family:system-ui,sans-serif;padding:24px;color:#111}h1{font-size:18px}table{border-collapse:collapse;width:100%;font-size:12px}th,td{border:1px solid #ddd;padding:6px 8px;text-align:left}th{background:#f5f5f5}</style></head><body><h1>${key}</h1><table><thead><tr>${head.map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${String(c)}</td>`).join("")}</tr>`).join("")}</tbody></table><script>window.onload=function(){window.print()}<\/script></body></html>`);
    w.document.close();
  }
}

function GanttView({
  items, deps, onEdit, onMove, onDuplicate, onPatch, onDelete, onAttach,
}: {
  items: ProjectScheduleItem[];
  deps: ProjectScheduleDependency[];
  onEdit: (i: ProjectScheduleItem) => void;
  onMove: (id: string, start: string, end: string) => void;
  onDuplicate: (i: ProjectScheduleItem) => void;
  onPatch: (i: ProjectScheduleItem, patch: Record<string, unknown>) => void;
  onDelete: (id: string) => void;
  onAttach: (itemId: string, kind: "photo" | "audio" | "file") => void;
}) {
  const [zoom, setZoom] = React.useState<GanttZoom>("day");
  const drag = React.useRef<DragState | null>(null);
  const lastClick = React.useRef({ x: 0, y: 0 });
  const [preview, setPreview] = React.useState<Record<string, { s: number; e: number }>>({});
  const [tip, setTip] = React.useState<null | { x: number; y: number; mode: string; s: number; e: number; delta: number }>(null);
  const [fab, setFab] = React.useState<null | { item: ProjectScheduleItem; x: number; y: number }>(null);

  // "Hide" (FAB) drops an item from the Gantt only.
  const visibleItems = React.useMemo(() => items.filter((i) => i.visible_on_gantt !== false), [items]);

  const rows: GanttRow[] = React.useMemo(() => {
    const out: GanttRow[] = [];
    for (const [name, group] of groupByProject(visibleItems)) {
      out.push({ kind: "group", key: `g:${name}`, name });
      for (const it of group) out.push({ kind: "item", key: it.id, item: it });
    }
    return out;
  }, [visibleItems]);
  const rowIndex = React.useMemo(() => {
    const m = new Map<string, number>();
    rows.forEach((r, idx) => { if (r.kind === "item") m.set(r.item.id, idx); });
    return m;
  }, [rows]);

  // Effective (preview-aware) ms span for an item. A same-day/legacy item (end<=start) shows as one day.
  const effMs = React.useCallback((it: ProjectScheduleItem) => {
    const p = preview[it.id];
    let s = p ? p.s : parseMs(it.start_date);
    let e = p ? p.e : parseMs(it.end_date);
    if (!Number.isFinite(s)) s = Date.now();
    if (!Number.isFinite(e) || e <= s) e = s + dayMs;
    return { s, e };
  }, [preview]);

  const pxPerDay = ZOOM[zoom].pxPerDay;
  const pxPerMs = pxPerDay / dayMs;
  const snapMs = ZOOM[zoom].snapMin * 60000;

  const dated = visibleItems.filter((i) => i.start_date && i.end_date);
  const range = React.useMemo(() => {
    if (!dated.length) { const now = startOfDayUTC(Date.now()); return { start: now - 3 * dayMs, end: now + 27 * dayMs }; }
    let min = Infinity, max = -Infinity;
    for (const i of dated) { const s = parseMs(i.start_date); let e = parseMs(i.end_date); if (e <= s) e = s + dayMs; if (s < min) min = s; if (e > max) max = e; }
    return { start: startOfDayUTC(min) - 2 * dayMs, end: startOfDayUTC(max) + 4 * dayMs };
  }, [dated]);

  const totalW = (range.end - range.start) * pxPerMs;
  const x = (ms: number) => (ms - range.start) * pxPerMs;
  const geom = (it: ProjectScheduleItem) => { const { s, e } = effMs(it); const left = x(s); const w = Math.max(6, (e - s) * pxPerMs); return { left, w, right: left + w, s, e }; };

  const bottomKind = zoom === "hour" ? "hour" : zoom === "day" ? "day" : zoom === "week" ? "week" : "month";
  const topKind = zoom === "hour" ? "day" : zoom === "month" ? "year" : "month";
  const bottom = React.useMemo(() => unitTicks(range.start, range.end, bottomKind), [range, bottomKind]);
  const top = React.useMemo(() => unitTicks(range.start, range.end, topKind), [range, topKind]);
  const dayShade = React.useMemo(
    () => (zoom === "hour" || zoom === "day")
      ? unitTicks(range.start, range.end, "day").filter((t) => { const dow = new Date(t.ms).getUTCDay(); return dow === 0 || dow === 6; })
      : [],
    [range, zoom],
  );

  function bottomLabel(ms: number) {
    const d = new Date(ms);
    if (zoom === "hour") { const h = d.getUTCHours(); return h % 3 === 0 ? `${(h % 12) || 12}${h < 12 ? "a" : "p"}` : ""; }
    if (zoom === "day") return String(d.getUTCDate());
    if (zoom === "week") return d.toLocaleDateString([], { month: "short", day: "numeric", timeZone: "UTC" });
    return d.toLocaleDateString([], { month: "short", timeZone: "UTC" });
  }
  function topLabel(ms: number) {
    const d = new Date(ms);
    if (topKind === "day") return d.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" });
    if (topKind === "year") return String(d.getUTCFullYear());
    return d.toLocaleDateString([], { month: "long", year: "numeric", timeZone: "UTC" });
  }

  function onDown(e: React.MouseEvent, it: ProjectScheduleItem, mode: DragState["mode"]) {
    e.preventDefault(); e.stopPropagation();
    lastClick.current = { x: e.clientX, y: e.clientY };
    setFab(null);
    const { s, e: en } = effMs(it);
    drag.current = { id: it.id, mode, startX: e.clientX, s0: s, e0: en, curS: s, curE: en, moved: false };
    window.addEventListener("mousemove", onWinMove);
    window.addEventListener("mouseup", onWinUp);
  }
  function onWinMove(ev: MouseEvent) {
    const d = drag.current; if (!d) return;
    const delta = Math.round(((ev.clientX - d.startX) / pxPerMs) / snapMs) * snapMs;
    if (delta !== 0) d.moved = true;
    let s = d.s0, e = d.e0;
    if (d.mode === "move") { s = d.s0 + delta; e = d.e0 + delta; }
    else if (d.mode === "l") { s = Math.min(d.s0 + delta, d.e0 - snapMs); e = d.e0; }
    else { e = Math.max(d.e0 + delta, d.s0 + snapMs); s = d.s0; }
    d.curS = s; d.curE = e;
    setPreview((p) => ({ ...p, [d.id]: { s, e } }));
    setTip({ x: ev.clientX, y: ev.clientY, mode: d.mode, s, e, delta: d.mode === "r" ? e - d.e0 : s - d.s0 });
  }
  function onWinUp() {
    const d = drag.current; drag.current = null;
    window.removeEventListener("mousemove", onWinMove);
    window.removeEventListener("mouseup", onWinUp);
    setTip(null);
    if (!d) return;
    if (!d.moved) {
      setPreview((p) => { const n = { ...p }; delete n[d.id]; return n; });
      if (d.mode === "move") { const it = items.find((i) => i.id === d.id); if (it) setFab({ item: it, x: lastClick.current.x, y: lastClick.current.y }); }
      return;
    }
    if (d.curS !== d.s0 || d.curE !== d.e0) onMove(d.id, new Date(d.curS).toISOString(), new Date(d.curE).toISOString());
    setPreview((p) => { const n = { ...p }; delete n[d.id]; return n; });
  }
  React.useEffect(() => () => {
    window.removeEventListener("mousemove", onWinMove);
    window.removeEventListener("mouseup", onWinUp);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const arrows = React.useMemo(() => {
    const present = new Set(visibleItems.map((i) => i.id));
    const byId = new Map(visibleItems.map((i) => [i.id, i]));
    const out: { d: string }[] = [];
    for (const dep of deps) {
      if (!present.has(dep.source_item_id) || !present.has(dep.target_item_id)) continue;
      const src = byId.get(dep.source_item_id)!, tgt = byId.get(dep.target_item_id)!;
      const sg = geom(src), tg = geom(tgt);
      const sRow = rowIndex.get(src.id), tRow = rowIndex.get(tgt.id);
      if (sRow == null || tRow == null) continue;
      const y1 = sRow * GANTT_ROW_H + GANTT_ROW_H / 2, y2 = tRow * GANTT_ROW_H + GANTT_ROW_H / 2;
      const t = dep.dependency_type;
      const x1 = (t === "start_to_start" || t === "start_to_finish") ? sg.left : sg.right;
      const x2 = (t === "finish_to_finish" || t === "start_to_finish") ? tg.right : tg.left;
      out.push({ d: `M ${x1} ${y1} C ${x1 + 26} ${y1}, ${x2 - 26} ${y2}, ${x2} ${y2}` });
    }
    return out;
  }, [deps, visibleItems, preview, rowIndex, zoom]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!items.length) return <Empty label="No items yet. Create one or apply a template." />;

  const bodyH = rows.length * GANTT_ROW_H;
  const nowMs = Date.now();
  const showToday = nowMs >= range.start && nowMs <= range.end;
  const half = GANTT_HEAD_H / 2;

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      {/* toolbar: hint + zoom levels */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border bg-muted/30 px-3 py-1.5">
        <span className="text-[11px] text-muted-foreground">Drag a bar to move · drag edges to resize · click a bar for actions</span>
        <div className="ml-auto flex items-center rounded-lg border border-border bg-card p-0.5 text-xs">
          {(Object.keys(ZOOM) as GanttZoom[]).map((z) => (
            <button key={z} onClick={() => setZoom(z)} className={cn("rounded-md px-2.5 py-1 font-medium", zoom === z ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground")}>{ZOOM[z].label}</button>
          ))}
        </div>
      </div>

      <div className="flex">
        {/* Left label column */}
        <div className="shrink-0 border-r border-border bg-card" style={{ width: GANTT_LABEL_W }}>
          <div className="border-b border-border" style={{ height: GANTT_HEAD_H }} />
          {rows.map((r) =>
            r.kind === "group" ? (
              <div key={r.key} className="flex items-center border-b border-border bg-muted/40 px-3 text-xs font-semibold" style={{ height: GANTT_ROW_H }}>
                <span className="truncate">{r.name}</span>
              </div>
            ) : (
              <button key={r.key} onClick={(e) => setFab({ item: r.item, x: e.clientX, y: e.clientY })} className="flex w-full items-center gap-1.5 border-b border-border px-3 text-left text-xs hover:bg-muted/40" style={{ height: GANTT_ROW_H }}>
                {r.item.type !== "task" && <span className="rounded bg-muted px-1 text-[9px] capitalize text-muted-foreground">{r.item.type[0]}</span>}
                <span className="truncate">{r.item.title}</span>
              </button>
            ),
          )}
        </div>

        {/* Right scrollable timeline */}
        <div className="flex-1 overflow-x-auto">
          <div style={{ width: totalW }}>
            {/* Two-tier header */}
            <div style={{ height: GANTT_HEAD_H }} className="relative border-b border-border">
              <div className="relative" style={{ height: half }}>
                {top.map((t) => (
                  <div key={t.ms} className="absolute top-0 truncate border-r border-border px-2 py-1 text-[11px] font-semibold text-muted-foreground" style={{ left: x(t.ms), width: (t.next - t.ms) * pxPerMs, height: half }}>{topLabel(t.ms)}</div>
                ))}
              </div>
              <div className="relative border-t border-border/60" style={{ height: half }}>
                {bottom.map((t) => {
                  const dow = new Date(t.ms).getUTCDay();
                  const weekend = zoom === "day" && (dow === 0 || dow === 6);
                  return <div key={t.ms} className={cn("absolute top-0 border-r border-border/40 text-center text-[9px] leading-[20px]", weekend ? "bg-muted/40 text-muted-foreground" : "text-muted-foreground")} style={{ left: x(t.ms), width: (t.next - t.ms) * pxPerMs, height: half }}>{bottomLabel(t.ms)}</div>;
                })}
              </div>
            </div>

            {/* Body: shading + grid + arrows + bars (FAB closes via its own backdrop, not here) */}
            <div className="relative" style={{ height: bodyH }}>
              {dayShade.map((t) => <div key={t.ms} className="absolute top-0 bg-muted/25" style={{ left: x(t.ms), width: (t.next - t.ms) * pxPerMs, height: bodyH }} />)}
              {rows.map((r, idx) => (
                <div key={`sep:${r.key}`} className={cn("absolute left-0 right-0 border-b border-border/60", r.kind === "group" && "bg-muted/20")} style={{ top: idx * GANTT_ROW_H, height: GANTT_ROW_H }} />
              ))}
              {showToday && <div className="absolute top-0 z-10 w-px bg-primary/70" style={{ left: x(nowMs), height: bodyH }} />}

              <svg className="pointer-events-none absolute inset-0 z-20 overflow-visible" width={totalW} height={bodyH}>
                <defs>
                  <marker id="gantt-arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" className="fill-muted-foreground" /></marker>
                </defs>
                {arrows.map((a, k) => <path key={k} d={a.d} fill="none" className="stroke-muted-foreground/60" strokeWidth={1.5} markerEnd="url(#gantt-arrow)" />)}
              </svg>

              {rows.map((r, idx) => {
                if (r.kind !== "item") return null;
                const it = r.item;
                if (!it.start_date || !it.end_date) return null;
                const g = geom(it);
                return (
                  <div key={`bar:${it.id}`} className="absolute z-30" style={{ left: g.left, width: g.w, top: idx * GANTT_ROW_H + 6, height: GANTT_ROW_H - 12 }}>
                    <div
                      onMouseDown={(e) => onDown(e, it, "move")}
                      title={`${it.title} · ${fmtMs(g.s)} → ${fmtMs(g.e)}`}
                      className={cn("group relative flex h-full cursor-grab items-center overflow-hidden rounded-md border active:cursor-grabbing", statusClass[it.status] ?? "bg-muted text-muted-foreground", "border-border/70")}
                    >
                      {it.progress > 0 && <div className="absolute inset-y-0 left-0 bg-primary/25" style={{ width: `${Math.min(100, it.progress)}%` }} />}
                      <span className="relative truncate px-2 text-[10px] font-medium">{it.title}</span>
                      <span onMouseDown={(e) => onDown(e, it, "l")} className="absolute inset-y-0 left-0 w-1.5 cursor-ew-resize opacity-0 hover:bg-foreground/20 group-hover:opacity-100" />
                      <span onMouseDown={(e) => onDown(e, it, "r")} className="absolute inset-y-0 right-0 w-1.5 cursor-ew-resize opacity-0 hover:bg-foreground/20 group-hover:opacity-100" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* live drag tooltip */}
      {tip && (
        <div className="pointer-events-none fixed z-[60] rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-lg" style={{ left: Math.min(tip.x + 14, (typeof window !== "undefined" ? window.innerWidth : 9999) - 230), top: tip.y + 14 }}>
          <div className="mb-1 font-semibold">{tip.mode === "l" ? "Adjust start" : tip.mode === "r" ? "Adjust end" : "Move task"}</div>
          <div className="text-muted-foreground">Start: <span className="text-foreground">{fmtMs(tip.s)}</span></div>
          <div className="text-muted-foreground">End: <span className="text-foreground">{fmtMs(tip.e)}</span></div>
          <div className={cn("mt-1 font-medium", tip.delta < 0 ? "text-orange-500" : tip.delta > 0 ? "text-primary" : "text-muted-foreground")}>Adjusted: {humanDelta(tip.delta)}</div>
          <div className="text-muted-foreground">Duration: {humanDur(tip.e - tip.s)}</div>
        </div>
      )}

      {/* FAB action panel */}
      {fab && (
        <GanttFab
          fab={fab} items={items} onClose={() => setFab(null)}
          onEdit={onEdit} onDuplicate={onDuplicate} onPatch={onPatch} onDelete={onDelete} onAttach={onAttach}
        />
      )}
    </div>
  );
}

// Floating action panel for a Gantt task — MJG-reframed (no construction actions),
// laid out as a 4×4 grid. Photo/Audio upload directly; people actions open the
// editor's People & associations section; the rest are direct quick actions.
function GanttFab({
  fab, items, onClose, onEdit, onDuplicate, onPatch, onDelete, onAttach,
}: {
  fab: { item: ProjectScheduleItem; x: number; y: number };
  items: ProjectScheduleItem[];
  onClose: () => void;
  onEdit: (i: ProjectScheduleItem) => void;
  onDuplicate: (i: ProjectScheduleItem) => void;
  onPatch: (i: ProjectScheduleItem, patch: Record<string, unknown>) => void;
  onDelete: (id: string) => void;
  onAttach: (itemId: string, kind: "photo" | "audio" | "file") => void;
}) {
  const it = fab.item;
  const run = (fn: () => void) => { fn(); onClose(); };
  const W = 320, H = 400;
  const vw = typeof window !== "undefined" ? window.innerWidth : 1280;
  const vh = typeof window !== "undefined" ? window.innerHeight : 800;
  const left = Math.max(8, Math.min(fab.x + 8, vw - W - 8));
  const top = Math.max(8, Math.min(fab.y + 8, vh - H - 8));

  const actions: { icon: React.ElementType; label: string; on: () => void; danger?: boolean }[] = [
    // Row 1 — people & associations (open the editor's assignee / participants)
    { icon: UserPlus, label: "Add user", on: () => onEdit(it) },
    { icon: Users, label: "Add participant", on: () => onEdit(it) },
    { icon: Contact, label: "Add contact", on: () => onEdit(it) },
    { icon: UsersRound, label: "Add team", on: () => onEdit(it) },
    // Row 2 — connect & attach
    { icon: Link2, label: "Connect task", on: () => onEdit(it) },
    { icon: StickyNote, label: "Add notes", on: () => onEdit(it) },
    { icon: Camera, label: "Add photo", on: () => onAttach(it.id, "photo") },
    { icon: Mic, label: "Add audio", on: () => onAttach(it.id, "audio") },
    // Row 3 — manage
    { icon: Pencil, label: "Edit", on: () => onEdit(it) },
    { icon: Copy, label: "Duplicate", on: () => onDuplicate(it) },
    { icon: EyeOff, label: "Hide", on: () => onPatch(it, { visible_on_gantt: false }) },
    { icon: CheckCircle2, label: "Complete", on: () => onPatch(it, { status: "complete" }) },
    // Row 4 — remind & export
    { icon: Bell, label: "Reminder", on: () => onPatch(it, { notify: true }) },
    { icon: FileDown, label: "CSV", on: () => exportGanttProject(it, items, "csv") },
    { icon: FileText, label: "PDF", on: () => exportGanttProject(it, items, "pdf") },
    { icon: Trash2, label: "Delete", on: () => onDelete(it.id), danger: true },
  ];

  return (
    <>
      <div className="fixed inset-0 z-[55]" onClick={onClose} />
      <div className="fixed z-[60] w-[320px] rounded-xl border border-border bg-popover p-3 shadow-xl" style={{ left, top }}>
        <div className="mb-2">
          <div className="truncate text-sm font-semibold">{it.title}</div>
          <div className="text-[11px] capitalize text-muted-foreground">{label(it.type)}{it.phase ? ` · ${it.phase}` : ""}</div>
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {actions.map((a) => (
            <button key={a.label} onClick={() => run(a.on)} className={cn("flex flex-col items-center gap-1 rounded-lg border border-border px-1 py-2 text-center text-[10px] leading-tight hover:bg-muted", a.danger && "text-destructive hover:bg-destructive/10")}>
              <a.icon className="h-4 w-4" /> {a.label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-[10px] leading-snug text-muted-foreground">Drag the bar center to move. Use the left or right edge handles to resize duration.</p>
      </div>
    </>
  );
}

function TemplatesView({ templates, tasks, onApply }: { templates: ProjectTemplate[]; tasks: ProjectTemplateTask[]; onApply: (t: ProjectTemplate) => void }) {
  const byCat = new Map<string, ProjectTemplate[]>();
  for (const t of templates) { const c = t.category || "Other"; if (!byCat.has(c)) byCat.set(c, []); byCat.get(c)!.push(t); }
  if (!templates.length) return <Empty label="No templates. (Did the migration seed run?)" />;
  return (
    <div className="space-y-5">
      {Array.from(byCat.entries()).map(([cat, list]) => (
        <div key={cat}>
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{cat}</div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {list.map((t) => {
              const tt = tasks.filter((x) => x.template_id === t.id);
              return (
                <div key={t.id} className="flex flex-col rounded-xl border border-border bg-card p-4">
                  <div className="font-semibold">{t.name}</div>
                  {t.description && <p className="mt-1 text-xs text-muted-foreground">{t.description}</p>}
                  <div className="mt-2 text-[11px] text-muted-foreground">{tt.length} tasks · ~{t.suggested_duration_days} days</div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {tt.slice(0, 5).map((x) => <span key={x.id} className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">{x.task_name}</span>)}
                    {tt.length > 5 && <span className="text-[10px] text-muted-foreground">+{tt.length - 5}</span>}
                  </div>
                  <Button size="sm" className="mt-3 self-start" onClick={() => onApply(t)}><Plus className="h-3.5 w-3.5" /> Apply template</Button>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function Empty({ label }: { label: string }) {
  return <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">{label}</div>;
}

// ── modals ─────────────────────────────────────────────────────────────────
function Field({ label: l, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return <div className={full ? "sm:col-span-2" : ""}><label className="mb-1 block text-xs font-medium text-muted-foreground">{l}</label>{children}</div>;
}

function ItemEditor({
  draft, setDraft, onSave, onClose, busy, staffOptions, allItems, incoming, itemsById, onAddDep, onRemoveDep,
  attachments, links, linkOptions, onUpload, onRemoveAttachment, onAddLink, onRemoveLink,
}: {
  draft: ItemDraft; setDraft: React.Dispatch<React.SetStateAction<ItemDraft | null>>;
  onSave: (d: ItemDraft) => void; onClose: () => void; busy: boolean; staffOptions: string[];
  allItems: ProjectScheduleItem[]; incoming: ProjectScheduleDependency[]; itemsById: Record<string, ProjectScheduleItem>;
  onAddDep: (targetId: string, sourceId: string, t: DependencyType, lag: number, auto: boolean) => Promise<void>;
  onRemoveDep: (id: string) => Promise<void>;
  attachments: ProjectItemAttachment[]; links: ProjectItemLink[]; linkOptions: ProjectLinkOptions;
  onUpload: (itemId: string, kind: "photo" | "audio" | "file") => void;
  onRemoveAttachment: (id: string) => void;
  onAddLink: (itemId: string, opt: { link_type: LinkType; id: string; name: string; email: string | null; phone: string | null }) => void;
  onRemoveLink: (id: string) => void;
}) {
  const set = <K extends keyof ItemDraft>(k: K, v: ItemDraft[K]) => setDraft((d) => (d ? { ...d, [k]: v } : d));
  const [depSource, setDepSource] = React.useState(""); const [depType, setDepType] = React.useState<DependencyType>("finish_to_start");
  const [depLag, setDepLag] = React.useState(0); const [depAuto, setDepAuto] = React.useState(true); const [depBusy, setDepBusy] = React.useState(false);

  const depSourceOpts: FieldSelectOption[] = [
    { value: "", label: "Depends on…" },
    ...allItems.filter((i) => i.id !== draft.id).map((i) => ({ value: i.id, label: i.title })),
  ];

  async function add() {
    if (!depSource || !draft.id) return;
    setDepBusy(true);
    try { await onAddDep(draft.id, depSource, depType, depLag, depAuto); setDepSource(""); } finally { setDepBusy(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 my-6 w-full max-w-2xl rounded-xl border border-border bg-card p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">{draft.id ? "Edit item" : "New item"}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Title" full><Input value={draft.title} onChange={(e) => set("title", e.target.value)} /></Field>
          <Field label="Type"><FieldSelect value={draft.type} onChange={(v) => set("type", v as ScheduleItemType)} options={TYPE_OPTS} /></Field>
          <Field label="Project"><Input value={draft.project_title} onChange={(e) => set("project_title", e.target.value)} placeholder="Project / group" /></Field>
          <Field label="Phase"><Input value={draft.phase} onChange={(e) => set("phase", e.target.value)} /></Field>
          <Field label="Assignee"><Input list="pm-staff" value={draft.assignee} onChange={(e) => set("assignee", e.target.value)} /></Field>
          <Field label="Participants (comma-separated)" full><Input list="pm-staff" value={draft.participants} onChange={(e) => set("participants", e.target.value)} /></Field>
          <Field label="Start date"><DatePicker value={draft.start_date} onChange={(v) => set("start_date", v)} allowClear={false} /></Field>
          <Field label="End date"><DatePicker value={draft.end_date} onChange={(v) => set("end_date", v)} allowClear={false} /></Field>
          <Field label="Status"><FieldSelect value={draft.status} onChange={(v) => set("status", v as ScheduleStatus)} options={STATUS_OPTS} /></Field>
          <Field label="Priority"><FieldSelect value={draft.priority} onChange={(v) => set("priority", v as SchedulePriority)} options={PRIORITY_OPTS} /></Field>
          <Field label={`Progress: ${draft.progress}%`} full><input type="range" min={0} max={100} value={draft.progress} onChange={(e) => set("progress", Number(e.target.value))} className="w-full accent-primary" /></Field>
          <Field label="Description" full><Textarea className="min-h-[64px]" value={draft.description} onChange={(e) => set("description", e.target.value)} /></Field>
          <Field label="Internal notes" full><Textarea className="min-h-[56px]" value={draft.internal_notes} onChange={(e) => set("internal_notes", e.target.value)} /></Field>
          <div className="flex flex-wrap gap-4 sm:col-span-2">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="accent-primary" checked={draft.client_visible} onChange={(e) => set("client_visible", e.target.checked)} /> Client visible</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="accent-primary" checked={draft.notify} onChange={(e) => set("notify", e.target.checked)} /> Notify</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="accent-primary" checked={draft.is_blocked} onChange={(e) => set("is_blocked", e.target.checked)} /> Blocked</label>
          </div>
          {draft.is_blocked && <Field label="Blocker reason" full><Input value={draft.blocker_reason} onChange={(e) => set("blocker_reason", e.target.value)} /></Field>}
        </div>
        <datalist id="pm-staff">{staffOptions.map((s) => <option key={s} value={s} />)}</datalist>

        {/* Dependencies (only for saved items) */}
        {draft.id && (
          <div className="mt-4 rounded-lg border border-border p-3">
            <div className="mb-2 flex items-center gap-1.5 text-sm font-semibold"><Link2 className="h-4 w-4" /> Dependencies (this item waits on)</div>
            {incoming.length === 0 && <p className="text-xs text-muted-foreground">No dependencies yet.</p>}
            {incoming.map((d) => (
              <div key={d.id} className="mb-1 flex items-center gap-2 text-xs">
                <span className="flex-1 truncate">{itemsById[d.source_item_id]?.title ?? "—"} <span className="text-muted-foreground">· {label(d.dependency_type)}{d.lag_days ? ` +${d.lag_days}d` : ""}{d.auto_shift ? " · auto-shift" : ""}</span></span>
                <button onClick={() => onRemoveDep(d.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            ))}
            <div className="mt-2 flex flex-wrap items-end gap-2">
              <div className="w-44"><FieldSelect value={depSource} onChange={setDepSource} options={depSourceOpts} placeholder="Depends on…" className="h-8" /></div>
              <div className="w-40"><FieldSelect value={depType} onChange={(v) => setDepType(v as DependencyType)} options={DEP_TYPE_OPTS} className="h-8" /></div>
              <Input type="number" value={depLag} onChange={(e) => setDepLag(Number(e.target.value))} className="h-8 w-20" title="Lag days" />
              <label className="flex items-center gap-1 pb-1.5 text-xs"><input type="checkbox" className="accent-primary" checked={depAuto} onChange={(e) => setDepAuto(e.target.checked)} /> auto-shift</label>
              <Button size="sm" variant="outline" onClick={add} disabled={!depSource || depBusy}>{depBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />} Add</Button>
            </div>
          </div>
        )}

        {/* Attachments (photo / audio / file) */}
        {draft.id && (
          <div className="mt-4 rounded-lg border border-border p-3">
            <div className="mb-2 flex items-center gap-1.5 text-sm font-semibold"><Paperclip className="h-4 w-4" /> Attachments</div>
            {attachments.length === 0 && <p className="text-xs text-muted-foreground">No photos, audio, or files yet.</p>}
            {attachments.length > 0 && (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {attachments.map((a) => (
                  <div key={a.id} className="group relative overflow-hidden rounded-lg border border-border p-2">
                    {a.kind === "photo" ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={a.url} alt={a.file_name ?? ""} className="aspect-video w-full rounded object-cover" />
                    ) : a.kind === "audio" ? (
                      <audio src={a.url} controls className="w-full" />
                    ) : (
                      <a href={a.url} target="_blank" rel="noreferrer" className="block truncate py-3 text-xs text-primary hover:underline">{a.file_name || "Open file"}</a>
                    )}
                    <div className="mt-1 flex items-center justify-between gap-1">
                      <span className="truncate text-[10px] text-muted-foreground">{a.file_name}</span>
                      <button onClick={() => onRemoveAttachment(a.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-2 flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => onUpload(draft.id!, "photo")}><Camera className="h-3.5 w-3.5" /> Photo</Button>
              <Button size="sm" variant="outline" onClick={() => onUpload(draft.id!, "audio")}><Mic className="h-3.5 w-3.5" /> Audio</Button>
              <Button size="sm" variant="outline" onClick={() => onUpload(draft.id!, "file")}><Paperclip className="h-3.5 w-3.5" /> File</Button>
            </div>
          </div>
        )}

        {/* People & associations (real user / participant / contact records) */}
        {draft.id && (
          <div className="mt-4 rounded-lg border border-border p-3">
            <div className="mb-2 flex items-center gap-1.5 text-sm font-semibold"><Users className="h-4 w-4" /> People &amp; associations</div>
            {links.length === 0 && <p className="text-xs text-muted-foreground">No linked users, participants, or contacts yet.</p>}
            {links.map((l) => (
              <div key={l.id} className="mb-1 flex items-center gap-2 text-xs">
                <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] capitalize text-muted-foreground">{l.link_type}</span>
                <span className="flex-1 truncate">{l.display_name || "—"}{l.email ? <span className="text-muted-foreground"> · {l.email}</span> : null}</span>
                <button onClick={() => onRemoveLink(l.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            ))}
            <LinkPicker linkOptions={linkOptions} onAdd={(opt) => onAddLink(draft.id!, opt)} />
          </div>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onSave(draft)} disabled={busy || !draft.title.trim()}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save</Button>
        </div>
        {!draft.id && <p className="mt-2 text-right text-[11px] text-muted-foreground">Save first to add dependencies, attachments, and people.</p>}
      </div>
    </div>
  );
}

// Picker to link a real user / participant / contact record to a task.
function LinkPicker({ linkOptions, onAdd }: {
  linkOptions: ProjectLinkOptions;
  onAdd: (opt: { link_type: LinkType; id: string; name: string; email: string | null; phone: string | null }) => void;
}) {
  const [type, setType] = React.useState<LinkType>("participant");
  const [sel, setSel] = React.useState("");
  const list = type === "user" ? linkOptions.users : type === "participant" ? linkOptions.participants : linkOptions.contacts;
  const opts: FieldSelectOption[] = [
    { value: "", label: `Choose ${type}…` },
    ...list.map((o) => ({ value: o.id, label: o.email ? `${o.name} (${o.email})` : o.name })),
  ];
  function add() {
    const o = list.find((x) => x.id === sel);
    if (!o) return;
    onAdd({ link_type: type, id: o.id, name: o.name, email: o.email, phone: o.phone });
    setSel("");
  }
  return (
    <div className="mt-2 flex flex-wrap items-end gap-2">
      <div className="w-32"><FieldSelect value={type} onChange={(v) => { setType(v as LinkType); setSel(""); }} options={[{ value: "user", label: "User" }, { value: "participant", label: "Participant" }, { value: "contact", label: "Contact" }]} className="h-8" /></div>
      <div className="w-56"><FieldSelect value={sel} onChange={setSel} options={opts} className="h-8" /></div>
      <Button size="sm" variant="outline" onClick={add} disabled={!sel}><Plus className="h-3.5 w-3.5" /> Add</Button>
    </div>
  );
}

function ApplyTemplateModal({ template, taskCount, busy, onClose, onApply }: { template: ProjectTemplate; taskCount: number; busy: boolean; onClose: () => void; onApply: (t: ProjectTemplate, title: string, start: string) => void }) {
  const [title, setTitle] = React.useState(template.name);
  const [start, setStart] = React.useState(todayStr());
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-xl border border-border bg-card p-5 shadow-xl">
        <div className="mb-3 flex items-center justify-between"><h3 className="text-lg font-semibold">Apply template</h3><button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button></div>
        <p className="mb-3 text-sm text-muted-foreground">Generates <span className="font-medium text-foreground">{taskCount}</span> tasks from “{template.name}”, with dependencies wired automatically.</p>
        <Field label="Project name"><Input value={title} onChange={(e) => setTitle(e.target.value)} /></Field>
        <div className="mt-3"><Field label="Start date"><DatePicker value={start} onChange={setStart} allowClear={false} /></Field></div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onApply(template, title.trim() || template.name, start)} disabled={busy || !title.trim()}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Create schedule</Button>
        </div>
      </div>
    </div>
  );
}
