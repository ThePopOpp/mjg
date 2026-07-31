"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPlatePlugin, PlateElement, useEditorRef, usePath } from "platejs/react";
import {
  Plus, X, ChevronLeft, ChevronRight, Paperclip, Link2, Mic, Upload, User, FolderKanban,
  CircleDot, CalendarClock, MoreHorizontal, Trash2, GripVertical, Search,
} from "lucide-react";
import { useDashboardActionToken } from "@/components/layout/dashboard-action-token";
import { BrandAudioPlayer } from "@/components/workspace/brand-audio-player";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

/* eslint-disable @typescript-eslint/no-explicit-any */

// ---- Plugins (void block elements; data lives on the node → saved in content_json) ----
export const ProjectTrackerPlugin = createPlatePlugin({ key: "project_tracker", node: { isElement: true, isVoid: true } });
export const KanbanPlugin = createPlatePlugin({ key: "kanban_board", node: { isElement: true, isVoid: true } });
export const CalendarPlugin = createPlatePlugin({ key: "doc_calendar", node: { isElement: true, isVoid: true } });

const uid = () => (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.floor(Math.random() * 1e6)}`);

// MJG brand block accents (theme-aware). Ink uses the foreground token so it stays
// visible in dark mode; gold & red are brand hexes that read on both themes.
export const BLOCK_ACCENT = { tracker: "hsl(var(--foreground))", kanban: "#C9A46E", calendar: "#9B2F2E" };

const DEFAULT_STATUSES = [
  { label: "Upcoming", color: "#C9A46E" },
  { label: "In Progress", color: "#9B2F2E" },
  { label: "Complete", color: "#3f3a34" },
];
const STATUS_PALETTE = ["#C9A46E", "#9B2F2E", "#3f3a34", "#B58F55", "#7C6F5A", "#4B4844", "#191815"];
// Brand recolor palette for Kanban columns (no green — MJG is gold/ink/warm neutrals).
const KANBAN_PALETTE = ["#C9A46E", "#B58F55", "#9B2F2E", "#7C6F5A", "#4B4844", "#191815"];

const emptyRow = () => ({ id: uid(), name: "", home: "workspace", recordId: null, href: null, ownerId: null, ownerName: "", status: null, deadline: null, attachment: null });
const newColumn = (title: string, color: string) => ({ id: uid(), title, color, cards: [] as any[] });

export function newProjectTrackerNode() { return { type: ProjectTrackerPlugin.key, statuses: DEFAULT_STATUSES, rows: [emptyRow(), emptyRow(), emptyRow()], children: [{ text: "" }] }; }
export function newKanbanNode() { return { type: KanbanPlugin.key, columns: [newColumn("To Do", "#C9A46E"), newColumn("In Progress", "#B58F55"), newColumn("Done", "#9E7A46")], children: [{ text: "" }] }; }
export function newCalendarNode() { return { type: CalendarPlugin.key, events: [] as any[], children: [{ text: "" }] }; }

// ---- Shared helpers ----
let USERS_CACHE: { id: string; name: string }[] | null = null;
function useMjgUsers() {
  const [users, setUsers] = useState<{ id: string; name: string }[]>(USERS_CACHE ?? []);
  useEffect(() => {
    if (USERS_CACHE) return;
    fetch("/api/workspace/users").then((r) => r.json()).then((d) => { if (d.ok) { USERS_CACHE = d.users; setUsers(d.users); } }).catch(() => {});
  }, []);
  return users;
}

async function uploadFile(file: File, token: string): Promise<{ url: string; name: string } | null> {
  const fd = new FormData(); fd.append("file", file); fd.append("folder", "workspace");
  try {
    const res = await fetch("/api/admin/uploads", { method: "POST", headers: { "x-mjg-action-token": token }, body: fd });
    const d = await res.json();
    if (res.ok && d.url) return { url: d.url, name: file.name };
  } catch { /* no-op */ }
  return null;
}

function EditableText({ value, onSave, placeholder, className }: { value: string; onSave: (v: string) => void; placeholder?: string; className?: string }) {
  const [v, setV] = useState(value ?? "");
  useEffect(() => setV(value ?? ""), [value]);
  return (
    <input
      value={v}
      placeholder={placeholder}
      onChange={(e) => setV(e.target.value)}
      onBlur={() => { if (v !== value) onSave(v); }}
      onKeyDown={(e) => { e.stopPropagation(); if (e.key === "Enter") { e.preventDefault(); (e.target as HTMLInputElement).blur(); } }}
      className={cn("w-full bg-transparent outline-none placeholder:text-muted-foreground/70", className)}
    />
  );
}

function BlockShell({ icon: Icon, label, color, actions, children }: { icon: any; label: string; color: string; actions?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div contentEditable={false} className="my-3 select-none rounded-lg border bg-card p-3 shadow-sm">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-md border bg-background px-2 py-1 text-sm font-semibold" style={{ color }}>
          <Icon className="h-4 w-4" /> {label}
        </span>
        <div className="flex items-center gap-1.5">{actions}</div>
      </div>
      {children}
    </div>
  );
}

function RecordPicker({ home, onPick }: { home: string; onPick: (r: any) => void }) {
  const [q, setQ] = useState("");
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => {
    let ok = true;
    const t = setTimeout(() => {
      fetch(`/api/workspace/records?type=${home}&q=${encodeURIComponent(q)}`).then((r) => r.json()).then((d) => { if (ok && d.ok) setRows(d.results); }).catch(() => {});
    }, 250);
    return () => { ok = false; clearTimeout(t); };
  }, [home, q]);
  return (
    <div className="p-1">
      <div className="relative mb-1">
        <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.stopPropagation()} placeholder="Search…" className="w-full rounded border bg-background py-1 pl-7 pr-2 text-sm outline-none" />
      </div>
      <div className="max-h-40 overflow-y-auto">
        {rows.length ? rows.map((r) => (
          <button key={r.recordId} type="button" onClick={() => onPick(r)} className="block w-full truncate rounded px-2 py-1 text-left text-sm hover:bg-accent">{r.label}</button>
        )) : <p className="px-2 py-1 text-xs text-muted-foreground">No matches.</p>}
      </div>
    </div>
  );
}

// ===================== Project Tracker =====================
function ProjectTrackerElement(props: any) {
  const editor = useEditorRef();
  const path = usePath();
  const el = props.element ?? {};
  const rows: any[] = el.rows ?? [];
  const statuses: any[] = el.statuses ?? DEFAULT_STATUSES;
  const token = useDashboardActionToken();
  const users = useMjgUsers();

  const save = (patch: Record<string, unknown>) => { try { (editor as any).tf?.setNodes?.(patch, { at: path }); } catch { /* no-op */ } };
  const setRow = (id: string, patch: any) => save({ rows: rows.map((r) => (r.id === id ? { ...r, ...patch } : r)) });
  const addRow = () => save({ rows: [...rows, emptyRow()] });
  const removeRow = (id: string) => save({ rows: rows.filter((r) => r.id !== id) });
  const addStatus = (label: string) => { const color = STATUS_PALETTE[statuses.length % STATUS_PALETTE.length]; save({ statuses: [...statuses, { label, color }] }); };
  const removeStatus = (label: string) => save({ statuses: statuses.filter((s) => s.label !== label) });

  const HOMES = [{ v: "workspace", l: "Workspace" }, { v: "plan", l: "Plans" }, { v: "project", l: "Projects" }];
  const col = "border-b border-r px-2 py-1.5 align-middle";

  return (
    <PlateElement {...props}>
      <BlockShell icon={FolderKanban} label="Project Tracker" color={BLOCK_ACCENT.tracker} actions={<button type="button" onClick={addRow} className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs hover:bg-accent"><Plus className="h-3.5 w-3.5" /> Add row</button>}>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="border-b border-r px-2 py-1.5 font-semibold"><FolderKanban className="mr-1 inline h-3.5 w-3.5" />Project</th>
                <th className="border-b border-r px-2 py-1.5 font-semibold"><User className="mr-1 inline h-3.5 w-3.5" />Owner</th>
                <th className="border-b border-r px-2 py-1.5 font-semibold"><CircleDot className="mr-1 inline h-3.5 w-3.5" />Status</th>
                <th className="border-b border-r px-2 py-1.5 font-semibold"><CalendarClock className="mr-1 inline h-3.5 w-3.5" />Deadline</th>
                <th className="border-b px-2 py-1.5 font-semibold"><Paperclip className="mr-1 inline h-3.5 w-3.5" />Attachment</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="group">
                  {/* Project */}
                  <td className={cn(col, "min-w-[180px]")}>
                    <div className="flex items-center gap-1">
                      <EditableText value={r.name} onSave={(v) => setRow(r.id, { name: v })} placeholder="New Project" className="text-sm font-medium" />
                      <DropdownMenu>
                        <DropdownMenuTrigger className="rounded p-0.5 text-muted-foreground hover:bg-accent focus:outline-none"><ChevronDownSm /></DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-64">
                          <DropdownMenuLabel>Project home</DropdownMenuLabel>
                          {/* preventDefault keeps the menu open so the record picker can render below */}
                          {HOMES.map((h) => <DropdownMenuItem key={h.v} onSelect={(ev) => { ev.preventDefault(); setRow(r.id, { home: h.v, recordId: null, href: null }); }}><span className={cn("h-2 w-2 rounded-full", r.home === h.v ? "bg-primary" : "bg-muted-foreground/30")} /> {h.l}</DropdownMenuItem>)}
                          {r.home !== "workspace" ? (
                            <>
                              <DropdownMenuSeparator />
                              <p className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Pick an existing {r.home === "plan" ? "plan" : "project"}</p>
                              <RecordPicker home={r.home} onPick={(rec) => setRow(r.id, { name: rec.label, recordId: rec.recordId, href: rec.href })} />
                              {r.home === "plan" && r.name.trim() && !r.recordId ? (
                                <DropdownMenuItem onSelect={async (ev) => { ev.preventDefault(); const res = await fetch("/api/workspace/records", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ actionToken: token, type: "plan", name: r.name.trim() }) }); const d = await res.json(); if (d.ok) setRow(r.id, { recordId: d.recordId, href: d.href }); }}>
                                  <Plus className="h-3.5 w-3.5" /> Create “{r.name.trim()}” in Plans
                                </DropdownMenuItem>
                              ) : <p className="px-2 pt-1 text-[11px] text-muted-foreground">…or type a name in the field to create a new one.</p>}
                            </>
                          ) : null}
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <button type="button" onClick={() => removeRow(r.id)} className="rounded p-0.5 text-muted-foreground opacity-0 hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100" aria-label="Delete row"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                    {r.href ? <a href={r.href} className="ml-1 text-[11px] text-primary hover:underline">Linked ›</a> : null}
                  </td>
                  {/* Owner */}
                  <td className={cn(col, "min-w-[120px]")}>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="focus:outline-none">
                        {r.ownerName ? <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs">{r.ownerName}</span> : <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border text-muted-foreground hover:bg-accent"><Plus className="h-3.5 w-3.5" /></span>}
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-56">
                        <DropdownMenuLabel>Owner</DropdownMenuLabel>
                        <div className="max-h-40 overflow-y-auto">
                          {users.map((u) => <DropdownMenuItem key={u.id} onSelect={() => setRow(r.id, { ownerId: u.id, ownerName: u.name })}>{u.name}</DropdownMenuItem>)}
                        </div>
                        <DropdownMenuSeparator />
                        <div className="p-1"><EditableText value={r.ownerName} onSave={(v) => setRow(r.id, { ownerId: null, ownerName: v })} placeholder="Type a name…" className="rounded border px-2 py-1 text-sm" /></div>
                        {r.ownerName ? <DropdownMenuItem onSelect={() => setRow(r.id, { ownerId: null, ownerName: "" })}><X className="h-3.5 w-3.5" /> Clear</DropdownMenuItem> : null}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                  {/* Status */}
                  <td className={cn(col, "min-w-[130px]")}>
                    <StatusCell row={r} statuses={statuses} onSet={(s) => setRow(r.id, { status: s })} onAdd={addStatus} onRemoveStatus={removeStatus} />
                  </td>
                  {/* Deadline */}
                  <td className={cn(col, "min-w-[170px]")}>
                    <DateTimePicker
                      date={r.deadline?.date ?? ""}
                      time={r.deadline?.time ?? ""}
                      placeholder="Set date & time…"
                      onChange={(date, time) => setRow(r.id, { deadline: date || time ? { date, time } : null })}
                    />
                  </td>
                  {/* Attachment */}
                  <td className={cn("border-b px-2 py-1.5 align-middle", "min-w-[150px]")}>
                    <AttachmentCell value={r.attachment} token={token} onSet={(a) => setRow(r.id, { attachment: a })} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </BlockShell>
      {props.children}
    </PlateElement>
  );
}

function ChevronDownSm() { return <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6" /></svg>; }

function StatusCell({ row, statuses, onSet, onAdd, onRemoveStatus }: { row: any; statuses: any[]; onSet: (s: string | null) => void; onAdd: (l: string) => void; onRemoveStatus: (l: string) => void }) {
  const current = statuses.find((s) => s.label === row.status);
  const [draft, setDraft] = useState("");
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus:outline-none">
        {current ? (
          <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-semibold" style={{ color: current.color, background: `${current.color}1a` }}>
            <span className="h-2 w-2 rounded-full" style={{ background: current.color }} /> {current.label}
          </span>
        ) : <span className="text-xs italic text-muted-foreground">Set Status…</span>}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-52">
        {statuses.map((s) => (
          <div key={s.label} className="flex items-center">
            <button type="button" onClick={() => onSet(s.label)} className="flex flex-1 items-center gap-2 rounded px-2 py-1.5 text-left text-sm hover:bg-accent">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} /> <span style={{ color: s.color }} className="font-semibold">{s.label}</span>
            </button>
            <button type="button" onClick={() => onRemoveStatus(s.label)} className="rounded p-1 text-muted-foreground hover:text-destructive" aria-label="Remove status"><X className="h-3 w-3" /></button>
          </div>
        ))}
        {row.status ? <DropdownMenuItem onSelect={() => onSet(null)}><X className="h-3.5 w-3.5" /> Clear</DropdownMenuItem> : null}
        <DropdownMenuSeparator />
        <div className="p-1">
          <input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { e.stopPropagation(); if (e.key === "Enter" && draft.trim()) { onAdd(draft.trim()); setDraft(""); } }} placeholder="New Status…" className="w-full rounded border bg-background px-2 py-1 text-sm outline-none" />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function AttachmentCell({ value, token, onSet }: { value: any; token: string; onSet: (a: any) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLInputElement>(null);
  const [urlMode, setUrlMode] = useState(false);
  if (value?.kind === "audio") return <div className="flex items-center gap-1"><div className="min-w-[8rem] flex-1"><BrandAudioPlayer src={value.url} /></div><button type="button" onClick={() => onSet(null)} className="rounded p-0.5 text-muted-foreground hover:text-destructive"><X className="h-3.5 w-3.5" /></button></div>;
  if (value) return <div className="flex items-center gap-1"><a href={value.url} target="_blank" rel="noreferrer" className="inline-flex min-w-0 items-center gap-1 truncate text-xs text-primary hover:underline"><Paperclip className="h-3.5 w-3.5 shrink-0" /> {value.name || value.url}</a><button type="button" onClick={() => onSet(null)} className="rounded p-0.5 text-muted-foreground hover:text-destructive"><X className="h-3.5 w-3.5" /></button></div>;
  return (
    <div>
      <input ref={fileRef} type="file" className="hidden" onChange={async (e) => { const f = e.target.files?.[0]; if (f) { const up = await uploadFile(f, token); if (up) onSet({ kind: "upload", ...up }); } e.target.value = ""; }} />
      <input ref={audioRef} type="file" accept="audio/*" className="hidden" onChange={async (e) => { const f = e.target.files?.[0]; if (f) { const up = await uploadFile(f, token); if (up) onSet({ kind: "audio", ...up }); } e.target.value = ""; }} />
      {urlMode ? (
        <input autoFocus placeholder="Paste URL, press Enter" onKeyDown={(e) => { if (e.key === "Enter") { const v = (e.target as HTMLInputElement).value.trim(); if (v) onSet({ kind: "url", url: v, name: v }); setUrlMode(false); } if (e.key === "Escape") setUrlMode(false); }} className="w-full rounded border bg-background px-2 py-1 text-xs outline-none" />
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger className="text-xs italic text-muted-foreground hover:text-foreground focus:outline-none">Choose File…</DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onSelect={() => fileRef.current?.click()}><Upload className="h-3.5 w-3.5" /> Upload file</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => audioRef.current?.click()}><Mic className="h-3.5 w-3.5" /> Audio</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setUrlMode(true)}><Link2 className="h-3.5 w-3.5" /> URL</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}

// ===================== Kanban Board =====================
function KanbanElement(props: any) {
  const editor = useEditorRef();
  const path = usePath();
  const el = props.element ?? {};
  const columns: any[] = el.columns ?? [];
  const save = (patch: Record<string, unknown>) => { try { (editor as any).tf?.setNodes?.(patch, { at: path }); } catch { /* no-op */ } };
  const setCol = (id: string, patch: any) => save({ columns: columns.map((c) => (c.id === id ? { ...c, ...patch } : c)) });
  const addColumn = () => save({ columns: [...columns, newColumn("New Column", KANBAN_PALETTE[columns.length % KANBAN_PALETTE.length])] });
  const removeColumn = (id: string) => save({ columns: columns.filter((c) => c.id !== id) });
  const addCard = (colId: string) => setCol(colId, { cards: [...(columns.find((c) => c.id === colId)?.cards ?? []), { id: uid(), text: "" }] });
  const setCard = (colId: string, cardId: string, text: string) => { const c = columns.find((x) => x.id === colId); if (!c) return; setCol(colId, { cards: c.cards.map((k: any) => (k.id === cardId ? { ...k, text } : k)) }); };
  const removeCard = (colId: string, cardId: string) => { const c = columns.find((x) => x.id === colId); if (!c) return; setCol(colId, { cards: c.cards.filter((k: any) => k.id !== cardId) }); };
  const moveCard = (fromCol: string, cardId: string, toCol: string) => {
    const from = columns.find((c) => c.id === fromCol); const card = from?.cards.find((k: any) => k.id === cardId);
    if (!from || !card) return;
    save({ columns: columns.map((c) => c.id === fromCol ? { ...c, cards: c.cards.filter((k: any) => k.id !== cardId) } : c.id === toCol ? { ...c, cards: [...c.cards, card] } : c) });
  };

  return (
    <PlateElement {...props}>
      <BlockShell icon={KanbanIcon} label="Kanban Board" color={BLOCK_ACCENT.kanban} actions={<button type="button" onClick={addColumn} className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs hover:bg-accent"><Plus className="h-3.5 w-3.5" /> Add column</button>}>
        <div className="flex gap-3 overflow-x-auto pb-1">
          {columns.map((c) => (
            <div key={c.id} className="w-60 shrink-0">
              <div className="mb-2 flex items-center gap-1.5 rounded-md px-2 py-1.5" style={{ background: `${c.color}1a` }}>
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: c.color }} />
                <EditableText value={c.title} onSave={(v) => setCol(c.id, { title: v })} placeholder="Column" className="text-sm font-semibold" />
                <span className="text-xs text-muted-foreground">{c.cards.length}</span>
                <DropdownMenu>
                  <DropdownMenuTrigger className="rounded p-0.5 text-muted-foreground hover:bg-accent focus:outline-none"><MoreHorizontal className="h-3.5 w-3.5" /></DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Column color</DropdownMenuLabel>
                    <div className="flex flex-wrap gap-1 p-1">{KANBAN_PALETTE.map((col) => <button key={col} type="button" onClick={() => setCol(c.id, { color: col })} className="h-5 w-5 rounded-full border" style={{ background: col }} />)}</div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={() => removeColumn(c.id)}><Trash2 className="h-3.5 w-3.5" /> Delete column</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="space-y-2">
                {c.cards.map((k: any) => (
                  <div key={k.id} className="group rounded-md border p-2" style={{ background: `${c.color}12`, borderColor: `${c.color}44` }}>
                    <div className="flex items-start gap-1">
                      <GripVertical className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground/50" />
                      <EditableText value={k.text} onSave={(v) => setCard(c.id, k.id, v)} placeholder="New Card" className="text-sm" />
                      <DropdownMenu>
                        <DropdownMenuTrigger className="rounded p-0.5 text-muted-foreground opacity-0 hover:bg-accent focus:outline-none group-hover:opacity-100"><MoreHorizontal className="h-3.5 w-3.5" /></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Move to</DropdownMenuLabel>
                          {columns.filter((x) => x.id !== c.id).map((x) => <DropdownMenuItem key={x.id} onSelect={() => moveCard(c.id, k.id, x.id)}><span className="h-2 w-2 rounded-full" style={{ background: x.color }} /> {x.title}</DropdownMenuItem>)}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onSelect={() => removeCard(c.id, k.id)}><Trash2 className="h-3.5 w-3.5" /> Delete card</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
                <button type="button" onClick={() => addCard(c.id)} className="flex w-full items-center justify-center gap-1 rounded-md border border-dashed py-1.5 text-xs text-muted-foreground hover:bg-accent"><Plus className="h-3.5 w-3.5" /></button>
              </div>
            </div>
          ))}
        </div>
      </BlockShell>
      {props.children}
    </PlateElement>
  );
}

function KanbanIcon() { return <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="6" height="14" rx="1" /><rect x="9.5" y="3" width="6" height="9" rx="1" transform="translate(0.5 0)" /><rect x="15" y="3" width="6" height="18" rx="1" /></svg>; }

// ===================== Calendar =====================
function CalendarElement(props: any) {
  const editor = useEditorRef();
  const path = usePath();
  const el = props.element ?? {};
  const events: any[] = el.events ?? [];
  const save = (patch: Record<string, unknown>) => { try { (editor as any).tf?.setNodes?.(patch, { at: path }); } catch { /* no-op */ } };
  const [cursor, setCursor] = useState(() => { const d = new Date(); return { y: d.getFullYear(), m: d.getMonth() }; });
  const [adding, setAdding] = useState<string | null>(null);

  const addEvent = (dateKey: string, title: string) => { if (title.trim()) save({ events: [...events, { id: uid(), date: dateKey, title: title.trim(), color: "#9B2F2E" }] }); setAdding(null); };
  const removeEvent = (id: string) => save({ events: events.filter((e) => e.id !== id) });

  const byDay = useMemo(() => { const map = new Map<string, any[]>(); for (const e of events) map.set(e.date, [...(map.get(e.date) ?? []), e]); return map; }, [events]);
  const first = new Date(cursor.y, cursor.m, 1);
  const start = new Date(first); start.setDate(1 - first.getDay());
  const cells = Array.from({ length: 42 }, (_, k) => { const x = new Date(start); x.setDate(start.getDate() + k); return x; });
  const key = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const shift = (delta: number) => setCursor((c) => { const m = c.m + delta; return { y: c.y + Math.floor(m / 12), m: ((m % 12) + 12) % 12 }; });

  return (
    <PlateElement {...props}>
      <BlockShell icon={CalendarClock} label="Calendar" color={BLOCK_ACCENT.calendar} actions={<div className="flex items-center gap-1"><span className="mr-1 text-sm font-medium">{first.toLocaleDateString([], { month: "long", year: "numeric" })}</span><button type="button" onClick={() => shift(-1)} className="rounded border p-1 hover:bg-accent"><ChevronLeft className="h-4 w-4" /></button><button type="button" onClick={() => shift(1)} className="rounded border p-1 hover:bg-accent"><ChevronRight className="h-4 w-4" /></button></div>}>
        <div className="grid grid-cols-7 text-center text-xs text-muted-foreground">{["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => <div key={d} className="py-1">{d}</div>)}</div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((d) => {
            const k = key(d);
            const items = byDay.get(k) ?? [];
            const inMonth = d.getMonth() === cursor.m;
            return (
              <div key={k} className={cn("min-h-[76px] rounded border p-1", inMonth ? "bg-background" : "bg-muted/30 text-muted-foreground/50")}>
                <div className="flex items-center justify-between">
                  <span className="text-xs">{d.getDate()}</span>
                  <button type="button" onClick={() => setAdding(k)} className="rounded p-0.5 text-muted-foreground opacity-0 hover:bg-accent hover:opacity-100" aria-label="Add event"><Plus className="h-3 w-3" /></button>
                </div>
                <div className="mt-0.5 space-y-0.5">
                  {items.map((e) => (
                    <button key={e.id} type="button" onClick={() => removeEvent(e.id)} title="Click to remove" className="block w-full truncate rounded px-1 py-0.5 text-left text-[11px]" style={{ background: `${e.color}1a`, color: e.color }}>{e.title}</button>
                  ))}
                  {adding === k ? <input autoFocus onBlur={(ev) => addEvent(k, ev.target.value)} onKeyDown={(ev) => { if (ev.key === "Enter") addEvent(k, (ev.target as HTMLInputElement).value); if (ev.key === "Escape") setAdding(null); }} placeholder="Event…" className="w-full rounded border bg-background px-1 py-0.5 text-[11px] outline-none" /> : null}
                </div>
              </div>
            );
          })}
        </div>
      </BlockShell>
      {props.children}
    </PlateElement>
  );
}

export const LIVE_APP_PLUGINS = [ProjectTrackerPlugin, KanbanPlugin, CalendarPlugin];
export const LIVE_APP_COMPONENTS: Record<string, any> = {
  [ProjectTrackerPlugin.key]: ProjectTrackerElement,
  [KanbanPlugin.key]: KanbanElement,
  [CalendarPlugin.key]: CalendarElement,
};
