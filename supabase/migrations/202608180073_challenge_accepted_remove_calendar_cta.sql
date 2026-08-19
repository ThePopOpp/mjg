-- Remove the dark "Lock It In / Add to calendar" CTA band from the
-- 6WC · 00 · Challenge Accepted email (per request — that section is being dropped).
-- Matches the full <tr> (with its leading newline+indent) so it removes cleanly and once.
update public.email_templates set
  html_body = replace(
    html_body,
    E'\n      <tr><td style="background:#191815;padding:40px 40px 40px;"><p style="margin:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#C9A46E;font-weight:700;">Lock It In</p><h2 style="margin:0 0 10px;font-family:Georgia, ''Times New Roman'', serif;font-size:22px;line-height:1.25;color:#ffffff;font-weight:700;">Add the six dates to your calendar</h2><p style="margin:0 0 22px;font-family:Arial, Helvetica, sans-serif;font-size:14px;line-height:1.7;color:#d8d2c8;">Protect these six weeks the way you&rsquo;d protect anything that matters. Put every session on the calendar now, before the busy weeks arrive.</p><div><a href="https://michaeljgauthier.com/6-week-challenge#dates" style="display:inline-block;background:#C9A46E;color:#191815;text-decoration:none;padding:13px 26px;border-radius:6px;font-family:Arial, Helvetica, sans-serif;font-size:14px;font-weight:700;">Add to calendar &rarr;</a></div></td></tr>',
    ''
  ),
  updated_at = now()
where slug = '6wc-participant-00-challenge-accepted';
