-- Swap the generic video placeholder in the remaining 6-Week Challenge participant emails for
-- their branded video thumbnails. Each template already links to its /6-week-challenge/videos/<slug>
-- page (which plays the video once its Drive link is set), so this only changes the poster image.
update public.email_templates set
  html_body = replace(html_body,
    'https://michaeljgauthier.com/email-assets/video-placeholder.png',
    'https://michaeljgauthier.com/6-week-challenge/thumbnails/week2-email.png'),
  updated_at = now()
where slug = '6wc-participant-week-2';

update public.email_templates set
  html_body = replace(html_body,
    'https://michaeljgauthier.com/email-assets/video-placeholder.png',
    'https://michaeljgauthier.com/6-week-challenge/thumbnails/week3-email.png'),
  updated_at = now()
where slug = '6wc-participant-week-3';

update public.email_templates set
  html_body = replace(html_body,
    'https://michaeljgauthier.com/email-assets/video-placeholder.png',
    'https://michaeljgauthier.com/6-week-challenge/thumbnails/week4-email.png'),
  updated_at = now()
where slug = '6wc-participant-week-4';

update public.email_templates set
  html_body = replace(html_body,
    'https://michaeljgauthier.com/email-assets/video-placeholder.png',
    'https://michaeljgauthier.com/6-week-challenge/thumbnails/week5-email.png'),
  updated_at = now()
where slug = '6wc-participant-week-5';

update public.email_templates set
  html_body = replace(html_body,
    'https://michaeljgauthier.com/email-assets/video-placeholder.png',
    'https://michaeljgauthier.com/6-week-challenge/thumbnails/week6-email.png'),
  updated_at = now()
where slug = '6wc-participant-week-6';

-- Final thank-you / "What's Next" closing email links to /6-week-challenge/videos/closing.
update public.email_templates set
  html_body = replace(html_body,
    'https://michaeljgauthier.com/email-assets/video-placeholder.png',
    'https://michaeljgauthier.com/6-week-challenge/thumbnails/whats-next-email.png'),
  updated_at = now()
where slug = '6wc-participant-16-final-thankyou';
