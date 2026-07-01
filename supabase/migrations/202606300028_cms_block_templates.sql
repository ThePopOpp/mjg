-- CMS reusable block/component templates. A Super Admin can save the currently
-- selected block (or a curated group of blocks) as a named component and re-insert
-- it into any page. SUPER-ADMIN ONLY (RLS via public.is_super_admin()); the data
-- layer uses the service-role client behind requireSuperAdmin.

create table if not exists public.cms_block_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  kind text not null default 'block' check (kind in ('block','section','group')),
  content jsonb not null default '[]'::jsonb,   -- an array of CmsBlock objects
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists cms_block_templates_created_idx on public.cms_block_templates(created_at desc);

alter table public.cms_block_templates enable row level security;

drop policy if exists cms_block_templates_super_admin on public.cms_block_templates;
create policy cms_block_templates_super_admin on public.cms_block_templates
  for all
  using (public.is_super_admin())
  with check (public.is_super_admin());
