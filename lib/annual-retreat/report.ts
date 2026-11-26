import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { LANDING_PATH } from "./config";

// The Annual Retreat report (Dashboard → Annual Retreat). Each measure is kept
// separate, as Mike asked. A download click is counted as a click, never as the
// guide being read. No personal details leave the database here except the
// recent-requests list on the admin page itself.

const db = () => createSupabaseAdminClient();

type Touch = { utm_source?: string; utm_medium?: string; utm_campaign?: string; utm_content?: string } | null;

export type RetreatReport = {
  sinceDays: number;
  visits: number;
  visitors: number;
  requests: number;
  uniqueContacts: number;
  optIns: number;
  emailFailures: number;
  pageDownloads: number;
  emailClicks: number;
  nextSteps: { createdForMore: number; steward: number };
  followups: { enrolled: number; unsubscribed: number; sent: number; pending: number; skipped: number; failed: number };
  campaigns: { key: string; visits: number; requests: number }[];
  recent: { id: string; created_at: string; email: string; first_name: string | null; marketing_opt_in: boolean; email_status: string; guide_version: string; campaign: string | null }[];
};

/** UTMs on the page the form was submitted from (the social link itself), when present. */
function pageTouch(pageUrl: string | null): Touch {
  if (!pageUrl) return null;
  try {
    const q = new URL(pageUrl, "https://x.invalid").searchParams;
    return q.get("utm_campaign") ? { utm_source: q.get("utm_source") ?? undefined, utm_campaign: q.get("utm_campaign") ?? undefined, utm_content: q.get("utm_content") ?? undefined } : null;
  } catch {
    return null;
  }
}

const label = (t: Touch) => (t?.utm_campaign ? [t.utm_source, t.utm_campaign, t.utm_content].filter(Boolean).join(" · ") : null);

export async function getRetreatReport(sinceDays = 90): Promise<RetreatReport> {
  const since = new Date(Date.now() - sinceDays * 86_400_000).toISOString();
  const client = db();
  const [views, downloads, clicks, requests, enrollments, events] = await Promise.all([
    client.from("analytics_events").select("visitor_hash, utm_source, utm_campaign, utm_content").eq("event", "pageview").eq("path", LANDING_PATH).gte("occurred_at", since).limit(50000),
    client.from("analytics_events").select("id", { count: "exact", head: true }).eq("event", "retreat_download").gte("occurred_at", since),
    client.from("analytics_events").select("id", { count: "exact", head: true }).eq("event", "retreat_email_click").gte("occurred_at", since),
    client
      .from("annual_retreat_requests")
      .select("id, created_at, email, first_name, contact_id, marketing_opt_in, email_status, guide_version, first_touch, session_touch, page_url")
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(10000),
    client.from("annual_retreat_enrollments").select("id, unsubscribed_at").limit(10000),
    client.from("annual_retreat_events").select("status").limit(50000),
  ]);

  const viewRows = views.data ?? [];
  const reqRows = (requests.data ?? []) as {
    id: string;
    created_at: string;
    email: string;
    first_name: string | null;
    contact_id: string | null;
    marketing_opt_in: boolean;
    email_status: string;
    guide_version: string;
    first_touch: Touch;
    session_touch: Touch;
    page_url: string | null;
  }[];

  // Campaign table: visits by the session's UTMs, requests by the visit's (session, else first) touch.
  const camp = new Map<string, { visits: number; requests: number }>();
  for (const v of viewRows) {
    const key = v.utm_campaign ? [v.utm_source, v.utm_campaign, v.utm_content].filter(Boolean).join(" · ") : "(no campaign)";
    const row = camp.get(key) ?? { visits: 0, requests: 0 };
    row.visits++;
    camp.set(key, row);
  }
  for (const r of reqRows) {
    const key = label(pageTouch(r.page_url)) ?? label(r.session_touch) ?? label(r.first_touch) ?? "(no campaign)";
    const row = camp.get(key) ?? { visits: 0, requests: 0 };
    row.requests++;
    camp.set(key, row);
  }

  // Observed next steps: requesters who later completed Created for More or started Steward.
  const firstByEmail = new Map<string, string>();
  for (const r of reqRows) {
    const e = r.email.toLowerCase();
    if (!firstByEmail.has(e) || r.created_at < firstByEmail.get(e)!) firstByEmail.set(e, r.created_at);
  }
  const emails = [...firstByEmail.keys()].slice(0, 1000);
  let createdForMore = 0;
  let steward = 0;
  if (emails.length) {
    const [checkins, profiles] = await Promise.all([
      client.from("check_in_submissions").select("email, created_at").eq("assessment", "created-for-more").in("email", emails).limit(10000),
      client.from("profiles").select("id, email").in("email", emails).limit(5000),
    ]);
    const cfm = new Set<string>();
    for (const c of checkins.data ?? []) {
      const e = String(c.email ?? "").toLowerCase();
      if (firstByEmail.has(e) && c.created_at >= firstByEmail.get(e)!) cfm.add(e);
    }
    createdForMore = cfm.size;
    const profileEmail = new Map((profiles.data ?? []).map((p) => [p.id as string, String(p.email).toLowerCase()]));
    if (profileEmail.size) {
      const { data: convos } = await client.from("steward_conversations").select("profile_id, started_at").in("profile_id", [...profileEmail.keys()]).limit(10000);
      const st = new Set<string>();
      for (const c of convos ?? []) {
        const e = profileEmail.get(c.profile_id as string);
        if (e && String(c.started_at) >= firstByEmail.get(e)!) st.add(e);
      }
      steward = st.size;
    }
  }

  const evRows = events.data ?? [];
  const countStatus = (s: string) => evRows.filter((e) => e.status === s).length;

  return {
    sinceDays,
    visits: viewRows.length,
    visitors: new Set(viewRows.map((v) => v.visitor_hash)).size,
    requests: reqRows.length,
    uniqueContacts: firstByEmail.size,
    optIns: new Set(reqRows.filter((r) => r.marketing_opt_in).map((r) => r.email.toLowerCase())).size,
    emailFailures: reqRows.filter((r) => r.email_status === "failed" || r.email_status === "skipped").length,
    pageDownloads: downloads.count ?? 0,
    emailClicks: clicks.count ?? 0,
    nextSteps: { createdForMore, steward },
    followups: {
      enrolled: (enrollments.data ?? []).length,
      unsubscribed: (enrollments.data ?? []).filter((e) => e.unsubscribed_at).length,
      sent: countStatus("sent"),
      pending: countStatus("pending"),
      skipped: countStatus("skipped") + countStatus("cancelled"),
      failed: countStatus("failed"),
    },
    campaigns: [...camp.entries()].map(([key, v]) => ({ key, ...v })).sort((a, b) => b.visits + b.requests - (a.visits + a.requests)),
    recent: reqRows.slice(0, 25).map((r) => ({
      id: r.id,
      created_at: r.created_at,
      email: r.email,
      first_name: r.first_name,
      marketing_opt_in: r.marketing_opt_in,
      email_status: r.email_status,
      guide_version: r.guide_version,
      campaign: label(pageTouch(r.page_url)) ?? label(r.session_touch) ?? label(r.first_touch),
    })),
  };
}
