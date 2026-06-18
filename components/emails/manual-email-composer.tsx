"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  Bold, Check, Copy, Eye, EyeOff, Image, Italic,
  LayoutTemplate, Link as LinkIcon, List, Paperclip, Send, Square, Type, Underline, X,
} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDashboardActionToken } from "@/components/layout/dashboard-action-token";
import { DEFAULT_EMAIL_FIELDS } from "@/lib/email/constants";

type UserOption = { id: string; full_name: string | null; email: string; role: string };
type TemplateOption = { id: string; name: string; subject: string; status: string; html_body?: string | null };

const NONE = "__none__";

export function ManualEmailComposer({
  users,
  templates = [],
  defaultEmail = "",
}: {
  users: UserOption[];
  templates?: TemplateOption[];
  defaultEmail?: string;
}) {
  const actionToken = useDashboardActionToken();
  const editorRef = useRef<HTMLDivElement>(null);

  // Recipients
  const [selectedUserEmails, setSelectedUserEmails] = useState<string[]>([]);
  const [manualEmails, setManualEmails] = useState("");
  const [cc, setCc] = useState("");
  const [bcc, setBcc] = useState("");

  // Subject + template
  const [subject, setSubject] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateOption | null>(null);
  const [showPreview, setShowPreview] = useState(true);

  // Manual compose
  const [html, setHtml] = useState("<p>Hi {{first_name}},</p><p></p>");
  const [attachments, setAttachments] = useState<File[]>([]);

  // Template deploy
  const [mode, setMode] = useState<"test" | "audience">("test");
  const [testEmail, setTestEmail] = useState(defaultEmail);
  const [audience, setAudience] = useState<"profiles" | "participants">("profiles");
  const [limit, setLimit] = useState(25);
  const [recipientCount, setRecipientCount] = useState<number | null>(null);
  const [testSent, setTestSent] = useState(false);
  const [countLoading, setCountLoading] = useState(false);

  // Field copy feedback
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Status
  const [statusMsg, setStatusMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const recipients = useMemo(
    () => Array.from(new Set([...selectedUserEmails, ...parseEmails(manualEmails)])),
    [selectedUserEmails, manualEmails],
  );
  const activeTemplates = useMemo(() => templates.filter((t) => t.status !== "archived"), [templates]);
  const isManualMode = !selectedTemplate;

  function pickTemplate(value: string) {
    if (value === NONE || !value) {
      setSelectedTemplate(null);
      return;
    }
    const tmpl = activeTemplates.find((t) => t.id === value) ?? null;
    setSelectedTemplate(tmpl);
    if (tmpl?.subject) setSubject(tmpl.subject);
    setTestSent(false);
    setMode("test");
    setShowPreview(true);
  }

  // Recipient count when in audience deploy mode
  useEffect(() => {
    if (!selectedTemplate || mode !== "audience") return;
    let alive = true;
    setCountLoading(true);
    setRecipientCount(null);
    fetch("/api/admin/email/recipient-count", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-mjg-action-token": actionToken },
      body: JSON.stringify({ audience, actionToken }),
    })
      .then((r) => r.json())
      .then((p) => { if (alive) setRecipientCount(typeof p.count === "number" ? p.count : null); })
      .catch(() => { if (alive) setRecipientCount(null); })
      .finally(() => { if (alive) setCountLoading(false); });
    return () => { alive = false; };
  }, [actionToken, audience, mode, selectedTemplate]);

  // Rich-text editor helpers
  function exec(command: string, value?: string) {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    syncHtml();
  }
  function syncHtml() { setHtml(editorRef.current?.innerHTML ?? ""); }
  function insertHtml(value: string) {
    editorRef.current?.focus();
    document.execCommand("insertHTML", false, value);
    syncHtml();
  }

  // Clicking a field chip inserts it into the editor (manual) or copies it (template)
  async function handleFieldClick(field: string) {
    const token = `{{${field}}}`;
    if (isManualMode) {
      insertHtml(token);
    } else {
      await navigator.clipboard.writeText(token);
      setCopiedField(field);
      setTimeout(() => setCopiedField((f) => (f === field ? null : f)), 1600);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setStatusMsg(null);

    try {
      if (selectedTemplate) {
        if (mode === "audience" && !testSent) {
          setStatusMsg({ ok: false, text: "Send a test email first to unlock audience deploy." });
          return;
        }
        if (mode === "audience" && !window.confirm(`Send to up to ${Math.min(limit, recipientCount ?? limit)} ${audience}?`)) return;

        const res = await fetch("/api/admin/email/deploy", {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-mjg-action-token": actionToken },
          body: JSON.stringify({ templateId: selectedTemplate.id, mode, testEmail, audience, limit, testSent, actionToken }),
        });
        const p = await res.json();
        if (!res.ok) { setStatusMsg({ ok: false, text: p.error ?? "Deployment failed." }); return; }
        if (mode === "test" && p.sent > 0) setTestSent(true);
        setStatusMsg({ ok: true, text: `Sent ${p.sent}, skipped ${p.skipped}, failed ${p.failed}.` });
      } else {
        const data = new FormData();
        data.set("recipients", recipients.join(","));
        data.set("cc", cc);
        data.set("bcc", bcc);
        data.set("subject", subject);
        data.set("html", html);
        data.set("text", stripHtml(html));
        data.set("actionToken", actionToken);
        attachments.forEach((f) => data.append("attachments", f));

        const res = await fetch("/api/admin/email/manual", { method: "POST", headers: { "x-mjg-action-token": actionToken }, body: data });
        const p = await res.json();
        if (!res.ok) { setStatusMsg({ ok: false, text: p.error ?? "Email could not be sent." }); return; }
        setStatusMsg({ ok: true, text: `Sent ${p.sent}, skipped ${p.skipped}.` });
      }
    } finally {
      setLoading(false);
    }
  }

  const canSend = isManualMode
    ? Boolean(subject && recipients.length && html)
    : selectedTemplate && (mode === "test" ? Boolean(testEmail) : testSent);

  return (
    <form className="space-y-0" onSubmit={handleSubmit}>
      {/* ── Addressing header ─────────────────────────────── */}
      <div className={`overflow-hidden border bg-card ${isManualMode ? "rounded-t-md" : "rounded-t-md"}`}>
        {/* To */}
        <div className="grid gap-3 border-b px-4 py-3 md:grid-cols-[4.5rem_minmax(0,1fr)] md:items-center">
          <span className="text-sm font-medium text-muted-foreground">To</span>
          <Input
            value={manualEmails}
            onChange={(e) => setManualEmails(e.target.value)}
            placeholder="person@example.com, another@example.com"
            className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
          />
        </div>

        {/* Dashboard users accordion */}
        <Accordion type="single" collapsible className="border-b px-4">
          <AccordionItem value="users" className="border-0">
            <AccordionTrigger className="py-3 text-sm font-medium hover:no-underline">
              <span className="flex flex-wrap items-center gap-2 text-left">
                Add dashboard users
                {selectedUserEmails.length ? <Badge variant="secondary">{selectedUserEmails.length} selected</Badge> : null}
              </span>
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              <div className="max-h-56 overflow-auto rounded-md border bg-background p-2">
                {users.map((user) => (
                  <label key={user.id} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-accent">
                    <input
                      type="checkbox"
                      checked={selectedUserEmails.includes(user.email)}
                      onChange={(e) =>
                        setSelectedUserEmails((cur) =>
                          e.target.checked ? [...cur, user.email] : cur.filter((em) => em !== user.email),
                        )
                      }
                    />
                    <span className="min-w-0">
                      <span className="block truncate font-medium">{user.full_name || user.email}</span>
                      <span className="block truncate text-xs text-muted-foreground">{user.email}</span>
                    </span>
                  </label>
                ))}
                {!users.length && <p className="p-2 text-sm text-muted-foreground">No active users found.</p>}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Selected recipient chips */}
        {recipients.length > 0 && (
          <div className="flex flex-wrap gap-2 border-b px-4 py-3">
            {recipients.map((email) => (
              <Badge key={email} variant="secondary" className="gap-1 pr-1">
                {email}
                <button
                  type="button"
                  className="ml-0.5 rounded hover:text-destructive"
                  onClick={() => {
                    setManualEmails((prev) => parseEmails(prev).filter((e) => e !== email).join(", "));
                    setSelectedUserEmails((prev) => prev.filter((e) => e !== email));
                  }}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        {/* CC */}
        <div className="grid gap-3 border-b px-4 py-3 md:grid-cols-[4.5rem_minmax(0,1fr)] md:items-center">
          <span className="text-sm font-medium text-muted-foreground">CC</span>
          <Input value={cc} onChange={(e) => setCc(e.target.value)} placeholder="Optional CC recipients" className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0" />
        </div>

        {/* BCC */}
        <div className="grid gap-3 border-b px-4 py-3 md:grid-cols-[4.5rem_minmax(0,1fr)] md:items-center">
          <span className="text-sm font-medium text-muted-foreground">BCC</span>
          <Input value={bcc} onChange={(e) => setBcc(e.target.value)} placeholder="Optional BCC recipients" className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0" />
        </div>

        {/* Subject + Template picker (two columns) */}
        <div className="flex items-center gap-2 px-4 py-3">
          <span className="w-[4.5rem] shrink-0 text-sm font-medium text-muted-foreground">Subject</span>
          <Input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Email subject..."
            required
            className="flex-1 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
          />
          <Select value={selectedTemplate?.id ?? NONE} onValueChange={pickTemplate}>
            <SelectTrigger
              className={`w-auto max-w-[200px] shrink-0 gap-1.5 text-sm ${selectedTemplate ? "border-primary/60 bg-primary/5 text-primary" : "text-muted-foreground"}`}
            >
              <LayoutTemplate className="h-3.5 w-3.5 shrink-0" />
              <SelectValue placeholder="Template" />
            </SelectTrigger>
            <SelectContent align="end" className="max-w-xs">
              <SelectItem value={NONE}>No template (manual)</SelectItem>
              {activeTemplates.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                  <span className="ml-1.5 text-xs text-muted-foreground">({t.status})</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* ── Template preview panel ─────────────────────────── */}
      {selectedTemplate && (
        <div className="border-x border-b bg-card">
          <div className="flex items-center justify-between border-b bg-muted/40 px-4 py-2">
            <p className="text-sm">
              <span className="text-muted-foreground">Using: </span>
              <span className="font-semibold text-primary">{selectedTemplate.name}</span>
            </p>
            <button
              type="button"
              onClick={() => setShowPreview((v) => !v)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              {showPreview ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              {showPreview ? "Hide preview" : "Show preview"}
            </button>
          </div>
          {showPreview && (
            <div className="max-h-80 overflow-y-auto bg-white px-4 py-4">
              {selectedTemplate.html_body ? (
                <div dangerouslySetInnerHTML={{ __html: selectedTemplate.html_body }} />
              ) : (
                <p className="text-sm italic text-muted-foreground">No preview available for this template.</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Manual compose body ────────────────────────────── */}
      {isManualMode && (
        <div className="overflow-hidden rounded-b-md border-x border-b bg-card">
          {/* Dynamic fields strip — click to insert at cursor */}
          <div className="border-b bg-muted/30 px-4 py-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="mr-1 shrink-0 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Fields:</span>
              {DEFAULT_EMAIL_FIELDS.map((field) => {
                const copied = copiedField === field;
                return (
                  <button
                    key={field}
                    type="button"
                    onClick={() => handleFieldClick(field)}
                    title={`Insert {{${field}}}`}
                    className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[11px] transition-colors ${
                      copied
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-background text-muted-foreground hover:border-primary hover:text-primary"
                    }`}
                  >
                    {copied && <Check className="h-2.5 w-2.5" />}
                    {`{{${field}}}`}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Formatting toolbar */}
          <div className="flex flex-wrap gap-1 border-b px-3 py-2">
            <ToolbarBtn label="Bold" icon={<Bold className="h-3.5 w-3.5" />} onClick={() => exec("bold")} />
            <ToolbarBtn label="Italic" icon={<Italic className="h-3.5 w-3.5" />} onClick={() => exec("italic")} />
            <ToolbarBtn label="Underline" icon={<Underline className="h-3.5 w-3.5" />} onClick={() => exec("underline")} />
            <ToolbarBtn label="List" icon={<List className="h-3.5 w-3.5" />} onClick={() => exec("insertUnorderedList")} />
            <ToolbarBtn
              label="Link"
              icon={<LinkIcon className="h-3.5 w-3.5" />}
              onClick={() => exec("createLink", window.prompt("Enter URL") || "")}
            />
            <ToolbarBtn label="Heading" icon={<Type className="h-3.5 w-3.5" />} onClick={() => exec("formatBlock", "h2")} />
            <ToolbarBtn
              label="Button"
              icon={<Square className="h-3.5 w-3.5" />}
              onClick={() =>
                insertHtml(
                  `<p><a href="{{site_url}}" style="display:inline-block;background:#2f6848;color:#fff;text-decoration:none;padding:12px 18px;border-radius:6px;font-weight:bold;">Button Text</a></p>`,
                )
              }
            />
            <ToolbarBtn
              label="Image"
              icon={<Image className="h-3.5 w-3.5" />}
              onClick={() =>
                insertHtml(
                  `<p><img src="https://via.placeholder.com/640x260" alt="Email image" style="max-width:100%;height:auto;border-radius:8px;" /></p>`,
                )
              }
            />
          </div>

          {/* Content-editable body */}
          <div
            ref={editorRef}
            className="min-h-64 bg-background px-4 py-3 text-sm focus:outline-none"
            contentEditable
            dangerouslySetInnerHTML={{ __html: html }}
            onInput={syncHtml}
            role="textbox"
            aria-label="Email body"
          />
        </div>
      )}

      {/* ── Template deploy controls ───────────────────────── */}
      {selectedTemplate && (
        <div className="rounded-b-md border-x border-b bg-card px-4 py-4 space-y-4">
          {/* Fields — click to copy (for pasting into template editor) */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Dynamic fields <span className="normal-case font-normal text-muted-foreground">— click to copy</span>
            </p>
            <div className="flex flex-wrap gap-1.5">
              {DEFAULT_EMAIL_FIELDS.map((field) => {
                const copied = copiedField === field;
                return (
                  <button
                    key={field}
                    type="button"
                    onClick={() => handleFieldClick(field)}
                    className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 text-xs transition-colors ${
                      copied
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-background text-muted-foreground hover:border-primary hover:text-primary"
                    }`}
                  >
                    {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    {`{{${field}}}`}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mode + recipient options */}
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1.5 text-sm font-medium">
              Send mode
              <Select value={mode} onValueChange={(v) => setMode(v as "test" | "audience")}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="test">Test email</SelectItem>
                  <SelectItem value="audience">Deploy to audience</SelectItem>
                </SelectContent>
              </Select>
            </label>

            {mode === "test" ? (
              <label className="space-y-1.5 text-sm font-medium">
                Test recipient
                <Input className="mt-1.5" value={testEmail} onChange={(e) => setTestEmail(e.target.value)} type="email" placeholder="your@email.com" required />
              </label>
            ) : (
              <>
                <label className="space-y-1.5 text-sm font-medium">
                  Audience
                  <Select value={audience} onValueChange={(v) => setAudience(v as "profiles" | "participants")}>
                    <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="profiles">Active dashboard users</SelectItem>
                      <SelectItem value="participants">Participants</SelectItem>
                    </SelectContent>
                  </Select>
                </label>
                <label className="space-y-1.5 text-sm font-medium">
                  Limit
                  <Input className="mt-1.5" min={1} max={1000} type="number" value={limit} onChange={(e) => setLimit(Number(e.target.value))} />
                </label>
              </>
            )}
          </div>

          <div className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
            {mode === "test"
              ? testSent
                ? "Test sent — audience deploy is now unlocked."
                : "Send a test email first to unlock audience deploy."
              : countLoading
              ? "Counting recipients…"
              : `${recipientCount ?? "Unknown"} eligible recipients. Sends immediately after confirmation.`}
          </div>
        </div>
      )}

      {/* ── Attachments (manual only) ──────────────────────── */}
      {isManualMode && (
        <div className="space-y-2 pt-4">
          <label className="text-sm font-medium">Attachments</label>
          <Input multiple type="file" onChange={(e) => setAttachments(Array.from(e.target.files ?? []))} />
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
              {attachments.map((f) => (
                <span key={`${f.name}-${f.size}`} className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1">
                  <Paperclip className="h-3 w-3" /> {f.name}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Status + submit ────────────────────────────────── */}
      {statusMsg && (
        <p className={`pt-3 text-sm ${statusMsg.ok ? "text-green-600" : "text-destructive"}`}>{statusMsg.text}</p>
      )}

      <div className="flex items-center gap-3 pt-4">
        <Button disabled={loading || !canSend} type="submit" className="gap-2">
          <Send className="h-4 w-4" />
          {loading
            ? "Sending…"
            : selectedTemplate
            ? mode === "test"
              ? "Send test"
              : "Deploy email"
            : "Send email"}
        </Button>
        {selectedTemplate && (
          <Button type="button" variant="ghost" size="sm" onClick={() => pickTemplate(NONE)}>
            Clear template
          </Button>
        )}
      </div>
    </form>
  );
}

function ToolbarBtn({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <Button type="button" size="sm" variant="outline" onClick={onClick} title={label} className="h-7 gap-1.5 px-2 text-xs">
      {icon} {label}
    </Button>
  );
}

function parseEmails(value: string) {
  return value
    .split(/[,;\s]+/)
    .map((s) => s.trim().toLowerCase())
    .filter((s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s));
}

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}
