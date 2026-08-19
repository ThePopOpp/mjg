-- Add the branded video thumbnail (Mike + play button, links to the invitation video page)
-- to the 6-Week Challenge Invitation email, between the "You're invited." hero and the body copy.
-- Anchored on the unique body-row padding so it inserts once, whitespace-independent.
update public.email_templates set
  html_body = replace(
    html_body,
    '<tr><td style="padding:26px 40px 8px;">',
    '<tr><td style="padding:6px 40px 18px;" align="center">'
      || '<a href="https://michaeljgauthier.com/6-week-challenge/videos/invitation" target="_blank" style="text-decoration:none;display:block;">'
      || '<img src="https://michaeljgauthier.com/6-week-challenge/thumbnails/invitation-email.png" alt="Watch the invitation video" width="520" '
      || 'style="display:block;width:100%;max-width:520px;height:auto;margin:0 auto;border:0;border-radius:12px;outline:none;text-decoration:none;" />'
      || '</a></td></tr>' || E'\n\n      '
      || '<tr><td style="padding:26px 40px 8px;">'
  ),
  updated_at = now()
where slug = 'dashboard-invitation';
