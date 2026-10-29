-- Churches, church admins and facilitator applications (docs/mcp/MJG-MCP-EXPANSION-PLAN.md §2.3, Phase 4).
--
--   churches                    — the churches groups can belong to (soft delete, archive).
--   church_admins               — who administers which church (role church_admin + an active row).
--   church_admin_applications   — someone asks to be a church admin; a Super Admin approves through a
--                                 single-use, expiring link (only the SHA-256 of the token is stored).
--   facilitator_applications    — a facilitator names their church; that church's admin (or a Super
--                                 Admin) approves. An "official church group" (facilitator_groups.church_id)
--                                 needs an approved application for that church — enforced in the app
--                                 (lib/churches/rules.ts) and by the trigger below.
--
-- All writes go through the app's server code with the service role; RLS below governs direct reads.
-- 'church_admin' is added to app_role here but never used as an enum literal in this file: a new enum
-- value can't be used in the transaction that adds it (the runner commits per file).

do $$
begin
  if not exists (
    select 1 from pg_enum where enumlabel = 'church_admin' and enumtypid = 'public.app_role'::regtype
  ) then
    alter type public.app_role add value 'church_admin';
  end if;
end $$;

-- ── Churches ─────────────────────────────────────────────────────────────────────
create table if not exists public.churches (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  city text,
  state text,
  website text,
  status text not null default 'active' check (status in ('active','archived')),
  created_by uuid references public.profiles(id) on delete set null,
  deleted_at timestamptz,
  deleted_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists churches_status_idx on public.churches(status) where deleted_at is null;
create index if not exists churches_trash_idx on public.churches(deleted_at) where deleted_at is not null;

-- ── Church admins ────────────────────────────────────────────────────────────────
create table if not exists public.church_admins (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references public.churches(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'active' check (status in ('active','removed')),
  application_id uuid,
  assigned_by uuid references public.profiles(id) on delete set null,
  assigned_at timestamptz not null default now(),
  removed_by uuid references public.profiles(id) on delete set null,
  removed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists church_admins_active_uidx on public.church_admins(church_id, profile_id) where status = 'active';
create index if not exists church_admins_profile_idx on public.church_admins(profile_id) where status = 'active';

-- ── Church admin applications ────────────────────────────────────────────────────
-- church_id is set when they picked a listed church; otherwise church_name/city/state/website
-- describe a church to create on approval.
create table if not exists public.church_admin_applications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  church_id uuid references public.churches(id) on delete set null,
  church_name text,
  church_city text,
  church_state text,
  church_website text,
  role_title text,
  message text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  token_hash text unique,
  token_expires_at timestamptz,
  token_used_at timestamptz,
  decided_by uuid references public.profiles(id) on delete set null,
  decided_at timestamptz,
  decision_note text,
  notified jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (church_id is not null or coalesce(trim(church_name), '') <> '')
);
create index if not exists caa_status_idx on public.church_admin_applications(status, created_at desc);
create unique index if not exists caa_one_pending_uidx on public.church_admin_applications(profile_id) where status = 'pending';

alter table public.church_admins
  drop constraint if exists church_admins_application_fk,
  add constraint church_admins_application_fk foreign key (application_id) references public.church_admin_applications(id) on delete set null;

-- ── Facilitator applications ─────────────────────────────────────────────────────
create table if not exists public.facilitator_applications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  church_id uuid not null references public.churches(id) on delete cascade,
  message text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  decided_by uuid references public.profiles(id) on delete set null,
  decided_at timestamptz,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists fa_church_status_idx on public.facilitator_applications(church_id, status);
create index if not exists fa_profile_idx on public.facilitator_applications(profile_id);
create unique index if not exists fa_live_uidx on public.facilitator_applications(profile_id, church_id) where status in ('pending','approved');

-- ── Group ↔ church ───────────────────────────────────────────────────────────────
alter table public.facilitator_groups
  add column if not exists church_id uuid references public.churches(id) on delete set null;
create index if not exists facilitator_groups_church_idx on public.facilitator_groups(church_id) where church_id is not null;

-- Backstop for the app rule: an official church group needs an approved facilitator for that church.
create or replace function public.enforce_church_group()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.church_id is null then return new; end if;
  if tg_op = 'UPDATE' and new.church_id is not distinct from old.church_id and new.facilitator_id is not distinct from old.facilitator_id then
    return new;
  end if;
  if not exists (
    select 1 from public.facilitator_applications
    where profile_id = new.facilitator_id and church_id = new.church_id and status = 'approved'
  ) then
    raise exception 'church_group_not_approved: this facilitator has not been approved by that church';
  end if;
  return new;
end $$;

drop trigger if exists facilitator_groups_church_check on public.facilitator_groups;
create trigger facilitator_groups_church_check
  before insert or update of church_id, facilitator_id on public.facilitator_groups
  for each row execute function public.enforce_church_group();

-- ── RLS helper ───────────────────────────────────────────────────────────────────
create or replace function public.is_church_admin_of(p_church uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.church_admins
    where church_id = p_church and profile_id = public.current_profile_id() and status = 'active'
  )
$$;

-- ── RLS ──────────────────────────────────────────────────────────────────────────
alter table public.churches enable row level security;
alter table public.church_admins enable row level security;
alter table public.church_admin_applications enable row level security;
alter table public.facilitator_applications enable row level security;

drop policy if exists "churches_super_admin" on public.churches;
create policy "churches_super_admin" on public.churches for all
  using (public.is_super_admin()) with check (public.is_super_admin());
drop policy if exists "churches_read_active" on public.churches;
create policy "churches_read_active" on public.churches for select
  using (auth.uid() is not null and deleted_at is null and status = 'active');

drop policy if exists "church_admins_super_admin" on public.church_admins;
create policy "church_admins_super_admin" on public.church_admins for all
  using (public.is_super_admin()) with check (public.is_super_admin());
drop policy if exists "church_admins_own_read" on public.church_admins;
create policy "church_admins_own_read" on public.church_admins for select
  using (profile_id = public.current_profile_id());

drop policy if exists "caa_super_admin" on public.church_admin_applications;
create policy "caa_super_admin" on public.church_admin_applications for all
  using (public.is_super_admin()) with check (public.is_super_admin());
drop policy if exists "caa_own_read" on public.church_admin_applications;
create policy "caa_own_read" on public.church_admin_applications for select
  using (profile_id = public.current_profile_id());

drop policy if exists "fa_super_admin" on public.facilitator_applications;
create policy "fa_super_admin" on public.facilitator_applications for all
  using (public.is_super_admin()) with check (public.is_super_admin());
drop policy if exists "fa_read" on public.facilitator_applications;
create policy "fa_read" on public.facilitator_applications for select
  using (profile_id = public.current_profile_id() or public.is_church_admin_of(church_id));

drop policy if exists "facilitator_groups_church_admin_read" on public.facilitator_groups;
create policy "facilitator_groups_church_admin_read" on public.facilitator_groups for select
  using (church_id is not null and public.is_church_admin_of(church_id));

revoke all on function public.is_church_admin_of(uuid) from public, anon;
grant execute on function public.is_church_admin_of(uuid) to authenticated, service_role;
