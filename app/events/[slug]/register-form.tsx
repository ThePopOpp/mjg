"use client";

import * as React from "react";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FieldSelect } from "@/components/ui/field-select";
import type { IntakeQuestion } from "@/lib/booking/types";

export function EventRegisterForm({ slug, customFields, full, closed, spotsLeft }: {
  slug: string; customFields: IntakeQuestion[]; full: boolean; closed: boolean; spotsLeft: number | null;
}) {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [partySize, setPartySize] = React.useState(1);
  const [answers, setAnswers] = React.useState<Record<string, string>>({});
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [done, setDone] = React.useState<{ waitlisted: boolean; message: string } | null>(null);

  async function submit() {
    setSubmitting(true); setError(null);
    try {
      const res = await fetch("/api/events/register", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ slug, name: name.trim(), email: email.trim() || null, phone: phone.trim() || null, party_size: partySize, answers }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.message || "Registration failed.");
      setDone({ waitlisted: json.waitlisted, message: json.message });
    } catch (e) { setError(e instanceof Error ? e.message : "Registration failed."); }
    finally { setSubmitting(false); }
  }

  if (done) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"><Check className="h-6 w-6" /></div>
        <p className="font-semibold">{done.waitlisted ? "You're on the waitlist" : "You're registered!"}</p>
        <p className="mt-2 text-sm text-muted-foreground">{done.message}</p>
      </div>
    );
  }

  if (closed) return <div className="text-center text-sm text-muted-foreground"><p className="font-medium text-foreground">Registration closed</p><p className="mt-1">This event is no longer accepting registrations.</p></div>;

  return (
    <div>
      <div className="mb-3">
        <p className="font-semibold">{full ? "Join the waitlist" : "Register"}</p>
        {full ? <p className="text-xs text-muted-foreground">This event is full — add your name to the waitlist.</p>
          : spotsLeft != null && spotsLeft <= 10 ? <p className="text-xs text-amber-600 dark:text-amber-400">Only {spotsLeft} {spotsLeft === 1 ? "spot" : "spots"} left</p>
          : <p className="text-xs text-muted-foreground">Save your spot below.</p>}
      </div>
      <div className="space-y-3">
        <div><label className="mb-1 block text-xs font-medium text-muted-foreground">Full name *</label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
        <div><label className="mb-1 block text-xs font-medium text-muted-foreground">Email</label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        <div><label className="mb-1 block text-xs font-medium text-muted-foreground">Phone</label><Input value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
        <div><label className="mb-1 block text-xs font-medium text-muted-foreground">Number attending</label><Input type="number" min={1} max={50} value={partySize} onChange={(e) => setPartySize(Math.max(1, Number(e.target.value) || 1))} /></div>
        {customFields.map((q) => (
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
      <Button className="mt-4 w-full" onClick={submit} disabled={submitting || !name.trim() || customFields.some((q) => q.required && !answers[q.key]?.trim())}>
        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null} {full ? "Join waitlist" : "Register"}
      </Button>
    </div>
  );
}
