"use client";

import { FormEvent, useMemo, useState } from "react";
import { Link as LinkIcon, Save } from "lucide-react";
import { EMAIL_EVENT_KEYS, type EmailEventKey } from "@/lib/email/constants";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

type TemplateOption = { id: string; name: string; status: string };
type Mapping = {
  id?: string;
  event_key: EmailEventKey;
  template_id?: string | null;
  enabled?: boolean;
};

export function TemplateMappingForm({ templates, mappings }: { templates: TemplateOption[]; mappings: Mapping[] }) {
  const activeTemplates = templates.filter((template) => template.status !== "archived");
  const mappingByEvent = useMemo(() => new Map(mappings.map((mapping) => [mapping.event_key, mapping])), [mappings]);
  const [eventKey, setEventKey] = useState<EmailEventKey>("user_invitation");
  const current = mappingByEvent.get(eventKey);
  const [templateId, setTemplateId] = useState(current?.template_id ?? "");
  const [enabled, setEnabled] = useState(current?.enabled !== false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function changeEvent(nextEventKey: EmailEventKey) {
    const next = mappingByEvent.get(nextEventKey);
    setEventKey(nextEventKey);
    setTemplateId(next?.template_id ?? "");
    setEnabled(next?.enabled !== false);
    setMessage(null);
    setError(null);
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    const response = await fetch("/api/admin/email/template-mappings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventKey, templateId: templateId || null, enabled }),
    });
    const payload = await response.json();
    if (!response.ok) {
      setError(payload.error ?? "Unable to save mapping.");
      setLoading(false);
      return;
    }

    setMessage("Email event mapping saved.");
    setLoading(false);
  }

  const selectedEvent = EMAIL_EVENT_KEYS.find((event) => event.key === eventKey);

  return (
    <form className="space-y-4" onSubmit={save}>
      <div className="grid gap-4 lg:grid-cols-[1fr_1fr_auto]">
        <label className="space-y-2 text-sm font-medium">
          <span>Event</span>
          <Select value={eventKey} onValueChange={(value) => changeEvent(value as EmailEventKey)}>
            <SelectTrigger>
              <SelectValue placeholder="Choose event" />
            </SelectTrigger>
            <SelectContent>
            {EMAIL_EVENT_KEYS.map((event) => (
              <SelectItem key={event.key} value={event.key}>{event.label}</SelectItem>
            ))}
            </SelectContent>
          </Select>
        </label>
        <label className="space-y-2 text-sm font-medium">
          <span>Template</span>
          <Select value={templateId || "none"} onValueChange={(value) => setTemplateId(value === "none" ? "" : value)}>
            <SelectTrigger>
              <SelectValue placeholder="Choose template" />
            </SelectTrigger>
            <SelectContent>
            <SelectItem value="none">No template assigned</SelectItem>
            {activeTemplates.map((template) => (
              <SelectItem key={template.id} value={template.id}>{template.name} ({template.status})</SelectItem>
            ))}
            </SelectContent>
          </Select>
        </label>
        <label className="flex items-end gap-3 pb-2 text-sm font-medium">
          <Switch checked={enabled} onCheckedChange={setEnabled} aria-label="Toggle email automation" />
          <span>{enabled ? "Enabled" : "Disabled"}</span>
        </label>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-md bg-muted p-3 text-sm text-muted-foreground">
        <span className="flex items-center gap-2">
          <LinkIcon className="h-4 w-4" />
          {selectedEvent?.description ?? "Choose which template should be used for this email event."}
        </span>
        <Button disabled={loading} type="submit">
          <Save className="h-4 w-4" />
          {loading ? "Saving..." : "Save mapping"}
        </Button>
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {message ? <p className="text-sm text-primary">{message}</p> : null}
    </form>
  );
}
