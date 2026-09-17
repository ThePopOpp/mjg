import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { ROLE_LABELS, normalizeAppRole } from "@/lib/rbac/roles";

export const FORMAT_OPTIONS = [
  { value: "print", label: "Print" },
  { value: "ebook", label: "E-Book" },
  { value: "audiobook", label: "Audiobook" },
  { value: "any", label: "Whichever comes first" },
] as const;

export type FormatValue = (typeof FORMAT_OPTIONS)[number]["value"];
/** "Whichever comes first" is mutually exclusive with picking specific editions. */
export const FORMAT_ANY: FormatValue = "any";

export function isFormatValue(value: unknown): value is FormatValue {
  return typeof value === "string" && FORMAT_OPTIONS.some((f) => f.value === value);
}

export const WAITLIST_STATUSES = ["requested", "notified", "fulfilled", "archived"] as const;
export type WaitlistStatus = (typeof WAITLIST_STATUSES)[number];

export type BookWaitlistRequest = {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  profile_id: string | null;
  participant_id: string | null;
  account_type: "registered" | "guest";
  user_role: string | null;
  /** Legacy single value, kept in sync with the first entry of format_preferences. */
  format_preference: string | null;
  format_preferences: string[] | null;
  interest: string | null;
  notes: string | null;
  source: string;
  status: WaitlistStatus;
  notified_at: string | null;
  created_at: string;
};

const SELECT =
  "id,email,first_name,last_name,phone,profile_id,participant_id,account_type,user_role,format_preference,format_preferences,interest,notes,source,status,notified_at,created_at";

export function formatLabel(value: string | null | undefined) {
  return FORMAT_OPTIONS.find((f) => f.value === value)?.label ?? "—";
}

/** Human-readable list of every format someone selected, in the option order. */
export function formatLabels(values: string[] | null | undefined, fallback?: string | null): string {
  const list = (values ?? []).filter(isFormatValue);
  if (!list.length) return fallback ? formatLabel(fallback) : "—";
  return FORMAT_OPTIONS.filter((f) => list.includes(f.value)).map((f) => f.label).join(", ");
}

export function roleLabel(value: string | null | undefined) {
  const role = normalizeAppRole(value);
  return role ? ROLE_LABELS[role] : null;
}

export type JoinWaitlistInput = {
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  formatPreferences?: unknown;
  interest?: string;
  notes?: string;
  source?: string;
};

export type JoinWaitlistResult = {
  id: string;
  email: string;
  /** True when the email matched an existing MJG account (so we don't push them to register). */
  hasAccount: boolean;
  alreadyOnList: boolean;
};

/**
 * Add (or refresh) a waitlist request. Resolves the requester against existing MJG accounts
 * and participant records by email so the request shows on their dashboard and carries their
 * account type + role for reporting.
 */
export async function joinBookWaitlist(input: JoinWaitlistInput): Promise<JoinWaitlistResult> {
  const email = (input.email ?? "").trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error("Enter a valid email address.");

  const supabase = createSupabaseAdminClient();

  const [{ data: profile }, { data: participant }, { data: existing }] = await Promise.all([
    supabase.from("profiles").select("id,role,first_name,last_name,phone").ilike("email", email).maybeSingle(),
    supabase.from("participants").select("id").ilike("email", email).maybeSingle(),
    supabase.from("book_waitlist_requests").select("id,status").ilike("email", email).maybeSingle(),
  ]);

  // Multi-select, de-duped and kept in option order. "Whichever comes first" wins outright.
  const requested = Array.isArray(input.formatPreferences) ? input.formatPreferences.filter(isFormatValue) : [];
  const unique = Array.from(new Set(requested));
  const formats: FormatValue[] = unique.includes(FORMAT_ANY) || !unique.length
    ? [FORMAT_ANY]
    : FORMAT_OPTIONS.map((f) => f.value).filter((v) => unique.includes(v));
  const row = {
    email,
    first_name: (input.firstName ?? "").trim() || profile?.first_name || null,
    last_name: (input.lastName ?? "").trim() || profile?.last_name || null,
    phone: (input.phone ?? "").trim() || profile?.phone || null,
    profile_id: profile?.id ?? null,
    participant_id: participant?.id ?? null,
    account_type: profile ? ("registered" as const) : ("guest" as const),
    user_role: profile?.role ?? null,
    format_preferences: formats,
    // Legacy single column — first selection, so older reads still resolve to something real.
    format_preference: formats[0],
    interest: (input.interest ?? "").trim().slice(0, 2000) || null,
    notes: (input.notes ?? "").trim().slice(0, 2000) || null,
    source: (input.source ?? "").trim().slice(0, 120) || "book_waitlist_page",
    updated_at: new Date().toISOString(),
  };

  // A repeat request refreshes the row rather than creating a duplicate, and never
  // downgrades a status the team already advanced.
  const query = existing
    ? supabase.from("book_waitlist_requests").update(row).eq("id", existing.id)
    : supabase.from("book_waitlist_requests").insert(row);

  const { data: saved, error } = await query.select("id").single();
  if (error) throw error;

  return { id: saved.id as string, email, hasAccount: Boolean(profile), alreadyOnList: Boolean(existing) };
}

export async function listBookWaitlist(limit = 500): Promise<BookWaitlistRequest[]> {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("book_waitlist_requests")
    .select(SELECT)
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as BookWaitlistRequest[];
}

/** One person's request, by email — for their own dashboard. */
export async function getBookWaitlistForEmail(email: string): Promise<BookWaitlistRequest | null> {
  const normalized = (email ?? "").trim().toLowerCase();
  if (!normalized) return null;
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase.from("book_waitlist_requests").select(SELECT).ilike("email", normalized).maybeSingle();
  return (data as BookWaitlistRequest) ?? null;
}

export type BookWaitlistStats = {
  total: number;
  registered: number;
  guests: number;
  last7: number;
  byStatus: Record<WaitlistStatus, number>;
  byFormat: { label: string; count: number }[];
  byRole: { label: string; count: number }[];
};

export async function getBookWaitlistStats(): Promise<BookWaitlistStats> {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("book_waitlist_requests")
    .select("account_type,user_role,format_preference,format_preferences,status,created_at")
    .limit(5000);
  const rows = data ?? [];
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

  const byStatus = { requested: 0, notified: 0, fulfilled: 0, archived: 0 } as Record<WaitlistStatus, number>;
  for (const r of rows) {
    const s = r.status as WaitlistStatus;
    if (s in byStatus) byStatus[s] += 1;
  }

  // A multi-select counts once per chosen format, so these sum to more than `total`.
  const tallyFormats = (selections: string[][]) => {
    const counts = new Map<string, number>();
    for (const sel of selections) {
      for (const v of new Set(sel.filter(isFormatValue))) counts.set(v, (counts.get(v) ?? 0) + 1);
    }
    return FORMAT_OPTIONS.filter((f) => counts.has(f.value)).map((f) => ({ label: f.label, count: counts.get(f.value)! }));
  };

  const tally = (values: (string | null)[]) => {
    const map = new Map<string, number>();
    for (const v of values) map.set(v ?? "—", (map.get(v ?? "—") ?? 0) + 1);
    return [...map.entries()].map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count);
  };

  return {
    total: rows.length,
    registered: rows.filter((r) => r.account_type === "registered").length,
    guests: rows.filter((r) => r.account_type !== "registered").length,
    last7: rows.filter((r) => new Date(r.created_at as string).getTime() >= weekAgo).length,
    byStatus,
    byFormat: tallyFormats(rows.map((r) => (r.format_preferences as string[]) ?? [])),
    byRole: tally(rows.map((r) => roleLabel(r.user_role as string) ?? "No account")),
  };
}

export async function updateBookWaitlistStatus(id: string, status: WaitlistStatus) {
  if (!WAITLIST_STATUSES.includes(status)) throw new Error("Invalid status.");
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("book_waitlist_requests")
    .update({
      status,
      notified_at: status === "notified" ? new Date().toISOString() : undefined,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) throw error;
  return { id, status };
}
