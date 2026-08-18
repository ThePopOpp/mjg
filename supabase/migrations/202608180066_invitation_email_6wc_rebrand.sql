-- Rebrand the invitation email (event: user_invitation, slug: dashboard-invitation)
-- to the 6-Week Challenge + MJG brand: gold (#C9A46E) + ink (#191815) + warm neutrals,
-- NO green. Content is now participant-facing (join the Challenge, create your account,
-- take the Created for More Check-In) instead of admin/dashboard-oriented.
-- Updates in place by slug so the existing user_invitation mapping keeps pointing at it.

update public.email_templates set
  name = '6-Week Challenge Invitation',
  subject = 'You''re invited — The Life You''re Building 6-Week Challenge',
  preheader = 'Accept your invitation, create your participant account, and take the Created for More Check-In.',
  category = 'six_week_challenge',
  status = 'active',
  html_body = $HTML$<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1eee7;padding:24px 0;margin:0;">
  <tr><td align="center">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#ffffff;border-radius:8px;overflow:hidden;">
      <tr><td style="padding:40px 40px 24px;"><div style="text-align:center;">
        <img src="https://michaeljgauthier.com/mjg-logos/mjg_black_white.png" width="92" alt="Michael J. Gauthier" style="display:block;width:92px;max-width:100%;height:auto;margin:0 auto 8px;" />
        <div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:0.22em;color:#191815;">MICHAEL J. GAUTHIER</div>
      </div></td></tr>
      <tr><td style="padding:0 40px;"><div style="border-top:1px solid #e7e1d5;font-size:0;line-height:0;">&nbsp;</div></td></tr>

      <tr><td style="padding:34px 40px 4px;"><div style="text-align:center;">
        <p style="margin:0 0 10px;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#C9A46E;font-weight:700;">The Life You&rsquo;re Building &middot; 6-Week Challenge</p>
        <h1 style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:30px;line-height:1.15;color:#191815;font-weight:700;">You&rsquo;re invited.</h1>
        <p style="margin:12px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#7a736a;">A six-week journey to build a life that matters.</p>
      </div></td></tr>

      <tr><td style="padding:26px 40px 8px;">
        <p style="margin:0 0 16px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">You&rsquo;ve been invited to join <strong>The Life You&rsquo;re Building 6-Week Challenge</strong> &mdash; an honest six-week journey to slow down, look at the life you&rsquo;re actually building, and begin stewarding it with purpose.</p>
        <p style="margin:0 0 14px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.7;color:#3a3632;"><strong>Here&rsquo;s how to begin:</strong></p>
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td valign="top" width="38" style="padding:0 12px 14px 0;"><div style="width:26px;height:26px;border-radius:50%;background:#C9A46E;color:#191815;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;text-align:center;line-height:26px;">1</div></td>
            <td style="padding:2px 0 14px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;color:#3a3632;">Accept your invitation and create your secure participant account.</td>
          </tr>
          <tr>
            <td valign="top" width="38" style="padding:0 12px 14px 0;"><div style="width:26px;height:26px;border-radius:50%;background:#C9A46E;color:#191815;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;text-align:center;line-height:26px;">2</div></td>
            <td style="padding:2px 0 14px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;color:#3a3632;">Take the <strong>Created for More Check-In</strong> &mdash; a 15-minute, whole-life reflection.</td>
          </tr>
          <tr>
            <td valign="top" width="38" style="padding:0 12px 0 0;"><div style="width:26px;height:26px;border-radius:50%;background:#C9A46E;color:#191815;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;text-align:center;line-height:26px;">3</div></td>
            <td style="padding:2px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;color:#3a3632;">Get your Blueprint Snapshot and one faithful next step, then step into the Challenge.</td>
          </tr>
        </table>
      </td></tr>

      <tr><td style="padding:28px 40px 8px;"><div style="border-top:1px solid #e7e1d5;font-size:0;line-height:0;">&nbsp;</div></td></tr>

      <tr><td style="background:#191815;padding:36px 40px;"><div style="text-align:center;">
        <p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#C9A46E;font-weight:700;">Your Invitation Is Ready</p>
        <p style="margin:0 0 22px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.7;color:#d8d2c8;">Create your secure participant account and step in. This link is secure and expires in 14 days.</p>
        <div><a href="{{invite_url}}" style="display:inline-block;background:#C9A46E;color:#191815;text-decoration:none;padding:14px 30px;border-radius:6px;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:700;">Accept Your Invitation &rarr;</a></div>
        <p style="margin:18px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#9a948b;">Already have an account? <a href="https://michaeljgauthier.com/login" style="color:#C9A46E;text-decoration:none;font-weight:700;">Log in</a></p>
      </div></td></tr>

      <tr><td style="padding:32px 40px 4px;">
        <p style="margin:0 0 14px;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#C9A46E;font-weight:700;">What&rsquo;s inside the Challenge</p>
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
          <tr><td valign="top" width="18" style="padding:0 10px 10px 0;font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#C9A46E;font-weight:700;">&bull;</td><td style="padding:0 0 10px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;color:#3a3632;"><strong>Weekly teaching videos</strong> &mdash; one short video anchors each of the six weeks.</td></tr>
          <tr><td valign="top" width="18" style="padding:0 10px 10px 0;font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#C9A46E;font-weight:700;">&bull;</td><td style="padding:0 0 10px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;color:#3a3632;"><strong>The Created for More Check-In</strong> &mdash; a mirror and a map for the life you&rsquo;re building.</td></tr>
          <tr><td valign="top" width="18" style="padding:0 10px 10px 0;font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#C9A46E;font-weight:700;">&bull;</td><td style="padding:0 0 10px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;color:#3a3632;"><strong>Your Personal Blueprint</strong> &mdash; clarity across the seven layers of a well-built life.</td></tr>
          <tr><td valign="top" width="18" style="padding:0 10px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#C9A46E;font-weight:700;">&bull;</td><td style="padding:0 0 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;color:#3a3632;"><strong>Brothers walking it with you</strong> &mdash; honesty, encouragement, and accountability.</td></tr>
        </table>
      </td></tr>

      <tr><td style="padding:28px 40px 22px;"><div>
        <img src="https://michaeljgauthier.com/mjg-logos/mjg_black_white.png" width="42" alt="MJG" style="display:block;width:42px;height:auto;margin:0 0 8px;" />
        <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:18px;color:#191815;">Michael J. Gauthier</p>
        <p style="margin:2px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#7a736a;">Author &middot; The Stewardship Blueprint</p>
      </div></td></tr>

      <tr><td style="background:#191815;padding:26px 40px;"><div style="text-align:center;">
        <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-style:italic;font-size:16px;line-height:1.5;color:#f1eee7;">&ldquo;Every resource you steward is a seed for something greater.&rdquo;</p>
        <p style="margin:10px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:0.14em;color:#C9A46E;font-weight:700;">&mdash; MICHAEL J. GAUTHIER</p>
      </div></td></tr>

      <tr><td style="padding:24px 40px 36px;"><div style="text-align:center;">
        <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#7a736a;">michaeljgauthier.com</p>
        <p style="margin:8px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#9a948b;">You&rsquo;re receiving this because you were invited to The Life You&rsquo;re Building 6-Week Challenge.</p>
        <p style="margin:6px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#9a948b;"><a href="{{preferences_url}}" style="color:#7a736a;">Manage preferences</a> &nbsp;&middot;&nbsp; <a href="{{unsubscribe_url}}" style="color:#7a736a;">Unsubscribe</a></p>
      </div></td></tr>
    </table>
  </td></tr>
</table>$HTML$,
  text_body = $TXT$You're invited — The Life You're Building 6-Week Challenge

You've been invited to join The Life You're Building 6-Week Challenge — an honest six-week journey to slow down, look at the life you're actually building, and begin stewarding it with purpose.

Here's how to begin:
1. Accept your invitation and create your secure participant account.
2. Take the Created for More Check-In — a 15-minute, whole-life reflection.
3. Get your Blueprint Snapshot and one faithful next step, then step into the Challenge.

Accept your invitation (secure link, expires in 14 days): {{invite_url}}
Already have an account? Log in: https://michaeljgauthier.com/login

What's inside the Challenge:
- Weekly teaching videos
- The Created for More Check-In
- Your Personal Blueprint
- Brothers walking it with you

"Every resource you steward is a seed for something greater." — Michael J. Gauthier

michaeljgauthier.com
Manage preferences: {{preferences_url}} · Unsubscribe: {{unsubscribe_url}}$TXT$,
  updated_at = now()
where slug = 'dashboard-invitation';
