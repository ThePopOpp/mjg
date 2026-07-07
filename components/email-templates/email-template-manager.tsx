"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Archive, Copy, Eye, FlaskConical, MoreHorizontal, Pencil, Plus, Send, Trash2, Workflow, Zap,
} from "lucide-react";
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
  category: string;
  status: "draft" | "active" | "archived";
  html_body: string;
  text_body: string | null;
  available_fields: string[] | null;
  is_test?: boolean | null;
};

type MappingRow = {
  event_key: string;
  template_id: string | null;
  enabled: boolean | null;
};

const CATEGORY_LABELS: Record<string, string> = {
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
type MenuPos = { top: number; right: number };
function anchorFrom(el: HTMLElement): MenuPos {
  const r = el.getBoundingClientRect();
  return { top: r.bottom + 4, right: window.innerWidth - r.right };
}

export function EmailTemplateManager({ templates, mappings }: { templates: EmailTemplateRow[]; mappings: MappingRow[] }) {
  const actionToken = useDashboardActionToken();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplateRow | null>(null);
  const [rowMenu, setRowMenu] = useState<{ template: EmailTemplateRow; pos: MenuPos } | null>(null);
  const [fabMenu, setFabMenu] = useState(false);
  const [automationDialog, setAutomationDialog] = useState<{ presetTemplateId?: string } | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

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

  const categories = useMemo(() => {
    const present = new Set(templates.map((t) => t.category || "general"));
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

  const visibleTemplates = templates.filter((t) => {
    if (category !== "all" && (t.category || "general") !== category) return false;
    if (!matchesStatus(t)) return false;
    const hay = `${t.name} ${t.subject} ${t.category} ${t.status}`.toLowerCase();
    return hay.includes(search.toLowerCase());
  });

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

  async function saveWith(t: EmailTemplateRow, patch: Partial<{ status: EmailTemplateRow["status"]; isTest: boolean }>) {
    try {
      await post("/api/admin/email/templates", {
        id: t.id, name: t.name, subject: t.subject, category: t.category,
        status: patch.status ?? t.status, htmlBody: t.html_body, textBody: t.text_body,
        ...(patch.isTest !== undefined ? { isTest: patch.isTest } : {}),
      });
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

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Automation</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleTemplates.map((t) => {
                  const autos = automationsByTemplate.get(t.id) ?? [];
                  return (
                    <TableRow key={t.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <span>{t.name}</span>
                          {t.is_test ? (
                            <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300">
                              <FlaskConical className="mr-1 h-3 w-3" />Test
                            </Badge>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[22rem] truncate text-muted-foreground">{t.subject}</TableCell>
                      <TableCell><Badge variant="secondary">{catLabel(t.category || "general")}</Badge></TableCell>
                      <TableCell>
                        {autos.length === 0 ? (
                          <span className="text-xs text-muted-foreground">— Manual</span>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {autos.map((a) => (
                              <span
                                key={a.key}
                                className={cn(
                                  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
                                  a.enabled
                                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                                    : "bg-muted text-muted-foreground",
                                )}
                                title={a.enabled ? "Automation active" : "Automation inactive"}
                              >
                                <Zap className="h-3 w-3" />
                                {a.label} · {a.enabled ? "Active" : "Inactive"}
                              </span>
                            ))}
                          </div>
                        )}
                      </TableCell>
                      <TableCell><StatusPill status={t.status} /></TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button size="sm" type="button" variant="outline" onClick={() => setPreviewTemplate(t)}>
                            <Eye className="h-4 w-4" /> Preview
                          </Button>
                          <Button asChild size="sm" type="button" variant="outline">
                            <Link href={`/dashboard/emails/editor?id=${t.id}`}>
                              <Pencil className="h-4 w-4" /> Edit
                            </Link>
                          </Button>
                          <Button size="sm" type="button" variant="outline" aria-label="More actions"
                            onClick={(e) => { setFabMenu(false); setRowMenu({ template: t, pos: anchorFrom(e.currentTarget) }); }}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {!visibleTemplates.length ? (
                  <TableRow><TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">No templates match this view.</TableCell></TableRow>
                ) : null}
              </TableBody>
            </Table>
          </div>
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
          <div className="my-1 border-t" />
          <MenuItem icon={Trash2} label="Delete" danger disabled={busy}
            onClick={() => { deleteTemplate(rowMenu.template); setRowMenu(null); }} />
        </MenuOverlay>
      ) : null}

      {/* Floating action button — bottom-center to avoid the Steward review FAB (bottom-right) */}
      <button
        type="button"
        aria-label="Quick actions"
        onClick={() => { setRowMenu(null); setFabMenu((v) => !v); }}
        className="fixed bottom-6 left-1/2 z-40 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition hover:brightness-110"
      >
        <Plus className="h-6 w-6" />
      </button>
      {fabMenu ? (
        <MenuOverlay center bottom={88} onClose={() => setFabMenu(false)}>
          <MenuItem icon={Plus} label="Create template" href="/dashboard/emails/editor" onClick={() => setFabMenu(false)} />
          <MenuItem icon={Workflow} label="Add to automation" onClick={() => { setAutomationDialog({}); setFabMenu(false); }} />
          <MenuItem icon={Zap} label="Manage automations" href="/dashboard/emails/automations" onClick={() => setFabMenu(false)} />
        </MenuOverlay>
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
          </div>
        </div>
      ) : null}
    </div>
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

function MenuOverlay({
  pos, bottom, center, onClose, children,
}: { pos?: MenuPos; bottom?: number; center?: boolean; onClose: () => void; children: React.ReactNode }) {
  const style: React.CSSProperties = center
    ? { bottom, left: "50%", transform: "translateX(-50%)" }
    : bottom !== undefined
      ? { bottom, right: pos?.right }
      : { top: pos?.top, right: pos?.right };
  return (
    <>
      <button type="button" aria-label="Close menu" className="fixed inset-0 z-40 cursor-default" onClick={onClose} />
      <div className="fixed z-50 min-w-[13rem] rounded-md border bg-popover p-1 shadow-lg" style={style}>
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
