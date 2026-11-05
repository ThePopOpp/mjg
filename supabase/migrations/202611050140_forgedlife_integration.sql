-- ForgedLife → MJG integration (theforged.life, Firebase).
--
-- ForgedLife's Cloud Functions POST signed events to /api/integrations/forgedlife/events
-- (live) and /test-events (record only). Every event lands in integration_events, unique
-- on its event id, which is both the idempotency key and the audit log. Applying an event
-- only ever writes to the forgedlife_* staging tables below; nothing reaches the live
-- churches / facilitator_groups / profiles tables until a Super Admin approves it on
-- /dashboard/forgedlife. Consented users are also upserted as participants (contacts).
--
-- All tables are service-role only: RLS on, no policies.

create table if not exists public.integration_events (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  mode text not null check (mode in ('live', 'test')),
  event_id text not null,
  event_type text,
  payload jsonb not null,
  status text not null default 'received'
    check (status in ('received', 'recorded', 'applied', 'skipped', 'failed')),
  error text,
  received_at timestamptz not null default now(),
  processed_at timestamptz
);

create unique index if not exists integration_events_event_uidx on public.integration_events (source, mode, event_id);
create index if not exists integration_events_recent_idx on public.integration_events (source, received_at desc);
create index if not exists integration_events_status_idx on public.integration_events (source, status) where status in ('recorded', 'failed');

alter table public.integration_events enable row level security;

-- One row per ForgedLife user who consented to share with MJG.
create table if not exists public.forgedlife_access_requests (
  id uuid primary key default gen_random_uuid(),
  forged_uid text not null unique,
  email text,
  email_is_relay boolean not null default false,
  email_verified boolean,
  name text,
  phone text,
  requested text[] not null default '{}',
  role_in_forged text,
  forged_church_id text,
  consent jsonb,
  sms_consent jsonb,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'declined', 'withdrawn', 'deleted')),
  participant_id uuid references public.participants(id) on delete set null,
  profile_id uuid references public.profiles(id) on delete set null,
  invitation_id uuid,
  decided_by uuid references public.profiles(id) on delete set null,
  decided_at timestamptz,
  last_event_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists forgedlife_requests_status_idx on public.forgedlife_access_requests (status, created_at desc);
create index if not exists forgedlife_requests_email_idx on public.forgedlife_access_requests (lower(email));
create index if not exists forgedlife_requests_participant_idx on public.forgedlife_access_requests (participant_id);
create index if not exists forgedlife_requests_profile_idx on public.forgedlife_access_requests (profile_id);

alter table public.forgedlife_access_requests enable row level security;

-- Churches as ForgedLife sent them; church_id is set once a Super Admin links or creates the MJG church.
create table if not exists public.forgedlife_churches (
  id uuid primary key default gen_random_uuid(),
  forged_id text not null unique,
  name text not null,
  city text,
  state text,
  timezone text,
  logo_url text,
  admins jsonb not null default '[]',
  status text not null default 'pending' check (status in ('pending', 'linked', 'ignored', 'deleted')),
  church_id uuid references public.churches(id) on delete set null,
  source_updated_at timestamptz,
  decided_by uuid references public.profiles(id) on delete set null,
  decided_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists forgedlife_churches_status_idx on public.forgedlife_churches (status);
create index if not exists forgedlife_churches_church_idx on public.forgedlife_churches (church_id);

alter table public.forgedlife_churches enable row level security;

-- Groups as ForgedLife sent them; group_id is set once imported (as a draft) into Find a Group.
create table if not exists public.forgedlife_groups (
  id uuid primary key default gen_random_uuid(),
  forged_id text not null unique,
  forged_church_id text,
  church jsonb,
  study_id text,
  name text not null,
  description text,
  leader jsonb,
  audience text,
  meeting_weekday smallint,
  meeting_hour smallint,
  timezone text,
  start_date date,
  length_days integer,
  member_count integer,
  capacity integer,
  location text,
  open_to_church boolean,
  open_to_public boolean not null default false,
  requires_approval boolean,
  source_status text,
  status text not null default 'pending' check (status in ('pending', 'imported', 'ignored', 'deleted')),
  group_id uuid references public.facilitator_groups(id) on delete set null,
  source_updated_at timestamptz,
  decided_by uuid references public.profiles(id) on delete set null,
  decided_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists forgedlife_groups_status_idx on public.forgedlife_groups (status);
create index if not exists forgedlife_groups_group_idx on public.forgedlife_groups (group_id);

alter table public.forgedlife_groups enable row level security;

-- Links so an MJG church can be traced back to its ForgedLife record.
alter table public.churches add column if not exists external_source text;
alter table public.churches add column if not exists external_id text;
create unique index if not exists churches_external_uidx on public.churches (external_source, external_id) where external_id is not null;

alter table public.facilitator_groups add column if not exists external_source text;
alter table public.facilitator_groups add column if not exists external_id text;
create unique index if not exists facilitator_groups_external_uidx on public.facilitator_groups (external_source, external_id) where external_id is not null;

-- Consent captured in ForgedLife is audited as its own source.
alter table public.consent_events drop constraint if exists consent_events_source_check;
alter table public.consent_events add constraint consent_events_source_check
  check (source in ('web_form', 'admin_manual', 'bulk_import', 'keyword_stop', 'keyword_start', 'csv_import', 'forgedlife'));

-- Switches, both off: applying live events at all, and treating ForgedLife SMS consent as
-- an opt-in (only after the Twilio campaign lists the ForgedLife consent sheet). Withdrawals
-- are always honoured, whatever the switches say.
insert into public.feature_flags (key, description, enabled)
values
  ('forgedlife.sync', 'Apply live ForgedLife events. Off: events are recorded only and can be replayed.', false),
  ('forgedlife.sms_opt_in', 'Treat SMS consent given in ForgedLife as an opt-in. Only after the Twilio campaign lists ForgedLife as an opt-in method.', false)
on conflict (key) do nothing;
