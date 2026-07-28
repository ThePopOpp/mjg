"use client";

import { useEffect, useState } from "react";
import { useDashboardActionToken } from "@/components/layout/dashboard-action-token";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const OPTIONS = [
  { value: "immediate", label: "Immediately" },
  { value: "daily", label: "Daily digest" },
  { value: "weekly", label: "Weekly digest" },
];

export function FrequencyCard() {
  const actionToken = useDashboardActionToken();
  const [frequency, setFrequency] = useState("immediate");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/me/preferences")
      .then((r) => r.json())
      .then((d) => { if (active && d.frequency) setFrequency(d.frequency); })
      .catch(() => {})
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  async function save(value: string) {
    setFrequency(value);
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/me/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actionToken, frequency: value }),
      });
      if (res.ok) setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Frequency</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">How often you receive notification summaries.</p>
        <div className="max-w-xs space-y-1.5">
          <Label>Notification frequency</Label>
          <Select value={frequency} onValueChange={save}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        {loading ? <p className="text-xs text-muted-foreground">Loading…</p> : saving ? <p className="text-xs text-muted-foreground">Saving…</p> : saved ? <p className="text-xs text-emerald-600 dark:text-emerald-400">Saved.</p> : null}
      </CardContent>
    </Card>
  );
}
