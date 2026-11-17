"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useDashboardActionToken } from "@/components/layout/dashboard-action-token";
import type { WelcomeOverview } from "@/lib/facilitator-welcome/admin";

// Facilitator Welcome Series — links, on/off and what has gone out.
// The email copy itself is edited in Emails → Templates ("Facilitator Welcome Series").

const FIELDS = [
  { key: "handbook_url", label: "Facilitator Handbook link", hint: "Permanent, branded URL. Used in Email 1 and the Welcome Text." },
  { key: "assessment_url", label: "Created for More Check-In link", hint: "Email 2 button." },
  { key: "resources_url", label: "Resources link", hint: "Email 3 button." },
  { key: "instagram_url", label: "Instagram", hint: "Social row under the signature." },
  { key: "facebook_url", label: "Facebook", hint: "Full profile URL, including the numeric ID. Shown simply as “Facebook”." },
  { key: "linkedin_url", label: "LinkedIn", hint: "Social row under the signature." },
  { key: "mailing_address", label: "Postal address", hint: "Shown in every email's footer beside the unsubscribe link. Required by law for these emails; a PO box is fine." },
] as const;

type FieldKey = (typeof FIELDS)[number]["key"];

export function FacilitatorWelcomeCard({ initial }: { initial: WelcomeOverview }) {
  const actionToken = useDashboardActionToken();
  const [overview, setOverview] = useState(initial);
  const [values, setValues] = useState<Record<FieldKey, string>>(
    () => Object.fromEntries(FIELDS.map((f) => [f.key, (initial.settings[f.key] as string | null) ?? ""])) as Record<FieldKey, string>,
  );
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function save(settings: Record<string, unknown>, done: string) {
    setBusy(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch("/api/admin/facilitator-welcome", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-mjg-action-token": actionToken },
        body: JSON.stringify({ settings, actionToken }),
      });
      const payload = await res.json();
      if (!res.ok) setError(payload.error ?? "Unable to save.");
      else {
        setOverview(payload.overview);
        setMessage(done);
      }
    } catch {
      setError("Unable to save. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void save(values, "Settings saved.");
  }

  const on = overview.settings.enabled;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <CardTitle>Facilitator Welcome Series</CardTitle>
            <CardDescription className="mt-1 max-w-2xl">
              Email 1 right after a confirmed facilitator signup (MJG registration, accepted facilitator invite, or a ForgedLife group leader), a same-day
              Welcome Text with SMS consent (11am–5pm Arizona, daytime in every US time zone), Email 2 two days later and Email 3 five days later. Once per person. Study emails go first.
            </CardDescription>
          </div>
          <label className="flex items-center gap-3 text-sm font-medium">
            <span>{on ? "On" : "Off"}</span>
            <Switch
              checked={on}
              disabled={busy || (!on && overview.problems.length > 0)}
              onCheckedChange={(checked) => void save({ enabled: checked }, checked ? "Series switched on. New facilitators will be welcomed." : "Series switched off. Nothing more will send; pending messages wait.")}
              aria-label="Facilitator Welcome Series on or off"
            />
          </label>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {overview.problems.length ? (
          <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-100">
            <p className="font-medium">Before it can be switched on:</p>
            <ul className="mt-1 list-disc pl-5">
              {overview.problems.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
          {FIELDS.map((f) => (
            <div key={f.key} className="space-y-1.5">
              <Label htmlFor={`fw-${f.key}`}>{f.label}</Label>
              <Input
                id={`fw-${f.key}`}
                type={f.key === "mailing_address" ? "text" : "url"}
                inputMode={f.key === "mailing_address" ? "text" : "url"}
                placeholder={f.key === "mailing_address" ? "PO Box 123, City, AZ 85000" : "https://"}
                value={values[f.key]}
                onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">{f.hint}</p>
            </div>
          ))}
          <div className="flex items-center gap-3 md:col-span-2">
            <Button type="submit" disabled={busy}>{busy ? "Saving…" : "Save settings"}</Button>
            {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
          </div>
        </form>

        <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-5">
          {[
            ["Welcomed", overview.enrolled],
            ["Waiting", overview.pending],
            ["Sent", overview.sent],
            ["Skipped", overview.skipped],
            ["Failed", overview.failed],
          ].map(([label, n]) => (
            <div key={label as string} className="rounded-md border p-3">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="text-lg font-semibold tabular-nums">{n}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Edit the wording in <Link href="/dashboard/emails/templates" className="underline">Templates</Link> (category “Facilitator Welcome Series”) and the
          text in SMS → Templates. Skipped usually means no SMS consent, or the same-day window for the text had passed.
        </p>
      </CardContent>
    </Card>
  );
}
