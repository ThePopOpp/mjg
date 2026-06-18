"use client";

import { useState } from "react";
import { useDashboardActionToken } from "@/components/layout/dashboard-action-token";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DEFAULT_SMS_FIELDS } from "@/lib/sms/constants";
import { smsSegmentCount, extractSmsFields } from "@/lib/sms/templates";

interface SmsTemplate {
  id: string;
  name: string;
  slug: string;
  body: string;
  category: string;
  status: string;
  available_fields: string[];
  updated_at: string;
}

interface SmsTemplateBuilderProps {
  templates: SmsTemplate[];
}

const SAMPLE_DATA: Record<string, string> = {
  first_name: "Michael",
  last_name: "Gauthier",
  full_name: "Michael Gauthier",
  email: "michael@example.com",
  phone: "+14805550000",
  wave: "Wave 1",
  source: "Direct",
  participant_type: "General Participant",
  check_in_status: "completed",
  survey_status: "survey_sent",
  sms_opt_out_url: "https://michaeljgauthier.com/sms/opt-out",
  site_url: "https://michaeljgauthier.com",
};

export function SmsTemplateBuilder({ templates: initialTemplates }: SmsTemplateBuilderProps) {
  const token = useDashboardActionToken();
  const [templates, setTemplates] = useState<SmsTemplate[]>(initialTemplates);
  const [editing, setEditing] = useState<SmsTemplate | null>(null);
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("general");
  const [status, setStatus] = useState("draft");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  const segments = smsSegmentCount(body);
  const fields = extractSmsFields(body);
  const preview = body.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, k) => SAMPLE_DATA[k] ?? `[${k}]`);

  function startNew() {
    setEditing(null);
    setName("");
    setBody("");
    setCategory("general");
    setStatus("draft");
    setSaveMsg("");
  }

  function startEdit(tpl: SmsTemplate) {
    setEditing(tpl);
    setName(tpl.name);
    setBody(tpl.body);
    setCategory(tpl.category);
    setStatus(tpl.status);
    setSaveMsg("");
  }

  function insertField(field: string) {
    setBody((prev) => prev + `{{${field}}}`);
  }

  async function handleSave() {
    if (!name.trim() || !body.trim()) return;
    setSaving(true);
    setSaveMsg("");
    try {
      const res = await fetch("/api/admin/sms/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actionToken: token,
          id: editing?.id ?? null,
          name,
          body,
          category,
          status,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSaveMsg("Template saved.");
        const freshRes = await fetch("/api/admin/sms/templates?status=all", {
          headers: { "x-mjg-action-token": token ?? "" },
        });
        const freshData = await freshRes.json();
        setTemplates(freshData.templates ?? []);
      } else {
        setSaveMsg(data.error ?? "Failed to save.");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_1.5fr]">
      {/* Template list */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Saved templates</h3>
          <Button size="sm" variant="outline" onClick={startNew}>New template</Button>
        </div>
        <div className="space-y-2">
          {templates.length === 0 && (
            <p className="text-sm text-muted-foreground">No templates yet. Create your first one.</p>
          )}
          {templates.map((tpl) => (
            <div
              key={tpl.id}
              className={`cursor-pointer rounded-lg border p-3 transition-colors hover:bg-accent ${editing?.id === tpl.id ? "border-primary bg-accent" : ""}`}
              onClick={() => startEdit(tpl)}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium">{tpl.name}</span>
                <Badge variant={tpl.status === "active" ? "default" : "secondary"} className="text-xs">
                  {tpl.status}
                </Badge>
              </div>
              <p className="mt-1 text-xs text-muted-foreground truncate">{tpl.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Editor */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>{editing ? `Editing: ${editing.name}` : "New template"}</CardTitle>
            <CardDescription>Use {"{{field_name}}"} for dynamic personalization</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Template name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Check-In Reminder" className="mt-1" />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm">
                  <option value="general">General</option>
                  <option value="reminder">Reminder</option>
                  <option value="follow_up">Follow-up</option>
                  <option value="announcement">Announcement</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)} className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm">
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-muted-foreground">Message body</label>
                <span className="text-xs text-muted-foreground">{body.length} chars · {segments} segment{segments !== 1 ? "s" : ""}</span>
              </div>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={6}
                maxLength={1600}
                placeholder="Hi {{first_name}}, ..."
                className="w-full resize-none rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>

            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">Dynamic fields</p>
              <div className="flex flex-wrap gap-1">
                {DEFAULT_SMS_FIELDS.map((f) => (
                  <button
                    key={f}
                    onClick={() => insertField(f)}
                    className="rounded bg-muted px-2 py-0.5 font-mono text-xs hover:bg-accent transition-colors"
                  >
                    {"{{"}{f}{"}}"}
                  </button>
                ))}
              </div>
            </div>

            {fields.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Fields used in this template</p>
                <div className="flex flex-wrap gap-1">
                  {fields.map((f) => <Badge key={f} variant="outline" className="font-mono text-xs">{f}</Badge>)}
                </div>
              </div>
            )}

            {saveMsg && (
              <p className={`text-sm ${saveMsg.includes("saved") ? "text-green-600" : "text-destructive"}`}>{saveMsg}</p>
            )}

            <Button onClick={handleSave} disabled={saving || !name.trim() || !body.trim()} className="w-full">
              {saving ? "Saving…" : "Save template"}
            </Button>
          </CardContent>
        </Card>

        {body && (
          <Card>
            <CardHeader><CardTitle>Preview</CardTitle></CardHeader>
            <CardContent>
              <div className="rounded-lg bg-muted p-4 font-sans text-sm whitespace-pre-wrap">{preview}</div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
