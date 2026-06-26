"use client";

import * as React from "react";
import { ArrowLeft, Calendar, Check, ChevronLeft, ChevronRight, Clock, Loader2, MapPin, Phone, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FieldSelect } from "@/components/ui/field-select";
import { cn } from "@/lib/utils";
import { groupSlotsByDate } from "@/lib/booking/availability";
import type { IntakeQuestion, Slot } from "@/lib/booking/types";

const ICONS: Record<string, typeof Video> = { video: Video, phone: Phone, in_person: MapPin, custom: Clock };

function addDaysStr(d: string, n: number) { const dt = new Date(`${d}T00:00:00Z`); dt.setUTCDate(dt.getUTCDate() + n); return dt.toISOString().slice(0, 10); }
function monthLabel(d: string) { return new Date(`${d}T00:00:00Z`).toLocaleDateString([], { month: "long", year: "numeric", timeZone: "UTC" }); }

export function BookWidget(props: {
  slug: string; name: string; description: string | null; durationMinutes: number;
  locationType: string; locationDetails: string | null; hostName: string | null; color: string | null;
  timezone: string; questions: IntakeQuestion[];
}) {
  const { slug, name, timezone } = props;
  const Icon = ICONS[props.locationType] ?? Clock;

  const [slots, setSlots] = React.useState<Slot[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [monthAnchor, setMonthAnchor] = React.useState(() => new Date().toISOString().slice(0, 10));
  const [selectedDate, setSelectedDate] = React.useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = React.useState<Slot | null>(null);
  const [step, setStep] = React.useState<"pick" | "details" | "done">("pick");

  // form
  const [name_, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [answers, setAnswers] = React.useState<Record<string, string>>({});
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<{ reference: string; message: string | null; start: string } | null>(null);

  const loadSlots = React.useCallback(async () => {
    setLoading(true);
    try {
      const from = new Date().toISOString().slice(0, 10);
      const to = addDaysStr(from, 70);
      const r = await fetch(`/api/booking/slots?slug=${encodeURIComponent(slug)}&from=${from}&to=${to}`).then((x) => x.json());
      setSlots(r.slots ?? []);
    } catch { setSlots([]); }
    finally { setLoading(false); }
  }, [slug]);
  React.useEffect(() => { loadSlots(); }, [loadSlots]);

  const byDate = React.useMemo(() => {
    const map = new Map<string, Slot[]>();
    for (const g of groupSlotsByDate(slots, timezone)) map.set(g.date, g.slots);
    return map;
  }, [slots, timezone]);

  // Build a month grid around monthAnchor.
  const grid = React.useMemo(() => {
    const [y, m] = monthAnchor.split("-").map(Number);
    const first = new Date(Date.UTC(y, m - 1, 1));
    const startDow = first.getUTCDay();
    const gridStart = new Date(first); gridStart.setUTCDate(1 - startDow);
    return Array.from({ length: 42 }, (_, k) => { const d = new Date(gridStart); d.setUTCDate(gridStart.getUTCDate() + k); return d.toISOString().slice(0, 10); });
  }, [monthAnchor]);
  const curMonth = Number(monthAnchor.slice(5, 7));

  const daySlots = selectedDate ? byDate.get(selectedDate) ?? [] : [];

  async function submit() {
    if (!selectedSlot) return;
    setSubmitting(true); setError(null);
    try {
      const res = await fetch("/api/booking/book", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ slug, start_at: selectedSlot.start, invitee_name: name_.trim(), invitee_email: email.trim() || null, invitee_phone: phone.trim() || null, answers }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 409) { await loadSlots(); setStep("pick"); setSelectedSlot(null); }
        throw new Error(json.message || "Booking failed.");
      }
      setResult({ reference: json.reference, message: json.confirmation_message, start: json.start_at });
      setStep("done");
    } catch (e) { setError(e instanceof Error ? e.message : "Booking failed."); }
    finally { setSubmitting(false); }
  }

  if (step === "done" && result) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-border bg-card p-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"><Check className="h-7 w-7" /></div>
        <h1 className="font-serif text-2xl font-semibold">You&apos;re booked!</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {new Date(result.start).toLocaleString([], { timeZone: timezone, weekday: "long", month: "long", day: "numeric", hour: "numeric", minute: "2-digit" })} ({timezone.replace(/_/g, " ")})
        </p>
        <p className="mt-4 rounded-lg bg-muted/50 px-4 py-3 text-sm">{result.message || "A confirmation is on its way."}</p>
        <p className="mt-4 text-xs text-muted-foreground">Confirmation reference <span className="font-mono font-medium text-foreground">{result.reference}</span></p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card md:grid md:grid-cols-[280px_1fr]">
      {/* Summary rail */}
      <div className="border-b border-border p-6 md:border-b-0 md:border-r">
        <span className="flex h-11 w-11 items-center justify-center rounded-lg text-white" style={{ background: props.color || "#0f766e" }}><Icon className="h-5 w-5" /></span>
        <h1 className="mt-4 font-serif text-xl font-semibold leading-tight">{name}</h1>
        {props.hostName && <p className="mt-1 text-sm text-muted-foreground">with {props.hostName}</p>}
        <div className="mt-4 space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2"><Clock className="h-4 w-4" /> {props.durationMinutes} minutes</div>
          <div className="flex items-center gap-2"><Icon className="h-4 w-4" /> {props.locationType === "video" ? "Video call" : props.locationType === "phone" ? "Phone call" : props.locationType === "in_person" ? "In person" : "Details to follow"}</div>
          {selectedSlot && <div className="flex items-center gap-2 font-medium text-foreground"><Calendar className="h-4 w-4" /> {new Date(selectedSlot.start).toLocaleString([], { timeZone: timezone, weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</div>}
        </div>
        {props.description && <p className="mt-4 border-t border-border pt-4 text-sm text-muted-foreground">{props.description}</p>}
        <p className="mt-4 text-[11px] text-muted-foreground">Times shown in {timezone.replace(/_/g, " ")}.</p>
      </div>

      {/* Body */}
      <div className="p-6">
        {step === "pick" && (
          <>
            <div className="mb-3 flex items-center justify-between">
              <div className="font-semibold">{monthLabel(monthAnchor)}</div>
              <div className="flex items-center gap-1">
                <button onClick={() => setMonthAnchor((a) => { const [y, m] = a.split("-").map(Number); return new Date(Date.UTC(y, m - 2, 1)).toISOString().slice(0, 10); })} className="rounded p-1 hover:bg-muted"><ChevronLeft className="h-4 w-4" /></button>
                <button onClick={() => setMonthAnchor((a) => { const [y, m] = a.split("-").map(Number); return new Date(Date.UTC(y, m, 1)).toISOString().slice(0, 10); })} className="rounded p-1 hover:bg-muted"><ChevronRight className="h-4 w-4" /></button>
              </div>
            </div>
            {loading ? <div className="py-12 text-center"><Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" /></div> : (
              <>
                <div className="grid grid-cols-7 text-center text-[11px] font-medium text-muted-foreground">{["S", "M", "T", "W", "T", "F", "S"].map((d, i) => <div key={i} className="py-1">{d}</div>)}</div>
                <div className="grid grid-cols-7 gap-1">
                  {grid.map((day) => {
                    const inMonth = Number(day.slice(5, 7)) === curMonth;
                    const has = (byDate.get(day)?.length ?? 0) > 0;
                    const isSel = day === selectedDate;
                    return (
                      <button key={day} disabled={!has} onClick={() => { setSelectedDate(day); setSelectedSlot(null); }}
                        className={cn("aspect-square rounded-lg text-sm transition-colors",
                          !inMonth && "opacity-40",
                          isSel ? "bg-primary text-primary-foreground font-semibold" : has ? "bg-primary/10 font-medium text-primary hover:bg-primary/20" : "text-muted-foreground")}
                      >{Number(day.slice(8, 10))}</button>
                    );
                  })}
                </div>

                {selectedDate && (
                  <div className="mt-5">
                    <div className="mb-2 text-sm font-medium">{new Date(`${selectedDate}T00:00:00Z`).toLocaleDateString([], { weekday: "long", month: "long", day: "numeric", timeZone: "UTC" })}</div>
                    {daySlots.length === 0 ? <p className="text-sm text-muted-foreground">No times left on this day.</p> : (
                      <div className="grid max-h-64 grid-cols-3 gap-2 overflow-y-auto sm:grid-cols-4">
                        {daySlots.map((s) => (
                          <button key={s.start} onClick={() => { setSelectedSlot(s); setStep("details"); }}
                            className="rounded-lg border border-border py-2 text-sm font-medium hover:border-primary hover:bg-primary/5">
                            {new Date(s.start).toLocaleTimeString([], { timeZone: timezone, hour: "numeric", minute: "2-digit" })}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                {!selectedDate && <p className="mt-5 text-sm text-muted-foreground">Pick a highlighted day to see available times.</p>}
              </>
            )}
          </>
        )}

        {step === "details" && selectedSlot && (
          <div>
            <button onClick={() => setStep("pick")} className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Back to times</button>
            <h2 className="font-serif text-lg font-semibold">Your details</h2>
            <div className="mt-3 space-y-3">
              <div><label className="mb-1 block text-xs font-medium text-muted-foreground">Full name *</label><Input value={name_} onChange={(e) => setName(e.target.value)} /></div>
              <div><label className="mb-1 block text-xs font-medium text-muted-foreground">Email</label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
              <div><label className="mb-1 block text-xs font-medium text-muted-foreground">Phone</label><Input value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
              {props.questions.map((q) => (
                <div key={q.key}>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">{q.label}{q.required ? " *" : ""}</label>
                  {q.type === "textarea" ? (
                    <Textarea value={answers[q.key] ?? ""} onChange={(e) => setAnswers((a) => ({ ...a, [q.key]: e.target.value }))} />
                  ) : q.type === "select" ? (
                    <FieldSelect value={answers[q.key] ?? ""} onChange={(v) => setAnswers((a) => ({ ...a, [q.key]: v }))} options={[{ value: "", label: "Select…" }, ...(q.options ?? []).map((o) => ({ value: o, label: o }))]} />
                  ) : (
                    <Input type={q.type === "email" ? "email" : q.type === "phone" ? "tel" : "text"} value={answers[q.key] ?? ""} onChange={(e) => setAnswers((a) => ({ ...a, [q.key]: e.target.value }))} />
                  )}
                </div>
              ))}
            </div>
            {error && <p className="mt-3 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
            <Button className="mt-4 w-full" onClick={submit} disabled={submitting || !name_.trim() || props.questions.some((q) => q.required && !answers[q.key]?.trim())}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Confirm booking
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
