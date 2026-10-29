"use client";

import { useMemo, useState } from "react";
import { ExternalLink, Eye, EyeOff, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { FieldSelect } from "@/components/ui/field-select";
import { TimePicker } from "@/components/ui/time-picker";
import { DatePicker } from "@/components/ui/date-picker";
import { GroupsMap } from "@/components/maps/groups-map";
import type { TileConfig } from "@/lib/maps/config";
import { AUDIENCES, DAYS, FORMATS, TIMEZONES, tzLabel, type GroupInput, type OwnerGroup } from "@/lib/facilitator-groups/shared";
import { groupApi } from "./api";

type Form = {
  title: string; description: string; audience: string; language: string; churchOrg: string;
  meetingDay: string; meetingTime: string; timezone: string; frequency: string; startDate: string; durationWeeks: string;
  format: string; venueName: string; addressLine: string; city: string; state: string; postalCode: string; showExactAddress: boolean;
  capacity: string; bookingMode: string; experienceId: string; churchId: string;
};

function toForm(g: OwnerGroup | null): Form {
  return {
    title: g?.title ?? "", description: g?.description ?? "", audience: g?.audience ?? "men", language: g?.language ?? "English",
    churchOrg: g?.churchOrg ?? "", meetingDay: g?.meetingDay != null ? String(g.meetingDay) : "", meetingTime: g?.meetingTime ?? "",
    timezone: g?.timezone ?? "America/Phoenix", frequency: g?.frequency ?? "weekly", startDate: g?.startDate ?? "",
    durationWeeks: String(g?.durationWeeks ?? 6), format: g?.format ?? "in_person", venueName: g?.venueName ?? "",
    addressLine: g?.addressLine ?? "", city: g?.city ?? "", state: g?.state ?? "", postalCode: g?.postalCode ?? "",
    showExactAddress: g?.showExactAddress ?? false, capacity: String(g?.capacity ?? 10), bookingMode: g?.bookingMode ?? "approval",
    experienceId: g?.experienceId ?? "", churchId: g?.churchId ?? "",
  };
}

function toInput(f: Form): GroupInput {
  return {
    title: f.title, description: f.description, audience: f.audience as GroupInput["audience"], language: f.language,
    churchOrg: f.churchOrg, meetingDay: f.meetingDay === "" ? null : Number(f.meetingDay), meetingTime: f.meetingTime || null,
    timezone: f.timezone, frequency: f.frequency as "weekly" | "biweekly", startDate: f.startDate || null,
    durationWeeks: Number(f.durationWeeks) || 6, format: f.format as GroupInput["format"], venueName: f.venueName,
    addressLine: f.addressLine, city: f.city, state: f.state, postalCode: f.postalCode, showExactAddress: f.showExactAddress,
    capacity: Number(f.capacity) || 10, bookingMode: f.bookingMode as "auto" | "approval", experienceId: f.experienceId || null,
    churchId: f.churchId || null,
  };
}

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3 border-t border-border pt-5 first:border-t-0 first:pt-0">
      <div>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      </div>
      {children}
    </section>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return <div className={`space-y-1.5 ${className ?? ""}`}><Label>{label}</Label>{children}</div>;
}

export function GroupEditor({
  group, tiles, experiences, churches = [], actionToken, onSaved, onCancel, ownerId,
}: {
  group: OwnerGroup | null; // null = new
  ownerId?: string | null; // admin creating a group for someone else
  tiles: TileConfig;
  experiences: Array<{ id: string; name: string }>;
  /** Churches that approved this facilitator (official church groups). */
  churches?: Array<{ id: string; name: string }>;
  actionToken: string | null;
  onSaved: (g: OwnerGroup) => void;
  onCancel?: () => void;
}) {
  const [form, setForm] = useState<Form>(() => toForm(group));
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));
  const online = form.format === "online";

  const preview = useMemo(() => {
    if (!group) return [];
    const lat = group.showExactAddress ? group.lat : group.publicLat;
    const lng = group.showExactAddress ? group.lng : group.publicLng;
    return lat != null && lng != null ? [{ id: group.id, lat, lng, exact: group.showExactAddress, label: group.title.slice(0, 24), title: group.title }] : [];
  }, [group]);

  async function save(status?: "published" | "draft" | "closed") {
    setBusy(status ?? "save");
    setError(null);
    setNotice(null);
    try {
      let saved: OwnerGroup;
      if (group) {
        saved = (await groupApi<{ group: OwnerGroup }>(`/api/facilitator/groups/${group.id}`, "PATCH", { group: toInput(form), ...(status ? { status } : {}) }, actionToken)).group;
      } else {
        saved = (await groupApi<{ group: OwnerGroup }>("/api/facilitator/groups", "POST", { group: toInput(form), facilitatorId: ownerId ?? undefined }, actionToken)).group;
        if (status) saved = (await groupApi<{ group: OwnerGroup }>(`/api/facilitator/groups/${saved.id}`, "PATCH", { status }, actionToken)).group;
      }
      if (!online && saved.lat == null) setNotice("Saved — but we couldn't find that location on the map. Check the address, city and ZIP.");
      else setNotice(status === "published" ? "Published — your group is listed on Find a Group." : status === "closed" ? "Closed — it no longer shows on Find a Group." : "Saved.");
      onSaved(saved);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-5">
      <Section title="About the group" hint="What people see first on the listing.">
        <Field label="Group name"><Input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Tuesday Night Men's Group" maxLength={120} /></Field>
        <Field label="Description">
          <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={4} placeholder="Who it's for, what to expect, anything people should know before joining." />
        </Field>
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Who it's for"><FieldSelect value={form.audience} onChange={(v) => set("audience", v)} options={Object.entries(AUDIENCES).map(([value, label]) => ({ value, label }))} /></Field>
          <Field label="Church or organization"><Input value={form.churchOrg} onChange={(e) => set("churchOrg", e.target.value)} placeholder="Optional" /></Field>
          <Field label="Language"><Input value={form.language} onChange={(e) => set("language", e.target.value)} /></Field>
        </div>
      </Section>

      <Section title="When you meet">
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Day"><FieldSelect value={form.meetingDay} onChange={(v) => set("meetingDay", v)} placeholder="Choose a day" options={DAYS.map((d, i) => ({ value: String(i), label: d }))} /></Field>
          <Field label="Time"><TimePicker value={form.meetingTime} onChange={(v) => set("meetingTime", v)} /></Field>
          <Field label="Time zone"><FieldSelect value={form.timezone} onChange={(v) => set("timezone", v)} options={TIMEZONES.map((tz) => ({ value: tz, label: tzLabel(tz) }))} /></Field>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="How often"><FieldSelect value={form.frequency} onChange={(v) => set("frequency", v)} options={[{ value: "weekly", label: "Every week" }, { value: "biweekly", label: "Every other week" }]} /></Field>
          <Field label="First meeting"><DatePicker value={form.startDate} onChange={(v) => set("startDate", v)} /></Field>
          <Field label="Length (weeks)"><Input type="number" min={1} max={52} value={form.durationWeeks} onChange={(e) => set("durationWeeks", e.target.value)} /></Field>
        </div>
      </Section>

      <Section title="Where you meet" hint="Only the area shows publicly. The exact address goes to people once their spot is confirmed.">
        <Field label="Format" className="max-w-xs"><FieldSelect value={form.format} onChange={(v) => set("format", v)} options={Object.entries(FORMATS).map(([value, label]) => ({ value, label }))} /></Field>
        {!online ? (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Place name"><Input value={form.venueName} onChange={(e) => set("venueName", e.target.value)} placeholder="e.g. Grace Church, Room 4 — or leave blank for a home" /></Field>
              <Field label="Street address"><Input value={form.addressLine} onChange={(e) => set("addressLine", e.target.value)} placeholder="Private until a spot is confirmed" /></Field>
            </div>
            <div className="grid gap-3 sm:grid-cols-[1fr_6rem_8rem]">
              <Field label="City"><Input value={form.city} onChange={(e) => set("city", e.target.value)} /></Field>
              <Field label="State"><Input value={form.state} onChange={(e) => set("state", e.target.value)} maxLength={2} placeholder="AZ" /></Field>
              <Field label="ZIP"><Input value={form.postalCode} onChange={(e) => set("postalCode", e.target.value)} /></Field>
            </div>
            <label className="flex items-start gap-3 rounded-md border border-border p-3">
              <Switch checked={form.showExactAddress} onCheckedChange={(v) => set("showExactAddress", v)} className="mt-0.5" />
              <span className="text-sm">
                <span className="font-medium text-foreground">Show the exact address publicly</span>
                <span className="block text-xs text-muted-foreground">Good for churches and public venues. Leave off for homes — the listing then shows an approximate area.</span>
              </span>
            </label>
            {preview.length ? (
              <div className="overflow-hidden rounded-md border border-border">
                <GroupsMap points={preview} tiles={tiles} className="h-56 w-full" zoom={13} />
                <p className="border-t border-border bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground">
                  {group?.showExactAddress ? "Shown as an exact pin." : "What the public sees: an approximate area, not your address."} Updates when you save.
                </p>
              </div>
            ) : null}
          </>
        ) : null}
      </Section>

      <Section title="Spots and sign-ups">
        <div className="grid gap-3 sm:grid-cols-[8rem_1fr]">
          <Field label="Total spots"><Input type="number" min={1} max={200} value={form.capacity} onChange={(e) => set("capacity", e.target.value)} /></Field>
          <div className="space-y-1.5">
            <Label>When someone requests a spot</Label>
            <div className="grid gap-2 sm:grid-cols-2">
              {([
                ["approval", "I approve each request", "You get a message and decide."],
                ["auto", "Book them automatically", "Confirmed instantly while spots remain."],
              ] as const).map(([value, title, hint]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => set("bookingMode", value)}
                  className={`rounded-md border p-3 text-left text-sm transition-colors ${form.bookingMode === value ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}
                  aria-pressed={form.bookingMode === value}
                >
                  <span className="block font-medium text-foreground">{title}</span>
                  <span className="block text-xs text-muted-foreground">{hint}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
        {experiences.length ? (
          <Field label="Linked experience (optional)" className="max-w-md">
            <FieldSelect
              value={form.experienceId}
              onChange={(v) => set("experienceId", v)}
              options={[{ value: "", label: "None" }, ...experiences.map((e) => ({ value: e.id, label: e.name }))]}
            />
            <p className="text-xs text-muted-foreground">Confirmed members also receive this experience's emails.</p>
          </Field>
        ) : null}
        {churches.length || form.churchId ? (
          <Field label="Official church group (optional)" className="max-w-md">
            <FieldSelect
              value={form.churchId}
              onChange={(v) => set("churchId", v)}
              options={[{ value: "", label: "Not a church group" }, ...churches.map((c) => ({ value: c.id, label: c.name }))]}
            />
            <p className="text-xs text-muted-foreground">Only churches that approved you as a facilitator (My Church) are listed.</p>
          </Field>
        ) : null}
      </Section>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {notice ? <p className="text-sm text-primary">{notice}</p> : null}

      <div className="flex flex-wrap items-center gap-2 border-t border-border pt-4">
        <Button onClick={() => save()} disabled={!!busy || !form.title.trim()}>
          <Save className="mr-2 h-4 w-4" /> {busy === "save" ? "Saving…" : group ? "Save changes" : "Save draft"}
        </Button>
        {group?.status === "published" ? (
          <Button variant="outline" onClick={() => save("closed")} disabled={!!busy}><EyeOff className="mr-2 h-4 w-4" /> {busy === "closed" ? "Closing…" : "Close listing"}</Button>
        ) : (
          <Button variant="outline" onClick={() => save("published")} disabled={!!busy || !form.title.trim()}><Eye className="mr-2 h-4 w-4" /> {busy === "published" ? "Publishing…" : "Save & publish"}</Button>
        )}
        {group?.status === "published" ? (
          <a href={`/groups/${group.slug}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
            View listing <ExternalLink className="h-3.5 w-3.5" />
          </a>
        ) : null}
        {onCancel ? <Button variant="ghost" onClick={onCancel} disabled={!!busy}>Cancel</Button> : null}
      </div>
    </div>
  );
}
