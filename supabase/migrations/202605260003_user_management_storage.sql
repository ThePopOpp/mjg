do $$
begin
  if not exists (
    select 1 from pg_enum
    where enumlabel = 'pending'
      and enumtypid = 'public.user_status'::regtype
  ) then
    alter type public.user_status add value 'pending';
  end if;

  if not exists (
    select 1 from pg_enum
    where enumlabel = 'suspended'
      and enumtypid = 'public.user_status'::regtype
  ) then
    alter type public.user_status add value 'suspended';
  end if;

  if not exists (
    select 1 from pg_enum
    where enumlabel = 'archived'
      and enumtypid = 'public.user_status'::regtype
  ) then
    alter type public.user_status add value 'archived';
  end if;
end $$;

alter table public.profiles
  add column if not exists auth_user_id uuid references auth.users(id) on delete cascade,
  add column if not exists full_name text,
  add column if not exists phone text,
  add column if not exists avatar_url text,
  add column if not exists invited_by uuid references public.profiles(id) on delete set null,
  add column if not exists related_participant_id uuid references public.participants(id) on delete set null,
  add column if not exists notes text,
  add column if not exists last_login_at timestamptz,
  add column if not exists status_changed_by uuid references public.profiles(id) on delete set null,
  add column if not exists status_changed_at timestamptz,
  add column if not exists status_change_reason text,
  add column if not exists role_changed_by uuid references public.profiles(id) on delete set null,
  add column if not exists role_changed_at timestamptz,
  add column if not exists role_metadata jsonb not null default '{}'::jsonb;

update public.profiles
set
  auth_user_id = coalesce(auth_user_id, id),
  full_name = nullif(trim(coalesce(first_name, '') || ' ' || coalesce(last_name, '')), '')
where auth_user_id is null or full_name is null;

create unique index if not exists profiles_auth_user_id_unique_idx on public.profiles(auth_user_id);
create index if not exists profiles_email_idx on public.profiles(lower(email));
create index if not exists profiles_phone_idx on public.profiles(phone) where phone is not null;
create index if not exists profiles_role_status_idx on public.profiles(role, status);
create index if not exists profiles_related_participant_idx on public.profiles(related_participant_id);

create table if not exists public.user_invitations (
  id uuid primary key default gen_random_uuid(),
  email text,
  phone text,
  role public.app_role not null default 'participant',
  invited_by uuid references public.profiles(id) on delete set null,
  invite_method text not null check (invite_method in ('email', 'sms', 'manual')),
  invite_status text not null default 'pending' check (invite_status in ('pending', 'sent', 'accepted', 'expired', 'revoked', 'failed')),
  invite_token text unique,
  sent_at timestamptz,
  accepted_at timestamptz,
  expires_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_invitations_contact_check check (email is not null or phone is not null)
);

create table if not exists public.user_activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  actor_user_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.user_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  preferred_user_view text not null default 'table',
  saved_filters jsonb not null default '{}'::jsonb,
  saved_search text,
  column_preferences jsonb not null default '{}'::jsonb,
  dashboard_preferences jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id)
);

create table if not exists public.form_submissions (
  id uuid primary key default gen_random_uuid(),
  form_type text not null,
  email text,
  phone text,
  user_id uuid references public.profiles(id) on delete set null,
  participant_id uuid references public.participants(id) on delete set null,
  source text,
  status text not null default 'received',
  payload jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.participant_user_links (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references public.participants(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  link_type text not null default 'email_match',
  linked_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  unique(participant_id, user_id)
);

create table if not exists public.role_assignment_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  previous_role public.app_role,
  new_role public.app_role not null,
  changed_by uuid references public.profiles(id) on delete set null,
  change_reason text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.notifications
  add column if not exists user_id uuid references public.profiles(id) on delete set null,
  add column if not exists actor_user_id uuid references public.profiles(id) on delete set null;

create index if not exists user_invitations_email_idx on public.user_invitations(lower(email));
create index if not exists user_invitations_phone_idx on public.user_invitations(phone) where phone is not null;
create index if not exists user_invitations_status_idx on public.user_invitations(invite_status);
create index if not exists user_activity_user_idx on public.user_activity_logs(user_id);
create index if not exists user_activity_actor_idx on public.user_activity_logs(actor_user_id);
create index if not exists form_submissions_email_idx on public.form_submissions(lower(email));
create index if not exists form_submissions_phone_idx on public.form_submissions(phone) where phone is not null;
create index if not exists form_submissions_participant_idx on public.form_submissions(participant_id);
create index if not exists participant_user_links_participant_idx on public.participant_user_links(participant_id);
create index if not exists participant_user_links_user_idx on public.participant_user_links(user_id);
create index if not exists notifications_user_idx on public.notifications(user_id);

alter table public.user_invitations enable row level security;
alter table public.user_activity_logs enable row level security;
alter table public.user_preferences enable row level security;
alter table public.form_submissions enable row level security;
alter table public.participant_user_links enable row level security;
alter table public.role_assignment_history enable row level security;

create or replace function public.current_profile_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from public.profiles where auth_user_id = auth.uid() or id = auth.uid()
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_app_role() = 'super_admin'
$$;

create or replace function public.can_manage_users()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_app_role() in ('super_admin', 'admin')
$$;

drop policy if exists "user_invitations_dashboard_read" on public.user_invitations;
create policy "user_invitations_dashboard_read" on public.user_invitations
for select using (public.can_manage_users());

drop policy if exists "user_activity_dashboard_read" on public.user_activity_logs;
create policy "user_activity_dashboard_read" on public.user_activity_logs
for select using (public.can_manage_users() or user_id = public.current_profile_id() or actor_user_id = public.current_profile_id());

drop policy if exists "user_preferences_self_read" on public.user_preferences;
create policy "user_preferences_self_read" on public.user_preferences
for select using (user_id = public.current_profile_id() or public.can_manage_users());

drop policy if exists "user_preferences_self_write" on public.user_preferences;
create policy "user_preferences_self_write" on public.user_preferences
for all using (user_id = public.current_profile_id()) with check (user_id = public.current_profile_id());

drop policy if exists "form_submissions_dashboard_read" on public.form_submissions;
create policy "form_submissions_dashboard_read" on public.form_submissions
for select using (public.can_access_dashboard());

drop policy if exists "form_submissions_public_insert" on public.form_submissions;
create policy "form_submissions_public_insert" on public.form_submissions
for insert with check (true);

drop policy if exists "participant_user_links_dashboard_read" on public.participant_user_links;
create policy "participant_user_links_dashboard_read" on public.participant_user_links
for select using (public.can_access_dashboard());

drop policy if exists "role_assignment_history_dashboard_read" on public.role_assignment_history;
create policy "role_assignment_history_dashboard_read" on public.role_assignment_history
for select using (public.can_manage_users() or user_id = public.current_profile_id());

drop policy if exists "profiles_manage_users_write" on public.profiles;
create policy "profiles_manage_users_write" on public.profiles
for all using (public.can_manage_users()) with check (public.can_manage_users());
