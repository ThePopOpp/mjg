-- Point the "Download the Participant Guide" button in the 6WC Welcome email at the
-- actual Participant Study Guide PDF (was a link to the hub #guide anchor).
update public.email_templates set
  html_body = replace(html_body, 'https://michaeljgauthier.com/6-week-challenge#guide', 'https://michaeljgauthier.com/6-week-challenge/participant-study-guide.pdf'),
  text_body = replace(text_body, 'https://michaeljgauthier.com/6-week-challenge#guide', 'https://michaeljgauthier.com/6-week-challenge/participant-study-guide.pdf'),
  updated_at = now()
where slug = '6wc-participant-01-welcome';

-- Document the invitations cron in Steward's training doc (append to the 6-Week Challenge test doc).
update public.agent_training_docs set
  content_md = content_md || E'\n\n## Coolify scheduled tasks (all share EXPERIENCE_CRON_SECRET)\nThree scheduled tasks run inside the app container, every ~10 min:\n- `node scripts/experiences-cron.mjs` — releases due 6-Week Challenge / experience emails.\n- `node scripts/journey-cron.mjs` — releases due 7-Day Journey emails.\n- `node scripts/invitations-cron.mjs` — sends invitation emails that were **scheduled** for a future time (immediate invites and "send now" don''t need it).',
  char_count = char_length(content_md) + 400,
  updated_at = now()
where title = 'How to test the 6-Week Challenge';
