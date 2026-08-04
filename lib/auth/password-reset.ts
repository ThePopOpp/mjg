import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { sendSmtpEmail } from "@/lib/email/smtp";

// Generates a Supabase recovery link WITHOUT Supabase sending the email, then delivers
// the branded link through the app's own Resend/SMTP. Shared by the admin action and the
// self-service "Forgot password" flow.
export async function sendPasswordResetEmail(email: string): Promise<{ ok: boolean; sentTo?: string; reason?: string }> {
  const clean = (email ?? "").trim();
  if (!clean) return { ok: false, reason: "A user email is required." };

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.auth.admin.generateLink({ type: "recovery", email: clean });
  if (error) return { ok: false, reason: error.message };
  const hashed = (data as any)?.properties?.hashed_token;
  if (!hashed) return { ok: false, reason: "Could not generate a reset link for this user." };

  const site = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://michaeljgauthier.com").replace(/\/$/, "");
  const link = `${site}/reset-password?token_hash=${encodeURIComponent(hashed)}&type=recovery`;

  const result = await sendSmtpEmail({
    to: clean,
    subject: "Reset your Michael J. Gauthier password",
    html: resetEmailHtml(link),
    text: `Reset your password using this link (valid for 1 hour):\n${link}`,
  });
  if (!result.ok) return { ok: false, reason: result.reason ?? "The reset email could not be sent." };
  return { ok: true, sentTo: clean };
}

function resetEmailHtml(link: string): string {
  const GOLD = "#C9A46E", INK = "#191815";
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1eee7;padding:24px 0;margin:0;">
  <tr><td align="center">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#ffffff;border-radius:8px;overflow:hidden;">
      <tr><td style="padding:36px 40px 20px;text-align:center;">
        <img src="https://michaeljgauthier.com/mjg-logos/mjg_black_white.png" width="88" alt="Michael J. Gauthier" style="display:block;width:88px;height:auto;margin:0 auto 8px;" />
        <div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:0.22em;color:${INK};">MICHAEL J. GAUTHIER</div>
      </td></tr>
      <tr><td style="padding:8px 40px 8px;">
        <h1 style="margin:0 0 12px;font-family:Georgia,serif;font-size:24px;color:${INK};">Reset your password</h1>
        <p style="margin:0 0 16px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">A password reset was requested for your account. Click the button below to choose a new password. This link is valid for one hour.</p>
        <p style="text-align:center;margin:26px 0;"><a href="${link}" style="display:inline-block;background:${INK};color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:6px;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:700;">Set a new password</a></p>
        <p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:#7a736a;">If you didn't request this, you can safely ignore this email — your password won't change.</p>
        <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:#9a948b;word-break:break-all;">Or paste this link into your browser:<br>${link}</p>
      </td></tr>
      <tr><td style="padding:24px 40px 36px;text-align:center;border-top:1px solid #e7e1d5;">
        <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#9a948b;">michaeljgauthier.com</p>
      </td></tr>
    </table>
  </td></tr>
</table>`;
}
