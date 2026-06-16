"use client";

import { FormEvent, useEffect, useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDashboardActionToken } from "@/components/layout/dashboard-action-token";

type TemplateOption = { id: string; name: string; status: string };

export function DeployEmailForm({ templates, defaultEmail }: { templates: TemplateOption[]; defaultEmail: string }) {
  const actionToken = useDashboardActionToken();
  const activeTemplates = templates.filter((template) => template.status !== "archived");
  const [templateId, setTemplateId] = useState(activeTemplates[0]?.id ?? "");
  const [mode, setMode] = useState<"test" | "audience">("test");
  const [testEmail, setTestEmail] = useState(defaultEmail);
  const [audience, setAudience] = useState<"profiles" | "participants">("profiles");
  const [limit, setLimit] = useState(25);
  const [recipientCount, setRecipientCount] = useState<number | null>(null);
  const [testSent, setTestSent] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [countLoading, setCountLoading] = useState(false);

  useEffect(() => {
    setTestSent(false);
  }, [templateId]);

  useEffect(() => {
    if (mode !== "audience") return;
    let active = true;
    setCountLoading(true);
    setRecipientCount(null);
    fetch("/api/admin/email/recipient-count", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-mjg-action-token": actionToken },
      body: JSON.stringify({ audience, actionToken }),
    })
      .then((response) => response.json())
      .then((payload) => {
        if (!active) return;
        setRecipientCount(typeof payload.count === "number" ? payload.count : null);
      })
      .catch(() => {
        if (active) setRecipientCount(null);
      })
      .finally(() => {
        if (active) setCountLoading(false);
      });
    return () => {
      active = false;
    };
  }, [actionToken, audience, mode]);

  async function deploy(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (mode === "audience" && !testSent) {
      setError("Send a test email first, then deploy to the audience.");
      return;
    }
    if (mode === "audience" && !window.confirm(`Send this email to up to ${Math.min(limit, recipientCount ?? limit)} ${audience}?`)) {
      return;
    }
    setLoading(true);
    setMessage(null);
    setError(null);

    const response = await fetch("/api/admin/email/deploy", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-mjg-action-token": actionToken },
      body: JSON.stringify({ templateId, mode, testEmail, audience, limit, testSent, actionToken }),
    });
    const payload = await response.json();

    if (!response.ok) {
      setError(payload.error ?? "Email deployment failed.");
      setLoading(false);
      return;
    }

    if (mode === "test" && payload.sent > 0) setTestSent(true);
    setMessage(`Sent ${payload.sent}, skipped ${payload.skipped}, failed ${payload.failed}.`);
    setLoading(false);
  }

  return (
    <form className="space-y-4" onSubmit={deploy}>
      <label className="space-y-2 text-sm font-medium">
        <span>Template</span>
        <Select value={templateId} onValueChange={setTemplateId}>
          <SelectTrigger>
            <SelectValue placeholder="Choose template" />
          </SelectTrigger>
          <SelectContent>
            {activeTemplates.map((template) => <SelectItem key={template.id} value={template.id}>{template.name} ({template.status})</SelectItem>)}
          </SelectContent>
        </Select>
      </label>
      <label className="space-y-2 text-sm font-medium">
        <span>Mode</span>
        <Select value={mode} onValueChange={(value) => setMode(value as "test" | "audience")}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="test">Test email</SelectItem>
            <SelectItem value="audience">Deploy to audience</SelectItem>
          </SelectContent>
        </Select>
      </label>
      {mode === "test" ? (
        <label className="space-y-2 text-sm font-medium">
          <span>Test recipient</span>
          <Input onChange={(event) => setTestEmail(event.target.value)} required type="email" value={testEmail} />
        </label>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm font-medium">
            <span>Audience</span>
            <Select value={audience} onValueChange={(value) => setAudience(value as "profiles" | "participants")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="profiles">Active dashboard users</SelectItem>
                <SelectItem value="participants">Participants</SelectItem>
              </SelectContent>
            </Select>
          </label>
          <label className="space-y-2 text-sm font-medium">
            <span>Limit</span>
            <Input min={1} max={100} onChange={(event) => setLimit(Number(event.target.value))} type="number" value={limit} />
          </label>
        </div>
      )}
      <div className="rounded-md bg-muted p-3 text-xs text-muted-foreground">
        {mode === "test" ? (
          <span>{testSent ? "Test sent for this template. Audience deploy is now unlocked." : "Send a test email first to unlock audience deploy."}</span>
        ) : (
          <span>
            {countLoading ? "Counting recipients..." : `Audience has ${recipientCount ?? "unknown"} eligible recipients.`} Deploy will send immediately to the current limit after confirmation.
          </span>
        )}
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {message ? <p className="text-sm text-primary">{message}</p> : null}
      <Button disabled={loading || !templateId || (mode === "audience" && !testSent)} type="submit">
        <Send className="h-4 w-4" />
        {loading ? "Sending..." : mode === "test" ? "Send test" : "Deploy email"}
      </Button>
    </form>
  );
}
