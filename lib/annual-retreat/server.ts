import { createHash } from "node:crypto";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { sendSmtpEmail } from "@/lib/email/smtp";
import { signUnsubscribe } from "@/lib/email/unsubscribe-token";
import { upsertContactByEmail } from "@/lib/contacts/upsert";
import { FLAGS, isFeatureEnabled } from "@/lib/flags";
import { getCurrentProfile } from "@/lib/auth/server";
import { FOLLOWUP_STEPS, MARKETING_CONSENT_TEXT, SENDER_NAME, SOURCE, guideUrl, siteUrl, stewardUrl, type FollowupKey } from "./config";
import { renderEmail, type EmailKey } from "./emails";

// Annual Retreat Guide, server side (migration 202611260152). See config.ts for
// the shared constants and emails.ts for the copy.

const db = () => createSupabaseAdminClient();
const HOUR = 3_600_000;

// ── Settings and access ──────────────────────────────────────────────────────

export type RetreatSettings = {
  guide_version: string;
  guide_path: string;
  guide_filename: string;
  followups_enabled: boolean;
  mailing_address: string | null;
};

export async function getRetreatSettings(): Promise<RetreatSettings> {
  const { data } = await db().from("annual_retreat_settings").select("guide_version, guide_path, guide_filename, followups_enabled, mailing_address").eq("id", 1).maybeSingle();
  return (
    (data as RetreatSettings | null) ?? {
      guide_version: "1.0",
      guide_path: "Annual_Stewardship_Blueprint_Retreat_Guide_v1_0.pdf",
      guide_filename: "Annual_Stewardship_Blueprint_Retreat_Guide.pdf",
      followups_enabled: false,
      mailing_address: null,
    }
  );
}

const filled = (v: string | null | undefined) => typeof v === "string" && v.trim() !== "";

/** What blocks switching the follow-ups on. Empty = ready. */
export function followupProblems(s: RetreatSettings): string[] {
  const out: string[] = [];
  if (!filled(s.mailing_address)) out.push("The postal address is not set (required in the footer of every follow-up email).");
  return out;
}

export async function retreatIsPublic(): Promise<boolean> {
  const { data, error } = await db().from("feature_flags").select("enabled").eq("key", FLAGS.ANNUAL_RETREAT_PUBLIC).maybeSingle();
  return !error && data?.enabled === true;
}

/** Who may see the pages: everyone once released; super admins (and named testers) while in preview. */
export async function retreatAccess() {
  const profile = await getCurrentProfile().catch(() => null);
  const real = profile && profile.id !== "local-preview" ? profile : null;
  const isPublic = await retreatIsPublic();
  const preview = !isPublic && real ? await isFeatureEnabled(FLAGS.ANNUAL_RETREAT_PUBLIC, { id: real.id, role: real.role }) : false;
  return { isPublic, canView: isPublic || preview, preview };
}

// ── The guide request ────────────────────────────────────────────────────────

export type GuideRequestInput = {
  attemptId: string;
  email: string;
  firstName: string | null;
  marketingOptIn: boolean;
  pageUrl: string | null;
  firstTouch: Record<string, string> | null;
  sessionTouch: Record<string, string> | null;
  ip: string | null;
  userAgent: string | null;
};

export type GuideRequestResult = { email: "sent" | "failed" | "skipped"; repeat: boolean; enrolled: boolean };

export const hashIp = (ip: string | null) => (ip ? createHash("sha256").update(`retreat:${ip}`).digest("hex").slice(0, 32) : null);

/** Recent requests from this address or network, for the rate limit. */
export async function recentRequestCount(email: string, ipHash: string | null): Promise<{ byEmail: number; byIp: number }> {
  const since = new Date(Date.now() - HOUR).toISOString();
  const [e, i] = await Promise.all([
    db().from("annual_retreat_requests").select("id", { count: "exact", head: true }).ilike("email", email).gte("created_at", since),
    ipHash ? db().from("annual_retreat_requests").select("id", { count: "exact", head: true }).eq("ip_hash", ipHash).gte("created_at", since) : Promise.resolve({ count: 0 }),
  ]);
  return { byEmail: e.count ?? 0, byIp: i.count ?? 0 };
}

/**
 * Record one guide request, deliver the guide by email, and (only with the
 * optional permission) enroll the follow-up series. Idempotent per attemptId:
 * a retried submission returns the first result and sends nothing twice.
 * Never creates an account, never touches the 7-day journey.
 */
export async function handleGuideRequest(input: GuideRequestInput): Promise<GuideRequestResult> {
  const client = db();
  const email = input.email.trim().toLowerCase();

  // A retry of the same attempt: report what already happened.
  const { data: prior } = await client.from("annual_retreat_requests").select("id, email_status").eq("attempt_id", input.attemptId).maybeSingle();
  if (prior) return { email: prior.email_status === "sent" ? "sent" : prior.email_status === "skipped" ? "skipped" : "failed", repeat: true, enrolled: false };

  const settings = await getRetreatSettings();
  const contact = await upsertContactByEmail({ email, firstName: input.firstName, source: SOURCE, tag: SOURCE, marketingConsent: input.marketingOptIn });
  const now = new Date().toISOString();

  const { data: requestRow, error } = await client
    .from("annual_retreat_requests")
    .insert({
      attempt_id: input.attemptId,
      contact_id: contact.id,
      email,
      first_name: input.firstName,
      source: SOURCE,
      guide_version: settings.guide_version,
      marketing_opt_in: input.marketingOptIn,
      consent_text: input.marketingOptIn ? MARKETING_CONSENT_TEXT : null,
      consented_at: input.marketingOptIn ? now : null,
      page_url: input.pageUrl,
      first_touch: input.firstTouch,
      session_touch: input.sessionTouch,
      ip_hash: hashIp(input.ip),
    })
    .select("id")
    .single();
  if (error) {
    // Two tabs submitting the same attempt at once: the other one owns it.
    if (error.code === "23505") return { email: "sent", repeat: true, enrolled: false };
    throw new Error(error.message);
  }

  // Marketing permission, recorded separately from the request, with its exact wording.
  if (input.marketingOptIn) {
    await client.from("consent_events").insert({
      entity_type: "contact",
      entity_id: contact.id,
      channel: "email",
      event_type: "opt_in",
      source: "web_form",
      form_type: SOURCE,
      disclosure_text: MARKETING_CONSENT_TEXT,
      ip_address: input.ip,
      user_agent: input.userAgent,
      metadata: { page_url: input.pageUrl, request_id: requestRow.id, previously_opted_out: contact.previouslyOptedOut },
    });
  }

  // Email 1: the guide. Requested mail, sent whatever the marketing choice.
  const delivery = await sendRetreatEmail("delivery", { email, firstName: input.firstName, contactId: contact.id, withUnsubscribe: false });
  await client
    .from("annual_retreat_requests")
    .update({ email_status: delivery.status, email_message_id: delivery.messageId ?? null, email_error: delivery.error ?? null, emailed_at: delivery.status === "sent" ? new Date().toISOString() : null })
    .eq("id", requestRow.id);

  let enrolled = false;
  if (input.marketingOptIn) enrolled = await enrollFollowups({ email, firstName: input.firstName, contactId: contact.id, requestId: requestRow.id as string, settings });

  return { email: delivery.status, repeat: false, enrolled };
}

// ── Sending ──────────────────────────────────────────────────────────────────

type SendOutcome = { status: "sent" | "failed" | "skipped"; messageId?: string; error?: string };

/** The footer link: a confirmation page (a person clicks the button there). */
export function unsubscribeLink(email: string): string {
  return `${siteUrl()}/email/unsubscribe?t=${encodeURIComponent(signUnsubscribe(email, "annual_retreat"))}`;
}

/** The List-Unsubscribe header target: inboxes POST here for one-click unsubscribe (RFC 8058). */
export function oneClickUnsubscribeUrl(email: string): string {
  return `${siteUrl()}/api/public/email/unsubscribe?t=${encodeURIComponent(signUnsubscribe(email, "annual_retreat"))}`;
}

/** Render and send one retreat email, logging it to email_send_logs. */
export async function sendRetreatEmail(
  key: EmailKey,
  opts: { email: string; firstName: string | null; contactId?: string | null; withUnsubscribe: boolean; subjectPrefix?: string; mailingAddress?: string | null; actorId?: string | null },
): Promise<SendOutcome> {
  const base = siteUrl();
  const unsub = opts.withUnsubscribe ? unsubscribeLink(opts.email) : null;
  const rendered = renderEmail(key, {
    firstName: opts.firstName,
    guideUrl: guideUrl("email", base),
    stewardUrl: stewardUrl(base),
    siteUrl: base,
    unsubscribe: unsub ? { url: unsub, mailingAddress: opts.mailingAddress ?? "" } : null,
  });
  const subject = `${opts.subjectPrefix ?? ""}${rendered.subject}`;
  let outcome: SendOutcome;
  try {
    const result = await sendSmtpEmail({
      to: opts.email,
      subject,
      html: rendered.html,
      text: rendered.text,
      fromName: SENDER_NAME,
      replyTo: process.env.ANNUAL_RETREAT_REPLY_TO?.trim() || undefined,
      headers: unsub ? { "List-Unsubscribe": `<${oneClickUnsubscribeUrl(opts.email)}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" } : undefined,
    });
    outcome = result.skipped ? { status: "skipped", error: result.reason } : { status: "sent", messageId: result.messageId };
  } catch (e) {
    outcome = { status: "failed", error: (e instanceof Error ? e.message : String(e)).slice(0, 500) };
  }
  await db()
    .from("email_send_logs")
    .insert({
      recipient_email: opts.email,
      recipient_name: opts.firstName,
      recipient_type: "contact",
      subject,
      status: outcome.status,
      provider: "smtp",
      provider_message_id: outcome.messageId ?? null,
      error_message: outcome.error ?? null,
      merge_data: { campaign: SOURCE, email_key: key, contact_id: opts.contactId ?? null },
      sent_by: opts.actorId ?? null,
      sent_at: outcome.status === "sent" ? new Date().toISOString() : null,
    })
    .then(({ error }) => error && console.error("[annual-retreat] send log failed", error.message));
  return outcome;
}

// ── Follow-up series ─────────────────────────────────────────────────────────

/**
 * Enroll once per address. While the series is off nobody is queued, so turning
 * it on later never releases a backlog. A repeat request never re-enrolls.
 */
export async function enrollFollowups(input: { email: string; firstName: string | null; contactId: string; requestId: string; settings?: RetreatSettings }): Promise<boolean> {
  try {
    const settings = input.settings ?? (await getRetreatSettings());
    if (!settings.followups_enabled || followupProblems(settings).length) return false;
    const client = db();
    const { data: enrollment, error } = await client
      .from("annual_retreat_enrollments")
      .insert({ email: input.email, first_name: input.firstName, contact_id: input.contactId, request_id: input.requestId })
      .select("id, enrolled_at")
      .single();
    if (error) {
      if (error.code === "23505") return false; // already enrolled (by email)
      throw error;
    }
    const start = new Date(enrollment.enrolled_at as string).getTime();
    const { error: evErr } = await client
      .from("annual_retreat_events")
      .insert(FOLLOWUP_STEPS.map((s) => ({ enrollment_id: enrollment.id, step_key: s.key, scheduled_at: new Date(start + s.offsetMs).toISOString() })));
    if (evErr) throw evErr;
    return true;
  } catch (e) {
    console.error("[annual-retreat] enroll failed", e instanceof Error ? e.message : e);
    return false;
  }
}

/** Permission, checked again at send time: this series, the contact, the account, the participant record. */
export async function hasRetreatPermission(email: string, enrollmentId: string): Promise<{ ok: boolean; reason?: string }> {
  const client = db();
  const [{ data: enrollment }, { data: contacts }, { data: profile }, { data: participant }] = await Promise.all([
    client.from("annual_retreat_enrollments").select("unsubscribed_at").eq("id", enrollmentId).maybeSingle(),
    client.from("contacts").select("email_opt_in").ilike("email", email).is("deleted_at", null),
    client.from("profiles").select("email_opt_in").ilike("email", email).limit(1).maybeSingle(),
    client.from("participants").select("email_opt_in").ilike("email", email).limit(1).maybeSingle(),
  ]);
  if (enrollment?.unsubscribed_at) return { ok: false, reason: "Unsubscribed from the retreat series." };
  if (!(contacts ?? []).some((c) => c.email_opt_in === true)) return { ok: false, reason: "No active marketing permission on the contact." };
  if (profile?.email_opt_in === false || participant?.email_opt_in === false) return { ok: false, reason: "Opted out of email." };
  return { ok: true };
}

const MAX_ATTEMPTS = 3;
const CLAIM_TTL = 10 * 60_000;

export type FollowupRunResult = { processed: number; sent: number; skipped: number; failed: number };

/** Send follow-ups whose time has come. Runs on the experiences cron tick. Off = holds everything. */
export async function sendDueRetreatFollowups(opts: { limit?: number } = {}): Promise<FollowupRunResult> {
  const result: FollowupRunResult = { processed: 0, sent: 0, skipped: 0, failed: 0 };
  const settings = await getRetreatSettings();
  if (!settings.followups_enabled || followupProblems(settings).length) return result;
  const client = db();
  const { data, error } = await client
    .from("annual_retreat_events")
    .select("id, step_key, attempts, enrollment:annual_retreat_enrollments!inner(id, email, first_name, contact_id)")
    .eq("status", "pending")
    .lte("scheduled_at", new Date().toISOString())
    .order("scheduled_at", { ascending: true })
    .limit(Math.min(Math.max(opts.limit ?? 50, 1), 200));
  if (error) throw error;

  type Row = { id: string; step_key: FollowupKey; attempts: number; enrollment: { id: string; email: string; first_name: string | null; contact_id: string | null } };
  for (const row of (data ?? []) as unknown as Row[]) {
    // Claim first so two overlapping runs can't both send.
    const { data: claimed } = await client
      .from("annual_retreat_events")
      .update({ last_attempt_at: new Date().toISOString() })
      .eq("id", row.id)
      .eq("status", "pending")
      .or(`last_attempt_at.is.null,last_attempt_at.lt.${new Date(Date.now() - CLAIM_TTL).toISOString()}`)
      .select("id");
    if (!claimed?.length) continue;
    result.processed++;
    const now = new Date().toISOString();

    const permission = await hasRetreatPermission(row.enrollment.email, row.enrollment.id);
    if (!permission.ok) {
      result.skipped++;
      await client.from("annual_retreat_events").update({ status: "skipped", last_error: permission.reason }).eq("id", row.id);
      continue;
    }
    const sent = await sendRetreatEmail(row.step_key, {
      email: row.enrollment.email,
      firstName: row.enrollment.first_name,
      contactId: row.enrollment.contact_id,
      withUnsubscribe: true,
      mailingAddress: settings.mailing_address,
    });
    if (sent.status === "sent") {
      result.sent++;
      await client.from("annual_retreat_events").update({ status: "sent", sent_at: now, attempts: row.attempts + 1, last_error: null, provider_message_id: sent.messageId ?? null }).eq("id", row.id);
    } else {
      result.failed++;
      const attempts = row.attempts + 1;
      await client
        .from("annual_retreat_events")
        .update({ status: attempts >= MAX_ATTEMPTS ? "failed" : "pending", attempts, last_error: (sent.error ?? sent.status).slice(0, 500), scheduled_at: new Date(Date.now() + HOUR).toISOString() })
        .eq("id", row.id);
    }
  }
  return result;
}

// ── Unsubscribe ──────────────────────────────────────────────────────────────

/**
 * Stop the retreat series for an address: mark the enrollment, cancel anything
 * pending, and withdraw marketing permission on their contact (with a recorded
 * opt-out). Safe to call for an address that never enrolled.
 */
export async function unsubscribeFromRetreat(email: string, meta: { ip: string | null; userAgent: string | null; via: string }) {
  const client = db();
  const address = email.trim().toLowerCase();
  const now = new Date().toISOString();
  const { data: enrollments } = await client.from("annual_retreat_enrollments").update({ unsubscribed_at: now }).ilike("email", address).is("unsubscribed_at", null).select("id");
  const ids = (enrollments ?? []).map((e) => e.id as string);
  const { data: all } = await client.from("annual_retreat_enrollments").select("id").ilike("email", address);
  const allIds = (all ?? []).map((e) => e.id as string);
  if (allIds.length) await client.from("annual_retreat_events").update({ status: "cancelled", last_error: "Unsubscribed." }).in("enrollment_id", allIds).eq("status", "pending");

  const { data: contacts } = await client.from("contacts").select("id, email_opt_in").ilike("email", address).is("deleted_at", null);
  for (const c of contacts ?? []) {
    if (c.email_opt_in !== false) await client.from("contacts").update({ email_opt_in: false }).eq("id", c.id);
    await client.from("consent_events").insert({
      entity_type: "contact",
      entity_id: c.id,
      channel: "email",
      event_type: "opt_out",
      source: "web_form",
      form_type: SOURCE,
      ip_address: meta.ip,
      user_agent: meta.userAgent,
      metadata: { via: meta.via },
    });
  }
  return { enrollmentsStopped: ids.length, contactsUpdated: (contacts ?? []).length };
}

// ── Download ─────────────────────────────────────────────────────────────────

/** The current approved guide file from the private bucket. */
export async function loadGuideFile(): Promise<{ body: ArrayBuffer; filename: string; version: string } | null> {
  const settings = await getRetreatSettings();
  const { data, error } = await db().storage.from("annual-retreat").download(settings.guide_path);
  if (error || !data) return null;
  return { body: await data.arrayBuffer(), filename: settings.guide_filename, version: settings.guide_version };
}
