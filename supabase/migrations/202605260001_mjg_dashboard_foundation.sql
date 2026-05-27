do $$
begin
  if not exists (select 1 from pg_type where typname = 'app_role') then
    create type public.app_role as enum (
      'super_admin',
      'admin',
      'team_member',
      'content_reviewer',
      'pastor_elder_reviewer',
      'participant'
    );
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_status') then
    create type public.user_status as enum (
      'active',
      'invited',
      'inactive'
    );
  end if;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  first_name text,
  last_name text,
  role public.app_role not null default 'participant',
  status public.user_status not null default 'active',
  last_active_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.participants (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text,
  wave text,
  source text,
  relationship_category text,
  participant_type text not null default 'general_participant',
  check_in_status text not null default 'not_started',
  check_in_total_score integer,
  lowest_scoring_area text,
  score_range_category text,
  journey_status text not null default 'not_started',
  survey_status text not null default 'not_sent',
  inner_circle_status text not null default 'not_invited',
  story_permission_granted boolean not null default false,
  follow_up_permission_granted boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  category text not null default 'general',
  created_at timestamptz not null default now()
);

create table if not exists public.participant_tags (
  participant_id uuid not null references public.participants(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (participant_id, tag_id)
);

alter table public.profiles enable row level security;
alter table public.participants enable row level security;
alter table public.tags enable row level security;
alter table public.participant_tags enable row level security;

create or replace function public.current_app_role()
returns public.app_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid()
$$;

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
    'content_reviewer',
    'pastor_elder_reviewer'
  )
$$;

create policy "profiles_select_dashboard"
on public.profiles for select
using (id = auth.uid() or public.can_access_dashboard());

create policy "profiles_update_self"
on public.profiles for update
using (id = auth.uid())
with check (id = auth.uid());

create policy "participants_dashboard_read"
on public.participants for select
using (public.can_access_dashboard());

create policy "tags_dashboard_read"
on public.tags for select
using (public.can_access_dashboard());

create policy "participant_tags_dashboard_read"
on public.participant_tags for select
using (public.can_access_dashboard());
