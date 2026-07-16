-- Feature flags — the app has no entitlement/subscription/billing system, so this
-- is the generic gate for optional capabilities. First consumer: Plan Builder's
-- Premium plan type (docs/features/dashboard-planner.md).
--
-- This is deliberately NOT billing. A flag resolves from three independent grants,
-- any of which passes (see lib/flags/index.ts, which mirrors this):
--   1. enabled            — global on-switch for every dashboard user
--   2. enabled_roles      — role allowlist
--   3. enabled_profile_ids — per-profile allowlist
-- Super admins always pass, matching can() in lib/rbac/permissions.ts.

create table if not exists public.feature_flags (
  key                 text primary key,                          -- namespaced, e.g. plan_builder.premium
  description         text,
  enabled             boolean not null default false,
  enabled_roles       public.app_role[] not null default '{}',
  enabled_profile_ids uuid[] not null default '{}',              -- profiles.id
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

insert into public.feature_flags (key, description, enabled, enabled_roles)
values (
  'plan_builder.premium',
  'Allows creating Premium plans in Plan Builder (timeline, goals, sprints, custom fields).',
  false,
  array['super_admin', 'admin']::public.app_role[]
)
on conflict (key) do nothing;

alter table public.feature_flags enable row level security;
do $$
begin
  -- Any dashboard user may read flags (the UI needs to know what to show).
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'feature_flags' and policyname = 'feature_flags_read_dashboard') then
    execute 'create policy feature_flags_read_dashboard on public.feature_flags for select using (public.can_access_dashboard())';
  end if;
  -- Only super admins may change who has what.
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'feature_flags' and policyname = 'feature_flags_super_admin_write') then
    execute 'create policy feature_flags_super_admin_write on public.feature_flags for all using (public.is_super_admin()) with check (public.is_super_admin())';
  end if;
end $$;
