-- Pilot Forms — DB-backed definitions for the participant surveys and the
-- Created for More Check-In, editable from the dashboard builders. Draft +
-- Publish: `draft_definition` is the working copy; `published_definition` is
-- what the public pages serve. The public survey/check-in pages read the
-- published definition via the service-role admin client and FALL BACK to the
-- hardcoded constants (lib/pilot/constants.ts) when no published row exists, so
-- live forms never break — even before this migration is run.
-- SUPER-ADMIN ONLY (RLS via public.is_super_admin()); public reads are
-- server-side through the service-role client.

create table if not exists public.pilot_forms (
  id                   uuid primary key default gen_random_uuid(),
  kind                 text not null,                    -- 'survey' | 'check_in'
  slug                 text not null unique,             -- URL slug + survey_type
  title                text not null,
  description          text,
  status               text not null default 'draft',    -- 'draft' | 'published' | 'archived'
  draft_definition     jsonb not null default '{}'::jsonb,
  published_definition jsonb,
  created_by           uuid,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  published_at         timestamptz
);

create index if not exists pilot_forms_kind_idx on public.pilot_forms(kind, status);

alter table public.pilot_forms enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'pilot_forms' and policyname = 'pilot_forms_super_admin_all') then
    execute 'create policy pilot_forms_super_admin_all on public.pilot_forms for all using (public.is_super_admin()) with check (public.is_super_admin())';
  end if;
end $$;
