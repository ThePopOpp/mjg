-- Dev Request Queue — a single place aggregating items flagged for Claude
-- (the dev agent) to implement, sent from Media Studio resource cards and CMS
-- Frontend/Dashboard edit requests via a "Send to Claude" action.
-- SUPER-ADMIN ONLY (RLS via public.is_super_admin()); the API uses the service
-- role and re-authorizes with requireSuperAdmin.

create table if not exists public.dev_requests (
  id uuid primary key default gen_random_uuid(),
  source_type text not null check (source_type in ('media_resource', 'cms_frontend_edit', 'cms_dashboard_edit', 'manual')),
  source_id uuid,
  title text not null,
  body text,
  file_url text,
  page_target text,
  request_kind text,
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
  status text not null default 'queued' check (status in ('queued', 'in_progress', 'done', 'archived')),
  steward_brief text,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references public.profiles(id) on delete set null,
  created_by_email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- One queue row per source item, so re-sending the same resource/request updates
-- it in place instead of duplicating.
create unique index if not exists dev_requests_source_uidx
  on public.dev_requests(source_type, source_id) where source_id is not null;
create index if not exists dev_requests_status_idx on public.dev_requests(status, created_at desc);

alter table public.dev_requests enable row level security;

drop policy if exists "dev_requests_super_admin_all" on public.dev_requests;
create policy "dev_requests_super_admin_all" on public.dev_requests
  for all using (public.is_super_admin()) with check (public.is_super_admin());
