import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { sendTemplateEmail } from "@/lib/email/templates";
import { checkSmsConsent } from "@/lib/sms/outbound";
import { renderSmsTemplate } from "@/lib/sms/templates";
import { getOrCreateConversation, sendSms } from "@/lib/twilio/sms";
import { isFacilitatorRole } from "@/lib/rbac/roles";

// Facilitator Welcome Series (docs/Updates-11-16-26/facillitator-welcome-series.md).
//
//   welcome_1   email  immediately after confirmed facilitator signup
//   welcome_sms sms    same day, daytime only, only with SMS consent
//   welcome_2   email  two days after signup
//   welcome_3   email  five days after signup
//
// Rules from the series doc, and where each is enforced:
//   • Once per person — enrollments are unique on lower(email) (migration 143),
//     so a second plan, or arriving through both ForgedLife and MJG, adds nothing.
//   • Study communications take priority — a welcome due within STUDY_GAP of a
//     6-Week Challenge email to the same person waits (deferForStudy).
//   • No assessment reminders — nothing here follows up on Email 2's invitation.
//   • Separate from study automation — no copy here promises study materials.
//   • Off until ready — enrollment and sending both require settings.enabled,
//     and enabling requires the handbook URL and at least one social link.

export const SENDER_NAME = "Michael J. Gauthier | Stewardship Blueprint";

const HOUR = 3_600_000;
const DAY = 24 * HOUR;

export const STEPS = [
  { key: "welcome_1", channel: "email", offsetMs: 0, template: "facilitator-welcome-1" },
  { key: "welcome_sms", channel: "sms", offsetMs: 0, template: "facilitator-welcome-sms" },
  { key: "welcome_2", channel: "email", offsetMs: 2 * DAY, template: "facilitator-welcome-2" },
  { key: "welcome_3", channel: "email", offsetMs: 5 * DAY, template: "facilitator-welcome-3" },
] as const;

export type StepKey = (typeof STEPS)[number]["key"];

/**
 * Texts go out 9am–8pm in the program's time zone (Arizona, no DST — the same
 * convention as lib/experiences/schedule.ts). No per-person time zone is stored.
 */
const PROGRAM_UTC_OFFSET_HOURS = -7;
const SMS_WINDOW = { start: 9, end: 20 };

/** A welcome this close to a study email to the same person waits. */
const STUDY_GAP = 6 * HOUR;
/** …but never more than this past its schedule. Past it, the step is skipped. */
const MAX_DEFER = 3 * DAY;

export type WelcomeSettings = {
  enabled: boolean;
  handbook_url: string | null;
  assessment_url: string;
  resources_url: string;
  instagram_url: string | null;
  facebook_url: string | null;
  linkedin_url: string | null;
};

export type WelcomeSource = "mjg_register" | "mjg_invite" | "forgedlife" | "admin";

const db = () => createSupabaseAdminClient();

export async function getWelcomeSettings(): Promise<WelcomeSettings> {
  const { data, error } = await db()
    .from("facilitator_welcome_settings")
    .select("enabled, handbook_url, assessment_url, resources_url, instagram_url, facebook_url, linkedin_url")
    .eq("id", 1)
    .maybeSingle();
  if (error) throw error;
  return (
    (data as WelcomeSettings | null) ?? {
      enabled: false,
      handbook_url: null,
      assessment_url: "https://michaeljgauthier.com/created-for-more-check-in",
      resources_url: "https://michaeljgauthier.com/resources",
      instagram_url: null,
      facebook_url: null,
      linkedin_url: null,
    }
  );
}

const filled = (v: string | null | undefined) => typeof v === "string" && v.trim() !== "";

/** What still blocks switching the series on. Empty = ready. */
export function readinessProblems(s: WelcomeSettings): string[] {
  const problems: string[] = [];
  if (!filled(s.handbook_url)) problems.push("The Facilitator Handbook URL is not set (used in Email 1 and the Welcome Text).");
  if (!filled(s.instagram_url) && !filled(s.facebook_url) && !filled(s.linkedin_url)) {
    problems.push("No social links are set (Email 3 invites people to connect on social media).");
  }
  return problems;
}

function socialLinks(s: WelcomeSettings) {
  return [
    { label: "Instagram", url: s.instagram_url },
    { label: "Facebook", url: s.facebook_url },
    { label: "LinkedIn", url: s.linkedin_url },
  ].filter((l): l is { label: string; url: string } => filled(l.url) && /^https:\/\//i.test(l.url!.trim()));
}

const escapeHtml = (v: string) =>
  v.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");

/** The small social row under the signature. Labels stay plain ("Facebook"), links are full URLs. */
function socialRowHtml(s: WelcomeSettings) {
  const links = socialLinks(s);
  if (!links.length) return "";
  const items = links
    .map((l) => `<a href="${escapeHtml(l.url.trim())}" style="color:#8a8275;text-decoration:underline;">${l.label}</a>`)
    .join(' <span style="color:#c9c2b6;">|</span> ');
  return `<p style="margin:12px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#8a8275;">Connect with Michael: ${items}</p>`;
}

function socialRowText(s: WelcomeSettings) {
  const links = socialLinks(s);
  return links.length ? `\nConnect with Michael: ${links.map((l) => `${l.label} ${l.url.trim()}`).join(" | ")}` : "";
}

// ── Enrollment ───────────────────────────────────────────────────────────────

export type EnrollInput = {
  email: string;
  firstName?: string | null;
  phone?: string | null;
  profileId?: string | null;
  role?: string | null;
  source: WelcomeSource;
};

export type EnrollResult = { enrolled: boolean; reason?: string };

/**
 * Enroll a newly confirmed facilitator. Safe to call from any signup path, more
 * than once: a person already enrolled (by email, any source) is left alone.
 * Never throws — a welcome email must never break a signup.
 */
export async function enrollFacilitatorWelcome(input: EnrollInput): Promise<EnrollResult> {
  try {
    if (input.role !== undefined && !isFacilitatorRole(input.role)) return { enrolled: false, reason: "not a facilitator" };
    const email = (input.email ?? "").trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { enrolled: false, reason: "no valid email" };

    const settings = await getWelcomeSettings();
    // Off means off: nobody is queued, so turning it on later never releases a
    // backlog of "welcome" emails to people who signed up weeks ago.
    if (!settings.enabled || readinessProblems(settings).length) return { enrolled: false, reason: "series is off" };

    const client = db();
    const { data: enrollment, error } = await client
      .from("facilitator_welcome_enrollments")
      .insert({
        email,
        profile_id: input.profileId ?? null,
        first_name: (input.firstName ?? "").trim() || null,
        phone: (input.phone ?? "").trim() || null,
        source: input.source,
      })
      .select("id, enrolled_at")
      .single();
    if (error) {
      if (error.code === "23505") return { enrolled: false, reason: "already enrolled" };
      throw error;
    }

    const start = new Date(enrollment.enrolled_at as string).getTime();
    const { error: eventsError } = await client.from("facilitator_welcome_events").insert(
      STEPS.map((step) => ({
        enrollment_id: enrollment.id,
        step_key: step.key,
        channel: step.channel,
        scheduled_at: new Date(step.channel === "sms" ? nextSmsWindow(start + step.offsetMs) : start + step.offsetMs).toISOString(),
      })),
    );
    if (eventsError) throw eventsError;

    // Email 1 is "immediately": send it now rather than waiting for the next cron tick.
    await sendDueFacilitatorWelcome({ enrollmentId: enrollment.id as string, limit: STEPS.length }).catch((e) =>
      console.error("[facilitator-welcome] immediate send failed", e instanceof Error ? e.message : e),
    );
    return { enrolled: true };
  } catch (error) {
    console.error("[facilitator-welcome] enroll failed", error instanceof Error ? error.message : error);
    return { enrolled: false, reason: "error" };
  }
}

// ── Timing ───────────────────────────────────────────────────────────────────

/** Program-local hour (0–23) for a UTC timestamp. */
function programHour(ms: number) {
  return new Date(ms + PROGRAM_UTC_OFFSET_HOURS * HOUR).getUTCHours();
}

/** `ms` if it falls inside the daytime window, otherwise the start of the next window. */
export function nextSmsWindow(ms: number): number {
  const hour = programHour(ms);
  if (hour >= SMS_WINDOW.start && hour < SMS_WINDOW.end) return ms;
  const local = new Date(ms + PROGRAM_UTC_OFFSET_HOURS * HOUR);
  const target = new Date(Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate(), SMS_WINDOW.start));
  if (hour >= SMS_WINDOW.end) target.setUTCDate(target.getUTCDate() + 1);
  return target.getTime() - PROGRAM_UTC_OFFSET_HOURS * HOUR;
}

/**
 * When a 6-Week Challenge email to this person is scheduled or was sent within
 * STUDY_GAP of now, the welcome waits until STUDY_GAP after it. Null = go ahead.
 */
async function deferForStudy(email: string, now: number): Promise<number | null> {
  const client = db();
  const { data: attendees } = await client.from("experience_attendees").select("id").ilike("email", email);
  const ids = (attendees ?? []).map((a) => a.id as string);
  if (!ids.length) return null;
  const { data: events } = await client
    .from("experience_send_events")
    .select("scheduled_at, sent_at, status")
    .in("attendee_id", ids)
    .gte("scheduled_at", new Date(now - STUDY_GAP).toISOString())
    .lte("scheduled_at", new Date(now + STUDY_GAP).toISOString());
  const nearby = (events ?? [])
    .filter((e) => e.status !== "cancelled" && e.status !== "skipped")
    .map((e) => new Date((e.sent_at as string | null) ?? (e.scheduled_at as string)).getTime());
  if (!nearby.length) return null;
  return Math.max(...nearby) + STUDY_GAP;
}

// ── Sending ──────────────────────────────────────────────────────────────────

type EventRow = {
  id: string;
  step_key: StepKey;
  channel: "email" | "sms";
  scheduled_at: string;
  attempts: number;
  enrollment: { id: string; email: string; first_name: string | null; phone: string | null; profile_id: string | null; enrolled_at: string };
};

export type SendDueResult = { processed: number; sent: number; skipped: number; deferred: number; failed: number };

const MAX_ATTEMPTS = 3;
/** A claim older than this is treated as abandoned (the sender crashed mid-send). */
const CLAIM_TTL = 10 * 60_000;

/** Release welcome messages whose time has come. Called by the cron and right after enrollment. */
export async function sendDueFacilitatorWelcome(opts: { limit?: number; enrollmentId?: string } = {}): Promise<SendDueResult> {
  const result: SendDueResult = { processed: 0, sent: 0, skipped: 0, deferred: 0, failed: 0 };
  const settings = await getWelcomeSettings();
  // Switched off (or no longer ready): hold everything; nothing is lost.
  if (!settings.enabled || readinessProblems(settings).length) return result;

  const client = db();
  let query = client
    .from("facilitator_welcome_events")
    .select("id, step_key, channel, scheduled_at, attempts, enrollment:facilitator_welcome_enrollments!inner(id, email, first_name, phone, profile_id, enrolled_at)")
    .eq("status", "pending")
    .lte("scheduled_at", new Date().toISOString())
    .order("scheduled_at", { ascending: true })
    .limit(Math.min(Math.max(opts.limit ?? 50, 1), 200));
  if (opts.enrollmentId) query = query.eq("enrollment_id", opts.enrollmentId);
  const { data, error } = await query;
  if (error) throw error;

  for (const row of (data ?? []) as unknown as EventRow[]) {
    // Claim the row first. The immediate send after enrollment and the cron can
    // overlap; only the caller whose claim lands may send, so nobody gets two.
    const claimedAt = new Date().toISOString();
    const { data: claimed } = await client
      .from("facilitator_welcome_events")
      .update({ last_attempt_at: claimedAt })
      .eq("id", row.id)
      .eq("status", "pending")
      .or(`last_attempt_at.is.null,last_attempt_at.lt.${new Date(Date.now() - CLAIM_TTL).toISOString()}`)
      .select("id");
    if (!claimed?.length) continue;

    result.processed++;
    const outcome = await processEvent(row, settings).catch((e) => ({ kind: "failed" as const, error: e instanceof Error ? e.message : String(e) }));
    const now = new Date().toISOString();
    if (outcome.kind === "sent") {
      result.sent++;
      await client.from("facilitator_welcome_events").update({ status: "sent", sent_at: now, last_attempt_at: now, attempts: row.attempts + 1, last_error: null }).eq("id", row.id);
    } else if (outcome.kind === "skipped") {
      result.skipped++;
      await client.from("facilitator_welcome_events").update({ status: "skipped", last_attempt_at: now, last_error: outcome.reason }).eq("id", row.id);
    } else if (outcome.kind === "deferred") {
      result.deferred++;
      await client.from("facilitator_welcome_events").update({ scheduled_at: new Date(outcome.until).toISOString(), last_attempt_at: now, last_error: outcome.reason }).eq("id", row.id);
    } else {
      result.failed++;
      const attempts = row.attempts + 1;
      await client
        .from("facilitator_welcome_events")
        .update({
          status: attempts >= MAX_ATTEMPTS ? "failed" : "pending",
          attempts,
          last_attempt_at: now,
          last_error: outcome.error.slice(0, 500),
          // Retry in an hour; texts still only inside the daytime window.
          scheduled_at: new Date(row.channel === "sms" ? nextSmsWindow(Date.now() + HOUR) : Date.now() + HOUR).toISOString(),
        })
        .eq("id", row.id);
    }
  }
  return result;
}

type Outcome =
  | { kind: "sent" }
  | { kind: "skipped"; reason: string }
  | { kind: "deferred"; until: number; reason: string }
  | { kind: "failed"; error: string };

async function processEvent(row: EventRow, settings: WelcomeSettings): Promise<Outcome> {
  const step = STEPS.find((s) => s.key === row.step_key);
  if (!step) return { kind: "skipped", reason: "Unknown step." };
  const person = row.enrollment;
  const now = Date.now();
  const scheduled = new Date(row.scheduled_at).getTime();

  const studyUntil = await deferForStudy(person.email, now);
  if (studyUntil) {
    if (studyUntil - scheduled > MAX_DEFER) return { kind: "skipped", reason: "Kept clear of study emails for too long." };
    return { kind: "deferred", until: studyUntil, reason: "Waiting for study emails to go first." };
  }

  if (step.channel === "sms") {
    // Same day only: a welcome text that missed its day is not sent late.
    const enrolledDay = new Date(new Date(person.enrolled_at).getTime() + PROGRAM_UTC_OFFSET_HOURS * HOUR).toISOString().slice(0, 10);
    const today = new Date(now + PROGRAM_UTC_OFFSET_HOURS * HOUR).toISOString().slice(0, 10);
    if (enrolledDay !== today) return { kind: "skipped", reason: "Same-day window passed." };
    const window = nextSmsWindow(now);
    if (window !== now) return { kind: "deferred", until: window, reason: "Outside daytime hours." };
    if (!filled(person.phone)) return { kind: "skipped", reason: "No phone number." };
    const consent = await checkSmsConsent(person.phone!, { strict: true });
    if (!consent.allowed) return { kind: "skipped", reason: consent.reason };
    await sendWelcomeText(person, settings);
    return { kind: "sent" };
  }

  const template = await templateBySlug(step.template);
  if (!template) return { kind: "skipped", reason: `Template ${step.template} is missing or archived.` };
  const greeting = (person.first_name ?? "").trim();
  const result = await sendTemplateEmail({
    templateId: template.id,
    fromName: SENDER_NAME,
    replyTo: process.env.FACILITATOR_WELCOME_REPLY_TO?.trim() || undefined,
    recipient: {
      email: person.email,
      first_name: greeting,
      profile_id: person.profile_id ?? undefined,
      merge_data: {
        greeting_name: greeting ? escapeHtml(greeting) : "there",
        handbook_url: settings.handbook_url ?? "",
        assessment_url: settings.assessment_url,
        resources_url: settings.resources_url,
        social_links_html: socialRowHtml(settings),
        social_links_text: socialRowText(settings),
      },
    },
  });
  if (result.skipped) return { kind: "failed", error: result.reason ?? "No email provider configured." };
  return { kind: "sent" };
}

async function templateBySlug(slug: string) {
  const { data } = await db().from("email_templates").select("id, status").eq("slug", slug).maybeSingle();
  if (!data || data.status === "archived") return null;
  return { id: data.id as string };
}

async function sendWelcomeText(person: EventRow["enrollment"], settings: WelcomeSettings) {
  const { data: template } = await db()
    .from("sms_templates")
    .select("body, status")
    .eq("slug", "facilitator-welcome-sms")
    .is("deleted_at", null)
    .maybeSingle();
  if (!template || template.status === "archived") throw new Error("Welcome text template is missing.");
  const name = (person.first_name ?? "").trim();
  // No name: drop ", {{first_name}}" rather than sending "Thanks…facilitate, !".
  const body = name ? (template.body as string) : (template.body as string).replace(/,?\s*\{\{\s*first_name\s*\}\}/g, "");
  const message = renderSmsTemplate(body, { first_name: name, handbook_url: settings.handbook_url ?? "" });
  const conversationId = await getOrCreateConversation(person.phone!, name || null);
  await sendSms({ to: person.phone!, body: message, conversationId });
}
