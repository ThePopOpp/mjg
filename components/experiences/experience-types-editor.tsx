"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Save } from "lucide-react";
import { useDashboardActionToken } from "@/components/layout/dashboard-action-token";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { FREQUENCY_LABELS, type ExperienceFrequency } from "@/lib/experiences/types";

type StepInput = { step_number: number; label: string | null; email_template_id: string | null };
type TypeInput = {
  id: string;
  name: string;
  description: string | null;
  default_frequency: ExperienceFrequency;
  default_duration_weeks: number;
  steps: StepInput[];
};
type TemplateOption = { id: string; name: string };

const NEW = "__new__";

export function ExperienceTypesEditor({ types, templates }: { types: TypeInput[]; templates: TemplateOption[] }) {
  const router = useRouter();
  const actionToken = useDashboardActionToken();
  const [selectedId, setSelectedId] = useState<string>(types[0]?.id ?? NEW);

  const selected = useMemo(() => types.find((t) => t.id === selectedId) ?? null, [types, selectedId]);

  return (
    <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
      <div className="space-y-1">
        {types.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setSelectedId(t.id)}
            className={cn(
              "block w-full rounded-md px-3 py-2 text-left text-sm transition-colors",
              selectedId === t.id ? "bg-primary/10 font-medium text-primary" : "hover:bg-accent",
            )}
          >
            {t.name}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setSelectedId(NEW)}
          className={cn(
            "mt-1 flex w-full items-center gap-1.5 rounded-md px-3 py-2 text-left text-sm transition-colors",
            selectedId === NEW ? "bg-primary/10 font-medium text-primary" : "hover:bg-accent",
          )}
        >
          <Plus className="h-4 w-4" /> New type
        </button>
      </div>

      <TypeForm
        key={selectedId}
        initial={selected}
        templates={templates}
        actionToken={actionToken}
        onSaved={() => router.refresh()}
      />
    </div>
  );
}

function TypeForm({
  initial,
  templates,
  actionToken,
  onSaved,
}: {
  initial: TypeInput | null;
  templates: TemplateOption[];
  actionToken: string;
  onSaved: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [frequency, setFrequency] = useState<ExperienceFrequency>(initial?.default_frequency ?? "weekly");
  const [durationWeeks, setDurationWeeks] = useState<number>(initial?.default_duration_weeks ?? 6);
  const [stepTemplates, setStepTemplates] = useState<Record<number, string>>(() => {
    const map: Record<number, string> = {};
    for (const s of initial?.steps ?? []) if (s.email_template_id) map[s.step_number] = s.email_template_id;
    return map;
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  // Render enough rows for the default weeks AND every existing step, so a sequence longer
  // than "Default weeks" (e.g. the bi-weekly challenge) is never hidden — or truncated on save.
  const maxStep = (initial?.steps ?? []).reduce((m, s) => Math.max(m, s.step_number), 0);
  const weeks = Array.from({ length: Math.max(1, durationWeeks, maxStep) }, (_, i) => i + 1);

  async function save() {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const steps = weeks.map((w) => ({
        stepNumber: w,
        emailTemplateId: stepTemplates[w] || null,
      }));
      const res = await fetch("/api/admin/experiences/types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actionToken,
          id: initial?.id,
          name,
          description,
          defaultFrequency: frequency,
          defaultDurationWeeks: durationWeeks,
          steps,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to save.");
      setSaved(true);
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardContent className="space-y-5 p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="6 Week Challenge" />
          </div>
          <div className="space-y-1.5">
            <Label>Default cadence</Label>
            <Select value={frequency} onValueChange={(v) => setFrequency(v as ExperienceFrequency)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">{FREQUENCY_LABELS.weekly}</SelectItem>
                <SelectItem value="biweekly">{FREQUENCY_LABELS.biweekly}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Description</Label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
        </div>

        <div className="max-w-[10rem] space-y-1.5">
          <Label>Default weeks</Label>
          <Input
            type="number"
            min={1}
            max={52}
            value={durationWeeks}
            onChange={(e) => setDurationWeeks(Math.max(1, Math.floor(Number(e.target.value) || 1)))}
          />
        </div>

        <div className="space-y-2">
          <Label>Weekly email sequence</Label>
          <p className="text-sm text-muted-foreground">Pick the email template that goes out each week. Leave a week blank to skip it.</p>
          <div className="space-y-2">
            {weeks.map((w) => (
              <div key={w} className="flex items-center gap-3">
                <span className="w-16 shrink-0 text-sm text-muted-foreground">Week {w}</span>
                <Select
                  value={stepTemplates[w] ?? "none"}
                  onValueChange={(v) => setStepTemplates((m) => ({ ...m, [w]: v === "none" ? "" : v }))}
                >
                  <SelectTrigger className="max-w-md"><SelectValue placeholder="No email" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No email</SelectItem>
                    {templates.map((tpl) => (
                      <SelectItem key={tpl.id} value={tpl.id}>{tpl.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
          {!templates.length && (
            <p className="text-xs text-muted-foreground">No email templates found. Create templates under Emails first.</p>
          )}
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}
        {saved && <p className="text-sm text-emerald-600 dark:text-emerald-400">Saved.</p>}

        <Button type="button" onClick={save} disabled={saving || !name.trim()}>
          <Save className="mr-2 h-4 w-4" /> {saving ? "Saving…" : initial ? "Save type" : "Create type"}
        </Button>
      </CardContent>
    </Card>
  );
}
