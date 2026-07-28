-- Experiences: admin-built, multi-week programs that drip a per-week email sequence
-- to a group of attendees on a weekly / bi-weekly cadence, led by an assigned facilitator.
--
-- Model:
--   experience_types        — admin-configurable program templates (6 Week Challenge, …)
--   experience_type_steps   — the per-week email sequence for a type (a different template per week)
--   experiences             — a concrete instance (type + start date + cadence + facilitator)
--   experience_attendees    — the recipient list (Name + Email repeater), optionally linked to a participant
--   experience_send_events  — per attendee × per step scheduled send (modeled on email_journey_events)

-- ── Types (admin-configurable) ─────────────────────────────────────────────────────
create table if not exists public.experience_types (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  default_frequency text not null default 'weekly' check (default_frequency in ('weekly','biweekly')),
  default_duration_weeks integer not null default 6 check (default_duration_weeks > 0),
  status text not null default 'active' check (status in ('active','archived')),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── Per-week email sequence ────────────────────────────────────────────────────────
create table if not exists public.experience_type_steps (
  id uuid primary key default gen_random_uuid(),
  experience_type_id uuid not null references public.experience_types(id) on delete cascade,
  step_number integer not null check (step_number > 0),
  label text,
  email_template_id uuid references public.email_templates(id) on delete set null,
  subject_override text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (experience_type_id, step_number)
);
create index if not exists experience_type_steps_type_idx on public.experience_type_steps(experience_type_id, step_number);

-- ── Experiences (instances) ────────────────────────────────────────────────────────
create table if not exists public.experiences (
  id uuid primary key default gen_random_uuid(),
  experience_type_id uuid references public.experience_types(id) on delete set null,
  name text not null,
  facilitator_id uuid references public.profiles(id) on delete set null,
  start_date date not null,
  frequency text not null default 'weekly' check (frequency in ('weekly','biweekly')),
  duration_weeks integer not null default 6 check (duration_weeks > 0),
  status text not null default 'draft' check (status in ('draft','scheduled','active','completed','cancelled')),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists experiences_facilitator_idx on public.experiences(facilitator_id);
create index if not exists experiences_status_idx on public.experiences(status);

-- ── Attendees (recipient list) ─────────────────────────────────────────────────────
create table if not exists public.experience_attendees (
  id uuid primary key default gen_random_uuid(),
  experience_id uuid not null references public.experiences(id) on delete cascade,
  participant_id uuid references public.participants(id) on delete set null,
  name text,
  email text not null,
  opted_out boolean not null default false,
  created_at timestamptz not null default now(),
  unique (experience_id, email)
);
create index if not exists experience_attendees_experience_idx on public.experience_attendees(experience_id);

-- ── Scheduled sends (per attendee × per step) ──────────────────────────────────────
create table if not exists public.experience_send_events (
  id uuid primary key default gen_random_uuid(),
  experience_id uuid not null references public.experiences(id) on delete cascade,
  attendee_id uuid not null references public.experience_attendees(id) on delete cascade,
  step_number integer not null,
  template_id uuid references public.email_templates(id) on delete set null,
  subject text,
  status text not null default 'scheduled' check (status in ('scheduled','sent','skipped','failed')),
  scheduled_at timestamptz not null,
  sent_at timestamptz,
  provider text,
  provider_message_id text,
  error_message text,
  last_attempt_at timestamptz,
  merge_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (attendee_id, step_number)
);
-- "due" index — mirrors email_journey_events_due_idx; drives the scheduler query.
create index if not exists experience_send_events_due_idx on public.experience_send_events(status, scheduled_at);
create index if not exists experience_send_events_experience_idx on public.experience_send_events(experience_id);

-- ── RLS ────────────────────────────────────────────────────────────────────────────
-- Admin/service-role API bypasses RLS. Admins manage all; facilitators may read only
-- the experiences they are assigned to (forward-looking for the facilitator portal).
alter table public.experience_types enable row level security;
alter table public.experience_type_steps enable row level security;
alter table public.experiences enable row level security;
alter table public.experience_attendees enable row level security;
alter table public.experience_send_events enable row level security;

create policy "experience_types_dashboard_read" on public.experience_types for select using (public.can_access_dashboard());
create policy "experience_types_admin_write" on public.experience_types for all
  using (public.can_manage_users()) with check (public.can_manage_users());

create policy "experience_type_steps_dashboard_read" on public.experience_type_steps for select using (public.can_access_dashboard());
create policy "experience_type_steps_admin_write" on public.experience_type_steps for all
  using (public.can_manage_users()) with check (public.can_manage_users());

create policy "experiences_admin_write" on public.experiences for all
  using (public.can_manage_users()) with check (public.can_manage_users());
create policy "experiences_owner_read" on public.experiences for select
  using (public.can_manage_users() or facilitator_id = public.current_profile_id());

create policy "experience_attendees_admin_write" on public.experience_attendees for all
  using (public.can_manage_users()) with check (public.can_manage_users());
create policy "experience_attendees_owner_read" on public.experience_attendees for select
  using (
    public.can_manage_users()
    or exists (
      select 1 from public.experiences e
      where e.id = experience_id and e.facilitator_id = public.current_profile_id()
    )
  );

create policy "experience_send_events_admin_write" on public.experience_send_events for all
  using (public.can_manage_users()) with check (public.can_manage_users());
create policy "experience_send_events_owner_read" on public.experience_send_events for select
  using (
    public.can_manage_users()
    or exists (
      select 1 from public.experiences e
      where e.id = experience_id and e.facilitator_id = public.current_profile_id()
    )
  );

-- ── Seed: initial experience types ─────────────────────────────────────────────────
insert into public.experience_types (name, slug, description, default_frequency, default_duration_weeks) values
  ('6 Week Challenge', 'six-week-challenge', 'A six-week guided stewardship challenge.', 'weekly', 6),
  ('Stewardship Blueprint', 'stewardship-blueprint', 'The Stewardship Blueprint program.', 'weekly', 6),
  ('The Life You''re Building Booking', 'life-youre-building-booking', 'The Life You''re Building booking journey.', 'biweekly', 12)
on conflict (slug) do nothing;
