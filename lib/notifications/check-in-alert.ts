import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { sendSmtpEmail } from "@/lib/email/smtp";
import { createDashboardNotification } from "@/lib/notifications/notify";
import { dmBadge, getNotifierId } from "@/lib/notifications/system-dm";
import { publicSiteUrl } from "@/lib/public-site/static-pages";
import { MAX_SCORE, type CheckInScore } from "@/lib/check-in/created-for-more";

// Always alert these two, even if their role wouldn't otherwise receive it.
const ALWAYS_EMAIL = ["mike@strategicincomegroup.com", "jwaters@qallus.co"];

function esc(v: string) {
  return v.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}
/**
 * Alert the team when someone completes the Created for More Check-In: a styled email to Mike
 * and Jeremy (+ any super admins), a DM bell notification to both, and a dashboard
 * notification record (surfaces under Community).
 */
export async function alertCheckIn(input: {
  name: string | null;
  email: string | null;
  score: CheckInScore;
  participantId?: string | null;
}) {
  const supabase = createSupabaseAdminClient();
  const { name, email, score } = input;
  const site = publicSiteUrl();
  const displayName = name?.trim() || email || "Someone";

  // ── 1. Styled email to Mike + Jeremy + super admins ──────────────────────────────
  const { data: admins } = await supabase.from("profiles").select("email").eq("role", "super_admin").eq("status", "active").not("email", "is", null);
  const recipients = Array.from(new Set([...(admins ?? []).map((a) => a.email as string), ...ALWAYS_EMAIL].filter(Boolean).map((e) => e.toLowerCase())));

  if (recipients.length) {
    const gold = "#C9A46E", ink = "#191815";
    const layerRows = score.layerScores
      .map((l) => `<tr><td style="padding:5px 0;font-family:Arial,sans-serif;font-size:13px;color:#3a3632;">${esc(l.title)}</td><td style="padding:5px 0;text-align:right;font-family:Arial,sans-serif;font-size:13px;font-weight:700;color:${ink};">${l.score}/20</td></tr>`)
      .join("");
    const html = `<div style="background:#f1eee7;padding:24px 0;font-family:Arial,Helvetica,sans-serif;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1eee7;"><tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:600px;background:#fff;border-radius:12px;overflow:hidden;">
        <tr><td style="padding:26px 40px 0;text-align:center;">
          <img src="https://michaeljgauthier.com/mjg-logos/mjg_black_white.png" width="104" alt="MJG" style="width:104px;height:auto;border:0;" /></td></tr>
        <tr><td style="padding:16px 40px 0;"><hr style="border:none;border-top:1px solid #eee7db;margin:0;" /></td></tr>
        <tr><td style="padding:22px 40px 2px;">
          <p style="margin:0 0 6px;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:${gold};font-weight:700;">New Check-In</p>
          <h1 style="margin:0;font-family:Georgia,serif;font-size:24px;line-height:1.25;color:${ink};font-weight:700;">${esc(displayName)} completed the Created for More Check-In</h1>
        </td></tr>
        <tr><td style="padding:10px 40px 0;">
          <div style="text-align:center;border:1px solid #e7e1d5;border-radius:10px;padding:20px;">
            <div style="font-size:38px;font-weight:700;color:${ink};">${score.total}<span style="font-size:17px;color:#7a736a;"> / ${MAX_SCORE}</span></div>
            <div style="font-size:15px;font-weight:700;color:${ink};margin-top:2px;">${esc(score.stage)}</div>
          </div>
        </td></tr>
        <tr><td style="padding:16px 40px 0;font-family:Arial,sans-serif;font-size:14px;line-height:1.7;color:#3a3632;">
          <strong>Name:</strong> ${esc(name || "—")}<br/>
          <strong>Email:</strong> ${esc(email || "—")}<br/>
          <strong>Strongest:</strong> ${esc(score.strongestLayer)}<br/>
          <strong>Lowest${score.lowestPillar ? ` · ${esc(score.lowestPillar)}` : ""}:</strong> ${esc(score.lowestLayer)}
        </td></tr>
        <tr><td style="padding:14px 40px 0;">
          <table role="presentation" width="100%" style="border-collapse:collapse;border-top:1px solid #eee7db;">${layerRows}</table></td></tr>
        <tr><td style="padding:22px 40px 30px;text-align:center;">
          <a href="${site}/dashboard/check-in-results" style="display:inline-block;background:${gold};color:${ink};text-decoration:none;padding:14px 34px;border-radius:8px;font-size:15px;font-weight:700;">View all check-ins &rarr;</a></td></tr>
      </table></td></tr></table></div>`;
    const text = `New Check-In — ${displayName}\nScore: ${score.total}/${MAX_SCORE} — ${score.stage}\nName: ${name || "—"}\nEmail: ${email || "—"}\nStrongest: ${score.strongestLayer}\nLowest: ${score.lowestLayer}${score.lowestPillar ? ` (${score.lowestPillar})` : ""}\n\nView: ${site}/dashboard/check-in-results`;
    await sendSmtpEmail({ to: recipients, subject: `New Check-In — ${displayName} · ${score.total}/${MAX_SCORE} (${score.stage})`, html, text }).catch((e) => console.error("[check-in-alert] email failed", e instanceof Error ? e.message : e));
  }

  // ── 2. DM bell alert to Mike + Jeremy ────────────────────────────────────────────
  try {
    const notifierId = await getNotifierId(supabase);
    if (notifierId) {
      const { data: targets } = await supabase.from("profiles").select("id,email").in("email", ALWAYS_EMAIL);
      const body = `🔔 New Check-In\n${displayName} · ${score.total}/${MAX_SCORE} · ${score.stage}${email ? `\n${email}` : ""}`;
      for (const t of targets ?? []) await dmBadge(supabase, notifierId, t.id, body).catch((e) => console.error("[check-in-alert] dm failed", t.email, e instanceof Error ? e.message : e));
    }
  } catch (e) {
    console.error("[check-in-alert] dm block failed", e instanceof Error ? e.message : e);
  }

  // ── 3. Dashboard notification record (surfaces under Community) ───────────────────
  await createDashboardNotification({
    type: "check_in_completed",
    title: "New Created for More Check-In",
    message: `${displayName} scored ${score.total}/${MAX_SCORE} — ${score.stage}`,
    participantId: input.participantId ?? undefined,
    metadata: { name, email, total: score.total, stage: score.stage },
  });
}
