"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronLeft, ChevronRight, Plus, Send, Trash2 } from "lucide-react";
import { useDashboardActionToken } from "@/components/layout/dashboard-action-token";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { FREQUENCY_LABELS, type ExperienceFrequency } from "@/lib/experiences/types";

type TypeOption = { id: string; name: string; defaultFrequency: ExperienceFrequency; defaultDurationWeeks: number };
type FacilitatorOption = { id: string; name: string };
type Attendee = { name: string; email: string };

const STEPS = ["Trigger", "Start date", "Frequency", "Attendees", "Program", "Send"] as const;

export function ExperienceWizard({ types, facilitators }: { types: TypeOption[]; facilitators: FacilitatorOption[] }) {
  const router = useRouter();
  const actionToken = useDashboardActionToken();

  const [step, setStep] = useState(0);
  const [typeId, setTypeId] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [frequency, setFrequency] = useState<ExperienceFrequency>("weekly");
  const [durationWeeks, setDurationWeeks] = useState<number>(6);
  const [facilitatorId, setFacilitatorId] = useState<string>("");
  const [attendees, setAttendees] = useState<Attendee[]>([{ name: "", email: "" }]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedType = useMemo(() => types.find((t) => t.id === typeId) ?? null, [types, typeId]);

  function onPickType(id: string) {
    setTypeId(id);
    const t = types.find((x) => x.id === id);
    if (t) {
      setFrequency(t.defaultFrequency);
      setDurationWeeks(t.defaultDurationWeeks);
    }
  }

  const validEmails = attendees.filter((a) => a.email.includes("@"));

  const canAdvance = (() => {
    switch (step) {
      case 0: return Boolean(typeId);
      case 1: return /^\d{4}-\d{2}-\d{2}$/.test(startDate);
      case 2: return Boolean(frequency);
      case 3: return validEmails.length > 0;
      case 4: return durationWeeks >= 1;
      default: return true;
    }
  })();

  async function submit() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/experiences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actionToken,
          experienceTypeId: typeId,
          startDate,
          frequency,
          durationWeeks,
          facilitatorId: facilitatorId || null,
          attendees: validEmails,
          send: true,
        }),
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
          {/* Step 1 — Trigger / event type */}
          {step === 0 && (
            <div className="space-y-3">
              <div>
                <Label>Automation trigger — event type</Label>
                <p className="text-sm text-muted-foreground">Choose the experience this automation is for.</p>
              </div>
              {types.length ? (
                <div className="grid gap-2 sm:grid-cols-2">
                  {types.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => onPickType(t.id)}
                      className={cn(
                        "rounded-lg border p-4 text-left transition-colors",
                        typeId === t.id ? "border-primary bg-primary/5" : "hover:border-primary/40",
                      )}
                    >
                      <p className="font-medium">{t.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Default: {FREQUENCY_LABELS[t.defaultFrequency]} · {t.defaultDurationWeeks} weeks
                      </p>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No experience types yet. Create one under Experience Types first.
                </p>
              )}
            </div>
          )}

          {/* Step 2 — Start date */}
          {step === 1 && (
            <div className="max-w-xs space-y-2">
              <Label>Event start date</Label>
              <p className="text-sm text-muted-foreground">The first email goes out on this date.</p>
              <DatePicker value={startDate} onChange={setStartDate} placeholder="Select start date" />
            </div>
          )}

          {/* Step 3 — Frequency */}
          {step === 2 && (
            <div className="space-y-2">
              <Label>Frequency</Label>
              <p className="text-sm text-muted-foreground">How often the sequence sends.</p>
              <div className="flex gap-3">
                {(["weekly", "biweekly"] as ExperienceFrequency[]).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFrequency(f)}
                    className={cn(
                      "rounded-lg border px-5 py-3 text-sm font-medium transition-colors",
                      frequency === f ? "border-primary bg-primary/5 text-primary" : "hover:border-primary/40",
                    )}
                  >
                    {FREQUENCY_LABELS[f]}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4 — Attendees repeater */}
          {step === 3 && (
            <div className="space-y-3">
              <div>
                <Label>Add attendees</Label>
                <p className="text-sm text-muted-foreground">Name and email for each recipient.</p>
              </div>
              <div className="space-y-2">
                {attendees.map((a, i) => (
                  <div key={i} className="flex gap-2">
                    <Input
                      placeholder="Name"
                      value={a.name}
                      onChange={(e) => setAttendees((rows) => rows.map((r, j) => (j === i ? { ...r, name: e.target.value } : r)))}
                      className="flex-1"
                    />
                    <Input
                      placeholder="email@example.com"
                      type="email"
                      value={a.email}
                      onChange={(e) => setAttendees((rows) => rows.map((r, j) => (j === i ? { ...r, email: e.target.value } : r)))}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setAttendees((rows) => (rows.length > 1 ? rows.filter((_, j) => j !== i) : rows))}
                      aria-label="Remove attendee"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button type="button" variant="outline" size="sm" onClick={() => setAttendees((rows) => [...rows, { name: "", email: "" }])}>
                <Plus className="mr-2 h-4 w-4" /> Add attendee
              </Button>
              <p className="text-xs text-muted-foreground">{validEmails.length} valid recipient{validEmails.length === 1 ? "" : "s"}.</p>
            </div>
          )}

          {/* Step 5 — Program: duration + facilitator */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="max-w-xs space-y-2">
                <Label>Program length (weeks)</Label>
                <p className="text-sm text-muted-foreground">Number of scheduled touchpoints. A different email can be set per week under Experience Types.</p>
                <Input
                  type="number"
                  min={1}
                  max={52}
                  value={durationWeeks}
                  onChange={(e) => setDurationWeeks(Math.max(1, Math.floor(Number(e.target.value) || 1)))}
                  className="w-28"
                />
              </div>
              <div className="max-w-sm space-y-2">
                <Label>Assign facilitator</Label>
                <p className="text-sm text-muted-foreground">The facilitator who leads this group (optional).</p>
                <Select value={facilitatorId || "none"} onValueChange={(v) => setFacilitatorId(v === "none" ? "" : v)}>
                  <SelectTrigger><SelectValue placeholder="Select facilitator" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Unassigned</SelectItem>
                    {facilitators.map((f) => (
                      <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!facilitators.length && (
                  <p className="text-xs text-muted-foreground">No facilitators yet — invite a user with the Facilitator role to assign one.</p>
                )}
              </div>
            </div>
          )}

          {/* Step 6 — Review & send */}
          {step === 5 && (
            <div className="space-y-3">
              <Label>Review & send</Label>
              <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
                <Review label="Experience" value={selectedType?.name ?? "-"} />
                <Review label="Start date" value={startDate || "-"} />
                <Review label="Frequency" value={FREQUENCY_LABELS[frequency]} />
                <Review label="Weeks" value={String(durationWeeks)} />
                <Review label="Attendees" value={String(validEmails.length)} />
                <Review label="Facilitator" value={facilitators.find((f) => f.id === facilitatorId)?.name ?? "Unassigned"} />
              </dl>
              <p className="text-sm text-muted-foreground">
                Sending schedules {validEmails.length * durationWeeks} email{validEmails.length * durationWeeks === 1 ? "" : "s"}. Each goes out
                automatically on its scheduled date.
              </p>
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
          <Button type="button" onClick={() => setStep((s) => s + 1)} disabled={!canAdvance}>
            Next <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button type="button" onClick={submit} disabled={submitting || !validEmails.length}>
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
