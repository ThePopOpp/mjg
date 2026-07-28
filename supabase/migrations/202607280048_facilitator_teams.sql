-- Facilitator teams / cohorts.
-- A facilitator leads a named team of participants. In Phase 1 a team is created as
-- a side effect of an admin sending an Experience (see 202607280049); standalone team
-- management is a later (portal) phase. The tables exist now so the portal reads them later.

-- Keep the SQL notion of "dashboard role" in sync with the TypeScript DASHBOARD_ROLES,
-- which now includes facilitator. Safe to reference 'facilitator' here — it was added
-- and committed in the previous migration file.
create or replace function public.can_access_dashboard()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_app_role() in (
    'super_admin',
    'admin',
    'team_member',
    'facilitator',
    'content_reviewer',
    'pastor_elder_reviewer'
  )
$$;

-- ── Teams ────────────────────────────────────────────────────────────────────────
create table if not exists public.facilitator_teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  facilitator_id uuid references public.profiles(id) on delete set null,
  experience_id uuid,               -- set when a team is spun up from an Experience (no FK: created before experiences may exist)
  description text,
  status text not null default 'active' check (status in ('active','archived')),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists facilitator_teams_facilitator_idx on public.facilitator_teams(facilitator_id);
create index if not exists facilitator_teams_experience_idx on public.facilitator_teams(experience_id);

create table if not exists public.facilitator_team_members (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.facilitator_teams(id) on delete cascade,
  participant_id uuid not null references public.participants(id) on delete cascade,
  added_at timestamptz not null default now(),
  unique (team_id, participant_id)
);
create index if not exists facilitator_team_members_team_idx on public.facilitator_team_members(team_id);
create index if not exists facilitator_team_members_participant_idx on public.facilitator_team_members(participant_id);

-- ── RLS ──────────────────────────────────────────────────────────────────────────
-- Admin/service-role API bypasses RLS. Facilitators may read only their own teams.
alter table public.facilitator_teams enable row level security;
alter table public.facilitator_team_members enable row level security;

create policy "facilitator_teams_admin_write" on public.facilitator_teams for all
  using (public.can_manage_users())
  with check (public.can_manage_users());
create policy "facilitator_teams_owner_read" on public.facilitator_teams for select
  using (public.can_manage_users() or facilitator_id = public.current_profile_id());

create policy "facilitator_team_members_admin_write" on public.facilitator_team_members for all
  using (public.can_manage_users())
  with check (public.can_manage_users());
create policy "facilitator_team_members_owner_read" on public.facilitator_team_members for select
  using (
    public.can_manage_users()
    or exists (
      select 1 from public.facilitator_teams t
      where t.id = team_id and t.facilitator_id = public.current_profile_id()
    )
  );
