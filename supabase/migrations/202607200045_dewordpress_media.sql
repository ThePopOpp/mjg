-- Remove WordPress dependencies from live content.
--
-- The app is moving off the michaeljgauthier.com WordPress site entirely. Logos and
-- media were still hot-linked from michaeljgauthier.com/wp-content in stored content:
-- 18 email templates, a sent email log, 2 blog posts, and a CMS draft. Once WordPress
-- is decommissioned those URLs 404, so every email logo and blog image breaks.
--
-- All assets are now self-hosted: logos in public/mjg-logos, media (Mike's photo,
-- the family photo, the two audio narrations, a blog featured image) downloaded from
-- WordPress into public/media before it goes away.
--
-- Email columns get ABSOLUTE URLs — email clients have no page origin, so a relative
-- path can't resolve. On-site columns (blog, CMS pages) get RELATIVE paths, which are
-- origin-agnostic and survive the primary-domain move. The absolute base is
-- my.michaeljgauthier.com: it serves the app today and will 301 to the apex after
-- cutover, so these URLs work throughout the transition.
--
-- Re-runnable: replace() is a no-op when the source string is absent, and each WHERE
-- filters to rows that still contain wp-content.

-- Map every known WP asset URL to its self-hosted RELATIVE path.
create or replace function pg_temp.dewp_rel(t text) returns text language sql immutable as $$
  select replace(replace(replace(replace(replace(replace(replace(coalesce(t, ''),
    'https://michaeljgauthier.com/wp-content/uploads/2025/03/MJG_Logo_Black-1.svg', '/mjg-logos/mjg_black_white.png'),
    'https://michaeljgauthier.com/wp-content/uploads/2025/03/MJG_Logo_White-1.svg', '/mjg-logos/mjg_white.png'),
    'https://michaeljgauthier.com/wp-content/uploads/2026/04/mike-gauthier-profile-photo.png', '/media/mike-gauthier-profile-photo.png'),
    'https://michaeljgauthier.com/wp-content/uploads/2026/04/Gauthier-Family-840x1020-1.png', '/media/Gauthier-Family-840x1020-1.png'),
    'https://michaeljgauthier.com/wp-content/uploads/2026/04/The-Stewardship-Blueprint-Chapters-1-and-2-Summary.wav', '/media/The-Stewardship-Blueprint-Chapters-1-and-2-Summary.wav'),
    'https://michaeljgauthier.com/wp-content/uploads/2026/04/The-Stewardship-Blueprint-1.3.m4a', '/media/The-Stewardship-Blueprint-1.3.m4a'),
    'https://michaeljgauthier.com/wp-content/uploads/2026/05/The-Watch-the-Title-and-the-Wrong-Scoreboard-Featured-Image-v.2.png', '/media/The-Watch-the-Title-and-the-Wrong-Scoreboard-Featured-Image-v.2.png')
$$;

-- Same mapping, but ABSOLUTE (for email). Explicit targets rather than prefixing the
-- relative output, so a URL that's already absolute can never be double-prefixed.
create or replace function pg_temp.dewp_abs(t text) returns text language sql immutable as $$
  select replace(replace(replace(replace(replace(replace(replace(coalesce(t, ''),
    'https://michaeljgauthier.com/wp-content/uploads/2025/03/MJG_Logo_Black-1.svg', 'https://my.michaeljgauthier.com/mjg-logos/mjg_black_white.png'),
    'https://michaeljgauthier.com/wp-content/uploads/2025/03/MJG_Logo_White-1.svg', 'https://my.michaeljgauthier.com/mjg-logos/mjg_white.png'),
    'https://michaeljgauthier.com/wp-content/uploads/2026/04/mike-gauthier-profile-photo.png', 'https://my.michaeljgauthier.com/media/mike-gauthier-profile-photo.png'),
    'https://michaeljgauthier.com/wp-content/uploads/2026/04/Gauthier-Family-840x1020-1.png', 'https://my.michaeljgauthier.com/media/Gauthier-Family-840x1020-1.png'),
    'https://michaeljgauthier.com/wp-content/uploads/2026/04/The-Stewardship-Blueprint-Chapters-1-and-2-Summary.wav', 'https://my.michaeljgauthier.com/media/The-Stewardship-Blueprint-Chapters-1-and-2-Summary.wav'),
    'https://michaeljgauthier.com/wp-content/uploads/2026/04/The-Stewardship-Blueprint-1.3.m4a', 'https://my.michaeljgauthier.com/media/The-Stewardship-Blueprint-1.3.m4a'),
    'https://michaeljgauthier.com/wp-content/uploads/2026/05/The-Watch-the-Title-and-the-Wrong-Scoreboard-Featured-Image-v.2.png', 'https://my.michaeljgauthier.com/media/The-Watch-the-Title-and-the-Wrong-Scoreboard-Featured-Image-v.2.png')
$$;

-- Email — absolute.
update public.email_templates
set html_body = pg_temp.dewp_abs(html_body), updated_at = now()
where html_body ilike '%michaeljgauthier.com/wp-content%';

update public.email_messages
set html_body = pg_temp.dewp_abs(html_body),
    text_body = pg_temp.dewp_abs(text_body)
where html_body ilike '%michaeljgauthier.com/wp-content%'
   or text_body ilike '%michaeljgauthier.com/wp-content%';

-- On-site — relative.
update public.blog_posts
set content_html = pg_temp.dewp_rel(content_html), updated_at = now()
where content_html ilike '%michaeljgauthier.com/wp-content%';

-- cms_pages.draft_content is jsonb (block-based CMS), so cast through text to run the
-- replace, then back. Replacing a URL substring inside a JSON string keeps it valid
-- json — the replacement paths contain no quotes or backslashes.
update public.cms_pages
set draft_content = pg_temp.dewp_rel(draft_content::text)::jsonb
where draft_content::text ilike '%michaeljgauthier.com/wp-content%';
