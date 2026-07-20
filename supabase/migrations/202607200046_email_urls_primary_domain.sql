-- Pin email content to the PRIMARY domain (michaeljgauthier.com), off the
-- transitional my.michaeljgauthier.com subdomain.
--
-- After the previous migration the email logos/media were self-hosted but still on
-- my.michaeljgauthier.com. The site is moving to the apex as its permanent home, so
-- emails should reference it directly — then they depend only on the app's canonical
-- domain: no WordPress, no old subdomain, no redirect hop. That's the "zero
-- dependency" goal.
--
-- Rewrites only URLs (matches the '://my.' host prefix), never email addresses
-- (which have '@my.'), so a "reply to noreply@my.…" line is left untouched. Covers
-- logos, media, and the functional links (login, contact, resources) together.
--
-- Timing: these apex URLs resolve once the app is serving michaeljgauthier.com — i.e.
-- after the DNS cutover being done now. Env-driven code (brandEmailHeader,
-- resolveImageUrl, merge-field links) tracks NEXT_PUBLIC_SITE_URL and moves to the
-- apex on the same rebuild, so everything lands together.
--
-- Re-runnable: WHERE filters to rows still on the subdomain.

update public.email_templates
set html_body = replace(replace(html_body,
      'https://my.michaeljgauthier.com', 'https://michaeljgauthier.com'),
      'http://my.michaeljgauthier.com', 'https://michaeljgauthier.com'),
    updated_at = now()
where html_body ilike '%my.michaeljgauthier.com%';

update public.email_messages
set html_body = replace(replace(html_body,
      'https://my.michaeljgauthier.com', 'https://michaeljgauthier.com'),
      'http://my.michaeljgauthier.com', 'https://michaeljgauthier.com'),
    text_body = replace(replace(text_body,
      'https://my.michaeljgauthier.com', 'https://michaeljgauthier.com'),
      'http://my.michaeljgauthier.com', 'https://michaeljgauthier.com')
where html_body ilike '%my.michaeljgauthier.com%'
   or text_body ilike '%my.michaeljgauthier.com%';
