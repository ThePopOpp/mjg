import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { AppRole } from "@/lib/rbac/roles";
import { allowed, type Access } from "./catalog";
import { listItems } from "./items";
import { linearForecast } from "./forecast";

// Server data for the Overview cards. GET /api/dashboard/widgets/[source] checks
// the role may read the source (catalog.sourceAllowed), then calls one of these.
// A source shared by cards with different access (stats, alerts, content…) only
// fills the parts the role may see.

export type LoaderCtx = { profileId: string; email: string; role: AppRole; params: URLSearchParams };
type Loader = (ctx: LoaderCtx) => Promise<unknown>;

const db = () => createSupabaseAdminClient();
const DAY = 86_400_000;

export type StatRange = "today" | "7d" | "30d";
export function rangeStart(range: StatRange, now = new Date()): Date {
  if (range === "today") {
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    return d;
  }
  return new Date(now.getTime() - (range === "7d" ? 7 : 30) * DAY);
}
export const asRange = (v: string | null): StatRange => (v === "today" || v === "30d" ? v : "7d");

/** Head-count; a missing table or column counts as null (shown as "—"), never an error. */
async function count(table: string, build: (q: any) => any): Promise<number | null> {
  const { count: c, error } = await build(db().from(table).select("*", { count: "exact", head: true }));
  return error ? null : c ?? 0;
}

const can = (ctx: LoaderCtx, access: Access) => allowed(ctx.role, access);

// ── Stats ────────────────────────────────────────────────────────────────────
async function stats(ctx: LoaderCtx) {
  const range = asRange(ctx.params.get("range"));
  const since = rangeStart(range).toISOString();
  const now = new Date();
  const weekEnd = new Date(now.getTime() + 7 * DAY).toISOString();
  const tasks: Record<string, Promise<unknown>> = {};
  const mgr = can(ctx, "manager");
  const staff = can(ctx, "staff");

  tasks.notifications = count("notifications", (q) => q.eq("user_id", ctx.profileId).eq("destination", "dashboard").is("read_at", null));
  tasks.messages = (async () => {
    const { getDmStats } = await import("@/lib/direct-messages/data");
    return getDmStats(ctx.profileId).then((s) => s.unread).catch(() => null);
  })();

  if (mgr) {
    tasks.calls = count("calls", (q) => q.gte("created_at", since));
    tasks.outbound = count("calls", (q) => q.gte("created_at", since).eq("direction", "outbound"));
    tasks.inbound = count("calls", (q) => q.gte("created_at", since).eq("direction", "inbound"));
    tasks.missed = count("calls", (q) => q.gte("created_at", since).eq("direction", "inbound").in("status", ["no-answer", "busy", "failed", "canceled", "missed"]));
    tasks.sms = count("sms_messages", (q) => q.gte("created_at", since));
    tasks.smsInbound = count("sms_messages", (q) => q.gte("created_at", since).eq("direction", "inbound"));
    tasks.leads = count("contacts", (q) => q.eq("type", "lead").is("deleted_at", null).gte("created_at", since));
    tasks.signups = count("profiles", (q) => q.gte("created_at", since));
  }
  if (staff) {
    tasks.bookings = count("bookings", (q) => q.is("deleted_at", null).gte("created_at", since));
    tasks.bookingsUpcoming = count("bookings", (q) => q.is("deleted_at", null).neq("status", "cancelled").gte("start_at", now.toISOString()));
    tasks.calendarBookings = count("bookings", (q) => q.is("deleted_at", null).neq("status", "cancelled").gte("start_at", now.toISOString()).lt("start_at", weekEnd));
    tasks.calendarEvents = count("events", (q) => q.gte("start_at", now.toISOString()).lt("start_at", weekEnd));
    tasks.files = count("media_assets", (q) => q);
    tasks.filesNew = count("media_assets", (q) => q.gte("created_at", since));
    tasks.filesBytes = (async () => {
      const { data, error } = await db().from("media_assets").select("file_size").not("file_size", "is", null).limit(20000);
      return error ? null : (data ?? []).reduce((s, r: { file_size: number | null }) => s + (Number(r.file_size) || 0), 0);
    })();
    tasks.checkins = count("check_in_submissions", (q) => q.eq("assessment", "created-for-more").gte("created_at", since));
    tasks.alerts = alertCount(ctx, since);
  }
  if (can(ctx, "admin")) {
    tasks.emails = count("email_messages", (q) => q.is("deleted_at", null).gte("received_at", since));
  }
  if (can(ctx, "super")) {
    tasks.revenue = (async () => {
      const { data, error } = await db().from("steward_orders").select("amount_minor").in("status", ["paid", "partially_refunded"]).gte("paid_at", since).limit(10000);
      return error ? null : (data ?? []).reduce((s, r: { amount_minor: number | null }) => s + (Number(r.amount_minor) || 0), 0);
    })();
  }

  const keys = Object.keys(tasks);
  const values = await Promise.all(keys.map((k) => tasks[k].catch(() => null)));
  return { range, values: Object.fromEntries(keys.map((k, i) => [k, values[i]])) };
}

async function alertCount(ctx: LoaderCtx, since: string) {
  const parts = await Promise.all([
    count("sms_messages", (q) => q.gte("created_at", since).in("status", ["failed", "undelivered"])),
    count("social_posts", (q) => q.gte("created_at", since).eq("status", "failed")),
    can(ctx, "super") ? count("agent_tasks", (q) => q.gte("created_at", since).eq("status", "failed")) : Promise.resolve(0),
    can(ctx, "super") ? count("mcp_pending_confirmations", (q) => q.eq("status", "awaiting_approval")) : Promise.resolve(0),
  ]);
  return parts.reduce<number>((s, n) => s + (n ?? 0), 0);
}

// ── Notifications row ────────────────────────────────────────────────────────
async function alerts(ctx: LoaderCtx) {
  const out: Record<string, unknown> = {};
  const now = new Date().toISOString();
  const jobs = [];

  // Up next: the soonest of my next booking, project task and reminder.
  const nextItems: { kind: string; title: string; at: string; href: string }[] = [];
  if (can(ctx, "staff")) {
    jobs.push(
      (async () => {
        const { data } = await db()
          .from("bookings")
          .select("invitee_name, start_at, booking_type:booking_types(name)")
          .is("deleted_at", null)
          .neq("status", "cancelled")
          .gte("start_at", now)
          .order("start_at", { ascending: true })
          .limit(1);
        const b = data?.[0] as { invitee_name: string; start_at: string; booking_type: { name?: string } | null } | undefined;
        if (b) nextItems.push({ kind: "Booking", title: `${b.booking_type?.name ?? "Booking"} with ${b.invitee_name}`, at: b.start_at, href: "/dashboard/bookings" });
      })(),
      (async () => {
        const { getMyOpenTasks } = await import("@/lib/project-manager/my-tasks");
        const tasks = await getMyOpenTasks({ id: ctx.profileId, role: ctx.role, email: ctx.email }).catch(() => []);
        const t = [...tasks].sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0];
        if (t) nextItems.push({ kind: "Task", title: t.title, at: t.dueDate, href: "/dashboard/project-manager" });
      })(),
    );
  }
  jobs.push(
    (async () => {
      const { data } = await db()
        .from("dashboard_personal_items")
        .select("title, due_at")
        .eq("profile_id", ctx.profileId)
        .eq("kind", "reminder")
        .is("done_at", null)
        .gte("due_at", new Date(Date.now() - DAY).toISOString())
        .order("due_at", { ascending: true })
        .limit(1);
      const r = data?.[0];
      if (r?.due_at) nextItems.push({ kind: "Reminder", title: r.title || "Reminder", at: r.due_at, href: "#reminders" });
    })(),
  );

  if (can(ctx, "super")) {
    jobs.push(
      (async () => {
        const [approvals, open, failed] = await Promise.all([
          count("mcp_pending_confirmations", (q) => q.eq("status", "awaiting_approval")),
          count("agent_tasks", (q) => q.in("status", ["queued", "in_progress", "needs_review"])),
          db().from("agent_tasks").select("title, updated_at").eq("status", "needs_review").order("updated_at", { ascending: false }).limit(1),
        ]);
        out.agent = { approvals: approvals ?? 0, openTasks: open ?? 0, review: failed.data?.[0]?.title ?? null, href: "/dashboard/claude" };
      })(),
    );
  } else if (can(ctx, "staff")) {
    out.agent = { approvals: 0, openTasks: 0, review: null, href: can(ctx, "admin") ? "/dashboard/ai-agent" : null };
  }

  if (can(ctx, "staff")) {
    jobs.push(
      (async () => {
        const since = new Date(Date.now() - 7 * DAY).toISOString();
        const [sms, social, agentFailed, devOpen, changes] = await Promise.all([
          count("sms_messages", (q) => q.gte("created_at", since).in("status", ["failed", "undelivered"])),
          count("social_posts", (q) => q.gte("created_at", since).eq("status", "failed")),
          can(ctx, "super") ? count("agent_tasks", (q) => q.gte("created_at", since).eq("status", "failed")) : Promise.resolve(null),
          can(ctx, "super") ? count("dev_requests", (q) => q.in("status", ["new", "queued", "open", "pending"])) : Promise.resolve(null),
          can(ctx, "super") ? count("website_change_sets", (q) => q.eq("status", "pending")) : Promise.resolve(null),
        ]);
        const list = [
          sms ? { label: `${sms} text message${sms === 1 ? "" : "s"} failed this week`, href: "/dashboard/sms", tone: "bad" } : null,
          social ? { label: `${social} social post${social === 1 ? "" : "s"} failed`, href: "/dashboard/social-media", tone: "bad" } : null,
          agentFailed ? { label: `${agentFailed} agent task${agentFailed === 1 ? "" : "s"} failed`, href: "/dashboard/claude", tone: "bad" } : null,
          changes ? { label: `${changes} website change${changes === 1 ? "" : "s"} to review`, href: "/dashboard/cms", tone: "warn" } : null,
          devOpen ? { label: `${devOpen} dev request${devOpen === 1 ? "" : "s"} queued`, href: "/dashboard/cms", tone: "info" } : null,
        ].filter(Boolean);
        out.jobs = list;
      })(),
    );
  }

  await Promise.all(jobs.map((j) => j.catch(() => undefined)));
  out.next = nextItems.sort((a, b) => a.at.localeCompare(b.at));
  return out;
}

async function notifications(ctx: LoaderCtx) {
  const { listMyUnread } = await import("@/lib/notifications/personal");
  const { fireDueReminders } = await import("./items");
  await fireDueReminders(ctx.profileId).catch(() => undefined);
  return { notifications: await listMyUnread(ctx.profileId) };
}

// ── Tasks, calendar ──────────────────────────────────────────────────────────
async function mytasks(ctx: LoaderCtx) {
  const { getMyOpenTasks } = await import("@/lib/project-manager/my-tasks");
  return { tasks: await getMyOpenTasks({ id: ctx.profileId, role: ctx.role, email: ctx.email }) };
}

async function calendar(ctx: LoaderCtx) {
  // A month either side of the requested month, so paging is instant.
  const month = ctx.params.get("month"); // YYYY-MM
  const base = month && /^\d{4}-\d{2}$/.test(month) ? new Date(`${month}-01T00:00:00`) : new Date();
  const from = new Date(base.getFullYear(), base.getMonth() - 1, 1).toISOString();
  const to = new Date(base.getFullYear(), base.getMonth() + 2, 1).toISOString();
  const [bookings, events, items, tasks] = await Promise.all([
    db()
      .from("bookings")
      .select("id, invitee_name, start_at, end_at, status, booking_type:booking_types(name)")
      .is("deleted_at", null)
      .neq("status", "cancelled")
      .gte("start_at", from)
      .lt("start_at", to)
      .order("start_at")
      .limit(500),
    db().from("events").select("id, title, start_at, end_at, status").gte("start_at", from).lt("start_at", to).order("start_at").limit(300),
    listItems(ctx.profileId, ["reminder"]).catch(() => []),
    import("@/lib/project-manager/my-tasks").then((m) => m.getMyOpenTasks({ id: ctx.profileId, role: ctx.role, email: ctx.email })).catch(() => []),
  ]);
  type Entry = { id: string; kind: "booking" | "event" | "reminder" | "task"; title: string; at: string; href: string };
  const entries: Entry[] = [
    ...((bookings.data ?? []) as { id: string; invitee_name: string; start_at: string; booking_type: { name?: string } | null }[]).map((b) => ({
      id: `b-${b.id}`,
      kind: "booking" as const,
      title: `${b.booking_type?.name ?? "Booking"} · ${b.invitee_name}`,
      at: b.start_at,
      href: "/dashboard/bookings",
    })),
    ...((events.data ?? []) as { id: string; title: string; start_at: string; status: string }[])
      .filter((e) => e.status !== "cancelled" && e.status !== "archived")
      .map((e) => ({ id: `e-${e.id}`, kind: "event" as const, title: e.title, at: e.start_at, href: "/dashboard/bookings" })),
    ...items.filter((i) => i.dueAt && !i.doneAt).map((i) => ({ id: `r-${i.id}`, kind: "reminder" as const, title: i.title || "Reminder", at: i.dueAt as string, href: "#reminders" })),
    ...tasks.map((t) => ({ id: `t-${t.id}`, kind: "task" as const, title: t.title, at: t.dueDate, href: "/dashboard/project-manager" })),
  ];
  return { entries: entries.sort((a, b) => a.at.localeCompare(b.at)) };
}

async function items(ctx: LoaderCtx) {
  return { items: await listItems(ctx.profileId) };
}

// ── Communications ───────────────────────────────────────────────────────────
async function dms(ctx: LoaderCtx) {
  const { getDmStats } = await import("@/lib/direct-messages/data");
  return getDmStats(ctx.profileId);
}

async function calls() {
  const { data, error } = await db()
    .from("calls")
    .select("id, direction, from_number, to_number, status, duration_seconds, recording_url, voicemail_url, created_at, participant:participants(first_name, last_name)")
    .order("created_at", { ascending: false })
    .limit(8);
  if (error) throw new Error(error.message);
  return { calls: data ?? [] };
}

async function sms() {
  const { data, error } = await db()
    .from("sms_conversations")
    .select("id, contact_name, contact_number, last_message_at, last_message_preview, unread_count")
    .order("last_message_at", { ascending: false, nullsFirst: false })
    .limit(8);
  if (error) throw new Error(error.message);
  return { conversations: data ?? [] };
}

async function email() {
  const { data, error } = await db()
    .from("email_messages")
    .select("id, subject, from_name, from_email, snippet, received_at, flags")
    .is("deleted_at", null)
    .order("received_at", { ascending: false, nullsFirst: false })
    .limit(8);
  if (error) throw new Error(error.message);
  return { messages: data ?? [] };
}

// ── Financials, pipeline, reporting ──────────────────────────────────────────
function dailySeries(rows: { at: string | null; value: number }[], days: number) {
  const byDay = new Map<string, number>();
  for (const r of rows) {
    if (!r.at) continue;
    const day = r.at.slice(0, 10);
    byDay.set(day, (byDay.get(day) ?? 0) + r.value);
  }
  const out: { day: string; value: number }[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today.getTime() - i * DAY).toISOString().slice(0, 10);
    out.push({ day: d, value: byDay.get(d) ?? 0 });
  }
  return out;
}

async function revenue() {
  const since = new Date(Date.now() - 90 * DAY).toISOString();
  const { data, error } = await db()
    .from("steward_orders")
    .select("id, offer_key, amount_minor, currency, status, paid_at, created_at")
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(2000);
  if (error) throw new Error(error.message);
  const paid = (data ?? []).filter((o) => o.status === "paid" || o.status === "partially_refunded");
  const series = dailySeries(paid.map((o) => ({ at: o.paid_at, value: (Number(o.amount_minor) || 0) / 100 })), 90);
  const total90 = series.reduce((s, p) => s + p.value, 0);
  const total30 = series.slice(-30).reduce((s, p) => s + p.value, 0);
  return { series, total30, total90, forecast30: linearForecast(series.map((p) => p.value), 30), currency: paid[0]?.currency ?? "usd", recent: (data ?? []).slice(0, 8) };
}

async function leads() {
  const [stages, recent] = await Promise.all([
    db().from("contacts").select("lead_stage").eq("type", "lead").is("deleted_at", null).limit(10000),
    db()
      .from("contacts")
      .select("id, first_name, last_name, company, church, lead_stage, lead_segment, created_at")
      .eq("type", "lead")
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(8),
  ]);
  const counts: Record<string, number> = {};
  for (const r of stages.data ?? []) counts[r.lead_stage ?? "new"] = (counts[r.lead_stage ?? "new"] ?? 0) + 1;
  return { stages: counts, recent: recent.data ?? [] };
}

async function traffic() {
  const { windowFor, getTraffic } = await import("@/lib/analytics/queries");
  const t = await getTraffic(windowFor("30d"));
  return {
    series: t.series.map((p) => ({ day: p.day, value: p.visitors })),
    pages: t.pages.slice(0, 8).map((p) => ({ key: p.key, value: p.pageviews })),
    sources: t.sources.slice(0, 8).map((p) => ({ key: p.key, value: p.sessions })),
  };
}

async function signups() {
  const since = new Date(Date.now() - 60 * DAY).toISOString();
  const { data, error } = await db().from("profiles").select("created_at").gte("created_at", since).limit(20000);
  if (error) throw new Error(error.message);
  const series = dailySeries((data ?? []).map((r) => ({ at: r.created_at, value: 1 })), 60);
  return { series, total: series.reduce((s, p) => s + p.value, 0), forecast14: linearForecast(series.map((p) => p.value), 14) };
}

// ── Content, workspace, agents, files ────────────────────────────────────────
async function content(ctx: LoaderCtx) {
  const out: Record<string, unknown> = {};
  await Promise.all([
    can(ctx, { permission: "review_content" })
      ? db()
          .from("blog_posts")
          .select("id, title, status, publish_at, updated_at")
          .is("deleted_at", null)
          .order("updated_at", { ascending: false })
          .limit(8)
          .then((r) => void (out.blog = r.data ?? []))
      : null,
    can(ctx, "super")
      ? db()
          .from("website_change_sets")
          .select("id, summary, status, risk, created_at")
          .in("status", ["pending", "approved"])
          .order("created_at", { ascending: false })
          .limit(8)
          .then((r) => void (out.website = r.data ?? []))
      : null,
    can(ctx, "admin")
      ? db()
          .from("social_posts")
          .select("id, platform, status, body_text, scheduled_at")
          .in("status", ["scheduled", "approved", "pending_approval", "draft"])
          .order("scheduled_at", { ascending: true, nullsFirst: false })
          .limit(8)
          .then((r) => void (out.social = r.data ?? []))
      : null,
  ]);
  return out;
}

async function workspace() {
  const { data, error } = await db()
    .from("workspace_documents")
    .select("id, title, updated_at, status")
    .is("deleted_at", null)
    .is("archived_at", null)
    .order("updated_at", { ascending: false })
    .limit(8);
  if (error) throw new Error(error.message);
  return { docs: data ?? [] };
}

async function agents() {
  const [tasks, dev] = await Promise.all([
    db()
      .from("agent_tasks")
      .select("id, title, status, priority, due_at, created_at, agent:mcp_tokens(name)")
      .in("status", ["queued", "in_progress", "needs_review"])
      .order("created_at", { ascending: false })
      .limit(8),
    db().from("dev_requests").select("id, title, status, priority, created_at").order("created_at", { ascending: false }).limit(8),
  ]);
  return { tasks: tasks.data ?? [], devRequests: dev.data ?? [] };
}

async function steward() {
  const { getStewardUsageSummary } = await import("@/lib/steward/admin-usage");
  return getStewardUsageSummary(30);
}

async function files() {
  const { data, error } = await db()
    .from("media_assets")
    .select("id, title, asset_type, mime_type, file_size, file_url, created_at")
    .order("created_at", { ascending: false })
    .limit(8);
  if (error) throw new Error(error.message);
  return { files: data ?? [] };
}

// ── Community (the original overview sections) ───────────────────────────────
async function invitations() {
  const { getInvitationCounts, getRecentInvitations } = await import("@/lib/user-management/repository");
  const [counts, recent] = await Promise.all([getInvitationCounts(), getRecentInvitations()]);
  return { counts, invitations: recent };
}

async function community(ctx: LoaderCtx) {
  const [{ getPilotDashboardData, getPilotMetrics }, { getCheckInSubmissionStats, listCheckInSubmissions }, { getSectionSeen }] = await Promise.all([
    import("@/lib/dashboard/pilot-data"),
    import("@/lib/check-in/submissions"),
    import("@/lib/dashboard/section-seen"),
  ]);
  const [data, checkInStats, recentCheckIns, seen] = await Promise.all([getPilotDashboardData(), getCheckInSubmissionStats(), listCheckInSubmissions(6), getSectionSeen(ctx.profileId)]);
  const pilot = getPilotMetrics(data);
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const participants = data.participants as any[];
  const waveByParticipant = new Map<string, string | null>(participants.map((p) => [p.id, p.wave ?? p.source ?? null]));
  const waves = ["wave_0", "wave_1", "wave_2", "wave_3"].map((wave) => ({
    wave,
    invited: participants.filter((r) => r.wave === wave || r.source === wave).length,
    optedIn: participants.filter((r) => (r.wave === wave || r.source === wave) && r.email_journey_opt_in).length,
    completed: (data.checkIns as any[]).filter((r) => waveByParticipant.get(r.participant_id) === wave).length,
    survey: (data.surveys as any[]).filter((r) => r.participants?.wave === wave).length,
  }));
  /* eslint-enable @typescript-eslint/no-explicit-any */
  return {
    participants: participants.length,
    checkIns: checkInStats,
    pilot,
    waves,
    recent: recentCheckIns.map((c) => ({ id: c.id, name: c.name, email: c.email, total_score: c.total_score, stage: c.stage, created_at: c.created_at })),
    // "New since last seen" per section (badge turns red), as on the original overview.
    seen,
    error: data.error ?? null,
  };
}

// ── Get started / profile ────────────────────────────────────────────────────
async function getstarted(ctx: LoaderCtx) {
  const [{ data: profile }, { data: prefs }] = await Promise.all([
    db().from("profiles").select("first_name, last_name, avatar_url, phone").eq("id", ctx.profileId).maybeSingle(),
    db().from("user_preferences").select("dashboard_preferences").eq("user_id", ctx.profileId).maybeSingle(),
  ]);
  const p = (prefs?.dashboard_preferences ?? {}) as Record<string, unknown>;
  const steps = [
    { id: "photo", label: "Add a profile photo", done: !!profile?.avatar_url, href: "/dashboard/profile" },
    { id: "name", label: "Add your full name", done: !!(profile?.first_name && profile?.last_name), href: "/dashboard/profile" },
    { id: "phone", label: "Add your phone number", done: !!profile?.phone, href: "/dashboard/profile" },
    { id: "notify", label: "Choose your notification settings", done: !!p.notify_frequency, href: "/dashboard/settings" },
    { id: "customize", label: "Make this dashboard yours", done: !!p.overview, action: "customize" },
  ];
  return { steps, done: steps.filter((s) => s.done).length, total: steps.length };
}

// ── Weather (Open-Meteo, no key) ─────────────────────────────────────────────
async function weather(ctx: LoaderCtx) {
  const lat = Number(ctx.params.get("lat"));
  const lon = Number(ctx.params.get("lon"));
  if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) return { needsLocation: true };
  const unit = ctx.params.get("unit") === "c" ? "celsius" : "fahrenheit";
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(2)}&longitude=${lon.toFixed(2)}` +
    `&current=temperature_2m,apparent_temperature,weather_code,is_day,wind_speed_10m,relative_humidity_2m` +
    `&daily=temperature_2m_max,temperature_2m_min,weather_code&forecast_days=4&timezone=auto&temperature_unit=${unit}&wind_speed_unit=mph`;
  const res = await fetch(url, { next: { revalidate: 900 } });
  if (!res.ok) throw new Error("Weather is unavailable right now.");
  const j = (await res.json()) as {
    current?: { temperature_2m: number; apparent_temperature: number; weather_code: number; is_day: number; wind_speed_10m: number; relative_humidity_2m: number };
    daily?: { time: string[]; temperature_2m_max: number[]; temperature_2m_min: number[]; weather_code: number[] };
  };
  return {
    unit: unit === "celsius" ? "C" : "F",
    current: j.current
      ? { temp: Math.round(j.current.temperature_2m), feels: Math.round(j.current.apparent_temperature), code: j.current.weather_code, isDay: j.current.is_day === 1, wind: Math.round(j.current.wind_speed_10m), humidity: j.current.relative_humidity_2m }
      : null,
    daily: (j.daily?.time ?? []).map((day, i) => ({ day, max: Math.round(j.daily!.temperature_2m_max[i]), min: Math.round(j.daily!.temperature_2m_min[i]), code: j.daily!.weather_code[i] })),
  };
}

export const LOADERS: Record<string, Loader> = {
  stats,
  alerts,
  notifications,
  mytasks,
  calendar,
  items,
  dms,
  calls,
  sms,
  email,
  revenue,
  leads,
  traffic,
  signups,
  content,
  workspace,
  agents,
  steward,
  files,
  invitations,
  community,
  getstarted,
  weather,
};
