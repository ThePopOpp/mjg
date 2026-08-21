-- Swap the generic placeholder in the Week 1 launch email for the branded Week 1 video
-- thumbnail (it already links to /6-week-challenge/videos/week-1).
update public.email_templates set
  html_body = replace(
    html_body,
    'https://michaeljgauthier.com/email-assets/video-placeholder.png',
    'https://michaeljgauthier.com/6-week-challenge/thumbnails/week1-email.png'
  ),
  updated_at = now()
where slug = '6wc-participant-week-1';
