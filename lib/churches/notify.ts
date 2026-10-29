import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { sendSmtpEmail } from "@/lib/email/smtp";
import { sendSms } from "@/lib/twilio/sms";
import { checkSmsConsent } from "@/lib/sms/outbound";
import { toE164 } from "@/lib/sms/contacts";
import { BRAND_KIT, brandEmailHeader } from "@/lib/brand/assets";
import { appUrl } from "@/lib/public-site/static-pages";

// Church notifications. Church admin applications go to the Super Admins: an MJG-branded email
// with Approve / Reject links (every active Super Admin) and a text to Mike when his profile has
// a phone. The links carry a single-use token and open a signed-in approval screen — nothing is
// approved from the link alone.

export const MIKE_EMAIL = "mike@strategicincomegroup.com";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function approvalUrl(token: string, decision?: "approve" | "reject") {
  const q = new URLSearchParams({ token });
  if (decision) q.set("decision", decision);
  return `${appUrl()}/dashboard/church-admins/approve?${q.toString()}`;
}

function shell(inner: string) {
  return `<div style="background:#f1eee7;padding:24px 0;font-family:${BRAND_KIT.fonts.emailSans};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
  <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:600px;background:#ffffff;border-radius:12px;"><tr><td style="padding:28px 36px;">
  ${brandEmailHeader()}
  ${inner}
  </td></tr></table></td></tr></table></div>`;
}

function button(href: string, label: string, primary: boolean) {
  const gold = BRAND_KIT.colors.gold.hex;
  const ink = BRAND_KIT.colors.ink.hex;
  const style = primary
    ? `background:${gold};color:${ink};border:1px solid ${gold};`
    : `background:#ffffff;color:${ink};border:1px solid ${ink};`;
  return `<a href="${href}" style="display:inline-block;${style}text-decoration:none;padding:12px 26px;border-radius:8px;font-weight:700;font-size:15px;margin:0 6px 8px 0;">${label}</a>`;
}

export type ApplicationNotice = {
  applicantName: string;
  applicantEmail: string | null;
  churchName: string;
  churchPlace: string | null;
  isNewChurch: boolean;
  roleTitle: string | null;
  message: string | null;
  expiresAt: string;
};

export type NotifyResult = { emailed: string[]; texted: string | null; smsSkipped: string | null; errors: string[] };

export async function notifySuperAdminsOfChurchAdminApplication(notice: ApplicationNotice, token: string): Promise<NotifyResult> {
  const result: NotifyResult = { emailed: [], texted: null, smsSkipped: null, errors: [] };
  const supabase = createSupabaseAdminClient();
  const { data: admins } = await supabase
    .from("profiles")
    .select("email,phone,first_name")
    .eq("role", "super_admin")
    .eq("status", "active");
  const people = admins ?? [];
  const emails = Array.from(new Set(people.map((p: any) => String(p.email ?? "").toLowerCase()).filter(Boolean)));
  if (!emails.includes(MIKE_EMAIL)) emails.push(MIKE_EMAIL);

  const expires = new Date(notice.expiresAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Phoenix" });
  const ink = BRAND_KIT.colors.ink.hex;
  const gold = BRAND_KIT.colors.gold.hex;
  const html = shell(`
    <p style="margin:8px 0 4px;font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:${gold};font-weight:700;">Church admin application</p>
    <h1 style="margin:0 0 14px;font-family:Georgia,serif;font-size:23px;line-height:1.3;color:${ink};">${esc(notice.applicantName)} wants to be a church admin for ${esc(notice.churchName)}</h1>
    <p style="margin:0 0 14px;font-size:14px;line-height:1.7;color:#3a3632;">
      <strong>Email:</strong> ${esc(notice.applicantEmail ?? "—")}<br/>
      <strong>Church:</strong> ${esc(notice.churchName)}${notice.churchPlace ? ` · ${esc(notice.churchPlace)}` : ""}${notice.isNewChurch ? " <em>(new — created on approval)</em>" : ""}<br/>
      ${notice.roleTitle ? `<strong>Role at church:</strong> ${esc(notice.roleTitle)}<br/>` : ""}
    </p>
    ${notice.message ? `<p style="margin:0 0 16px;padding:12px 14px;border-left:3px solid ${gold};background:#faf7f1;font-size:14px;line-height:1.6;color:#3a3632;">${esc(notice.message)}</p>` : ""}
    <p style="margin:18px 0 6px;">${button(approvalUrl(token, "approve"), "Approve", true)}${button(approvalUrl(token, "reject"), "Reject", false)}</p>
    <p style="margin:12px 0 0;font-size:12px;line-height:1.6;color:#7a736a;">Either button opens the dashboard approval screen; you'll sign in as a Super Admin before anything changes. This link works once and expires ${esc(expires)} (Arizona time).</p>`);
  const text = `${notice.applicantName} (${notice.applicantEmail ?? "no email"}) applied to be a church admin for ${notice.churchName}.\n\nReview (Super Admin sign-in required): ${approvalUrl(token)}\nLink works once; expires ${expires}.`;

  const sent = await sendSmtpEmail({ to: emails, subject: `Church admin application — ${notice.applicantName} · ${notice.churchName}`, html, text }).catch((e) => {
    result.errors.push(`email: ${e instanceof Error ? e.message : String(e)}`);
    return null;
  });
  if (sent?.ok) result.emailed = emails;
  else if (sent) result.errors.push(`email: ${sent.reason ?? "not sent"}`);

  const mike = people.find((p: any) => String(p.email ?? "").toLowerCase() === MIKE_EMAIL);
  const phone = toE164(mike?.phone ?? "");
  if (!phone) {
    result.smsSkipped = "Mike's profile has no phone number";
    console.warn("[churches] church admin application: no phone on Mike's profile — emailed only");
  } else {
    const consent = await checkSmsConsent(phone, { strict: false }).catch(() => ({ allowed: false as const, reason: "consent check failed" }));
    if (!consent.allowed) {
      result.smsSkipped = consent.reason;
    } else {
      await sendSms({ to: phone, body: `MJG: ${notice.applicantName} applied to be church admin for ${notice.churchName}. Review (sign-in required): ${approvalUrl(token)}` })
        .then(() => { result.texted = phone; })
        .catch((e) => result.errors.push(`sms: ${e instanceof Error ? e.message : String(e)}`));
    }
  }
  if (result.errors.length) console.error("[churches] application notice problems", result.errors);
  return result;
}

/** Tell the applicant how their church admin application went. Best-effort. */
export async function notifyChurchAdminDecision(to: string | null, input: { name: string; churchName: string; approved: boolean; note?: string | null }) {
  if (!to) return;
  const html = shell(`
    <h1 style="margin:8px 0 12px;font-family:Georgia,serif;font-size:22px;color:${BRAND_KIT.colors.ink.hex};">${input.approved ? `You're a church admin for ${esc(input.churchName)}` : "About your church admin application"}</h1>
    <p style="font-size:14px;line-height:1.7;color:#3a3632;">${input.approved
      ? `Hi ${esc(input.name)}, your application was approved. You can now review facilitator applications for ${esc(input.churchName)} in your dashboard.`
      : `Hi ${esc(input.name)}, your application to be a church admin for ${esc(input.churchName)} wasn't approved.`}</p>
    ${input.note ? `<p style="font-size:14px;line-height:1.6;color:#3a3632;"><strong>Note:</strong> ${esc(input.note)}</p>` : ""}
    ${input.approved ? `<p style="margin-top:18px;">${button(`${appUrl()}/dashboard/church`, "Open your church", true)}</p>` : ""}`);
  await sendSmtpEmail({ to, subject: input.approved ? `You're a church admin for ${input.churchName}` : "Your church admin application", html });
}

/** Tell the facilitator how their facilitator application went. */
export async function notifyFacilitatorDecision(app: { email: string | null; name: string; churchName: string; status: string; note: string | null }) {
  if (!app.email) return;
  const approved = app.status === "approved";
  const html = shell(`
    <h1 style="margin:8px 0 12px;font-family:Georgia,serif;font-size:22px;color:${BRAND_KIT.colors.ink.hex};">${approved ? `${esc(app.churchName)} approved you as a facilitator` : "About your facilitator application"}</h1>
    <p style="font-size:14px;line-height:1.7;color:#3a3632;">${approved
      ? `Hi ${esc(app.name)}, you can now list your group as an official ${esc(app.churchName)} group on Find a Group.`
      : `Hi ${esc(app.name)}, ${esc(app.churchName)} didn't approve your facilitator application.`}</p>
    ${app.note ? `<p style="font-size:14px;line-height:1.6;color:#3a3632;"><strong>Note:</strong> ${esc(app.note)}</p>` : ""}
    ${approved ? `<p style="margin-top:18px;">${button(`${appUrl()}/dashboard/facilitator-listing`, "Open your listing", true)}</p>` : ""}`);
  await sendSmtpEmail({ to: app.email, subject: approved ? `${app.churchName} approved you as a facilitator` : "Your facilitator application", html });
}

/** Let a church's admins know a facilitator asked to be approved. */
export async function notifyChurchAdminsOfFacilitatorApplication(churchId: string, input: { name: string; churchName: string }) {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase.from("church_admins").select("profiles:profile_id(email)").eq("church_id", churchId).eq("status", "active");
  const to = (data ?? []).map((r: any) => r.profiles?.email).filter(Boolean) as string[];
  if (!to.length) return;
  const html = shell(`
    <h1 style="margin:8px 0 12px;font-family:Georgia,serif;font-size:22px;color:${BRAND_KIT.colors.ink.hex};">${esc(input.name)} asked to lead a group for ${esc(input.churchName)}</h1>
    <p style="font-size:14px;line-height:1.7;color:#3a3632;">Approve or decline their facilitator application from your dashboard.</p>
    <p style="margin-top:18px;">${button(`${appUrl()}/dashboard/church`, "Review applications", true)}</p>`);
  await sendSmtpEmail({ to, subject: `New facilitator application — ${input.name}`, html });
}
