"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronLeft, ChevronRight, Plus, Send, Trash2, FlaskConical } from "lucide-react";
import { useDashboardActionToken } from "@/components/layout/dashboard-action-token";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { TimePicker } from "@/components/ui/time-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { computeStepDate, defaultStepOffsets } from "@/lib/experiences/schedule";
import { FREQUENCY_LABELS, OFFSET_UNIT_LABELS, OFFSET_UNITS, type ExperienceFrequency, type OffsetUnit } from "@/lib/experiences/types";

type TypeStep = { stepNumber: number; emailTemplateId: string | null; offsetValue?: number | null; offsetUnit?: OffsetUnit | null };
type TypeOption = {
  id: string;
  name: string;
  category: string | null;
  defaultFrequency: ExperienceFrequency;
  defaultDurationWeeks: number;
  steps: TypeStep[];
};
type TemplateOption = { id: string; name: string };
type FacilitatorOption = { id: string; name: string };
type Attendee = { name: string; email: string };
type Step = { emailTemplateId: string; offsetValue: number; offsetUnit: OffsetUnit };

const STEPS = ["Trigger", "Start date", "Frequency", "Attendees", "Program", "Selections", "Send"] as const;

// Rebuild the step list to `count` rows: offsets come from the cadence, templates are
// carried from `existing` (or a type's prefilled templates) where available.
function buildSteps(
  count: number,
  frequency: ExperienceFrequency,
  custom: { value: number; unit: OffsetUnit } | null,
  existing: Step[],
  typeTemplates?: (string | null)[],
): Step[] {
  const offsets = defaultStepOffsets(frequency, count, custom);
  return offsets.map((o, i) => ({
    emailTemplateId: existing[i]?.emailTemplateId || typeTemplates?.[i] || "",
    offsetValue: o.offsetValue,
    offsetUnit: o.offsetUnit,
  }));
}

export function ExperienceWizard({
  types,
  templates,
  facilitators,
  previewId = null,
}: {
  types: TypeOption[];
  templates: TemplateOption[];
  facilitators: FacilitatorOption[];
  previewId?: string | null;
}) {
  const router = useRouter();
  const actionToken = useDashboardActionToken();

  const [step, setStep] = useState(0);
  const [custom, setCustom] = useState(false); // "New Experience" toggle
  const [typeId, setTypeId] = useState("");
  const [customName, setCustomName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [frequency, setFrequency] = useState<ExperienceFrequency>("weekly");
  const [freqCustom, setFreqCustom] = useState(false);
  const [intervalValue, setIntervalValue] = useState(1);
  const [intervalUnit, setIntervalUnit] = useState<OffsetUnit>("week");
  const [attendees, setAttendees] = useState<Attendee[]>([{ name: "", email: "" }]);
  const [facilitatorId, setFacilitatorId] = useState("");
  const [steps, setSteps] = useState<Step[]>([{ emailTemplateId: "", offsetValue: 0, offsetUnit: "week" }]);
  const [testEmail, setTestEmail] = useState("");
  const [testMsg, setTestMsg] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedType = useMemo(() => types.find((t) => t.id === typeId) ?? null, [types, typeId]);
  const customInterval = freqCustom || frequency === "custom" ? { value: Math.max(1, intervalValue), unit: intervalUnit } : null;
  const effectiveFrequency: ExperienceFrequency = customInterval ? "custom" : frequency;

  const grouped = useMemo(() => {
    const g: Record<string, TypeOption[]> = {};
    for (const t of types) (g[t.category || "Other"] ||= []).push(t);
    return g;
  }, [types]);

  function pickType(t: TypeOption) {
    setCustom(false);
    setTypeId(t.id);
    setCustomName("");
    setFrequency(t.defaultFrequency === "custom" ? "weekly" : t.defaultFrequency);
    setFreqCustom(t.defaultFrequency === "custom");
    const ordered = t.steps.slice().sort((a, b) => a.stepNumber - b.stepNumber);
    // If the type defines its own sequence (with per-step offsets), honor it verbatim — this
    // preserves non-uniform schedules like the 6-Week Challenge. Otherwise fall back to the
    // uniform cadence pre-fill from the default duration.
    if (ordered.length && ordered.some((s) => s.offsetValue != null)) {
      setSteps(
        ordered.map((s) => ({
          emailTemplateId: s.emailTemplateId ?? "",
          offsetValue: Math.max(0, s.offsetValue ?? 0),
          offsetUnit: s.offsetUnit ?? "day",
        })),
      );
      return;
    }
    const count = Math.max(1, t.defaultDurationWeeks);
    const tmpls = Array.from({ length: count }, (_, i) => ordered.find((s) => s.stepNumber === i + 1)?.emailTemplateId ?? null);
    setSteps(buildSteps(count, t.defaultFrequency, null, [], tmpls));
  }

  function enableCustom(on: boolean) {
    setCustom(on);
    if (on) {
      setTypeId("");
      setSteps((prev) => (prev.length ? prev : [{ emailTemplateId: "", offsetValue: 0, offsetUnit: "week" }]));
    }
  }

  function setLength(count: number) {
    const c = Math.max(1, Math.min(52, Math.floor(count) || 1));
    setSteps((prev) => buildSteps(c, effectiveFrequency, customInterval, prev, selectedType?.steps.map((s) => s.emailTemplateId ?? null)));
  }

  function regenerateOffsets(freq: ExperienceFrequency, ci: { value: number; unit: OffsetUnit } | null) {
    setSteps((prev) => buildSteps(prev.length, freq, ci, prev));
  }

  const validEmails = attendees.filter((a) => a.email.includes("@"));

  const canAdvance = (() => {
    switch (step) {
      case 0: return custom ? customName.trim().length > 0 : Boolean(typeId);
      case 1: return /^\d{4}-\d{2}-\d{2}$/.test(startDate) && /^\d{2}:\d{2}$/.test(startTime);
      case 2: return true;
      case 3: return validEmails.length > 0;
      case 4: return steps.length >= 1;
      case 5: return steps.some((s) => s.emailTemplateId);
      default: return true;
    }
  })();

  function payload(send: boolean) {
    return {
      actionToken,
      experienceTypeId: custom ? null : typeId,
      name: custom ? customName : undefined,
      startDate,
      startTime,
      frequency: effectiveFrequency,
      customIntervalValue: customInterval?.value ?? null,
      customIntervalUnit: customInterval?.unit ?? null,
      durationWeeks: steps.length,
      facilitatorId: facilitatorId || null,
      previewId: previewId || null,
      attendees: validEmails,
      steps: steps.map((s) => ({ emailTemplateId: s.emailTemplateId || null, offsetValue: s.offsetValue, offsetUnit: s.offsetUnit })),
      send,
    };
  }

  async function submit() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/experiences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload(true)),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to send experience.");
      router.push(`/dashboard/experiences/${data.experience.id}`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setSubmitting(false);
    }
  }

  async function sendTest() {
    setTesting(true);
    setTestMsg(null);
    try {
      const res = await fetch("/api/admin/experiences/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actionToken,
          testEmail,
          name: custom ? customName : selectedType?.name,
          steps: steps.map((s) => ({ emailTemplateId: s.emailTemplateId || null, offsetValue: s.offsetValue, offsetUnit: s.offsetUnit })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Test failed.");
      setTestMsg(`Sent ${data.sent} test email${data.sent === 1 ? "" : "s"} to ${testEmail}.`);
    } catch (e) {
      setTestMsg(e instanceof Error ? e.message : "Test failed.");
    } finally {
      setTesting(false);
    }
  }

  const templateName = (id: string) => templates.find((t) => t.id === id)?.name ?? "No email";

  return (
    <div className="space-y-6">
      {/* Stepper */}
      <div className="flex flex-wrap items-center gap-2">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => i < step && setStep(i)}
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                i === step ? "bg-primary text-primary-foreground" : i < step ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground",
              )}
            >
              {i < step ? <Check className="h-4 w-4" /> : i + 1}
            </button>
            <span className={cn("text-sm", i === step ? "font-medium" : "text-muted-foreground")}>{label}</span>
            {i < STEPS.length - 1 && <ChevronRight className="h-4 w-4 text-muted-foreground/50" />}
          </div>
        ))}
      </div>

      <Card>
        <CardContent className="space-y-5 p-6">
          {/* Step 1 — Trigger */}
          {step === 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <Label>Automation trigger — event type</Label>
                  <p className="text-sm text-muted-foreground">Choose what this automation is for.</p>
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">New Experience</span>
                  <Switch checked={custom} onCheckedChange={enableCustom} />
                </label>
              </div>

              {custom ? (
                <div className="max-w-md space-y-1.5">
                  <Label>Experience name</Label>
                  <Input value={customName} onChange={(e) => setCustomName(e.target.value)} placeholder="Name your experience" />
                  <p className="text-xs text-muted-foreground">You&apos;ll build its email sequence in the Selections step.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(grouped).map(([category, list]) => (
                    <div key={category} className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{category}</p>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {list.map((t) => (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => pickType(t)}
                            className={cn("rounded-lg border p-4 text-left transition-colors", typeId === t.id ? "border-primary bg-primary/5" : "hover:border-primary/40")}
                          >
                            <p className="font-medium">{t.name}</p>
                            <p className="mt-1 text-xs text-muted-foreground">Default: {FREQUENCY_LABELS[t.defaultFrequency]} · {t.defaultDurationWeeks} steps</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 2 — Start date + time */}
          {step === 1 && (
            <div className="flex flex-wrap gap-4">
              <div className="w-56 space-y-1.5">
                <Label>Event start date</Label>
                <DatePicker value={startDate} onChange={setStartDate} placeholder="Select start date" />
              </div>
              <div className="w-40 space-y-1.5">
                <Label>Start time</Label>
                <TimePicker value={startTime} onChange={setStartTime} />
                <p className="text-xs text-muted-foreground">The first email goes out then.</p>
              </div>
            </div>
          )}

          {/* Step 3 — Frequency */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <Label>Frequency</Label>
                <p className="text-sm text-muted-foreground">How often the sequence sends. This sets the default spacing — fine-tune each step under Selections.</p>
              </div>
              <div className={cn("flex gap-3", freqCustom && "opacity-40 pointer-events-none")}>
                {(["weekly", "biweekly"] as ExperienceFrequency[]).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => { setFrequency(f); regenerateOffsets(f, null); }}
                    className={cn("rounded-lg border px-5 py-3 text-sm font-medium transition-colors", frequency === f && !freqCustom ? "border-primary bg-primary/5 text-primary" : "hover:border-primary/40")}
                  >
                    {FREQUENCY_LABELS[f]}
                  </button>
                ))}
              </div>
              <label className="flex items-center gap-2 text-sm">
                <Switch checked={freqCustom} onCheckedChange={(on) => { setFreqCustom(on); regenerateOffsets(on ? "custom" : frequency, on ? { value: Math.max(1, intervalValue), unit: intervalUnit } : null); }} />
                <span>Customize</span>
              </label>
              {freqCustom && (
                <div className="flex items-end gap-2">
                  <span className="pb-2 text-sm text-muted-foreground">Send every</span>
                  <div className="w-24">
                    <Input type="number" min={1} value={intervalValue} onChange={(e) => { const v = Math.max(1, Math.floor(Number(e.target.value) || 1)); setIntervalValue(v); regenerateOffsets("custom", { value: v, unit: intervalUnit }); }} />
                  </div>
                  <div className="w-36">
                    <Select value={intervalUnit} onValueChange={(u) => { setIntervalUnit(u as OffsetUnit); regenerateOffsets("custom", { value: Math.max(1, intervalValue), unit: u as OffsetUnit }); }}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{OFFSET_UNITS.map((u) => <SelectItem key={u} value={u}>{OFFSET_UNIT_LABELS[u]}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 4 — Attendees */}
          {step === 3 && (
            <div className="space-y-3">
              <div>
                <Label>Add attendees</Label>
                <p className="text-sm text-muted-foreground">Name and email for each recipient.</p>
              </div>
              <div className="space-y-2">
                {attendees.map((a, i) => (
                  <div key={i} className="flex gap-2">
                    <Input placeholder="Name" value={a.name} onChange={(e) => setAttendees((rows) => rows.map((r, j) => (j === i ? { ...r, name: e.target.value } : r)))} className="flex-1" />
                    <Input placeholder="email@example.com" type="email" value={a.email} onChange={(e) => setAttendees((rows) => rows.map((r, j) => (j === i ? { ...r, email: e.target.value } : r)))} className="flex-1" />
                    <Button type="button" variant="ghost" size="icon" onClick={() => setAttendees((rows) => (rows.length > 1 ? rows.filter((_, j) => j !== i) : rows))} aria-label="Remove attendee"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                ))}
              </div>
              <Button type="button" variant="outline" size="sm" onClick={() => setAttendees((rows) => [...rows, { name: "", email: "" }])}><Plus className="mr-2 h-4 w-4" /> Add attendee</Button>
              <p className="text-xs text-muted-foreground">{validEmails.length} valid recipient{validEmails.length === 1 ? "" : "s"}.</p>
            </div>
          )}

          {/* Step 5 — Program */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="max-w-xs space-y-1.5">
                <Label>Number of emails (steps)</Label>
                <p className="text-sm text-muted-foreground">How many touchpoints. Assign a template + timing to each under Selections.</p>
                <Input type="number" min={1} max={52} value={steps.length} onChange={(e) => setLength(Number(e.target.value))} className="w-28" />
              </div>
              <div className="max-w-sm space-y-1.5">
                <Label>Assign facilitator</Label>
                <p className="text-sm text-muted-foreground">The facilitator who leads this group (optional).</p>
                <Select value={facilitatorId || "none"} onValueChange={(v) => setFacilitatorId(v === "none" ? "" : v)}>
                  <SelectTrigger><SelectValue placeholder="Select facilitator" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Unassigned</SelectItem>
                    {facilitators.map((f) => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                {!facilitators.length && <p className="text-xs text-muted-foreground">No facilitators yet — invite a user with the Facilitator role to assign one.</p>}
              </div>
            </div>
          )}

          {/* Step 6 — Selections (per-step template + timing) */}
          {step === 5 && (
            <div className="space-y-3">
              <div>
                <Label>Selections — email per step</Label>
                <p className="text-sm text-muted-foreground">Assign a template and when it sends. Timing is an offset from the start date/time.</p>
              </div>
              <div className="space-y-2">
                {steps.map((s, i) => {
                  const when = /^\d{4}-\d{2}-\d{2}$/.test(startDate)
                    ? computeStepDate(startDate, startTime, s.offsetValue, s.offsetUnit).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })
                    : null;
                  return (
                    <div key={i} className="flex flex-wrap items-end gap-2 rounded-lg border p-3">
                      <span className="pb-2 text-sm font-medium text-muted-foreground w-14">#{i + 1}</span>
                      <div className="min-w-[12rem] flex-1 space-y-1">
                        <Label className="text-xs">Email template</Label>
                        <Select value={s.emailTemplateId || "none"} onValueChange={(v) => setSteps((rows) => rows.map((r, j) => (j === i ? { ...r, emailTemplateId: v === "none" ? "" : v } : r)))}>
                          <SelectTrigger><SelectValue placeholder="No email" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No email</SelectItem>
                            {templates.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="w-20 space-y-1">
                        <Label className="text-xs">After</Label>
                        <Input type="number" min={0} value={s.offsetValue} onChange={(e) => setSteps((rows) => rows.map((r, j) => (j === i ? { ...r, offsetValue: Math.max(0, Math.floor(Number(e.target.value) || 0)) } : r)))} />
                      </div>
                      <div className="w-32 space-y-1">
                        <Label className="text-xs">Unit</Label>
                        <Select value={s.offsetUnit} onValueChange={(u) => setSteps((rows) => rows.map((r, j) => (j === i ? { ...r, offsetUnit: u as OffsetUnit } : r)))}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>{OFFSET_UNITS.map((u) => <SelectItem key={u} value={u}>{OFFSET_UNIT_LABELS[u]}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div className="min-w-[9rem] flex-1 pb-2 text-xs text-muted-foreground">{when ? `Sends ${when}` : "Set a start date to preview"}</div>
                      <Button type="button" variant="ghost" size="icon" onClick={() => setSteps((rows) => (rows.length > 1 ? rows.filter((_, j) => j !== i) : rows))} aria-label="Remove step"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  );
                })}
              </div>
              <Button type="button" variant="outline" size="sm" onClick={() => setSteps((rows) => [...rows, { emailTemplateId: "", offsetValue: rows.length * (customInterval?.value ?? (frequency === "biweekly" ? 2 : 1)), offsetUnit: customInterval?.unit ?? "week" }])}>
                <Plus className="mr-2 h-4 w-4" /> Add step
              </Button>
            </div>
          )}

          {/* Step 7 — Send + Test */}
          {step === 6 && (
            <div className="space-y-5">
              <div className="space-y-3">
                <Label>Review</Label>
                <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
                  <Review label="Experience" value={custom ? customName : selectedType?.name ?? "-"} />
                  <Review label="Start" value={startDate ? `${startDate} ${startTime}` : "-"} />
                  <Review label="Cadence" value={customInterval ? `Every ${customInterval.value} ${OFFSET_UNIT_LABELS[customInterval.unit].toLowerCase()}` : FREQUENCY_LABELS[frequency]} />
                  <Review label="Steps" value={String(steps.length)} />
                  <Review label="Attendees" value={String(validEmails.length)} />
                  <Review label="Facilitator" value={facilitators.find((f) => f.id === facilitatorId)?.name ?? "Unassigned"} />
                </dl>
                <div className="rounded-md border">
                  {steps.map((s, i) => (
                    <div key={i} className="flex items-center justify-between border-b px-3 py-1.5 text-sm last:border-b-0">
                      <span className="text-muted-foreground">#{i + 1} · {templateName(s.emailTemplateId)}</span>
                      <span className="text-xs text-muted-foreground">{/^\d{4}-\d{2}-\d{2}$/.test(startDate) ? computeStepDate(startDate, startTime, s.offsetValue, s.offsetUnit).toLocaleString([], { dateStyle: "medium", timeStyle: "short" }) : `+${s.offsetValue} ${s.offsetUnit}`}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2 rounded-lg border bg-muted/30 p-4">
                <div className="flex items-center gap-2"><FlaskConical className="h-4 w-4 text-primary" /><Label>Test this experience</Label></div>
                <p className="text-sm text-muted-foreground">Send every configured email to a test address right now, so you can verify content and order.</p>
                <div className="flex gap-2">
                  <Input type="email" placeholder="you@example.com" value={testEmail} onChange={(e) => setTestEmail(e.target.value)} className="max-w-xs" />
                  <Button type="button" variant="outline" onClick={sendTest} disabled={testing || !testEmail.includes("@") || !steps.some((s) => s.emailTemplateId)}>
                    <FlaskConical className="mr-2 h-4 w-4" /> {testing ? "Sending…" : "Send test now"}
                  </Button>
                </div>
                {testMsg && <p className="text-sm text-muted-foreground">{testMsg}</p>}
                <p className="text-xs text-muted-foreground">Tip: for a compressed live run, set Frequency → Customize to “every 1 minute” back on step 3.</p>
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Nav */}
      <div className="flex items-center justify-between">
        <Button type="button" variant="outline" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0 || submitting}>
          <ChevronLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        {step < STEPS.length - 1 ? (
          <Button type="button" onClick={() => setStep((s) => s + 1)} disabled={!canAdvance}>Next <ChevronRight className="ml-2 h-4 w-4" /></Button>
        ) : (
          <Button type="button" onClick={submit} disabled={submitting || !validEmails.length || !steps.some((s) => s.emailTemplateId)}>
            <Send className="mr-2 h-4 w-4" /> {submitting ? "Sending…" : "Send to Recipients"}
          </Button>
        )}
      </div>
    </div>
  );
}

function Review({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border p-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 font-medium">{value}</dd>
    </div>
  );
}
