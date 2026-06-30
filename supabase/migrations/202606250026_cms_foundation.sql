-- CMS Phase 1 foundation: pages, version history, and the working block tree.
-- SUPER-ADMIN ONLY (RLS via public.is_super_admin()). The dashboard data layer
-- uses the service-role client behind requireSuperAdmin; RLS is defense-in-depth.
-- Public page rendering (later phases) reads PUBLISHED snapshots through the
-- service-role client only, so drafts can never leak.

create table if not exists public.cms_pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  page_type text not null default 'page'
    check (page_type in ('page','landing','stewardship','experience','resource','informational')),
  status text not null default 'draft' check (status in ('draft','published','archived')),
  assigned_roles text[] not null default array[]::text[],
  published_version_id uuid,            -- points at the live cms_page_versions row (plain uuid; no FK to avoid circular dependency)
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists cms_pages_status_idx on public.cms_pages(status, page_type);

-- Immutable publish/revision history.
create table if not exists public.cms_page_versions (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.cms_pages(id) on delete cascade,
  version_number integer not null default 1,
  content_snapshot jsonb not null default '{}'::jsonb,
  status text not null default 'published',
  notes text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (page_id, version_number)
);
create index if not exists cms_page_versions_page_idx on public.cms_page_versions(page_id, version_number desc);

-- The editable working draft tree (nested blocks).
create table if not exists public.cms_blocks (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.cms_pages(id) on delete cascade,
  parent_block_id uuid references public.cms_blocks(id) on delete cascade,
  block_type text not null,
  sort_order integer not null default 0,
  content jsonb not null default '{}'::jsonb,
  settings jsonb not null default '{}'::jsonb,
  visibility_rules jsonb not null default '{}'::jsonb,
  is_hidden boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists cms_blocks_page_idx on public.cms_blocks(page_id, parent_block_id, sort_order);

-- ── RLS: super admin only ────────────────────────────────────────────────────
alter table public.cms_pages enable row level security;
alter table public.cms_page_versions enable row level security;
alter table public.cms_blocks enable row level security;

do $$
declare tbl text;
begin
  foreach tbl in array array['cms_pages','cms_page_versions','cms_blocks'] loop
    execute format('drop policy if exists %I on public.%I', tbl || '_super_admin_all', tbl);
    execute format('create policy %I on public.%I for all using (public.is_super_admin()) with check (public.is_super_admin())', tbl || '_super_admin_all', tbl);
  end loop;
end $$;
