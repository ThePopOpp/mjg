-- Frontend Editor (docs/frontend-editor/frontend-editor.md) — the owner-facing
-- website manager that lives under CMS -> Editor in the dashboard.
--
-- SUPER-ADMIN ONLY at the database level (RLS via public.is_super_admin()), the
-- same four-layer guard the CMS uses: nav permission -> page guard ->
-- requireSuperAdmin on every API route -> RLS. The dashboard data layer talks
-- through the service-role client; RLS is defense in depth.
--
-- The PUBLIC site renderer also reads through the service-role client and only
-- ever selects `published_content` of status='published' rows, so drafts and
-- change sets can never leak to anonymous visitors.

-- == Pages ===================================================================
-- Draft and published content live side by side on the page row (spec §46,
-- "choose one approach and use it consistently"). `draft_content` is what the
-- editor and Steward write to; `published_content` is the immutable public
-- snapshot swapped in atomically at publish time.
create table if not exists public.website_pages (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  page_type text not null default 'page'
    check (page_type in ('page','landing','resource','marketing','legal','system')),
  template text not null default 'standard',
  status text not null default 'draft'
    check (status in ('draft','published','scheduled','archived')),

  draft_content jsonb not null default '{"version":1,"blocks":[]}'::jsonb,
  published_content jsonb,

  -- SEO
  seo_title text,
  seo_description text,
  seo_keywords text[] not null default array[]::text[],
  canonical_url text,
  og_title text,
  og_description text,
  og_image_url text,
  featured_image_url text,
  no_index boolean not null default false,
  no_follow boolean not null default false,

  -- Navigation
  navigation_visibility boolean not null default false,
  navigation_label text,
  parent_page_id uuid references public.website_pages(id) on delete set null,
  sort_order integer not null default 0,

  -- Guardrails (spec §51/§52): protected pages cannot be deleted and their slug
  -- is frozen; legal pages force the draft -> review -> publish path.
  is_protected boolean not null default false,
  is_legal boolean not null default false,

  has_unpublished_changes boolean not null default true,
  last_edited_source text not null default 'manual'
    check (last_edited_source in ('manual','steward','restore')),

  published_at timestamptz,
  scheduled_at timestamptz,
  unpublish_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index if not exists website_pages_status_idx on public.website_pages(status, page_type);
create index if not exists website_pages_slug_idx on public.website_pages(slug) where deleted_at is null;
create index if not exists website_pages_scheduled_idx on public.website_pages(scheduled_at) where status = 'scheduled';

-- == Version history (spec §17) ==============================================
create table if not exists public.website_page_versions (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.website_pages(id) on delete cascade,
  version_number integer not null,
  content jsonb not null default '{"version":1,"blocks":[]}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  source text not null default 'manual' check (source in ('manual','steward','restore')),
  change_summary text not null default '',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (page_id, version_number)
);
create index if not exists website_page_versions_page_idx
  on public.website_page_versions(page_id, version_number desc);

-- == Change sets (spec §14) ==================================================
-- Every meaningful Steward request (and every manual publish) records a
-- before/after snapshot so the change is explainable and reversible.
create table if not exists public.website_change_sets (
  id uuid primary key default gen_random_uuid(),
  page_id uuid references public.website_pages(id) on delete cascade,
  requested_by uuid references public.profiles(id) on delete set null,
  source text not null default 'steward' check (source in ('steward','manual')),
  risk text not null default 'low' check (risk in ('low','medium','high')),
  prompt text,
  summary text not null default '',
  before_state jsonb not null default '{}'::jsonb,
  after_state jsonb not null default '{}'::jsonb,
  status text not null default 'proposed'
    check (status in ('proposed','draft_applied','approved','published','rejected')),
  created_at timestamptz not null default now(),
  approved_by uuid references public.profiles(id) on delete set null,
  approved_at timestamptz,
  published_at timestamptz
);
create index if not exists website_change_sets_page_idx
  on public.website_change_sets(page_id, created_at desc);
create index if not exists website_change_sets_status_idx
  on public.website_change_sets(status, created_at desc);

-- == Navigation (spec §21) ===================================================
create table if not exists public.website_navigation_items (
  id uuid primary key default gen_random_uuid(),
  navigation_group text not null default 'main'
    check (navigation_group in ('main','footer','utility')),
  label text not null,
  url text not null default '',
  page_id uuid references public.website_pages(id) on delete set null,
  parent_id uuid references public.website_navigation_items(id) on delete cascade,
  sort_order integer not null default 0,
  is_visible boolean not null default true,
  open_in_new_tab boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists website_navigation_items_group_idx
  on public.website_navigation_items(navigation_group, parent_id, sort_order);

-- == Global content (spec §22) ===============================================
create table if not exists public.website_globals (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  label text not null,
  value jsonb not null default '{}'::jsonb,
  type text not null default 'text',
  description text,
  updated_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now()
);

-- == Redirects (spec §24) ====================================================
create table if not exists public.website_redirects (
  id uuid primary key default gen_random_uuid(),
  source_path text not null unique,
  destination_path text not null,
  status_code integer not null default 301 check (status_code in (301,302)),
  is_active boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

-- == Audit log (spec §38) ====================================================
create table if not exists public.website_audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  actor_type text not null default 'user' check (actor_type in ('user','steward')),
  action text not null,
  resource_type text not null default 'page',
  resource_id uuid,
  summary text not null default '',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists website_audit_logs_created_idx
  on public.website_audit_logs(created_at desc);
create index if not exists website_audit_logs_resource_idx
  on public.website_audit_logs(resource_type, resource_id, created_at desc);

-- == Signed draft-preview tokens (spec §41) ==================================
create table if not exists public.website_preview_tokens (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.website_pages(id) on delete cascade,
  token text not null unique,
  created_by uuid references public.profiles(id) on delete set null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);
create index if not exists website_preview_tokens_page_idx
  on public.website_preview_tokens(page_id, expires_at desc);

-- == RLS: super admin only ===================================================
do $$
declare tbl text;
begin
  foreach tbl in array array[
    'website_pages','website_page_versions','website_change_sets','website_navigation_items',
    'website_globals','website_redirects','website_audit_logs','website_preview_tokens'
  ] loop
    execute format('alter table public.%I enable row level security', tbl);
    execute format('drop policy if exists %I on public.%I', tbl || '_super_admin_all', tbl);
    execute format(
      'create policy %I on public.%I for all using (public.is_super_admin()) with check (public.is_super_admin())',
      tbl || '_super_admin_all', tbl);
  end loop;
end $$;

-- == Seed global content =====================================================
-- Editable site-wide values the renderer and the public chrome read. Seeded with
-- the values already used by the marketing site so nothing changes on day one.
insert into public.website_globals (key, label, value, type, description) values
  ('site.announcement', 'Site announcement',
    '{"enabled":false,"text":"","href":""}'::jsonb, 'announcement',
    'Optional bar shown above the site navigation.'),
  ('site.primary_cta', 'Primary call to action',
    '{"label":"Join the Journey","href":"/#join"}'::jsonb, 'cta',
    'The site-wide CTA reused by blocks that ask for the default call to action.'),
  ('site.booking_link', 'Booking link',
    '{"label":"Book Michael","href":"/book"}'::jsonb, 'cta',
    'Where booking CTAs point.'),
  ('site.contact', 'Contact details',
    '{"email":"","phone":"","address":""}'::jsonb, 'contact',
    'Shown in the footer and on contact blocks.'),
  ('site.social', 'Social links',
    '{"facebook":"","instagram":"","linkedin":"","youtube":""}'::jsonb, 'social',
    'Social profile URLs.'),
  ('site.footer_note', 'Legal footer text',
    '{"text":"(c) Michael J. Gauthier. All rights reserved."}'::jsonb, 'text',
    'Small print at the bottom of every page.'),
  ('seo.defaults', 'Default SEO',
    '{"titleSuffix":" | Michael J. Gauthier","description":"A practical framework for stewarding your faith, relationships, health, resources, and legacy.","ogImage":""}'::jsonb,
    'seo', 'Fallbacks used when a page has no SEO of its own.'),
  ('editor.settings', 'Editor settings',
    '{"allowStewardDirectPublish":false}'::jsonb, 'settings',
    'Frontend Editor behaviour. Direct publish is OFF by default (spec §16).')
on conflict (key) do nothing;

-- == Seed the main + footer navigation =======================================
-- Mirrors lib/public-site/nav-items.ts so the Navigation manager opens with the
-- real site structure instead of an empty list.
insert into public.website_navigation_items (navigation_group, label, url, sort_order)
select * from (values
  ('main','Home','/',0),
  ('main','About','/about',1),
  ('main','Mission','/mission',2),
  ('main','Resources','/resources',3),
  ('main','Contact','/contact',4),
  ('footer','About','/about',0),
  ('footer','Mission','/mission',1),
  ('footer','Resources','/resources',2),
  ('footer','Contact','/contact',3),
  ('footer','Privacy','/privacy',4),
  ('footer','Terms','/terms',5)
) as seed(navigation_group, label, url, sort_order)
where not exists (select 1 from public.website_navigation_items);
