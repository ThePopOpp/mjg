"use client";

import { useEffect, useState } from "react";
import { Mail, MessageSquare } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useDashboardActionToken } from "@/components/layout/dashboard-action-token";

export function DmSettingsCard() {
  const token = useDashboardActionToken();
  const [email, setEmail] = useState(true);
  const [sms, setSms] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/direct-messages/preferences")
      .then((r) => r.json())
      .then((d) => { if (d.prefs) { setEmail(Boolean(d.prefs.email)); setSms(Boolean(d.prefs.sms)); } })
      .finally(() => setLoaded(true));
  }, []);

  async function save(next: { email: boolean; sms: boolean }) {
    setEmail(next.email);
    setSms(next.sms);
    await fetch("/api/direct-messages/preferences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ actionToken: token, ...next }),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Direct Messages</CardTitle>
        <CardDescription>Choose how you&rsquo;re alerted about new direct messages. Alerts are debounced, so an active back-and-forth won&rsquo;t spam you.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <label className="flex items-center justify-between gap-3 rounded-md border bg-card/60 p-3">
          <span className="flex items-center gap-2.5 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span><span className="font-medium">Email me</span> about new messages</span>
          </span>
          <Switch checked={email} disabled={!loaded} onCheckedChange={(v) => save({ email: v, sms })} />
        </label>
        <label className="flex items-center justify-between gap-3 rounded-md border bg-card/60 p-3">
          <span className="flex items-center gap-2.5 text-sm">
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            <span><span className="font-medium">Text me</span> about new messages <span className="text-muted-foreground">(requires a phone number + SMS opt-in)</span></span>
          </span>
          <Switch checked={sms} disabled={!loaded} onCheckedChange={(v) => save({ email, sms: v })} />
        </label>
        {saved ? <p className="text-xs text-muted-foreground">Saved.</p> : null}
      </CardContent>
    </Card>
  );
}
