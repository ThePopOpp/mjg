"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy, Eye, Image, Link as LinkIcon, MousePointerClick, PanelTop, Rows3, Save, Square, Type, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const sampleMergeData: Record<string, string> = {
  first_name: "Jeremy",
  last_name: "Waters",
  full_name: "Jeremy Waters",
  email: "jw@michaeljgauthier.com",
  phone: "+14803527598",
  role: "Super Admin",
  status: "active",
  wave: "Wave 0",
  source: "direct_text",
  participant_type: "General participant",
  check_in_status: "completed",
  survey_status: "sent",
  inner_circle_status: "invited",
  site_url: "https://blueprint.michaeljgauthier.com",
};

const categories = [
  { value: "general", label: "General" },
  { value: "new_user_signup", label: "New User Sign-Up" },
  { value: "login", label: "Login / Auth" },
  { value: "participants", label: "Participants" },
  { value: "waves", label: "Waves" },
  { value: "check_in_results", label: "Check-In Results" },
  { value: "surveys", label: "Surveys" },
  { value: "pastor_elder_review", label: "Pastor/Elder Review" },
  { value: "inner_circle", label: "Inner Circle" },
  { value: "email_journey", label: "7-Day Email Journey" },
  { value: "notifications", label: "Notifications" },
];

const mergeFields = [
  "first_name",
  "last_name",
  "full_name",
  "email",
  "wave",
  "source",
  "participant_type",
  "check_in_status",
  "survey_status",
  "inner_circle_status",
  "site_url",
];

export type EmailTemplateEditorValue = {
  id?: string;
  name?: string;
  subject?: string;
  category?: string;
  status?: "draft" | "active" | "archived";
  html_body?: string;
  text_body?: string | null;
};

export function EmailTemplateForm({
  initialTemplate,
  onSaved,
}: {
  initialTemplate?: EmailTemplateEditorValue;
  onSaved?: () => void;
}) {
  const router = useRouter();
  const [editorMode, setEditorMode] = useState<"advanced" | "simple">("advanced");
  const [editingId, setEditingId] = useState(initialTemplate?.id);
  const [name, setName] = useState(initialTemplate?.name ?? "");
  const [subject, setSubject] = useState(initialTemplate?.subject ?? "Hi {{first_name}},");
  const [category, setCategory] = useState(initialTemplate?.category ?? "general");
  const [status, setStatus] = useState<"draft" | "active" | "archived">(initialTemplate?.status ?? "draft");
  const [emailWidth, setEmailWidth] = useState(640);
  const [emailPadding, setEmailPadding] = useState(24);
  const [backgroundColor, setBackgroundColor] = useState("#f8f6f1");
  const [contentColor, setContentColor] = useState("#ffffff");
  const [textColor, setTextColor] = useState("#0f1f1a");
  const defaultHtmlBody =
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8f6f1;padding:24px 0;">
  <tr>
    <td align="center">
      <table role="presentation" width="640" cellpadding="0" cellspacing="0" style="max-width:640px;background:#ffffff;border-radius:8px;padding:32px;font-family:Arial,sans-serif;color:#0f1f1a;">
        <tr>
          <td>
            <h1 style="margin:0 0 16px;font-size:28px;line-height:1.2;">Hi {{first_name}},</h1>
            <p style="font-size:16px;line-height:1.6;margin:0 0 20px;">Your message goes here.</p>
            <a href="{{site_url}}" style="display:inline-block;background:#2f6848;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:6px;font-weight:bold;">Open Dashboard</a>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;
  const [htmlBody, setHtmlBody] = useState(initialTemplate?.html_body ?? defaultHtmlBody);
  const [textBody, setTextBody] = useState(initialTemplate?.text_body ?? "Hi {{first_name}},\n\nYour message goes here.\n\n{{site_url}}");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const previewHtml = useMemo(() => buildPreviewHtml(renderMergeFields(htmlBody)), [htmlBody]);
  const renderedSubject = useMemo(() => renderMergeFields(subject), [subject]);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    const response = await fetch("/api/admin/email/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: editingId, name, subject, category, status, htmlBody, textBody }),
    });
    const payload = await response.json();

    if (!response.ok) {
      setError(payload.error ?? "Template could not be saved.");
      setLoading(false);
      return;
    }

    setMessage(editingId ? "Template updated in Supabase." : "Template saved in Supabase.");
    if (!editingId) setName("");
    setLoading(false);
    router.refresh();
    onSaved?.();
  }

  function resetForNewTemplate() {
    setEditingId(undefined);
    setName("");
    setSubject("Hi {{first_name}},");
    setCategory("general");
    setStatus("draft");
    setHtmlBody(defaultHtmlBody);
    setTextBody("Hi {{first_name}},\n\nYour message goes here.\n\n{{site_url}}");
    setMessage(null);
    setError(null);
  }

  function insertSnippet(snippet: string) {
    setHtmlBody((current) => `${current}\n${snippet}`);
  }

  async function copyDynamicField(field: string) {
    await navigator.clipboard.writeText(`{{${field}}}`);
    setCopiedField(field);
    window.setTimeout(() => setCopiedField((current) => (current === field ? null : current)), 1600);
  }

  function applySimpleWrapper() {
    setHtmlBody((current) => wrapEmailContent(current, { emailWidth, emailPadding, backgroundColor, contentColor, textColor }));
  }

  return (
    <form className="space-y-5" onSubmit={save}>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm font-medium">
          <span>Template name</span>
          <Input onChange={(event) => setName(event.target.value)} placeholder="Wave 0 welcome email" required value={name} />
        </label>
        <label className="space-y-2 text-sm font-medium">
          <span>Subject</span>
          <Input onChange={(event) => setSubject(event.target.value)} required value={subject} />
        </label>
        <label className="space-y-2 text-sm font-medium">
          <span>Category</span>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
            {categories.map((item) => (
              <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
            ))}
            </SelectContent>
          </Select>
        </label>
        <label className="space-y-2 text-sm font-medium">
          <span>Status</span>
          <Select value={status} onValueChange={(value) => setStatus(value as "draft" | "active" | "archived")}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </label>
      </div>

      {editingId ? (
        <div className="flex items-center justify-between rounded-md border bg-muted/50 p-3 text-sm">
          <span>Editing existing template.</span>
          <Button type="button" variant="outline" size="sm" onClick={resetForNewTemplate}>
            Create new instead
          </Button>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant={editorMode === "advanced" ? "default" : "outline"} onClick={() => setEditorMode("advanced")}>
          Advanced HTML
        </Button>
        <Button type="button" variant={editorMode === "simple" ? "default" : "outline"} onClick={() => setEditorMode("simple")}>
          Simple Editor
        </Button>
        <Button type="button" variant="outline" onClick={() => setPreviewOpen(true)}>
          <Eye className="h-4 w-4" />
          Preview Email
        </Button>
      </div>

      <div className="space-y-4">
        <div className="rounded-md border bg-card p-3">
          <p className="text-sm font-medium">Insert dynamic field</p>
          <p className="mb-3 text-xs text-muted-foreground">Click to copy, then paste with Ctrl+V or right-click paste wherever you need it.</p>
          <div className="flex flex-wrap gap-2">
            {mergeFields.map((field) => {
              const copied = copiedField === field;
              return (
                <Button key={field} size="sm" type="button" variant={copied ? "default" : "outline"} onClick={() => copyDynamicField(field)}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? "Copied" : `{{${field}}}`}
                </Button>
              );
            })}
          </div>
        </div>

        <div className="rounded-md border bg-card p-3">
          <p className="text-xs font-medium uppercase text-muted-foreground">Rendered subject</p>
          <p className="mt-1 font-semibold">{renderedSubject}</p>
        </div>

        {editorMode === "simple" ? (
          <div className="space-y-4 rounded-md border bg-card p-4">
            <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-5">
              <NumberField label="Email width" value={emailWidth} onChange={setEmailWidth} />
              <NumberField label="Padding" value={emailPadding} onChange={setEmailPadding} />
              <ColorField label="Background" value={backgroundColor} onChange={setBackgroundColor} />
              <ColorField label="Content" value={contentColor} onChange={setContentColor} />
              <ColorField label="Text" value={textColor} onChange={setTextColor} />
            </div>
            <div className="flex flex-wrap gap-2">
              <SnippetButton icon={<Rows3 className="h-4 w-4" />} label="Row" onClick={() => insertSnippet(blocks.row)} />
              <SnippetButton icon={<PanelTop className="h-4 w-4" />} label="2 Columns" onClick={() => insertSnippet(blocks.columns)} />
              <SnippetButton icon={<Image className="h-4 w-4" />} label="Image" onClick={() => insertSnippet(blocks.image)} />
              <SnippetButton icon={<Type className="h-4 w-4" />} label="Text" onClick={() => insertSnippet(blocks.text)} />
              <SnippetButton icon={<MousePointerClick className="h-4 w-4" />} label="Button" onClick={() => insertSnippet(blocks.button)} />
              <SnippetButton icon={<LinkIcon className="h-4 w-4" />} label="Link" onClick={() => insertSnippet(blocks.link)} />
              <SnippetButton icon={<Square className="h-4 w-4" />} label="Divider" onClick={() => insertSnippet(blocks.divider)} />
            </div>
            <Button type="button" variant="secondary" onClick={applySimpleWrapper}>
              Apply width, padding, and colors
            </Button>
          </div>
        ) : null}

        <label className="space-y-2 text-sm font-medium">
          <span>{editorMode === "advanced" ? "HTML body" : "Generated HTML body"}</span>
          <textarea className="min-h-[36rem] w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-sm" onChange={(event) => setHtmlBody(event.target.value)} required value={htmlBody} />
        </label>
        <label className="space-y-2 text-sm font-medium">
          <span>Plain text body</span>
          <textarea className="min-h-32 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" onChange={(event) => setTextBody(event.target.value)} value={textBody} />
        </label>
      </div>

      <p className="text-xs text-muted-foreground">
        Advanced users can paste full HTML email templates. Simple Editor tools insert common email-safe blocks that you can adjust before saving.
      </p>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {message ? <p className="text-sm text-primary">{message}</p> : null}
      <Button disabled={loading || !name || !subject || !htmlBody} type="submit">
        <Save className="h-4 w-4" />
        {loading ? "Saving..." : editingId ? "Update template" : "Save template"}
      </Button>

      {previewOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-2 sm:p-4" role="dialog" aria-modal="true" aria-label="Email preview">
          <div className="flex h-[92vh] w-full max-w-[92rem] flex-col overflow-hidden rounded-md border bg-background shadow-xl">
            <div className="flex items-center gap-3 border-b px-4 py-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold">Email preview</p>
                <p className="truncate text-xs text-muted-foreground">{renderedSubject}</p>
              </div>
              <Button className="ml-auto" size="icon" type="button" variant="ghost" onClick={() => setPreviewOpen(false)} aria-label="Close preview">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-auto bg-muted p-2 sm:p-3">
              <div className="mx-auto w-full max-w-[86rem] overflow-hidden rounded-md border bg-white shadow-sm">
                <iframe className="h-[80vh] w-full bg-white" sandbox="" srcDoc={previewHtml} title="Email template preview" />
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </form>
  );
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label className="space-y-2 text-sm font-medium">
      <span>{label}</span>
      <Input type="number" value={value} onChange={(event) => onChange(Number(event.target.value))} />
    </label>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="space-y-2 text-sm font-medium">
      <span>{label}</span>
      <div className="flex gap-2">
        <Input className="h-9 w-12 p-1" type="color" value={value} onChange={(event) => onChange(event.target.value)} />
        <Input value={value} onChange={(event) => onChange(event.target.value)} />
      </div>
    </label>
  );
}

function SnippetButton({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <Button size="sm" type="button" variant="outline" onClick={onClick}>
      {icon}
      {label}
    </Button>
  );
}

function renderMergeFields(value: string) {
  return value.replace(/\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g, (_match, key: string) => sampleMergeData[key] ?? "");
}

function buildPreviewHtml(body: string) {
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;background:#f1eee7;}img{max-width:100%;height:auto;}table{border-collapse:collapse;}</style></head><body>${body}</body></html>`;
}

function wrapEmailContent(content: string, options: { emailWidth: number; emailPadding: number; backgroundColor: string; contentColor: string; textColor: string }) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${options.backgroundColor};padding:${options.emailPadding}px 0;">
  <tr>
    <td align="center">
      <table role="presentation" width="${options.emailWidth}" cellpadding="0" cellspacing="0" style="max-width:${options.emailWidth}px;background:${options.contentColor};padding:${options.emailPadding}px;font-family:Arial,sans-serif;color:${options.textColor};border-radius:8px;">
        <tr>
          <td>
            ${content}
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;
}

const blocks = {
  row: `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;">
  <tr><td style="font-size:16px;line-height:1.6;">Add row content here.</td></tr>
</table>`,
  columns: `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;">
  <tr>
    <td width="50%" valign="top" style="padding-right:12px;font-size:16px;line-height:1.6;">Left column</td>
    <td width="50%" valign="top" style="padding-left:12px;font-size:16px;line-height:1.6;">Right column</td>
  </tr>
</table>`,
  image: `<img src="https://via.placeholder.com/640x260" width="640" alt="Email image" style="display:block;width:100%;max-width:640px;border-radius:8px;margin:0 0 20px;" />`,
  text: `<p style="font-size:16px;line-height:1.6;margin:0 0 20px;">Add text here.</p>`,
  button: `<a href="{{site_url}}" style="display:inline-block;background:#2f6848;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:6px;font-weight:bold;margin:0 0 20px;">Button Text</a>`,
  link: `<a href="{{site_url}}" style="color:#2f6848;text-decoration:underline;">Link text</a>`,
  divider: `<hr style="border:none;border-top:1px solid #ddd8cc;margin:24px 0;" />`,
};
