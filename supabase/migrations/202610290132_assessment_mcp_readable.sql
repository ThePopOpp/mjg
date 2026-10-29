-- "Readable by MCP" per assessment (docs/mcp/MJG-MCP-EXPANSION-PLAN.md §10).
-- Claude / ChatGPT may read people's assessment RESULTS only where a Super Admin
-- turned this on. Default OFF. Read by lib/assessments/mcp-access.ts.
--
-- Builder forms (the pilot check-in and the surveys) are configured in
-- pilot_forms, so the flag lives on that row. The built-in assessments
-- (Created for More Check-In, Energy Audit) are defined in code and have no row,
-- so they get a small settings table keyed by assessment slug — the same value
-- check_in_submissions.assessment holds.

alter table public.pilot_forms
  add column if not exists mcp_readable boolean not null default false;

create table if not exists public.assessment_settings (
  assessment   text primary key,
  mcp_readable boolean not null default false,
  updated_by   uuid references public.profiles(id) on delete set null,
  updated_at   timestamptz not null default now()
);

insert into public.assessment_settings (assessment)
values ('created-for-more'), ('energy-audit')
on conflict (assessment) do nothing;

alter table public.assessment_settings enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'assessment_settings' and policyname = 'assessment_settings_super_admin_all') then
    execute 'create policy assessment_settings_super_admin_all on public.assessment_settings for all using (public.is_super_admin()) with check (public.is_super_admin())';
  end if;
end $$;
