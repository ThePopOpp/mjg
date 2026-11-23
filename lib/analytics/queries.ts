import { createSupabaseAdminClient } from "@/lib/supabase/admin";

// Read side of /dashboard/analytics. Everything goes through the SQL functions in
// supabase/migrations/202611210145_web_analytics.sql, plus head-counts of the
// business tables for the conversion KPIs.

export const RANGES = { "7d": 7, "30d": 30, "90d": 90, "365d": 365 } as const;
export type RangeKey = keyof typeof RANGES;

export type Window = { since: string; until: string; prevSince: string; days: number };

export function windowFor(range: RangeKey): Window {
  const days = RANGES[range];
  const until = new Date();
  const since = new Date(until.getTime() - days * 86_400_000);
  const prevSince = new Date(since.getTime() - days * 86_400_000);
  return { since: since.toISOString(), until: until.toISOString(), prevSince: prevSince.toISOString(), days };
}

export type Totals = { pageviews: number; visitors: number; sessions: number; bouncedSessions: number };
export type Breakdown = { key: string; pageviews: number; visitors: number; sessions: number };
export type FunnelRow = { channel: string; signups: number; checkins: number; groupRequests: number; purchases: number; waitlist: number };
export type BotRow = { bot: string; botKind: string; hits: number; pages: number; lastSeen: string };
export type Kpi = { current: number; previous: number };

const n = (v: unknown) => Number(v ?? 0) || 0;

async function rpc<T>(fn: string, args: Record<string, unknown>): Promise<T[]> {
  const { data, error } = await createSupabaseAdminClient().rpc(fn, args);
  if (error) throw new Error(`${fn}: ${error.message}`);
  return (data ?? []) as T[];
}

async function totals(since: string, until: string): Promise<Totals> {
  const [row] = await rpc<Record<string, unknown>>("analytics_totals", { p_since: since, p_until: until });
  return { pageviews: n(row?.pageviews), visitors: n(row?.visitors), sessions: n(row?.sessions), bouncedSessions: n(row?.bounced_sessions) };
}

export async function getBreakdown(w: Window, dim: string, limit = 25): Promise<Breakdown[]> {
  const rows = await rpc<Record<string, unknown>>("analytics_breakdown", { p_since: w.since, p_until: w.until, p_dim: dim, p_limit: limit });
  return rows.map((r) => ({ key: String(r.key), pageviews: n(r.pageviews), visitors: n(r.visitors), sessions: n(r.sessions) }));
}

async function count(table: string, column: string, since: string, until: string, filter?: (q: any) => any): Promise<number> {
  let q = createSupabaseAdminClient().from(table).select("*", { count: "exact", head: true }).gte(column, since).lt(column, until);
  if (filter) q = filter(q);
  const { count: c, error } = await q;
  if (error) throw new Error(`${table}: ${error.message}`);
  return c ?? 0;
}

async function kpi(fn: (since: string, until: string) => Promise<number>, w: Window): Promise<Kpi> {
  const [current, previous] = await Promise.all([fn(w.since, w.until), fn(w.prevSince, w.since)]);
  return { current, previous };
}

export async function getOverview(w: Window) {
  const prevWindow: Window = { since: w.prevSince, until: w.since, prevSince: w.prevSince, days: w.days };
  const [prevChannels, traffic, prevTraffic, signups, attributed, checkins, groupRequests, purchases, waitlist, series, channels, funnel, landing] =
    await Promise.all([
      getBreakdown(prevWindow, "channel", 20),
      totals(w.since, w.until),
      totals(w.prevSince, w.since),
      kpi((a, b) => count("profiles", "created_at", a, b), w),
      count("profile_attribution", "registered_at", w.since, w.until),
      kpi((a, b) => count("check_in_submissions", "created_at", a, b, (q) => q.eq("assessment", "created-for-more")), w),
      kpi((a, b) => count("facilitator_group_reservations", "created_at", a, b, (q) => q.eq("source", "request")), w),
      kpi((a, b) => count("steward_orders", "paid_at", a, b, (q) => q.in("status", ["paid", "partially_refunded"])), w),
      kpi((a, b) => count("book_waitlist_requests", "created_at", a, b), w),
      rpc<Record<string, unknown>>("analytics_series", { p_since: w.since, p_until: w.until }),
      getBreakdown(w, "channel", 20),
      rpc<Record<string, unknown>>("analytics_funnel", { p_since: w.since, p_until: w.until }),
      rpc<Record<string, unknown>>("analytics_landing_signups", { p_since: w.since, p_until: w.until, p_limit: 10 }),
    ]);

  const aiSessions = (rows: Breakdown[]) => rows.find((r) => r.key === "ai")?.sessions ?? 0;
  return {
    aiVisits: { current: aiSessions(channels), previous: aiSessions(prevChannels) } as Kpi,
    traffic,
    prevTraffic,
    signups,
    attributedSignups: attributed,
    checkins,
    groupRequests,
    purchases,
    waitlist,
    series: series.map((r) => ({ day: String(r.day), pageviews: n(r.pageviews), visitors: n(r.visitors), sessions: n(r.sessions) })),
    channels,
    funnel: funnel.map<FunnelRow>((r) => ({
      channel: String(r.channel),
      signups: n(r.signups),
      checkins: n(r.checkins),
      groupRequests: n(r.group_requests),
      purchases: n(r.purchases),
      waitlist: n(r.waitlist),
    })),
    landing: landing.map((r) => ({ path: String(r.path), signups: n(r.signups) })),
  };
}

export async function getTraffic(w: Window) {
  const [series, channelSeries, sources, pages, entries, referrers, devices, countries, campaigns] = await Promise.all([
    rpc<Record<string, unknown>>("analytics_series", { p_since: w.since, p_until: w.until }),
    rpc<Record<string, unknown>>("analytics_channel_series", { p_since: w.since, p_until: w.until }),
    getBreakdown(w, "source"),
    getBreakdown(w, "path"),
    getBreakdown(w, "entry_path"),
    getBreakdown(w, "referrer_host"),
    getBreakdown(w, "device", 5),
    getBreakdown(w, "country", 15),
    getBreakdown(w, "campaign"),
  ]);
  return {
    series: series.map((r) => ({ day: String(r.day), pageviews: n(r.pageviews), visitors: n(r.visitors), sessions: n(r.sessions) })),
    channelSeries: channelSeries.map((r) => ({ day: String(r.day), channel: String(r.channel), sessions: n(r.sessions) })),
    sources, pages, entries, referrers, devices, countries, campaigns,
  };
}

export async function getBots(w: Window) {
  const [bots, aiPages] = await Promise.all([
    rpc<Record<string, unknown>>("analytics_bot_breakdown", { p_since: w.since, p_until: w.until }),
    rpc<Record<string, unknown>>("analytics_bot_pages", { p_since: w.since, p_until: w.until, p_kind: null, p_limit: 20 }),
  ]);
  return {
    bots: bots.map<BotRow>((r) => ({ bot: String(r.bot), botKind: String(r.bot_kind), hits: n(r.hits), pages: n(r.pages), lastSeen: String(r.last_seen) })),
    pages: aiPages.map((r) => ({ path: String(r.path), hits: n(r.hits), bots: n(r.bots) })),
  };
}
