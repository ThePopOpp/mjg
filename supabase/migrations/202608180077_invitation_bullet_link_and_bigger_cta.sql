-- Invitation email tweaks: link the "Created for More Check-In" bullet to the check-in page,
-- and make the primary "Accept Your Invitation" CTA larger / more prominent.
update public.email_templates set
  html_body = replace(
    html_body,
    'Take the <strong>Created for More Check-In</strong> &mdash; a 15-minute, whole-life reflection.',
    'Take the <a href="https://michaeljgauthier.com/created-for-more-check-in" style="color:#C9A46E;font-weight:700;text-decoration:underline;">Created for More Check-In</a> &mdash; a 15-minute, whole-life reflection.'
  ),
  updated_at = now()
where slug = 'dashboard-invitation';

update public.email_templates set
  html_body = replace(
    html_body,
    'padding:14px 30px;border-radius:6px;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:700;">Accept Your Invitation &rarr;</a>',
    'padding:20px 52px;border-radius:8px;font-family:Arial,Helvetica,sans-serif;font-size:19px;font-weight:700;letter-spacing:0.01em;">Accept Your Invitation &rarr;</a>'
  ),
  updated_at = now()
where slug = 'dashboard-invitation';
