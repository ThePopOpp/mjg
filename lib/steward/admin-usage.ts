import { createSupabaseAdminClient } from "@/lib/supabase/admin";

// Steward as the owner sees it: usage and each member's status. NEVER content —
// no conversation titles (a member's own first words), messages, transcripts or
// Blueprint wording (plan §9 rule 5). Every output is built field by field from
// an allow-list below, so a column added to a table later can't leak through.

const DAY = 24 * 60 * 60 * 1000;

export type StewardMemberRaw = {
  profile: { id: string; first_name?: string | null; last_name?: string | null; email?: string | null; role?: string | null; status?: string | null } | null;
  blueprint: { edition?: string | null; created_at?: string | null; updated_at?: string | null } | null;
  entitlements: { benefit: string; source: string; starts_at: string | null; ends_at: string | null }[];
  conversations: { started_at: string | null; last_active_at: string | null }[];
  runs: { status: string; started_at: string | null }[];
  orders: { offer_key: string; status: string; amount_minor: number | null; currency: string | null; paid_at: string | null; created_at: string | null }[];
};

/** Pure: the member status the connector may see. */
export function memberStatusFrom(raw: StewardMemberRaw) {
  const p = raw.profile;
  const lastActive = raw.conversations.map((c) => c.last_active_at).filter(Boolean).sort().pop() ?? null;
  const monthAgo = Date.now() - 30 * DAY;
  return {
    member: p ? { id: p.id, name: [p.first_name, p.last_name].filter(Boolean).join(" ") || null, email: p.email ?? null, role: p.role ?? null, status: p.status ?? null } : null,
    blueprint: raw.blueprint ? { edition: raw.blueprint.edition ?? null, startedAt: raw.blueprint.created_at ?? null, lastUpdatedAt: raw.blueprint.updated_at ?? null } : null,
    access: raw.entitlements.map((e) => ({ benefit: e.benefit, source: e.source, startsAt: e.starts_at, endsAt: e.ends_at })),
    conversations: { count: raw.conversations.length, lastActiveAt: lastActive },
    repliesLast30Days: raw.runs.filter((r) => r.status === "completed" && r.started_at && new Date(r.started_at).getTime() >= monthAgo).length,
    orders: raw.orders.map((o) => ({ offer: o.offer_key, status: o.status, amountMinor: o.amount_minor, currency: o.currency, paidAt: o.paid_at, createdAt: o.created_at })),
  };
}

function activeNow(e: { starts_at: string | null; ends_at: string | null; revoked_at?: string | null }, now = Date.now()) {
  if (e.revoked_at) return false;
  if (e.starts_at && new Date(e.starts_at).getTime() > now) return false;
  return !e.ends_at || new Date(e.ends_at).getTime() > now;
}

export async function getStewardMemberStatus(email: string) {
  const db = createSupabaseAdminClient();
  const { data: profile, error } = await db.from("profiles").select("id, first_name, last_name, email, role, status").ilike("email", email.trim()).maybeSingle();
  if (error) throw new Error(error.message);
  if (!profile) throw new Error(`No account found for ${email}.`);
  const id = profile.id as string;
  const [blueprint, entitlements, conversations, runs, orders] = await Promise.all([
    db.from("steward_blueprints").select("edition, created_at, updated_at").eq("profile_id", id).maybeSingle(),
    db.from("steward_entitlements").select("benefit, source, starts_at, ends_at, revoked_at").eq("user_id", id),
    db.from("steward_conversations").select("started_at, last_active_at").eq("profile_id", id),
    db.from("steward_agent_runs").select("status, started_at").eq("profile_id", id).gte("started_at", new Date(Date.now() - 30 * DAY).toISOString()),
    db.from("steward_orders").select("offer_key, status, amount_minor, currency, paid_at, created_at").eq("user_id", id).order("created_at", { ascending: false }),
  ]);
  return memberStatusFrom({
    profile,
    blueprint: blueprint.data ?? null,
    entitlements: (entitlements.data ?? []).filter((e) => activeNow(e)),
    conversations: conversations.data ?? [],
    runs: runs.data ?? [],
    orders: orders.data ?? [],
  });
}

const tally = (values: (string | null | undefined)[]) => {
  const m = new Map<string, number>();
  for (const v of values) m.set(v ?? "unknown", (m.get(v ?? "unknown") ?? 0) + 1);
  return Object.fromEntries([...m.entries()].sort((a, b) => b[1] - a[1]));
};

/** Counts only, over the last `days` days (default 30). */
export async function getStewardUsageSummary(days = 30) {
  const db = createSupabaseAdminClient();
  const since = new Date(Date.now() - Math.max(1, days) * DAY).toISOString();
  const [convos, runs, blueprints, entitlements, orders] = await Promise.all([
    db.from("steward_conversations").select("profile_id, started_at, last_active_at").limit(20000),
    db.from("steward_agent_runs").select("status, provider, actual_model, requested_model, input_tokens, output_tokens").gte("started_at", since).limit(50000),
    db.from("steward_blueprints").select("edition").limit(20000),
    db.from("steward_entitlements").select("benefit, source, starts_at, ends_at, revoked_at").limit(20000),
    db.from("steward_orders").select("status, offer_key, amount_minor, paid_at").gte("created_at", since).limit(20000),
  ]);
  for (const r of [convos, runs, blueprints, entitlements, orders]) if (r.error) throw new Error(r.error.message);
  const c = convos.data ?? [];
  const r = runs.data ?? [];
  const sinceMs = new Date(since).getTime();
  const live = (entitlements.data ?? []).filter((e) => activeNow(e));
  const paid = (orders.data ?? []).filter((o) => o.paid_at);
  return {
    rangeDays: days,
    members: {
      everUsed: new Set(c.map((x) => x.profile_id)).size,
      activeInRange: new Set(c.filter((x) => x.last_active_at && new Date(x.last_active_at).getTime() >= sinceMs).map((x) => x.profile_id)).size,
    },
    conversations: { total: c.length, startedInRange: c.filter((x) => x.started_at && new Date(x.started_at).getTime() >= sinceMs).length },
    replies: {
      total: r.length,
      byStatus: tally(r.map((x) => x.status)),
      byModel: tally(r.map((x) => `${x.provider}/${x.actual_model ?? `${x.requested_model} (unconfirmed)`}`)),
      inputTokens: r.reduce((n, x) => n + (x.input_tokens ?? 0), 0),
      outputTokens: r.reduce((n, x) => n + (x.output_tokens ?? 0), 0),
    },
    blueprints: tally((blueprints.data ?? []).map((b) => b.edition)),
    activeAccess: tally(live.map((e) => `${e.benefit} (${e.source})`)),
    ordersInRange: { total: (orders.data ?? []).length, paid: paid.length, paidAmountMinor: paid.reduce((n, o) => n + (o.amount_minor ?? 0), 0), byStatus: tally((orders.data ?? []).map((o) => o.status)) },
  };
}
