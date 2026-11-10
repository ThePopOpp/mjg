"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  Archive, ArrowDown, ArrowUp, ArrowUpDown, ChevronDown, Copy, Download, Eye, FlaskConical, LayoutGrid, List, Mail,
  MoreHorizontal, Pencil, Plus, Send, Share2, Table2, Trash2, Workflow, X, Zap,
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { EMAIL_EVENT_KEYS } from "@/lib/email/constants";
import { useDashboardActionToken } from "@/components/layout/dashboard-action-token";
import { cn } from "@/lib/utils";

type EmailTemplateRow = {
  id: string;
  name: string;
  slug: string;
  subject: string;
  preheader?: string | null;
  category: string;
  status: "draft" | "active" | "archived";
  html_body: string;
  text_body: string | null;
  available_fields: string[] | null;
  is_test?: boolean | null;
  updated_at?: string | null;
};

type ViewMode = "table" | "list" | "cards";
const VIEW_KEY = "mjg.emailTemplates.view";
type SortKey = "name" | "subject" | "category" | "automation" | "status" | "updated";
const SORT_LABELS: Record<SortKey, string> = {
  name: "Name", subject: "Subject", category: "Category", automation: "Automation", status: "Status", updated: "Last updated",
};
type ExportFormat = "pdf" | "docx" | "txt" | "json";
const EXPORT_OPTIONS: { format: ExportFormat; label: string; hint: string }[] = [
  { format: "pdf", label: "PDF", hint: "Copy, ready to read or print" },
  { format: "docx", label: "Word", hint: "Edit with Track Changes" },
  { format: "txt", label: "Plain text", hint: ".txt" },
  { format: "json", label: "JSON", hint: "Everything, HTML included" },
];

/** The first content image in an email (skipping the MJG logos), for the card view. */
function heroImage(html: string): string | null {
  for (const m of html.matchAll(/<img[^>]+src="([^"]+)"/gi)) {
    if (!/mjg[-_]?logo|mjg_black|mjg_white|logo\.|\/icons?\//i.test(m[1])) return m[1];
  }
  return null;
}

type MappingRow = {
  event_key: string;
  template_id: string | null;
  enabled: boolean | null;
};

const CATEGORY_LABELS: Record<string, string> = {
  six_week_challenge: "The 6 Week Challenge",
  six_week_challenge_participant: "6WC · Participant",
  six_week_challenge_facilitator: "6WC · Facilitator",
  general: "General",
  new_user_signup: "New User Sign-Up",
  login: "Login / Auth",
  participants: "Participants",
  waves: "Waves",
  check_in_results: "Check-In Results",
  surveys: "Surveys",
  pastor_elder_review: "Pastor/Elder Review",
  inner_circle: "Inner Circle",
  email_journey: "7-Day Journey",
  notifications: "Notifications",
  blog_posts: "Blog Posts",
};
const CATEGORY_ORDER = [
  "six_week_challenge", "six_week_challenge_participant", "six_week_challenge_facilitator",
  "email_journey", "surveys", "inner_circle", "new_user_signup", "login",
  "participants", "waves", "check_in_results", "pastor_elder_review", "notifications",
  "blog_posts", "general",
];

const catLabel = (c: string) => CATEGORY_LABELS[c] ?? c.replace(/_/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
const EVENT_LABEL = new Map<string, string>(EMAIL_EVENT_KEYS.map((e) => [e.key, e.label]));

type StatusFilter = "all" | "live" | "draft" | "test" | "archived";
const STATUS_FILTERS: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "live", label: "Live" },
  { key: "draft", label: "Drafts" },
  { key: "test", label: "Test" },
  { key: "archived", label: "Archived" },
];

// Fixed-position menu anchored to a button — avoids table overflow clipping.
// Flips upward when there isn't room below (rows near the bottom of the page).
type MenuPos = { right: number; top?: number; bottom?: number };
const MENU_EST_HEIGHT = 360;
function anchorFrom(el: HTMLElement): MenuPos {
  const r = el.getBoundingClientRect();
  const right = window.innerWidth - r.right;
  if (window.innerHeight - r.bottom < MENU_EST_HEIGHT && r.top > MENU_EST_HEIGHT) {
    return { right, bottom: window.innerHeight - r.top + 4 };
  }
  return { right, top: r.bottom + 4 };
}

export function EmailTemplateManager({ templates, mappings, defaultEmail = "" }: { templates: EmailTemplateRow[]; mappings: MappingRow[]; defaultEmail?: string }) {
  const actionToken = useDashboardActionToken();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplateRow | null>(null);
  const [rowMenu, setRowMenu] = useState<{ template: EmailTemplateRow; pos: MenuPos } | null>(null);
  const [automationDialog, setAutomationDialog] = useState<{ presetTemplateId?: string } | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [view, setView] = useState<ViewMode>("table");
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" } | null>(null);
  const [emailDialog, setEmailDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);

  // Remember the chosen view per browser (a convenience, so failures are ignored).
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(VIEW_KEY);
      if (saved === "table" || saved === "list" || saved === "cards") setView(saved);
    } catch { /* storage unavailable */ }
  }, []);
  const chooseView = (v: ViewMode) => {
    setView(v);
    try { window.localStorage.setItem(VIEW_KEY, v); } catch { /* storage unavailable */ }
  };

  // template_id -> [{ key, label, enabled }]
  const automationsByTemplate = useMemo(() => {
    const map = new Map<string, { key: string; label: string; enabled: boolean }[]>();
    for (const m of mappings) {
      if (!m.template_id) continue;
      const label = EVENT_LABEL.get(m.event_key) ?? m.event_key;
      const arr = map.get(m.template_id) ?? [];
      arr.push({ key: m.event_key, label, enabled: m.enabled !== false });
      map.set(m.template_id, arr);
    }
    return map;
  }, [mappings]);

  const heroImages = useMemo(() => new Map(templates.map((t) => [t.id, heroImage(t.html_body ?? "")])), [templates]);

  const categories = useMemo(() => {
    const present = new Set(templates.map((t) => t.category || "general"));
    // Always show the 6-Week Challenge tags (program is being prepared).
    present.add("six_week_challenge");
    present.add("six_week_challenge_participant");
    present.add("six_week_challenge_facilitator");
    return CATEGORY_ORDER.filter((c) => present.has(c)).concat(
      [...present].filter((c) => !CATEGORY_ORDER.includes(c)).sort(),
    );
  }, [templates]);

  const matchesStatus = (t: EmailTemplateRow) => {
    switch (statusFilter) {
      case "live": return t.status === "active";
      case "draft": return t.status === "draft";
      case "archived": return t.status === "archived";
      case "test": return !!t.is_test;
      default: return true;
    }
  };

  const filteredTemplates = templates.filter((t) => {
    if (category !== "all" && (t.category || "general") !== category) return false;
    if (!matchesStatus(t)) return false;
    const hay = `${t.name} ${t.subject} ${t.category} ${t.status}`.toLowerCase();
    return hay.includes(search.toLowerCase());
  });

  const sortValue = (t: EmailTemplateRow, key: SortKey): string => {
    switch (key) {
      case "name": return t.name.toLowerCase();
      case "subject": return t.subject.toLowerCase();
      case "category": return catLabel(t.category || "general").toLowerCase();
      case "automation": return (automationsByTemplate.get(t.id) ?? []).map((a) => a.label).join(", ").toLowerCase() || "~"; // manual last
      case "status": return t.status;
      case "updated": return t.updated_at ?? "";
    }
  };
  const visibleTemplates = sort
    ? [...filteredTemplates].sort((a, b) => {
        const cmp = sortValue(a, sort.key).localeCompare(sortValue(b, sort.key), undefined, { numeric: true });
        return sort.dir === "asc" ? cmp : -cmp;
      })
    : filteredTemplates;
  // Click a header: ascending, then descending, then back to the default order.
  const toggleSort = (key: SortKey) =>
    setSort((s) => (s?.key !== key ? { key, dir: key === "updated" ? "desc" : "asc" } : s.dir === (key === "updated" ? "desc" : "asc") ? { key, dir: key === "updated" ? "asc" : "desc" } : null));

  // Selection. Selected templates hidden by a filter stay selected, and the bar says so.
  const selectedTemplates = templates.filter((t) => selected.has(t.id));
  const visibleIds = visibleTemplates.map((t) => t.id);
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selected.has(id));
  const someVisibleSelected = visibleIds.some((id) => selected.has(id));
  const hiddenSelected = selectedTemplates.length - visibleIds.filter((id) => selected.has(id)).length;
  const toggleOne = (id: string) =>
    setSelected((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const toggleAllVisible = () =>
    setSelected((s) => { const n = new Set(s); for (const id of visibleIds) { if (allVisibleSelected) n.delete(id); else n.add(id); } return n; });

  const statusCount = (key: StatusFilter) =>
    templates.filter((t) =>
      key === "all" ? true
      : key === "live" ? t.status === "active"
      : key === "draft" ? t.status === "draft"
      : key === "archived" ? t.status === "archived"
      : !!t.is_test,
    ).length;

  async function post(url: string, body: Record<string, unknown>, method = "POST") {
    setActionMessage(null);
    setActionError(null);
    setBusy(true);
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", "x-mjg-action-token": actionToken },
        body: JSON.stringify({ ...body, actionToken }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload.error ?? "Action failed.");
      return payload;
    } finally {
      setBusy(false);
    }
  }

  async function duplicateTemplate(t: EmailTemplateRow) {
    try {
      await post("/api/admin/email/templates", {
        name: `${t.name} Copy`, subject: t.subject, category: t.category,
        status: "draft", htmlBody: t.html_body, textBody: t.text_body,
      });
      setActionMessage("Template duplicated as a draft.");
      window.location.reload();
    } catch (e) { setActionError(e instanceof Error ? e.message : "Could not duplicate."); }
  }

  // Status and test-flag changes go through the bulk endpoint, which updates only those fields
  // (a full re-save would regenerate the slug from the name and drop the preview text).
  async function saveWith(t: EmailTemplateRow, patch: Partial<{ status: EmailTemplateRow["status"]; isTest: boolean }>) {
    try {
      await post("/api/admin/email/templates/bulk", { ids: [t.id], action: "update", ...patch });
      setActionMessage(patch.isTest !== undefined ? (patch.isTest ? "Marked as test." : "Removed test flag.") : "Template archived.");
      window.location.reload();
    } catch (e) { setActionError(e instanceof Error ? e.message : "Could not update template."); }
  }

  async function deleteTemplate(t: EmailTemplateRow) {
    if (!window.confirm(`Permanently delete the template “${t.name}”? This cannot be undone.`)) return;
    try {
      await post("/api/admin/email/templates", { id: t.id }, "DELETE");
      setActionMessage("Template deleted.");
      window.location.reload();
    } catch (e) { setActionError(e instanceof Error ? e.message : "Could not delete."); }
  }

  // ---- Bulk quick actions on the checked templates -------------------------------------
  const plural = (n: number) => `${n} template${n === 1 ? "" : "s"}`;

  async function downloadSelected(format: ExportFormat) {
    setActionMessage(null); setActionError(null); setBusy(true);
    try {
      const res = await fetch("/api/admin/email/templates/export", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-mjg-action-token": actionToken },
        body: JSON.stringify({ ids: selectedTemplates.map((t) => t.id), format, actionToken }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Download failed.");
      const name = /filename="([^"]+)"/.exec(res.headers.get("Content-Disposition") ?? "")?.[1] ?? `email-templates.${format}`;
      const url = URL.createObjectURL(await res.blob());
      const a = Object.assign(document.createElement("a"), { href: url, download: name });
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setActionMessage(`Downloaded ${plural(selectedTemplates.length)} as ${name}.`);
    } catch (e) { setActionError(e instanceof Error ? e.message : "Download failed."); }
    finally { setBusy(false); }
  }

  async function shareSelected() {
    setActionMessage(null); setActionError(null);
    const lines = selectedTemplates.map((t) => `${t.name}: ${window.location.origin}/dashboard/emails/editor?id=${t.id}`);
    const text = lines.join("\n");
    try {
      if (navigator.share && /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)) {
        await navigator.share({ title: selectedTemplates.length === 1 ? selectedTemplates[0].name : "Email templates", text });
        return;
      }
      await navigator.clipboard.writeText(text);
      setActionMessage(`Copied ${selectedTemplates.length === 1 ? "a link" : `${selectedTemplates.length} links`} to the clipboard. Team members with dashboard access can open them.`);
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") return; // closed the share sheet
      setActionError("Couldn't copy the links. Your browser blocked clipboard access.");
    }
  }

  function editSelected() {
    if (selectedTemplates.length === 1) router.push(`/dashboard/emails/editor?id=${selectedTemplates[0].id}`);
    else setEditDialog(true);
  }

  async function bulk(action: "archive" | "delete" | "update", extra: Record<string, unknown> = {}, done?: string) {
    try {
      await post("/api/admin/email/templates/bulk", { ids: selectedTemplates.map((t) => t.id), action, ...extra });
      setActionMessage(done ?? "Done.");
      window.location.reload();
    } catch (e) { setActionError(e instanceof Error ? e.message : "Bulk action failed."); }
  }

  function archiveSelected() {
    const n = selectedTemplates.length;
    if (!window.confirm(`Archive ${plural(n)}? Archived templates stop showing as live but can be restored.`)) return;
    bulk("archive", {}, `Archived ${plural(n)}.`);
  }

  function deleteSelected() {
    const n = selectedTemplates.length;
    const automated = selectedTemplates.filter((t) => (automationsByTemplate.get(t.id) ?? []).length).length;
    const warn = automated ? `\n\n${automated} of them power an automation, which will be switched off.` : "";
    if (!window.confirm(`Permanently delete ${plural(n)}? This cannot be undone.${warn}\n\nTip: Archive keeps them recoverable.`)) return;
    bulk("delete", {}, `Deleted ${plural(n)}.`);
  }

  const checkbox = (checked: boolean, onChange: () => void, label: string, indeterminate = false) => (
    <input
      type="checkbox"
      aria-label={label}
      checked={checked}
      ref={(el) => { if (el) el.indeterminate = indeterminate && !checked; }}
      onChange={onChange}
      onClick={(e) => e.stopPropagation()}
      className="h-4 w-4 cursor-pointer rounded border-input accent-[#b88a4a]"
    />
  );

  const rowActions = (t: EmailTemplateRow, compact = false) => (
    <div className="flex items-center justify-end gap-2">
      <Button size="sm" type="button" variant="outline" onClick={() => setPreviewTemplate(t)} aria-label="Preview">
        <Eye className="h-4 w-4" />{compact ? null : " Preview"}
      </Button>
      <Button asChild size="sm" type="button" variant="outline" aria-label="Edit">
        <Link href={`/dashboard/emails/editor?id=${t.id}`}>
          <Pencil className="h-4 w-4" />{compact ? null : " Edit"}
        </Link>
      </Button>
      <Button size="sm" type="button" variant="outline" aria-label="More actions"
        onClick={(e) => setRowMenu({ template: t, pos: anchorFrom(e.currentTarget) })}>
        <MoreHorizontal className="h-4 w-4" />
      </Button>
    </div>
  );

  const automationChips = (t: EmailTemplateRow) => {
    const autos = automationsByTemplate.get(t.id) ?? [];
    if (!autos.length) return <span className="text-xs text-muted-foreground">— Manual</span>;
    return (
      <div className="flex flex-wrap gap-1">
        {autos.map((a) => (
          <span
            key={a.key}
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
              a.enabled ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" : "bg-muted text-muted-foreground",
            )}
            title={a.enabled ? "Automation active" : "Automation inactive"}
          >
            <Zap className="h-3 w-3" />
            {a.label} · {a.enabled ? "Active" : "Inactive"}
          </span>
        ))}
      </div>
    );
  };

  const testBadge = (t: EmailTemplateRow) =>
    t.is_test ? (
      <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300">
        <FlaskConical className="mr-1 h-3 w-3" />Test
      </Badge>
    ) : null;

  const sortHead = (key: SortKey, className?: string) => {
    const active = sort?.key === key;
    const Icon = !active ? ArrowUpDown : sort.dir === "asc" ? ArrowUp : ArrowDown;
    return (
      <TableHead className={className} aria-sort={active ? (sort.dir === "asc" ? "ascending" : "descending") : "none"}>
        <button type="button" onClick={() => toggleSort(key)}
          className={cn("-ml-2 inline-flex items-center gap-1 rounded px-2 py-1 hover:bg-accent hover:text-foreground", active && "text-foreground")}>
          {SORT_LABELS[key]}
          <Icon className={cn("h-3.5 w-3.5", !active && "opacity-40")} />
        </button>
      </TableHead>
    );
  };
  const updatedLabel = (t: EmailTemplateRow) =>
    t.updated_at ? new Date(t.updated_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "—";

  async function sendTest(t: EmailTemplateRow) {
    try {
      const payload = await post("/api/admin/email/templates/test-send", { templateId: t.id });
      setActionMessage(`Test email sent to ${payload.to}.`);
    } catch (e) { setActionError(e instanceof Error ? e.message : "Could not send test."); }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Templates</CardTitle>
          <CardDescription>
            Segment templates by use case, see which automation each one powers, and tell real emails from tests at a glance.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Category tabs */}
          <div className="flex flex-wrap gap-2 rounded-md border bg-card p-1">
            {["all", ...categories].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
                  category === c && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                )}
              >
                {c === "all" ? "All" : catLabel(c)}
                <span className="ml-1.5 text-xs opacity-70">
                  {c === "all" ? templates.length : templates.filter((t) => (t.category || "general") === c).length}
                </span>
              </button>
            ))}
          </div>

          {/* Status filter chips + search + create */}
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-1.5">
              {STATUS_FILTERS.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setStatusFilter(f.key)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                    statusFilter === f.key
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:bg-accent",
                  )}
                >
                  {f.label} <span className="opacity-70">({statusCount(f.key)})</span>
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Input className="w-full sm:w-64" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search templates..." />
              <Button asChild>
                <Link href="/dashboard/emails/editor">Create template</Link>
              </Button>
            </div>
          </div>

          {/* View switcher + (list/cards) sort + select-all */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                {checkbox(allVisibleSelected, toggleAllVisible, "Select all shown templates", someVisibleSelected)}
                Select all <span className="text-xs opacity-70">({visibleTemplates.length})</span>
              </label>
              {view !== "table" ? (
                <label className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <span className="hidden sm:inline">Sort</span>
                  <select
                    className="h-8 rounded-md border border-input bg-background px-2 text-sm text-foreground"
                    value={sort ? `${sort.key}:${sort.dir}` : ""}
                    onChange={(e) => {
                      const [key, dir] = e.target.value.split(":");
                      setSort(key ? { key: key as SortKey, dir: dir as "asc" | "desc" } : null);
                    }}
                  >
                    <option value="">Default order</option>
                    {(Object.keys(SORT_LABELS) as SortKey[]).flatMap((k) => [
                      <option key={`${k}:asc`} value={`${k}:asc`}>{SORT_LABELS[k]} {k === "updated" ? "(oldest first)" : "(A–Z)"}</option>,
                      <option key={`${k}:desc`} value={`${k}:desc`}>{SORT_LABELS[k]} {k === "updated" ? "(newest first)" : "(Z–A)"}</option>,
                    ])}
                  </select>
                </label>
              ) : null}
            </div>
            <div className="inline-flex rounded-md border bg-card p-0.5" role="group" aria-label="View">
              {([["table", Table2, "Table"], ["list", List, "List"], ["cards", LayoutGrid, "Cards"]] as const).map(([v, Icon, label]) => (
                <button
                  key={v}
                  type="button"
                  aria-pressed={view === v}
                  onClick={() => chooseView(v)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground",
                    view === v && "bg-primary text-primary-foreground hover:text-primary-foreground",
                  )}
                >
                  <Icon className="h-3.5 w-3.5" /> {label}
                </button>
              ))}
            </div>
          </div>

          {/* Bulk quick actions — appears once something is checked */}
          {selectedTemplates.length ? (
            <div className="sticky top-2 z-30 flex flex-wrap items-center gap-2 rounded-md border border-[#b88a4a]/40 bg-[#b88a4a]/10 px-3 py-2 shadow-sm backdrop-blur">
              <span className="mr-1 text-sm font-semibold">
                {selectedTemplates.length} selected
                {hiddenSelected > 0 ? <span className="ml-1 font-normal text-muted-foreground">({hiddenSelected} not shown by this filter)</span> : null}
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" type="button" disabled={busy}><Download className="h-4 w-4" /> Download <ChevronDown className="h-3.5 w-3.5 opacity-70" /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuLabel className="text-xs text-muted-foreground">One file with {plural(selectedTemplates.length)}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {EXPORT_OPTIONS.map((o) => (
                    <DropdownMenuItem key={o.format} onSelect={() => downloadSelected(o.format)} className="flex flex-col items-start gap-0">
                      <span className="font-medium">{o.label}</span>
                      <span className="text-xs text-muted-foreground">{o.hint}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <Button size="sm" type="button" variant="outline" onClick={shareSelected}><Share2 className="h-4 w-4" /> Share</Button>
              <Button size="sm" type="button" variant="outline" onClick={() => setEmailDialog(true)} disabled={busy}><Mail className="h-4 w-4" /> Email</Button>
              <Button size="sm" type="button" variant="outline" onClick={editSelected} disabled={busy}><Pencil className="h-4 w-4" /> Edit</Button>
              <Button size="sm" type="button" variant="outline" onClick={archiveSelected} disabled={busy || selectedTemplates.every((t) => t.status === "archived")}><Archive className="h-4 w-4" /> Archive</Button>
              <Button size="sm" type="button" variant="outline" onClick={deleteSelected} disabled={busy} className="text-destructive hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-4 w-4" /> Delete</Button>
              <Button size="sm" type="button" variant="ghost" onClick={() => setSelected(new Set())} className="ml-auto"><X className="h-4 w-4" /> Clear</Button>
            </div>
          ) : null}

          {!visibleTemplates.length ? (
            <p className="rounded-md border border-dashed py-10 text-center text-sm text-muted-foreground">No templates match this view.</p>
          ) : view === "table" ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">{checkbox(allVisibleSelected, toggleAllVisible, "Select all shown templates", someVisibleSelected)}</TableHead>
                    {sortHead("name")}
                    {sortHead("subject")}
                    {sortHead("category")}
                    {sortHead("automation")}
                    {sortHead("status")}
                    {sortHead("updated", "whitespace-nowrap")}
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleTemplates.map((t) => (
                    <TableRow key={t.id} data-state={selected.has(t.id) ? "selected" : undefined} className={cn(selected.has(t.id) && "bg-[#b88a4a]/5")}>
                      <TableCell>{checkbox(selected.has(t.id), () => toggleOne(t.id), `Select ${t.name}`)}</TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2"><span>{t.name}</span>{testBadge(t)}</div>
                      </TableCell>
                      <TableCell className="max-w-[22rem] truncate text-muted-foreground">{t.subject}</TableCell>
                      <TableCell className="whitespace-nowrap"><Badge variant="secondary" className="whitespace-nowrap">{catLabel(t.category || "general")}</Badge></TableCell>
                      <TableCell>{automationChips(t)}</TableCell>
                      <TableCell><StatusPill status={t.status} /></TableCell>
                      <TableCell className="whitespace-nowrap text-xs text-muted-foreground">{updatedLabel(t)}</TableCell>
                      <TableCell>{rowActions(t)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : view === "list" ? (
            <ul className="divide-y rounded-md border">
              {visibleTemplates.map((t) => (
                <li key={t.id} className={cn("flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-accent/40", selected.has(t.id) && "bg-[#b88a4a]/5")}>
                  {checkbox(selected.has(t.id), () => toggleOne(t.id), `Select ${t.name}`)}
                  <button type="button" onClick={() => setPreviewTemplate(t)} className="min-w-0 flex-1 text-left">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="truncate text-sm font-medium">{t.name}</span>
                      {testBadge(t)}
                      <StatusPill status={t.status} />
                    </div>
                    <p className="truncate text-xs text-muted-foreground">{t.subject}</p>
                  </button>
                  <span className="hidden whitespace-nowrap text-xs text-muted-foreground md:inline">{catLabel(t.category || "general")}</span>
                  <span className="hidden whitespace-nowrap text-xs text-muted-foreground lg:inline">{updatedLabel(t)}</span>
                  {rowActions(t, true)}
                </li>
              ))}
            </ul>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {visibleTemplates.map((t) => {
                const img = heroImages.get(t.id);
                const isSel = selected.has(t.id);
                return (
                  <article key={t.id} className={cn("group relative flex flex-col overflow-hidden rounded-lg border bg-card shadow-sm transition-all hover:shadow-md", isSel && "ring-2 ring-[#b88a4a]")}>
                    <div className="absolute left-2.5 top-2.5 z-10 rounded bg-background/90 p-1 shadow-sm">
                      {checkbox(isSel, () => toggleOne(t.id), `Select ${t.name}`)}
                    </div>
                    <button type="button" onClick={() => setPreviewTemplate(t)} className="relative block aspect-[16/9] w-full overflow-hidden bg-[#f1eee7] dark:bg-muted" aria-label={`Preview ${t.name}`}>
                      {img ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={img} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
                      ) : (
                        <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
                          <Mail className="h-7 w-7 text-[#b88a4a]" />
                          <span className="line-clamp-2 font-serif text-base font-semibold text-[#191815]">{t.subject}</span>
                        </div>
                      )}
                    </button>
                    <div className="flex flex-1 flex-col gap-2 p-4">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Badge variant="secondary" className="text-[11px]">{catLabel(t.category || "general")}</Badge>
                        <StatusPill status={t.status} />
                        {testBadge(t)}
                      </div>
                      <h3 className="text-sm font-semibold leading-snug">{t.name}</h3>
                      <p className="line-clamp-2 text-xs text-muted-foreground">{t.subject}</p>
                      <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                        <span className="text-[11px] text-muted-foreground">{updatedLabel(t)}</span>
                        {rowActions(t, true)}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {actionError ? <p className="text-sm text-destructive">{actionError}</p> : null}
      {actionMessage ? <p className="text-sm text-primary">{actionMessage}</p> : null}

      {/* Row actions menu */}
      {rowMenu ? (
        <MenuOverlay pos={rowMenu.pos} onClose={() => setRowMenu(null)}>
          <MenuItem icon={Workflow} label="Add to automation"
            onClick={() => { setAutomationDialog({ presetTemplateId: rowMenu.template.id }); setRowMenu(null); }} />
          <MenuItem icon={Send} label="Send test to me" disabled={busy || rowMenu.template.status === "archived"}
            onClick={() => { sendTest(rowMenu.template); setRowMenu(null); }} />
          <MenuItem icon={Copy} label="Duplicate as draft" disabled={busy}
            onClick={() => { duplicateTemplate(rowMenu.template); setRowMenu(null); }} />
          <MenuItem icon={FlaskConical} label={rowMenu.template.is_test ? "Unmark as test" : "Mark as test"} disabled={busy}
            onClick={() => { saveWith(rowMenu.template, { isTest: !rowMenu.template.is_test }); setRowMenu(null); }} />
          <MenuItem icon={Archive} label="Archive" disabled={busy || rowMenu.template.status === "archived"}
            onClick={() => { saveWith(rowMenu.template, { status: "archived" }); setRowMenu(null); }} />
          <MenuItem icon={Trash2} label="Delete" danger disabled={busy}
            onClick={() => { deleteTemplate(rowMenu.template); setRowMenu(null); }} />
          <div className="my-1 border-t" />
          <MenuItem icon={Plus} label="Create template" href="/dashboard/emails/editor" onClick={() => setRowMenu(null)} />
          <MenuItem icon={Zap} label="Manage automations" href="/dashboard/emails/automations" onClick={() => setRowMenu(null)} />
        </MenuOverlay>
      ) : null}

      {emailDialog ? (
        <EmailSelectedDialog templates={selectedTemplates} defaultEmail={defaultEmail} actionToken={actionToken} onClose={() => setEmailDialog(false)} />
      ) : null}
      {editDialog ? (
        <BulkEditDialog
          count={selectedTemplates.length}
          categories={categories}
          busy={busy}
          onClose={() => setEditDialog(false)}
          onSave={(patch) => bulk("update", patch, `Updated ${plural(selectedTemplates.length)}.`)}
        />
      ) : null}

      {/* Add-to-automation dialog */}
      {automationDialog ? (
        <AddAutomationDialog
          templates={templates}
          mappings={mappings}
          presetTemplateId={automationDialog.presetTemplateId}
          actionToken={actionToken}
          onClose={() => setAutomationDialog(null)}
        />
      ) : null}

      {/* Preview */}
      {previewTemplate ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-3" role="dialog" aria-modal="true">
          <div className="flex h-[92vh] w-full max-w-[92rem] flex-col overflow-hidden rounded-md border bg-background shadow-xl">
            <div className="flex items-center gap-3 border-b px-4 py-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold">{previewTemplate.name}</p>
                <p className="truncate text-xs text-muted-foreground">{previewTemplate.subject}</p>
              </div>
              <Button className="ml-auto" type="button" variant="ghost" onClick={() => setPreviewTemplate(null)}>Close</Button>
            </div>
            <div className="flex-1 overflow-auto bg-muted p-3">
              <div className="mx-auto w-full max-w-[86rem] overflow-hidden rounded-md border bg-white shadow-sm">
                <iframe className="h-[80vh] w-full bg-white" sandbox="" srcDoc={previewTemplate.html_body} title="Email template preview" />
              </div>
            </div>
            {/* Send bar — send this template straight from the preview */}
            <PreviewSendBar key={previewTemplate.id} template={previewTemplate} defaultEmail={defaultEmail} actionToken={actionToken} />
          </div>
        </div>
      ) : null}
    </div>
  );
}

// Send bar inside the preview modal: fire the previewed template to one or more emails.
// Uses the same test-send endpoint (renders with sample merge data, e.g. {{first_name}} → "there").
function PreviewSendBar({ template, defaultEmail, actionToken }: { template: EmailTemplateRow; defaultEmail: string; actionToken: string }) {
  const [to, setTo] = useState(defaultEmail);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);

  const emails = to.split(/[,\s;]+/).map((e) => e.trim()).filter(Boolean);
  const allValid = emails.length > 0 && emails.every((e) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e));

  async function send() {
    if (!allValid) { setResult({ ok: false, text: "Enter at least one valid email address." }); return; }
    setSending(true);
    setResult(null);
    const failures: string[] = [];
    for (const email of emails) {
      try {
        const res = await fetch("/api/admin/email/templates/test-send", {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-mjg-action-token": actionToken },
          body: JSON.stringify({ templateId: template.id, to: email, actionToken }),
        });
        const payload = await res.json().catch(() => ({}));
        if (!res.ok) failures.push(`${email}: ${payload.error ?? "failed"}`);
      } catch {
        failures.push(`${email}: network error`);
      }
    }
    setSending(false);
    if (failures.length === 0) {
      setResult({ ok: true, text: `Sent to ${emails.length} recipient${emails.length === 1 ? "" : "s"}.` });
    } else {
      setResult({ ok: false, text: failures.join("  ·  ") });
    }
  }

  return (
    <div className="border-t bg-card px-4 py-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <span className="flex shrink-0 items-center gap-1.5 text-sm font-medium text-muted-foreground">
          <Send className="h-4 w-4" /> Send this email
        </span>
        <Input
          value={to}
          onChange={(e) => { setTo(e.target.value); setResult(null); }}
          onKeyDown={(e) => { if (e.key === "Enter" && !sending) send(); }}
          placeholder="recipient@example.com, another@example.com"
          className="flex-1"
          type="text"
        />
        <Button type="button" onClick={send} disabled={sending || !allValid} className="shrink-0">
          <Send className="h-4 w-4" /> {sending ? "Sending…" : emails.length > 1 ? `Send to ${emails.length}` : "Send"}
        </Button>
      </div>
      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
        {result ? (
          <span className={result.ok ? "text-primary" : "text-destructive"}>{result.text}</span>
        ) : (
          <span className="text-muted-foreground">
            Sends the live template with sample values (e.g. <code className="rounded bg-muted px-1">{"{{first_name}}"}</code> → &ldquo;there&rdquo;). Separate multiple emails with commas.
          </span>
        )}
        <Link href="/dashboard/emails/send" className="ml-auto text-muted-foreground underline-offset-2 hover:text-foreground hover:underline">
          Deploy to an audience →
        </Link>
      </div>
    </div>
  );
}

// Email the checked templates to one or more people, each as its own message with sample
// merge values (the same test-send the preview bar uses).
function EmailSelectedDialog({
  templates, defaultEmail, actionToken, onClose,
}: { templates: EmailTemplateRow[]; defaultEmail: string; actionToken: string; onClose: () => void }) {
  const [to, setTo] = useState(defaultEmail);
  const [sending, setSending] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);
  const sendable = templates.filter((t) => t.status !== "archived");
  const emails = to.split(/[,\s;]+/).map((e) => e.trim()).filter(Boolean);
  const allValid = emails.length > 0 && emails.every((e) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e));
  const total = sendable.length * emails.length;

  async function send() {
    if (!allValid || !sendable.length) return;
    setSending(true); setResult(null); setProgress(0);
    const failures: string[] = [];
    let done = 0;
    for (const t of sendable) {
      for (const email of emails) {
        try {
          const res = await fetch("/api/admin/email/templates/test-send", {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-mjg-action-token": actionToken },
            body: JSON.stringify({ templateId: t.id, to: email, actionToken }),
          });
          if (!res.ok) failures.push(`${t.name} → ${email}: ${(await res.json().catch(() => ({}))).error ?? "failed"}`);
        } catch {
          failures.push(`${t.name} → ${email}: network error`);
        }
        setProgress(++done);
      }
    }
    setSending(false);
    setResult(failures.length ? { ok: false, text: failures.join(" · ") } : { ok: true, text: `Sent ${total} email${total === 1 ? "" : "s"}.` });
  }

  return (
    <Dialog open onOpenChange={(v) => !v && !sending && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Email {sendable.length === 1 ? "this template" : `${sendable.length} templates`}</DialogTitle>
          <DialogDescription>
            Each template goes out as its own email, with sample values (e.g. {"{{first_name}}"} → &ldquo;there&rdquo;).
            {templates.length > sendable.length ? ` ${templates.length - sendable.length} archived template${templates.length - sendable.length === 1 ? " is" : "s are"} skipped.` : ""}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <label className="block space-y-1">
            <span className="text-sm font-medium">Send to</span>
            <Input value={to} onChange={(e) => { setTo(e.target.value); setResult(null); }} placeholder="name@example.com, another@example.com" />
            <span className="text-xs text-muted-foreground">Separate several addresses with commas.</span>
          </label>
          <ul className="max-h-40 space-y-1 overflow-y-auto rounded-md border bg-muted/40 p-2 text-xs">
            {sendable.map((t) => <li key={t.id} className="truncate">{t.name}</li>)}
          </ul>
          {sending ? <p className="text-xs text-muted-foreground">Sending {progress} of {total}…</p> : null}
          {result ? <p className={cn("text-sm", result.ok ? "text-primary" : "text-destructive")}>{result.text}</p> : null}
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={onClose} disabled={sending}>{result?.ok ? "Done" : "Cancel"}</Button>
            <Button type="button" onClick={send} disabled={sending || !allValid || !sendable.length || !!result?.ok}>
              <Send className="h-4 w-4" /> {sending ? "Sending…" : `Send ${total || ""} email${total === 1 ? "" : "s"}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Change status, category or the test flag on several templates at once.
function BulkEditDialog({
  count, categories, busy, onClose, onSave,
}: { count: number; categories: string[]; busy: boolean; onClose: () => void; onSave: (patch: Record<string, unknown>) => void }) {
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [test, setTest] = useState("");
  const patch: Record<string, unknown> = {};
  if (status) patch.status = status;
  if (category) patch.category = category;
  if (test) patch.isTest = test === "yes";
  const field = "h-10 w-full rounded-md border border-input bg-background px-3 text-sm";

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit {count} templates</DialogTitle>
          <DialogDescription>Only the fields you change are updated. Content, subjects and slugs stay as they are; open a template to edit its copy.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <label className="block space-y-1">
            <span className="text-sm font-medium">Status</span>
            <select className={field} value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">Keep as is</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-medium">Category</span>
            <select className={field} value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">Keep as is</option>
              {categories.map((c) => <option key={c} value={c}>{catLabel(c)}</option>)}
            </select>
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-medium">Test template</span>
            <select className={field} value={test} onChange={(e) => setTest(e.target.value)}>
              <option value="">Keep as is</option>
              <option value="yes">Mark as test</option>
              <option value="no">Not a test</option>
            </select>
          </label>
          {status === "active" ? (
            <p className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:bg-amber-950 dark:text-amber-300">
              Active templates can be sent by the automations and schedules they belong to.
            </p>
          ) : null}
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="button" disabled={busy || !Object.keys(patch).length} onClick={() => onSave(patch)}>{busy ? "Saving…" : "Apply changes"}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function StatusPill({ status }: { status: EmailTemplateRow["status"] }) {
  const styles: Record<string, string> = {
    active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
    draft: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
    archived: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  };
  return <span className={cn("inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize", styles[status])}>{status}</span>;
}

function MenuOverlay({ pos, onClose, children }: { pos: MenuPos; onClose: () => void; children: React.ReactNode }) {
  return (
    <>
      <button type="button" aria-label="Close menu" className="fixed inset-0 z-40 cursor-default" onClick={onClose} />
      <div
        className="fixed z-50 min-w-[13rem] rounded-md border bg-popover p-1 shadow-lg"
        style={{ right: pos.right, ...(pos.bottom !== undefined ? { bottom: pos.bottom } : { top: pos.top }) }}
      >
        {children}
      </div>
    </>
  );
}

function MenuItem({
  icon: Icon, label, onClick, href, danger, disabled,
}: { icon: typeof Zap; label: string; onClick?: () => void; href?: string; danger?: boolean; disabled?: boolean }) {
  const cls = cn(
    "flex w-full items-center gap-2 rounded-sm px-2.5 py-2 text-left text-sm transition-colors",
    danger ? "text-destructive hover:bg-destructive/10" : "hover:bg-accent",
    disabled && "pointer-events-none opacity-50",
  );
  if (href) return <Link href={href} className={cls} onClick={onClick}><Icon className="h-4 w-4" />{label}</Link>;
  return <button type="button" className={cls} disabled={disabled} onClick={onClick}><Icon className="h-4 w-4" />{label}</button>;
}

function AddAutomationDialog({
  templates, mappings, presetTemplateId, actionToken, onClose,
}: {
  templates: EmailTemplateRow[];
  mappings: MappingRow[];
  presetTemplateId?: string;
  actionToken: string;
  onClose: () => void;
}) {
  const [templateId, setTemplateId] = useState(presetTemplateId ?? "");
  const [eventKey, setEventKey] = useState("");
  const [enabled, setEnabled] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentForEvent = mappings.find((m) => m.event_key === eventKey);
  const currentTemplateName = currentForEvent?.template_id
    ? templates.find((t) => t.id === currentForEvent.template_id)?.name ?? "another template"
    : null;

  async function save() {
    setError(null);
    if (!templateId) { setError("Choose a template."); return; }
    if (!eventKey) { setError("Choose an automation."); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/email/template-mappings", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-mjg-action-token": actionToken },
        body: JSON.stringify({ eventKey, templateId, enabled, actionToken }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload.error ?? "Could not save automation.");
      window.location.reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save automation.");
      setSaving(false);
    }
  }

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add to automation</DialogTitle>
          <DialogDescription>Connect a template to an automated moment. This sets which template that automation sends.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <label className="block space-y-1">
            <span className="text-sm font-medium">Template</span>
            <select
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value)}
              disabled={!!presetTemplateId}
            >
              <option value="">Select a template…</option>
              {templates.filter((t) => t.status !== "archived").map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </label>

          <label className="block space-y-1">
            <span className="text-sm font-medium">Automation</span>
            <select
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={eventKey}
              onChange={(e) => setEventKey(e.target.value)}
            >
              <option value="">Select an automation…</option>
              {EMAIL_EVENT_KEYS.map((ev) => (
                <option key={ev.key} value={ev.key}>{ev.label}</option>
              ))}
            </select>
          </label>

          {eventKey && currentTemplateName ? (
            <p className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:bg-amber-950 dark:text-amber-300">
              This automation currently sends <strong>{currentTemplateName}</strong>. Saving will replace it with the selected template.
            </p>
          ) : null}

          <div className="flex items-center gap-2">
            <Switch checked={enabled} onCheckedChange={setEnabled} aria-label="Automation active" />
            <span className="text-sm">{enabled ? "Active — will send automatically" : "Inactive — connected but paused"}</span>
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="button" disabled={saving} onClick={save}>{saving ? "Saving…" : "Save automation"}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
