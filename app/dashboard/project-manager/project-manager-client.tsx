"use client";

import * as React from "react";
import {
  CalendarDays, ChevronDown, ChevronLeft, ChevronRight, Columns3, LayoutTemplate,
  List as ListIcon, Loader2, Plus, Pencil, Save, Table2, Trash2, User, X, Link2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FieldSelect, type FieldSelectOption } from "@/components/ui/field-select";
import { DatePicker } from "@/components/ui/date-picker";
import { cn } from "@/lib/utils";
import { useDashboardActionToken } from "@/components/layout/dashboard-action-token";
import type {
  DependencyType, ProjectManagerData, ProjectScheduleDependency, ProjectScheduleItem,
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

type ProjectView = "list" | "table" | "kanban" | "calendar" | "templates" | "my_tasks";
const VIEWS: { key: ProjectView; label: string; icon: React.ElementType }[] = [
  { key: "list", label: "List", icon: ListIcon },
  { key: "table", label: "Table", icon: Table2 },
  { key: "kanban", label: "Kanban", icon: Columns3 },
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
  initialData, staffOptions, currentUserName,
}: {
  initialData: ProjectManagerData;
  staffOptions: string[];
  currentUserName: string;
}) {
  const token = useDashboardActionToken();
  const [items, setItems] = React.useState<ProjectScheduleItem[]>(initialData.items);
  const [deps, setDeps] = React.useState<ProjectScheduleDependency[]>(initialData.dependencies);
  const [templates] = React.useState<ProjectTemplate[]>(initialData.templates);
  const [templateTasks] = React.useState<ProjectTemplateTask[]>(initialData.templateTasks);
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
}: {
  draft: ItemDraft; setDraft: React.Dispatch<React.SetStateAction<ItemDraft | null>>;
  onSave: (d: ItemDraft) => void; onClose: () => void; busy: boolean; staffOptions: string[];
  allItems: ProjectScheduleItem[]; incoming: ProjectScheduleDependency[]; itemsById: Record<string, ProjectScheduleItem>;
  onAddDep: (targetId: string, sourceId: string, t: DependencyType, lag: number, auto: boolean) => Promise<void>;
  onRemoveDep: (id: string) => Promise<void>;
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

        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onSave(draft)} disabled={busy || !draft.title.trim()}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save</Button>
        </div>
        {!draft.id && <p className="mt-2 text-right text-[11px] text-muted-foreground">Save first to add dependencies.</p>}
      </div>
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
