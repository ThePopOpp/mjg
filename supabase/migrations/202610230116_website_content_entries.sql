-- Marketing site content — the editable layer under the code-built pages.
--
-- The public pages (/, /about, /meet-steward, …) are laid out in code, but every
-- piece of text, every button and every image comes from a typed default in
-- lib/marketing/content plus an optional override stored here. That is what lets
-- copy and images be changed live (by the dashboard, Shepherd or the MJG MCP)
-- without a deploy, while the layout itself stays reviewed code.
--
-- WHY NOT website_pages. website_pages stores a free list of blocks the editor
-- owns. These pages have a fixed set of sections owned by code; letting an editor
-- reorder or delete them would break the designed pages. So the storage is
-- separate, while the change-set and audit tables are shared.
--
-- OVERRIDES ARE SPARSE. Only fields someone changed are stored. A field nobody
-- touched keeps following the code default, and "reset" just deletes the key.
-- No row at all means the page renders its defaults, so nothing needs seeding.

create table if not exists public.website_content_entries (
  id uuid primary key default gen_random_uuid(),
  -- 'page:home', 'page:about', 'global:nav', …
  scope text not null,
  -- 'hero', 'awaken', '_seo', …
  section_key text not null,
  schema_version integer not null default 1,

  published_override jsonb not null default '{}'::jsonb,
  -- null = the draft is the published content.
  draft_override jsonb,

  -- Bumps on every write; callers pass the revision they read so two editors
  -- (or an editor and the MCP) cannot silently overwrite each other.
  revision integer not null default 0,
  published_version integer not null default 0,

  updated_by uuid references public.profiles(id) on delete set null,
  updated_source text not null default 'manual'
    check (updated_source in ('manual','shepherd','mcp','restore')),
  published_by uuid references public.profiles(id) on delete set null,
  published_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (scope, section_key)
);

create index if not exists website_content_entries_scope_idx
  on public.website_content_entries (scope);

-- Append-only: one row per publish, so any earlier version can be restored and
-- every live change can be explained.
create table if not exists public.website_content_versions (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null references public.website_content_entries(id) on delete cascade,
  version integer not null,
  schema_version integer not null,
  override jsonb not null,
  change_set_id uuid references public.website_change_sets(id) on delete set null,
  published_by uuid references public.profiles(id) on delete set null,
  note text,
  created_at timestamptz not null default now(),
  unique (entry_id, version)
);

-- Change sets can now describe a content edit as well as a page edit, and can
-- come from the MCP.
alter table public.website_change_sets
  add column if not exists content_entry_id uuid
    references public.website_content_entries(id) on delete cascade;

alter table public.website_change_sets drop constraint if exists website_change_sets_source_check;
alter table public.website_change_sets
  add constraint website_change_sets_source_check check (source in ('shepherd','manual','mcp'));

-- Super-admin only, like every other website_* table. Public pages read through
-- the service-role server module, never with the visitor's session.
do $$
declare tbl text;
begin
  foreach tbl in array array['website_content_entries','website_content_versions'] loop
    execute format('alter table public.%I enable row level security', tbl);
    execute format('drop policy if exists %I on public.%I', tbl || '_super_admin_all', tbl);
    execute format(
      'create policy %I on public.%I for all using (public.is_super_admin()) with check (public.is_super_admin())',
      tbl || '_super_admin_all', tbl);
  end loop;
end $$;
