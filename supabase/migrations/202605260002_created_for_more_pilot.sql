create table if not exists public.waves (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  name text not null,
  description text,
  launch_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.participants
  add column if not exists email_journey_opt_in boolean not null default false,
  add column if not exists future_updates_opt_in boolean not null default false,
  add column if not exists anonymous_feedback_permission boolean not null default false,
  add column if not exists story_permission_granted boolean not null default false,
  add column if not exists follow_up_permission_granted boolean not null default false;

create unique index if not exists participants_email_unique_idx on public.participants (lower(email));
create unique index if not exists participants_email_exact_unique_idx on public.participants (email);
create index if not exists participants_wave_idx on public.participants (wave);
create index if not exists participants_status_idx on public.participants (check_in_status, survey_status, inner_circle_status);

create table if not exists public.check_in_results (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references public.participants(id) on delete cascade,
  total_score integer not null,
  score_range_category text not null,
  lowest_area_key text not null,
  lowest_area_label text not null,
  section_scores jsonb not null default '{}'::jsonb,
  reflections jsonb not null default '{}'::jsonb,
  consent jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.check_in_answers (
  id uuid primary key default gen_random_uuid(),
  check_in_result_id uuid not null references public.check_in_results(id) on delete cascade,
  participant_id uuid not null references public.participants(id) on delete cascade,
  section_key text not null,
  section_label text not null,
  question_index integer not null,
  question text not null,
  score integer not null check (score between 1 and 5),
  created_at timestamptz not null default now()
);

create table if not exists public.survey_responses (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid references public.participants(id) on delete set null,
  survey_type text not null check (survey_type in ('general', 'pastor_elder')),
  answers jsonb not null default '{}'::jsonb,
  anonymous_feedback_permission boolean not null default false,
  story_interview_permission boolean not null default false,
  follow_up_permission boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.survey_answers (
  id uuid primary key default gen_random_uuid(),
  survey_response_id uuid not null references public.survey_responses(id) on delete cascade,
  participant_id uuid references public.participants(id) on delete set null,
  question_key text not null,
  answer jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.email_journey_events (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references public.participants(id) on delete cascade,
  step_number integer not null,
  step_key text not null,
  subject text not null,
  status text not null default 'scheduled',
  provider text,
  provider_message_id text,
  scheduled_at timestamptz,
  sent_at timestamptz,
  error_message text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid references public.participants(id) on delete set null,
  type text not null,
  title text not null,
  message text not null,
  destination text not null default 'dashboard',
  status text not null default 'queued',
  metadata jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  participant_id uuid references public.participants(id) on delete set null,
  action text not null,
  entity_type text,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.inner_circle_responses (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid references public.participants(id) on delete set null,
  name text not null,
  email text not null,
  phone text,
  willing boolean not null default false,
  future_feedback_permission boolean not null default false,
  story_interview_permission boolean not null default false,
  public_use_acknowledgement boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.waves enable row level security;
alter table public.check_in_results enable row level security;
alter table public.check_in_answers enable row level security;
alter table public.survey_responses enable row level security;
alter table public.survey_answers enable row level security;
alter table public.email_journey_events enable row level security;
alter table public.notifications enable row level security;
alter table public.activity_logs enable row level security;
alter table public.inner_circle_responses enable row level security;

create policy "waves_dashboard_read" on public.waves for select using (public.can_access_dashboard());
create policy "check_in_results_dashboard_read" on public.check_in_results for select using (public.can_access_dashboard());
create policy "check_in_answers_dashboard_read" on public.check_in_answers for select using (public.can_access_dashboard());
create policy "survey_responses_dashboard_read" on public.survey_responses for select using (public.can_access_dashboard());
create policy "survey_answers_dashboard_read" on public.survey_answers for select using (public.can_access_dashboard());
create policy "email_journey_dashboard_read" on public.email_journey_events for select using (public.can_access_dashboard());
create policy "notifications_dashboard_read" on public.notifications for select using (public.can_access_dashboard());
create policy "activity_logs_dashboard_read" on public.activity_logs for select using (public.can_access_dashboard());
create policy "inner_circle_dashboard_read" on public.inner_circle_responses for select using (public.can_access_dashboard());

create policy "participants_public_insert" on public.participants for insert with check (true);
create policy "check_in_results_public_insert" on public.check_in_results for insert with check (true);
create policy "check_in_answers_public_insert" on public.check_in_answers for insert with check (true);
create policy "survey_responses_public_insert" on public.survey_responses for insert with check (true);
create policy "survey_answers_public_insert" on public.survey_answers for insert with check (true);
create policy "inner_circle_public_insert" on public.inner_circle_responses for insert with check (true);
create policy "notifications_public_insert" on public.notifications for insert with check (true);
create policy "email_journey_public_insert" on public.email_journey_events for insert with check (true);

insert into public.waves (key, name, description) values
  ('wave_0', 'Wave 0', 'Internal test group'),
  ('wave_1', 'Wave 1', 'Pastors, elders, and trusted participants'),
  ('wave_2', 'Wave 2', 'Future pilot cohort'),
  ('wave_3', 'Wave 3', 'Future pilot cohort')
on conflict (key) do nothing;

insert into public.tags (name, category) values
  ('Created for More Pilot', 'pilot'),
  ('Wave 0', 'wave'),
  ('Wave 1', 'wave'),
  ('Wave 2', 'wave'),
  ('Wave 3', 'wave'),
  ('Pastor/Elder Review', 'review'),
  ('Church Leader', 'relationship'),
  ('Check-In Started', 'check_in'),
  ('Check-In Completed', 'check_in'),
  ('7-Day Journey Started', 'journey'),
  ('7-Day Journey Completed', 'journey'),
  ('Survey Sent', 'survey'),
  ('Survey Completed', 'survey'),
  ('Inner Circle Invited', 'inner_circle'),
  ('Inner Circle Accepted', 'inner_circle'),
  ('Story Permission Granted', 'permission'),
  ('Interview Candidate', 'follow_up'),
  ('Church Pilot Interest', 'interest'),
  ('Small Group Interest', 'interest'),
  ('Bible Plan Interest', 'interest'),
  ('Workbook Interest', 'interest'),
  ('Speaking Interest', 'interest'),
  ('Referral / Shared With Others', 'referral'),
  ('Lowest: Purpose', 'lowest_area'),
  ('Lowest: Family', 'lowest_area'),
  ('Lowest: Fitness/Energy', 'lowest_area'),
  ('Lowest: Fun/Joy', 'lowest_area'),
  ('Lowest: Finances', 'lowest_area')
on conflict (name) do nothing;
