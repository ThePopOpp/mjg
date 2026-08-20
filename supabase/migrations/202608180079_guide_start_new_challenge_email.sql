-- A sendable email template the owner can send to himself and future facilitators:
-- a branded, step-by-step guide to starting a new challenge from the dashboard.
insert into public.email_templates (name, slug, subject, preheader, category, status, available_fields, html_body, text_body)
values (
  'Guide · How to Start a New Challenge',
  'guide-start-new-challenge',
  'How to Start a New Challenge in the MJG Dashboard',
  'A quick step-by-step for launching the 6-Week Challenge.',
  'six_week_challenge_facilitator',
  'active',
  array['first_name']::text[],
  $H$<div style="background:#f1eee7;padding:24px 0;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1eee7;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;">
        <tr><td style="padding:28px 40px 0;text-align:center;">
          <img src="https://michaeljgauthier.com/mjg-logos/mjg_black_white.png" width="120" alt="Michael J. Gauthier" style="width:120px;height:auto;border:0;" />
        </td></tr>
        <tr><td style="padding:18px 40px 0;"><hr style="border:none;border-top:1px solid #eee7db;margin:0;" /></td></tr>
        <tr><td style="padding:24px 40px 4px;text-align:center;">
          <p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#C9A46E;font-weight:700;">Facilitator Guide</p>
          <h1 style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:28px;line-height:1.2;color:#191815;font-weight:700;">How to Start a New Challenge</h1>
        </td></tr>
        <tr><td style="padding:18px 40px 6px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">
          Hi {{first_name}},<br /><br />
          Launching a challenge takes about two minutes. Here is the whole flow, start to finish &mdash; you do it all from the <strong>Experiences</strong> page in the dashboard.
        </td></tr>
        <tr><td style="padding:12px 40px 6px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-family:Arial,Helvetica,sans-serif;">
            <tr>
              <td valign="top" width="40" style="padding:0 12px 16px 0;"><div style="width:26px;height:26px;border-radius:50%;background:#C9A46E;color:#191815;font-size:13px;font-weight:700;text-align:center;line-height:26px;">1</div></td>
              <td style="padding:2px 0 16px;font-size:14px;line-height:1.6;color:#3a3632;">Click <strong>Start New Challenge</strong> on the Experiences page.</td>
            </tr>
            <tr>
              <td valign="top" width="40" style="padding:0 12px 16px 0;"><div style="width:26px;height:26px;border-radius:50%;background:#C9A46E;color:#191815;font-size:13px;font-weight:700;text-align:center;line-height:26px;">2</div></td>
              <td style="padding:2px 0 16px;font-size:14px;line-height:1.6;color:#3a3632;">Pick the challenge &mdash; <strong>6 Week Challenge</strong> (weekly) or <strong>6 Week Challenge - Bi-Weekly</strong> (every other week, 12 weeks). Same emails, different pace.</td>
            </tr>
            <tr>
              <td valign="top" width="40" style="padding:0 12px 16px 0;"><div style="width:26px;height:26px;border-radius:50%;background:#C9A46E;color:#191815;font-size:13px;font-weight:700;text-align:center;line-height:26px;">3</div></td>
              <td style="padding:2px 0 16px;font-size:14px;line-height:1.6;color:#3a3632;">Add the men joining &mdash; a name and email for each. Add as many as you like.</td>
            </tr>
            <tr>
              <td valign="top" width="40" style="padding:0 12px 16px 0;"><div style="width:26px;height:26px;border-radius:50%;background:#C9A46E;color:#191815;font-size:13px;font-weight:700;text-align:center;line-height:26px;">4</div></td>
              <td style="padding:2px 0 16px;font-size:14px;line-height:1.6;color:#3a3632;">Send the invitations &mdash; <strong>Send now</strong>, or <strong>Schedule</strong> them for a later date and time.</td>
            </tr>
            <tr>
              <td valign="top" width="40" style="padding:0 12px 16px 0;"><div style="width:26px;height:26px;border-radius:50%;background:#C9A46E;color:#191815;font-size:13px;font-weight:700;text-align:center;line-height:26px;">5</div></td>
              <td style="padding:2px 0 16px;font-size:14px;line-height:1.6;color:#3a3632;">Set the <strong>challenge start date</strong> &mdash; the actual Week 1 date and time. The 48-hour and 24-hour reminder emails fire before this automatically.</td>
            </tr>
            <tr>
              <td valign="top" width="40" style="padding:0 12px 16px 0;"><div style="width:26px;height:26px;border-radius:50%;background:#C9A46E;color:#191815;font-size:13px;font-weight:700;text-align:center;line-height:26px;">6</div></td>
              <td style="padding:2px 0 16px;font-size:14px;line-height:1.6;color:#3a3632;">Set <strong>Visibility</strong> &mdash; all facilitators, selected facilitators, or admins only. You can also assign one facilitator as the owner.</td>
            </tr>
            <tr>
              <td valign="top" width="40" style="padding:0 12px 0 0;"><div style="width:26px;height:26px;border-radius:50%;background:#C9A46E;color:#191815;font-size:13px;font-weight:700;text-align:center;line-height:26px;">7</div></td>
              <td style="padding:2px 0 0;font-size:14px;line-height:1.6;color:#3a3632;">Keep <strong>Start the challenge</strong> on and click <strong>Start Challenge</strong>. Turn it off first to save it as a draft.</td>
            </tr>
          </table>
        </td></tr>
        <tr><td style="padding:18px 40px 0;">
          <div style="background:#191815;border-radius:10px;padding:22px 26px;">
            <p style="margin:0 0 14px;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#C9A46E;font-weight:700;">What happens automatically</p>
            <p style="margin:0 0 10px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;color:#e3ddd1;">When someone accepts their invite, they instantly get the <strong style="color:#ffffff;">Challenge Accepted</strong> welcome email.</p>
            <p style="margin:0 0 10px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;color:#e3ddd1;">48 hours and 24 hours before the start date, the two reminder emails go out on their own.</p>
            <p style="margin:0 0 10px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;color:#e3ddd1;">Every weekly (or bi-weekly) email then sends itself on schedule &mdash; nothing else to do.</p>
            <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;color:#e3ddd1;">You can <strong style="color:#ffffff;">Edit</strong>, <strong style="color:#ffffff;">Pause</strong>, or <strong style="color:#ffffff;">Delete</strong> any challenge anytime.</p>
          </div>
        </td></tr>
        <tr><td style="padding:24px 40px 6px;text-align:center;">
          <a href="https://michaeljgauthier.com/dashboard/experiences" style="display:inline-block;background:#C9A46E;color:#191815;text-decoration:none;padding:16px 44px;border-radius:8px;font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:700;">Open Experiences &rarr;</a>
          <p style="margin:14px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.6;color:#8a8275;">On the Experiences page you can also click <strong>&ldquo;How to Start a New Challenge&rdquo;</strong> for the same steps as a click-through walkthrough.</p>
        </td></tr>
        <tr><td style="padding:24px 40px 34px;">
          <hr style="border:none;border-top:1px solid #eee7db;margin:0 0 16px;" />
          <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:15px;color:#191815;font-weight:700;">Michael J. Gauthier</p>
          <p style="margin:3px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#8a8275;">The Stewardship Blueprint</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</div>$H$,
  $T$How to Start a New Challenge

Hi {{first_name}},

Launching a challenge takes about two minutes — all from the Experiences page in the dashboard.

1. Click "Start New Challenge" on the Experiences page.
2. Pick the challenge: 6 Week Challenge (weekly) or 6 Week Challenge - Bi-Weekly (every other week, 12 weeks). Same emails, different pace.
3. Add the men joining — a name and email for each.
4. Send the invitations — Send now, or Schedule for later.
5. Set the challenge start date — the actual Week 1 date and time. The 48-hour and 24-hour reminders fire before this automatically.
6. Set Visibility — all facilitators, selected facilitators, or admins only. Optionally assign a facilitator.
7. Keep "Start the challenge" on and click Start Challenge. (Turn it off to save a draft.)

What happens automatically:
- When someone accepts their invite, they instantly get the Challenge Accepted welcome email.
- 48 and 24 hours before the start date, the two reminder emails go out on their own.
- Every weekly (or bi-weekly) email then sends itself on schedule.
- You can Edit, Pause, or Delete any challenge anytime.

Open Experiences: https://michaeljgauthier.com/dashboard/experiences

— Michael J. Gauthier
The Stewardship Blueprint$T$
)
on conflict (slug) do update set
  name = excluded.name,
  subject = excluded.subject,
  preheader = excluded.preheader,
  category = excluded.category,
  status = excluded.status,
  available_fields = excluded.available_fields,
  html_body = excluded.html_body,
  text_body = excluded.text_body,
  updated_at = now();
