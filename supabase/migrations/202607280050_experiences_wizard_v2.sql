-- Experiences builder v2: per-experience email steps (Selections), start time,
-- custom cadence, and expanded trigger/event types.

-- ── experiences: start time + custom cadence ───────────────────────────────────────
alter table public.experiences add column if not exists start_time time not null default '09:00:00';
alter table public.experiences add column if not exists custom_interval_value integer;
alter table public.experiences add column if not exists custom_interval_unit text
  check (custom_interval_unit in ('minute','hour','day','week','month'));

-- Allow a 'custom' frequency alongside weekly/biweekly.
alter table public.experiences drop constraint if exists experiences_frequency_check;
alter table public.experiences add constraint experiences_frequency_check
  check (frequency in ('weekly','biweekly','custom'));

-- ── experience_steps: per-experience sequence (the "Selections" repeater) ───────────
-- Each step is an email template plus an offset from the experience start
-- (offset_value + offset_unit). This is the source of truth for scheduling; the
-- type-level experience_type_steps become defaults that pre-fill this in the wizard.
create table if not exists public.experience_steps (
  id uuid primary key default gen_random_uuid(),
  experience_id uuid not null references public.experiences(id) on delete cascade,
  step_number integer not null check (step_number > 0),
  label text,
  email_template_id uuid references public.email_templates(id) on delete set null,
  offset_value integer not null default 0 check (offset_value >= 0),
  offset_unit text not null default 'week' check (offset_unit in ('minute','hour','day','week','month')),
  created_at timestamptz not null default now(),
  unique (experience_id, step_number)
);
create index if not exists experience_steps_experience_idx on public.experience_steps(experience_id, step_number);

alter table public.experience_steps enable row level security;
create policy "experience_steps_dashboard_read" on public.experience_steps for select using (public.can_access_dashboard());
create policy "experience_steps_admin_write" on public.experience_steps for all
  using (public.can_manage_users()) with check (public.can_manage_users());

-- ── experience_types: category (Program vs Trigger) + expanded trigger seeds ─────────
alter table public.experience_types add column if not exists category text;

update public.experience_types set category = 'Program'
  where category is null and slug in ('six-week-challenge','stewardship-blueprint','life-youre-building-booking');

insert into public.experience_types (name, slug, description, default_frequency, default_duration_weeks, category) values
  ('New Registration',  'trigger-new-registration', 'Welcome sequence when someone registers.',        'weekly', 3, 'Trigger'),
  ('Check-In Completed', 'trigger-check-in',         'Follow-up after a stewardship check-in.',          'weekly', 3, 'Trigger'),
  ('New Facilitator',   'trigger-new-facilitator',  'Onboarding sequence for a new facilitator.',       'weekly', 4, 'Trigger'),
  ('New Course',        'trigger-new-course',       'Announce and drip a new course.',                  'weekly', 6, 'Trigger'),
  ('Book Launch',       'trigger-book-launch',      'Launch runway for a new book.',                    'weekly', 4, 'Trigger'),
  ('Event',             'trigger-event',            'Reminders and follow-up around an event.',         'weekly', 3, 'Trigger'),
  ('Meeting',           'trigger-meeting',          'Reminders and recap around a meeting.',            'weekly', 2, 'Trigger')
on conflict (slug) do nothing;
