"use client";

import * as React from "react";
import {
  CalendarClock, CalendarDays, Check, Clock, Copy, ExternalLink, Loader2, Plus, Pencil,
  Save, SlidersHorizontal, Trash2, Users, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FieldSelect, type FieldSelectOption } from "@/components/ui/field-select";
import { DatePicker } from "@/components/ui/date-picker";
import { cn } from "@/lib/utils";
import { useDashboardActionToken } from "@/components/layout/dashboard-action-token";
import { zonedToUtc, utcToZonedDate } from "@/lib/booking/availability";
import type {
  AvailabilityRule, Booking, BookingManagerData, BookingType, EventItem,
  EventRegistration, IntakeQuestion,
} from "@/lib/booking/types";
import type { StaffOption } from "@/lib/booking/data";

// ── helpers ──────────────────────────────────────────────────────────────────
const pad = (n: number) => String(n).padStart(2, "0");
const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const TIMEZONES = [
  "America/New_York", "America/Chicago", "America/Denver", "America/Phoenix",
  "America/Los_Angeles", "America/Anchorage", "Pacific/Honolulu", "UTC",
];
const TIME_OPTS: FieldSelectOption[] = Array.from({ length: 96 }, (_, i) => {
  const h = Math.floor(i / 4), m = (i % 4) * 15;
  const v = `${pad(h)}:${pad(m)}`;
  const ampm = h < 12 ? "AM" : "PM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return { value: v, label: `${h12}:${pad(m)} ${ampm}` };
});
const LOCATION_OPTS: FieldSelectOption[] = [
  { value: "video", label: "Video call" }, { value: "phone", label: "Phone call" },
  { value: "in_person", label: "In person" }, { value: "custom", label: "Custom" },
];
const EVENT_LOCATION_OPTS: FieldSelectOption[] = [
  { value: "in_person", label: "In person" }, { value: "online", label: "Online" }, { value: "hybrid", label: "Hybrid" },
];
const EVENT_STATUS_OPTS: FieldSelectOption[] = [
  { value: "draft", label: "Draft" }, { value: "published", label: "Published" },
  { value: "canceled", label: "Canceled" }, { value: "completed", label: "Completed" },
];
const BOOKING_STATUS_OPTS: FieldSelectOption[] = [
  { value: "confirmed", label: "Confirmed" }, { value: "pending", label: "Pending" },
  { value: "completed", label: "Completed" }, { value: "no_show", label: "No-show" }, { value: "canceled", label: "Canceled" },
];
const REG_STATUS_OPTS: FieldSelectOption[] = [
  { value: "registered", label: "Registered" }, { value: "waitlisted", label: "Waitlisted" },
  { value: "attended", label: "Attended" }, { value: "canceled", label: "Canceled" },
];
const tzOpts = (): FieldSelectOption[] => TIMEZONES.map((t) => ({ value: t, label: t.replace(/_/g, " ") }));

function fmtDateTime(iso: string, tz: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString([], {
    timeZone: tz, weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
  });
}
function timeOf(iso: string, tz: string) {
  return new Date(iso).toLocaleTimeString([], { timeZone: tz, hour: "numeric", minute: "2-digit" });
}
function isoToParts(iso: string | null, tz: string): { date: string; time: string } {
  if (!iso) return { date: "", time: "" };
  const d = new Date(iso);
  const date = utcToZonedDate(d, tz);
  const time = new Intl.DateTimeFormat("en-GB", { timeZone: tz, hour: "2-digit", minute: "2-digit", hour12: false }).format(d);
  return { date, time };
}
function partsToIso(date: string, time: string, tz: string): string {
  if (!date) return "";
  const [h, m] = (time || "00:00").split(":").map(Number);
  return zonedToUtc(date, (h || 0) * 60 + (m || 0), tz).toISOString();
}

const statusClass: Record<string, string> = {
  confirmed: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  pending: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  completed: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  no_show: "bg-orange-500/15 text-orange-600 dark:text-orange-400",
  canceled: "bg-muted text-muted-foreground line-through",
  draft: "bg-muted text-muted-foreground",
  published: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  registered: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  waitlisted: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  attended: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
};
function Pill({ status }: { status: string }) {
  return <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium capitalize", statusClass[status] ?? "bg-muted text-muted-foreground")}>{status.replace(/_/g, " ")}</span>;
}

type Tab = "types" | "bookings" | "events";

export function BookingsClient({ initialData, staffOptions }: { initialData: BookingManagerData; staffOptions: StaffOption[] }) {
  const token = useDashboardActionToken();
  const [tab, setTab] = React.useState<Tab>("types");
  const [types, setTypes] = React.useState<BookingType[]>(initialData.bookingTypes);
  const [bookings, setBookings] = React.useState<Booking[]>(initialData.bookings);
  const [events, setEvents] = React.useState<EventItem[]>(initialData.events);
  const [error, setError] = React.useState<string | null>(null);
  const [origin, setOrigin] = React.useState("");
  React.useEffect(() => setOrigin(window.location.origin), []);

  // modals
  const [editType, setEditType] = React.useState<Partial<BookingType> | null>(null);
  const [availFor, setAvailFor] = React.useState<BookingType | null>(null);
  const [editEvent, setEditEvent] = React.useState<Partial<EventItem> | null>(null);
  const [regsFor, setRegsFor] = React.useState<EventItem | null>(null);

  const staffSelectOpts: FieldSelectOption[] = [{ value: "", label: "Unassigned" }, ...staffOptions.map((s) => ({ value: s.id, label: s.display_name }))];

  async function send(url: string, method: string, body: Record<string, unknown>) {
    const res = await fetch(url, { method, headers: { "content-type": "application/json" }, body: JSON.stringify({ ...body, actionToken: token }) });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.message || "Request failed.");
    return json;
  }
  const getJson = React.useCallback((url: string) => fetch(url, { headers: { "x-mjg-action-token": token } }).then((r) => r.json()), [token]);

  const reloadTypes = React.useCallback(async () => { const r = await getJson("/api/booking/types"); if (r.bookingTypes) setTypes(r.bookingTypes); }, [getJson]);
  const reloadBookings = React.useCallback(async () => { const r = await getJson("/api/booking/bookings"); if (r.bookings) setBookings(r.bookings); }, [getJson]);
  const reloadEvents = React.useCallback(async () => { const r = await getJson("/api/events"); if (r.events) setEvents(r.events); }, [getJson]);

  const stats = React.useMemo(() => {
    const nowIso = new Date().toISOString();
    return {
      activeTypes: types.filter((t) => t.is_active).length,
      upcoming: bookings.filter((b) => b.end_at >= nowIso && b.status !== "canceled").length,
      pending: bookings.filter((b) => b.status === "pending").length,
      events: events.filter((e) => e.status === "published").length,
    };
  }, [types, bookings, events]);

  async function saveType(draft: Partial<BookingType>) {
    try { await send("/api/booking/types", "POST", draft as Record<string, unknown>); setEditType(null); await reloadTypes(); }
    catch (e) { setError(e instanceof Error ? e.message : "Save failed."); }
  }
  async function removeType(t: BookingType) {
    if (!window.confirm(`Delete "${t.name}"? Its bookings and availability are removed too.`)) return;
    try { await send(`/api/booking/types/${t.id}`, "DELETE", {}); await reloadTypes(); await reloadBookings(); }
    catch (e) { setError(e instanceof Error ? e.message : "Delete failed."); }
  }
  async function setBookingStatus(b: Booking, status: string) {
    setBookings((prev) => prev.map((x) => (x.id === b.id ? { ...x, status: status as Booking["status"] } : x)));
    try { await send(`/api/booking/bookings/${b.id}`, "PATCH", { status }); } catch { reloadBookings(); }
  }
  async function removeBooking(b: Booking) {
    if (!window.confirm("Delete this booking?")) return;
    try { await send(`/api/booking/bookings/${b.id}`, "DELETE", {}); await reloadBookings(); }
    catch (e) { setError(e instanceof Error ? e.message : "Delete failed."); }
  }
  async function saveEvent(draft: Partial<EventItem>) {
    try { await send("/api/events", "POST", draft as Record<string, unknown>); setEditEvent(null); await reloadEvents(); }
    catch (e) { setError(e instanceof Error ? e.message : "Save failed."); }
  }
  async function removeEvent(ev: EventItem) {
    if (!window.confirm(`Delete "${ev.title}"? Its registrations are removed too.`)) return;
    try { await send(`/api/events/${ev.id}`, "DELETE", {}); await reloadEvents(); }
    catch (e) { setError(e instanceof Error ? e.message : "Delete failed."); }
  }

  return (
    <div>
      {/* Stat cards */}
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat icon={SlidersHorizontal} label="Active types" value={stats.activeTypes} />
        <Stat icon={CalendarClock} label="Upcoming" value={stats.upcoming} />
        <Stat icon={Clock} label="Pending" value={stats.pending} />
        <Stat icon={CalendarDays} label="Live events" value={stats.events} />
      </div>

      {/* Tabs */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="flex items-center rounded-lg border border-border bg-card p-0.5 text-xs">
          {([["types", "Booking Types"], ["bookings", "Bookings"], ["events", "Events"]] as [Tab, string][]).map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)} className={cn("rounded-md px-3 py-1.5 font-medium", tab === k ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground")}>{l}</button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2">
          {tab === "types" && <Button size="sm" onClick={() => setEditType(newType())}><Plus className="h-3.5 w-3.5" /> New type</Button>}
          {tab === "events" && <Button size="sm" onClick={() => setEditEvent(newEvent())}><Plus className="h-3.5 w-3.5" /> New event</Button>}
        </div>
      </div>

      {error && <div className="mb-3 flex items-center justify-between rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"><span>{error}</span><button onClick={() => setError(null)}><X className="h-3.5 w-3.5" /></button></div>}

      {tab === "types" && <TypesTab types={types} origin={origin} onEdit={setEditType} onAvailability={setAvailFor} onDelete={removeType} />}
      {tab === "bookings" && <BookingsTab bookings={bookings} onStatus={setBookingStatus} onDelete={removeBooking} />}
      {tab === "events" && <EventsTab events={events} origin={origin} onEdit={setEditEvent} onRegs={setRegsFor} onDelete={removeEvent} />}

      {editType && <TypeEditor draft={editType} onChange={setEditType} onSave={saveType} onClose={() => setEditType(null)} staffOpts={staffSelectOpts} />}
      {availFor && <AvailabilityModal type={availFor} token={token} onClose={() => setAvailFor(null)} />}
      {editEvent && <EventEditor draft={editEvent} onChange={setEditEvent} onSave={saveEvent} onClose={() => setEditEvent(null)} staffOpts={staffSelectOpts} />}
      {regsFor && <RegistrationsModal event={regsFor} token={token} onClose={() => setRegsFor(null)} />}
    </div>
  );
}

function newType(): Partial<BookingType> {
  return {
    name: "", description: "", duration_minutes: 30, slot_interval_minutes: null,
    buffer_before_minutes: 0, buffer_after_minutes: 0, location_type: "video", location_details: "",
    color: "#0f766e", is_active: true, is_public: true, host_staff_id: null, host_name: "",
    timezone: "America/Chicago", min_notice_hours: 12, max_advance_days: 60, price_cents: 0, currency: "USD",
    questions: [], confirmation_message: "",
  };
}
function newEvent(): Partial<EventItem> {
  return {
    title: "", summary: "", description: "", status: "draft", start_at: "", end_at: null,
    timezone: "America/Chicago", location_type: "in_person", location_name: "", location_address: "",
    online_url: "", cover_image_url: "", capacity: null, registration_required: true,
    registration_closes_at: null, price_cents: 0, currency: "USD", host_staff_id: null, host_name: "",
    is_public: true, custom_fields: [],
  };
}

// ── shared bits ──────────────────────────────────────────────────────────────
function Stat({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: number }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary"><Icon className="h-4 w-4" /></div>
      <div><div className="text-lg font-semibold leading-none">{value}</div><div className="mt-1 text-[11px] text-muted-foreground">{label}</div></div>
    </div>
  );
}
function Empty({ label }: { label: string }) {
  return <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">{label}</div>;
}
function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return <div className={full ? "sm:col-span-2" : ""}><label className="mb-1 block text-xs font-medium text-muted-foreground">{label}</label>{children}</div>;
}
function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="accent-primary" checked={checked} onChange={(e) => onChange(e.target.checked)} /> {label}</label>;
}
function Modal({ title, onClose, children, wide }: { title: string; onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className={cn("relative z-10 my-6 w-full rounded-xl border border-border bg-card p-5 shadow-xl", wide ? "max-w-3xl" : "max-w-2xl")}>
        <div className="mb-4 flex items-center justify-between"><h3 className="text-lg font-semibold">{title}</h3><button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button></div>
        {children}
      </div>
    </div>
  );
}
function CopyLink({ url }: { url: string }) {
  const [copied, setCopied] = React.useState(false);
  return (
    <button
      onClick={(e) => { e.stopPropagation(); navigator.clipboard?.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary"
      title={url}
    >
      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}{copied ? "Copied" : "Copy link"}
    </button>
  );
}

// ── Intake question editor (shared by types + events) ──────────────────────────
function QuestionsEditor({ value, onChange }: { value: IntakeQuestion[]; onChange: (q: IntakeQuestion[]) => void }) {
  const set = (i: number, patch: Partial<IntakeQuestion>) => onChange(value.map((q, k) => (k === i ? { ...q, ...patch } : q)));
  const add = () => onChange([...value, { key: `q${value.length + 1}`, label: "", type: "text", required: false }]);
  return (
    <div className="rounded-lg border border-border p-3">
      <div className="mb-2 text-xs font-semibold text-muted-foreground">Intake questions</div>
      {value.length === 0 && <p className="text-xs text-muted-foreground">No custom questions. Name, email and phone are always collected.</p>}
      <div className="space-y-2">
        {value.map((q, i) => (
          <div key={i} className="flex flex-wrap items-center gap-2">
            <Input value={q.label} onChange={(e) => set(i, { label: e.target.value, key: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "_").slice(0, 24) || `q${i + 1}` })} placeholder="Question label" className="h-8 flex-1 min-w-[160px]" />
            <div className="w-32"><FieldSelect value={q.type} onChange={(v) => set(i, { type: v as IntakeQuestion["type"] })} options={[{ value: "text", label: "Short text" }, { value: "textarea", label: "Long text" }, { value: "select", label: "Choice" }, { value: "email", label: "Email" }, { value: "phone", label: "Phone" }]} className="h-8" /></div>
            <label className="flex items-center gap-1 text-xs"><input type="checkbox" className="accent-primary" checked={q.required} onChange={(e) => set(i, { required: e.target.checked })} /> req</label>
            <button onClick={() => onChange(value.filter((_, k) => k !== i))} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
          </div>
        ))}
      </div>
      <Button size="sm" variant="outline" className="mt-2" onClick={add}><Plus className="h-3.5 w-3.5" /> Add question</Button>
    </div>
  );
}

// ── Booking Types tab ──────────────────────────────────────────────────────────
function TypesTab({ types, origin, onEdit, onAvailability, onDelete }: {
  types: BookingType[]; origin: string;
  onEdit: (t: BookingType) => void; onAvailability: (t: BookingType) => void; onDelete: (t: BookingType) => void;
}) {
  if (!types.length) return <Empty label="No booking types yet. Create one to start taking appointments." />;
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {types.map((t) => {
        const url = `${origin}/book/${t.slug}`;
        return (
          <div key={t.id} className="flex flex-col rounded-xl border border-border bg-card p-4">
            <div className="flex items-start gap-2">
              <span className="mt-1 h-3 w-3 shrink-0 rounded-full" style={{ background: t.color || "#0f766e" }} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2"><span className="truncate font-semibold">{t.name}</span>{!t.is_active && <Pill status="canceled" />}</div>
                <div className="mt-0.5 text-[11px] text-muted-foreground">{t.duration_minutes} min · {LOCATION_OPTS.find((o) => o.value === t.location_type)?.label}{t.host_name ? ` · ${t.host_name}` : ""}</div>
              </div>
            </div>
            {t.description && <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{t.description}</p>}
            <div className="mt-2 flex items-center gap-3">
              {t.is_public ? <a href={url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary"><ExternalLink className="h-3 w-3" />/book/{t.slug}</a> : <span className="text-[11px] text-muted-foreground">Private</span>}
              {t.is_public && <CopyLink url={url} />}
            </div>
            <div className="mt-3 flex items-center gap-2 border-t border-border pt-3">
              <Button size="sm" variant="outline" onClick={() => onAvailability(t)}><Clock className="h-3.5 w-3.5" /> Availability</Button>
              <button onClick={() => onEdit(t)} className="ml-auto text-muted-foreground hover:text-primary"><Pencil className="h-4 w-4" /></button>
              <button onClick={() => onDelete(t)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TypeEditor({ draft, onChange, onSave, onClose, staffOpts }: {
  draft: Partial<BookingType>; onChange: (d: Partial<BookingType>) => void;
  onSave: (d: Partial<BookingType>) => Promise<void>; onClose: () => void; staffOpts: FieldSelectOption[];
}) {
  const [busy, setBusy] = React.useState(false);
  const set = <K extends keyof BookingType>(k: K, v: BookingType[K]) => onChange({ ...draft, [k]: v });
  async function submit() { setBusy(true); try { await onSave(draft); } finally { setBusy(false); } }
  return (
    <Modal title={draft.id ? "Edit booking type" : "New booking type"} onClose={onClose}>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Name" full><Input value={draft.name ?? ""} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Stewardship Consultation" /></Field>
        <Field label="Description" full><Textarea className="min-h-[60px]" value={draft.description ?? ""} onChange={(e) => set("description", e.target.value)} /></Field>
        <Field label="Duration (minutes)"><Input type="number" min={5} value={draft.duration_minutes ?? 30} onChange={(e) => set("duration_minutes", Number(e.target.value))} /></Field>
        <Field label="Slot interval (optional)"><Input type="number" min={5} value={draft.slot_interval_minutes ?? ""} placeholder="= duration" onChange={(e) => set("slot_interval_minutes", e.target.value ? Number(e.target.value) : null)} /></Field>
        <Field label="Buffer before (min)"><Input type="number" min={0} value={draft.buffer_before_minutes ?? 0} onChange={(e) => set("buffer_before_minutes", Number(e.target.value))} /></Field>
        <Field label="Buffer after (min)"><Input type="number" min={0} value={draft.buffer_after_minutes ?? 0} onChange={(e) => set("buffer_after_minutes", Number(e.target.value))} /></Field>
        <Field label="Location"><FieldSelect value={draft.location_type ?? "video"} onChange={(v) => set("location_type", v as BookingType["location_type"])} options={LOCATION_OPTS} /></Field>
        <Field label="Location details"><Input value={draft.location_details ?? ""} onChange={(e) => set("location_details", e.target.value)} placeholder="Zoom link, address, etc." /></Field>
        <Field label="Timezone"><FieldSelect value={draft.timezone ?? "America/Chicago"} onChange={(v) => set("timezone", v)} options={tzOpts()} /></Field>
        <Field label="Host"><FieldSelect value={draft.host_staff_id ?? ""} onChange={(v) => set("host_staff_id", v || null)} options={staffOpts} /></Field>
        <Field label="Host display name"><Input value={draft.host_name ?? ""} onChange={(e) => set("host_name", e.target.value)} /></Field>
        <Field label="Color"><input type="color" value={draft.color ?? "#0f766e"} onChange={(e) => set("color", e.target.value)} className="h-9 w-full cursor-pointer rounded-md border border-input bg-background" /></Field>
        <Field label="Min notice (hours)"><Input type="number" min={0} value={draft.min_notice_hours ?? 12} onChange={(e) => set("min_notice_hours", Number(e.target.value))} /></Field>
        <Field label="Max advance (days)"><Input type="number" min={1} value={draft.max_advance_days ?? 60} onChange={(e) => set("max_advance_days", Number(e.target.value))} /></Field>
        <Field label="Confirmation message" full><Textarea className="min-h-[52px]" value={draft.confirmation_message ?? ""} onChange={(e) => set("confirmation_message", e.target.value)} placeholder="Shown to the invitee after booking." /></Field>
        <div className="flex flex-wrap gap-4 sm:col-span-2">
          <Toggle checked={draft.is_active ?? true} onChange={(v) => set("is_active", v)} label="Active" />
          <Toggle checked={draft.is_public ?? true} onChange={(v) => set("is_public", v)} label="Public booking page" />
        </div>
        <div className="sm:col-span-2"><QuestionsEditor value={(draft.questions as IntakeQuestion[]) ?? []} onChange={(q) => set("questions", q)} /></div>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={submit} disabled={busy || !String(draft.name ?? "").trim()}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save</Button>
      </div>
    </Modal>
  );
}

// ── Availability modal ──────────────────────────────────────────────────────────
function AvailabilityModal({ type, token, onClose }: { type: BookingType; token: string; onClose: () => void }) {
  const [rules, setRules] = React.useState<Pick<AvailabilityRule, "day_of_week" | "start_time" | "end_time" | "is_active">[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetch(`/api/booking/availability?booking_type_id=${type.id}`, { headers: { "x-mjg-action-token": token } })
      .then((r) => r.json())
      .then((d) => setRules((d.rules ?? []).map((r: AvailabilityRule) => ({ day_of_week: r.day_of_week, start_time: r.start_time.slice(0, 5), end_time: r.end_time.slice(0, 5), is_active: r.is_active }))))
      .catch(() => setErr("Failed to load availability."))
      .finally(() => setLoading(false));
  }, [type.id, token]);

  const byDay = (d: number) => rules.map((r, i) => ({ r, i })).filter(({ r }) => r.day_of_week === d);
  const addWindow = (d: number) => setRules((prev) => [...prev, { day_of_week: d, start_time: "09:00", end_time: "17:00", is_active: true }]);
  const update = (i: number, patch: Partial<typeof rules[number]>) => setRules((prev) => prev.map((r, k) => (k === i ? { ...r, ...patch } : r)));
  const remove = (i: number) => setRules((prev) => prev.filter((_, k) => k !== i));

  async function save() {
    setBusy(true); setErr(null);
    try {
      const res = await fetch("/api/booking/availability", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ booking_type_id: type.id, rules, actionToken: token }) });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || "Save failed.");
      onClose();
    } catch (e) { setErr(e instanceof Error ? e.message : "Save failed."); }
    finally { setBusy(false); }
  }

  return (
    <Modal title={`Availability — ${type.name}`} onClose={onClose} wide>
      <p className="mb-3 text-xs text-muted-foreground">Weekly hours in <span className="font-medium text-foreground">{type.timezone}</span>. Slots are generated from these windows minus existing bookings and buffers.</p>
      {err && <div className="mb-3 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{err}</div>}
      {loading ? <div className="py-10 text-center text-muted-foreground"><Loader2 className="mx-auto h-5 w-5 animate-spin" /></div> : (
        <div className="space-y-1.5">
          {DOW.map((name, d) => (
            <div key={d} className="flex items-start gap-3 rounded-lg border border-border px-3 py-2">
              <div className="w-12 pt-1.5 text-sm font-medium">{name}</div>
              <div className="flex-1 space-y-1.5">
                {byDay(d).length === 0 && <div className="py-1.5 text-xs text-muted-foreground">Unavailable</div>}
                {byDay(d).map(({ r, i }) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-28"><FieldSelect value={r.start_time} onChange={(v) => update(i, { start_time: v })} options={TIME_OPTS} className="h-8" /></div>
                    <span className="text-xs text-muted-foreground">to</span>
                    <div className="w-28"><FieldSelect value={r.end_time} onChange={(v) => update(i, { end_time: v })} options={TIME_OPTS} className="h-8" /></div>
                    <button onClick={() => remove(i)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                ))}
              </div>
              <button onClick={() => addWindow(d)} className="pt-1.5 text-muted-foreground hover:text-primary" title="Add window"><Plus className="h-4 w-4" /></button>
            </div>
          ))}
        </div>
      )}
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={save} disabled={busy || loading}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save availability</Button>
      </div>
    </Modal>
  );
}

// ── Bookings tab ────────────────────────────────────────────────────────────────
function BookingsTab({ bookings, onStatus, onDelete }: { bookings: Booking[]; onStatus: (b: Booking, s: string) => void; onDelete: (b: Booking) => void }) {
  const [filter, setFilter] = React.useState("");
  const now = new Date().toISOString();
  const list = React.useMemo(() => {
    return bookings.filter((b) => {
      if (filter === "upcoming") return b.end_at >= now && b.status !== "canceled";
      if (filter === "past") return b.end_at < now;
      if (filter && filter !== "upcoming" && filter !== "past") return b.status === filter;
      return true;
    });
  }, [bookings, filter, now]);
  if (!bookings.length) return <Empty label="No bookings yet. Share a booking type's public link to start receiving them." />;
  return (
    <div>
      <div className="mb-3 w-44"><FieldSelect value={filter} onChange={setFilter} options={[{ value: "", label: "All bookings" }, { value: "upcoming", label: "Upcoming" }, { value: "past", label: "Past" }, ...BOOKING_STATUS_OPTS]} className="h-8" /></div>
      <div className="overflow-hidden rounded-xl border border-border">
        <div className="divide-y divide-border">
          {list.map((b) => (
            <div key={b.id} className="flex flex-wrap items-center gap-3 px-4 py-3 hover:bg-muted/30">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: b.booking_type?.color || "#0f766e" }} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2"><span className="truncate text-sm font-medium">{b.invitee_name}</span><span className="text-[11px] text-muted-foreground">· {b.booking_type?.name ?? "—"}</span></div>
                <div className="mt-0.5 text-[11px] text-muted-foreground">{fmtDateTime(b.start_at, b.timezone)} – {timeOf(b.end_at, b.timezone)} · {b.invitee_email || b.invitee_phone || "no contact"} · <span className="font-mono">{b.reference}</span></div>
              </div>
              <div className="w-36"><FieldSelect value={b.status} onChange={(v) => onStatus(b, v)} options={BOOKING_STATUS_OPTS} className="h-8" /></div>
              <button onClick={() => onDelete(b)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
          {!list.length && <div className="px-4 py-8 text-center text-sm text-muted-foreground">No bookings match this filter.</div>}
        </div>
      </div>
    </div>
  );
}

// ── Events tab ──────────────────────────────────────────────────────────────────
function EventsTab({ events, origin, onEdit, onRegs, onDelete }: {
  events: EventItem[]; origin: string;
  onEdit: (e: EventItem) => void; onRegs: (e: EventItem) => void; onDelete: (e: EventItem) => void;
}) {
  if (!events.length) return <Empty label="No events yet. Create one to start taking registrations." />;
  return (
    <div className="space-y-3">
      {events.map((e) => {
        const url = `${origin}/events/${e.slug}`;
        const full = e.capacity != null && (e.registered_count ?? 0) >= e.capacity;
        return (
          <div key={e.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2"><span className="truncate font-semibold">{e.title}</span><Pill status={e.status} />{full && <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400">Full</span>}</div>
              <div className="mt-0.5 text-[11px] text-muted-foreground">
                {fmtDateTime(e.start_at, e.timezone)} · {EVENT_LOCATION_OPTS.find((o) => o.value === e.location_type)?.label}
                {e.location_name ? ` · ${e.location_name}` : ""}
              </div>
              <div className="mt-1 flex items-center gap-3">
                {e.status === "published" && e.is_public && <a href={url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary"><ExternalLink className="h-3 w-3" />/events/{e.slug}</a>}
                {e.status === "published" && e.is_public && <CopyLink url={url} />}
              </div>
            </div>
            <button onClick={() => onRegs(e)} className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1 text-xs hover:bg-muted/50">
              <Users className="h-3.5 w-3.5" />{e.registered_count ?? 0}{e.capacity != null ? `/${e.capacity}` : ""}{(e.waitlist_count ?? 0) > 0 ? ` (+${e.waitlist_count} wait)` : ""}
            </button>
            <button onClick={() => onEdit(e)} className="text-muted-foreground hover:text-primary"><Pencil className="h-4 w-4" /></button>
            <button onClick={() => onDelete(e)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
          </div>
        );
      })}
    </div>
  );
}

function EventEditor({ draft, onChange, onSave, onClose, staffOpts }: {
  draft: Partial<EventItem>; onChange: (d: Partial<EventItem>) => void;
  onSave: (d: Partial<EventItem>) => Promise<void>; onClose: () => void; staffOpts: FieldSelectOption[];
}) {
  const [busy, setBusy] = React.useState(false);
  const tz = draft.timezone || "America/Chicago";
  const set = <K extends keyof EventItem>(k: K, v: EventItem[K]) => onChange({ ...draft, [k]: v });
  const startP = isoToParts(draft.start_at ?? null, tz);
  const endP = isoToParts(draft.end_at ?? null, tz);
  const closesP = isoToParts(draft.registration_closes_at ?? null, tz);

  async function submit() { setBusy(true); try { await onSave(draft); } finally { setBusy(false); } }

  return (
    <Modal title={draft.id ? "Edit event" : "New event"} onClose={onClose} wide>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Title" full><Input value={draft.title ?? ""} onChange={(e) => set("title", e.target.value)} /></Field>
        <Field label="Summary" full><Input value={draft.summary ?? ""} onChange={(e) => set("summary", e.target.value)} placeholder="One-line teaser" /></Field>
        <Field label="Description" full><Textarea className="min-h-[72px]" value={draft.description ?? ""} onChange={(e) => set("description", e.target.value)} /></Field>
        <Field label="Status"><FieldSelect value={draft.status ?? "draft"} onChange={(v) => set("status", v as EventItem["status"])} options={EVENT_STATUS_OPTS} /></Field>
        <Field label="Timezone"><FieldSelect value={tz} onChange={(v) => set("timezone", v)} options={tzOpts()} /></Field>
        <Field label="Start date"><DatePicker value={startP.date} onChange={(v) => set("start_at", partsToIso(v, startP.time || "09:00", tz))} allowClear={false} /></Field>
        <Field label="Start time"><FieldSelect value={startP.time || "09:00"} onChange={(v) => set("start_at", partsToIso(startP.date, v, tz))} options={TIME_OPTS} /></Field>
        <Field label="End date"><DatePicker value={endP.date} onChange={(v) => set("end_at", v ? partsToIso(v, endP.time || "10:00", tz) : null)} /></Field>
        <Field label="End time"><FieldSelect value={endP.time || ""} onChange={(v) => set("end_at", endP.date ? partsToIso(endP.date, v, tz) : null)} options={[{ value: "", label: "—" }, ...TIME_OPTS]} /></Field>
        <Field label="Location type"><FieldSelect value={draft.location_type ?? "in_person"} onChange={(v) => set("location_type", v as EventItem["location_type"])} options={EVENT_LOCATION_OPTS} /></Field>
        <Field label="Venue / location name"><Input value={draft.location_name ?? ""} onChange={(e) => set("location_name", e.target.value)} /></Field>
        <Field label="Address" full><Input value={draft.location_address ?? ""} onChange={(e) => set("location_address", e.target.value)} /></Field>
        <Field label="Online URL"><Input value={draft.online_url ?? ""} onChange={(e) => set("online_url", e.target.value)} placeholder="https://…" /></Field>
        <Field label="Cover image URL"><Input value={draft.cover_image_url ?? ""} onChange={(e) => set("cover_image_url", e.target.value)} placeholder="https://…" /></Field>
        <Field label="Capacity (blank = unlimited)"><Input type="number" min={1} value={draft.capacity ?? ""} onChange={(e) => set("capacity", e.target.value ? Number(e.target.value) : null)} /></Field>
        <Field label="Host display name"><Input value={draft.host_name ?? ""} onChange={(e) => set("host_name", e.target.value)} /></Field>
        <Field label="Host"><FieldSelect value={draft.host_staff_id ?? ""} onChange={(v) => set("host_staff_id", v || null)} options={staffOpts} /></Field>
        <Field label="Registration closes"><DatePicker value={closesP.date} onChange={(v) => set("registration_closes_at", v ? partsToIso(v, closesP.time || "23:59", tz) : null)} /></Field>
        <div className="flex flex-wrap gap-4 sm:col-span-2">
          <Toggle checked={draft.registration_required ?? true} onChange={(v) => set("registration_required", v)} label="Registration required" />
          <Toggle checked={draft.is_public ?? true} onChange={(v) => set("is_public", v)} label="Public event page" />
        </div>
        <div className="sm:col-span-2"><QuestionsEditor value={(draft.custom_fields as IntakeQuestion[]) ?? []} onChange={(q) => set("custom_fields", q)} /></div>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={submit} disabled={busy || !String(draft.title ?? "").trim() || !draft.start_at}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save</Button>
      </div>
    </Modal>
  );
}

// ── Registrations modal ─────────────────────────────────────────────────────────
function RegistrationsModal({ event, token, onClose }: { event: EventItem; token: string; onClose: () => void }) {
  const [regs, setRegs] = React.useState<EventRegistration[]>([]);
  const [loading, setLoading] = React.useState(true);

  const reload = React.useCallback(() => {
    setLoading(true);
    fetch(`/api/events/registrations?event_id=${event.id}`, { headers: { "x-mjg-action-token": token } })
      .then((r) => r.json()).then((d) => setRegs(d.registrations ?? [])).finally(() => setLoading(false));
  }, [event.id, token]);
  React.useEffect(reload, [reload]);

  async function setStatus(r: EventRegistration, status: string) {
    setRegs((prev) => prev.map((x) => (x.id === r.id ? { ...x, status: status as EventRegistration["status"] } : x)));
    await fetch(`/api/events/registrations/${r.id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ status, actionToken: token }) });
  }
  async function remove(r: EventRegistration) {
    if (!window.confirm("Remove this registration?")) return;
    await fetch(`/api/events/registrations/${r.id}`, { method: "DELETE", headers: { "content-type": "application/json" }, body: JSON.stringify({ actionToken: token }) });
    reload();
  }

  const csvHref = React.useMemo(() => {
    const rows = [["Name", "Email", "Phone", "Party", "Status", "Registered"], ...regs.map((r) => [r.name, r.email ?? "", r.phone ?? "", String(r.party_size), r.status, r.created_at ?? ""])];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    return `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`;
  }, [regs]);

  return (
    <Modal title={`Registrations — ${event.title}`} onClose={onClose} wide>
      <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
        <span>{regs.filter((r) => r.status !== "canceled").reduce((s, r) => s + r.party_size, 0)} attending{event.capacity != null ? ` of ${event.capacity}` : ""}</span>
        {regs.length > 0 && <a href={csvHref} download={`${event.slug}-registrations.csv`} className="inline-flex items-center gap-1 hover:text-primary"><ExternalLink className="h-3 w-3" /> Export CSV</a>}
      </div>
      {loading ? <div className="py-10 text-center"><Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" /></div> : regs.length === 0 ? <Empty label="No registrations yet." /> : (
        <div className="overflow-hidden rounded-xl border border-border">
          <div className="divide-y divide-border">
            {regs.map((r) => (
              <div key={r.id} className="flex flex-wrap items-center gap-3 px-3 py-2.5">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{r.name}{r.party_size > 1 ? <span className="text-[11px] text-muted-foreground"> +{r.party_size - 1}</span> : ""}</div>
                  <div className="text-[11px] text-muted-foreground">{r.email || r.phone || "no contact"}</div>
                </div>
                <div className="w-36"><FieldSelect value={r.status} onChange={(v) => setStatus(r, v)} options={REG_STATUS_OPTS} className="h-8" /></div>
                <button onClick={() => remove(r)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="mt-5 flex justify-end"><Button variant="outline" onClick={onClose}>Close</Button></div>
    </Modal>
  );
}
