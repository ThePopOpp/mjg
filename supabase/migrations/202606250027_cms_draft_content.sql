-- CMS Phase 2: store each page's editable working draft (block tree) as JSON on
-- the page row. Publishing (Phase 3) snapshots this into cms_page_versions.
-- (We use a JSON draft tree — like the email/social block builders — rather than
--  row-per-block in cms_blocks for a simpler, stable v1; cms_blocks stays reserved.)
alter table public.cms_pages
  add column if not exists draft_content jsonb not null default '{}'::jsonb;
