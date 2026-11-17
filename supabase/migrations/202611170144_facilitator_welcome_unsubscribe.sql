-- Facilitator Welcome Series: unsubscribe + postal address (CAN-SPAM).
--
-- Emails 2 and 3 point people to resources and social media, so every welcome
-- email carries an unsubscribe link (to the existing /email/opt-out page) and the
-- sender's postal address. Both render through merge fields filled in by
-- lib/facilitator-welcome/series.ts.
--
--   • enrollments.unsubscribed_at — set by /api/public/email/opt-out, so an
--     opt-out sticks even for someone who exists only as an enrollment (e.g. a
--     ForgedLife group leader with no MJG profile or contact).
--   • settings.mailing_address — required before the series can be switched on.

alter table public.facilitator_welcome_enrollments
  add column if not exists unsubscribed_at timestamptz;

alter table public.facilitator_welcome_settings
  add column if not exists mailing_address text;

alter table public.facilitator_welcome_settings
  drop constraint if exists facilitator_welcome_ready;
alter table public.facilitator_welcome_settings
  add constraint facilitator_welcome_ready check (
    not enabled or (
      coalesce(handbook_url, '') <> ''
      and coalesce(mailing_address, '') <> ''
      and (coalesce(instagram_url, '') <> '' or coalesce(facebook_url, '') <> '' or coalesce(linkedin_url, '') <> '')
    )
  );

-- The footer goes right after the social row in each email. Templates already
-- carrying it are left alone, so this is safe to run twice.
update public.email_templates
set
  html_body = replace(html_body, '{{social_links_html}}', '{{social_links_html}}' || E'\n          {{unsubscribe_html}}'),
  text_body = replace(coalesce(text_body, ''), '{{social_links_text}}', '{{social_links_text}}' || E'\n{{unsubscribe_text}}'),
  available_fields = array(select distinct f from unnest(coalesce(available_fields, '{}'::text[]) || array['unsubscribe_html', 'unsubscribe_text']) as f),
  updated_at = now()
where slug in ('facilitator-welcome-1', 'facilitator-welcome-2', 'facilitator-welcome-3')
  and html_body not like '%{{unsubscribe_html}}%';
