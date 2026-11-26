-- Annual Retreat Guide (docs/squeeze-page/MJG_Annual_Retreat_Jeremy_Handoff).
--
-- A free lead magnet: /annual-retreat → form → immediate download on
-- /annual-retreat/thank-you + a delivery email → an OPTIONAL follow-up series.
--
-- Rules from Mike's brief, and where each is enforced:
--   • The guide is delivered whether or not the optional box is ticked.
--   • Guide request and marketing permission are recorded separately: every
--     request is a row here; permission is a consent_events row (with the exact
--     wording, time and page) written only when the box is ticked.
--   • Existing contacts are matched by email (lib/contacts/upsert.ts); a guide
--     request alone never turns marketing back on.
--   • The follow-up series is once per person (unique on lower(email)), checks
--     permission again at send time, and stops on unsubscribe.
--   • Nothing here creates an account or touches the 7-day journey.
--   • Everything is OFF: the page (feature flag annual_retreat.public) and the
--     follow-ups (annual_retreat_settings.followups_enabled).

-- ── Settings (singleton) ──────────────────────────────────────────────────────
create table if not exists public.annual_retreat_settings (
  id smallint primary key default 1 check (id = 1),
  -- Which file in the private bucket /annual-retreat/guide serves. Changing it is
  -- the "release a new version" switch; older files stay in the bucket.
  guide_version text not null default '1.0',
  guide_path text not null default 'Annual_Stewardship_Blueprint_Retreat_Guide_v1_0.pdf',
  guide_filename text not null default 'Annual_Stewardship_Blueprint_Retreat_Guide.pdf',
  followups_enabled boolean not null default false,
  mailing_address text,
  updated_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now(),
  constraint annual_retreat_followups_ready check (not followups_enabled or coalesce(trim(mailing_address), '') <> '')
);
insert into public.annual_retreat_settings (id) values (1) on conflict (id) do nothing;

-- ── Guide requests (one row per successful submission) ────────────────────────
create table if not exists public.annual_retreat_requests (
  id uuid primary key default gen_random_uuid(),
  -- Client-generated per form attempt, so a retried submission is recognised.
  attempt_id text not null unique check (attempt_id ~ '^[A-Za-z0-9_-]{8,64}$'),
  contact_id uuid references public.contacts(id) on delete set null,
  email text not null,
  first_name text,
  source text not null default 'annual_retreat_guide',
  guide_version text not null,
  marketing_opt_in boolean not null default false,
  -- Wording, time and page of the optional permission (null when not ticked).
  consent_text text,
  consented_at timestamptz,
  page_url text,
  first_touch jsonb,
  session_touch jsonb,
  email_status text not null default 'pending' check (email_status in ('pending', 'sent', 'failed', 'skipped')),
  email_message_id text,
  email_error text,
  emailed_at timestamptz,
  ip_hash text,
  created_at timestamptz not null default now()
);
create index if not exists annual_retreat_requests_email_idx on public.annual_retreat_requests (lower(email), created_at desc);
create index if not exists annual_retreat_requests_created_idx on public.annual_retreat_requests (created_at desc);
create index if not exists annual_retreat_requests_ip_idx on public.annual_retreat_requests (ip_hash, created_at desc) where ip_hash is not null;

-- ── Optional follow-up series ─────────────────────────────────────────────────
create table if not exists public.annual_retreat_enrollments (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  contact_id uuid references public.contacts(id) on delete set null,
  request_id uuid references public.annual_retreat_requests(id) on delete set null,
  first_name text,
  enrolled_at timestamptz not null default now(),
  unsubscribed_at timestamptz
);
create unique index if not exists annual_retreat_enrollments_email_key on public.annual_retreat_enrollments (lower(email));

create table if not exists public.annual_retreat_events (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references public.annual_retreat_enrollments(id) on delete cascade,
  step_key text not null,
  scheduled_at timestamptz not null,
  status text not null default 'pending' check (status in ('pending', 'sent', 'skipped', 'failed', 'cancelled')),
  attempts integer not null default 0,
  sent_at timestamptz,
  last_attempt_at timestamptz,
  last_error text,
  provider_message_id text,
  created_at timestamptz not null default now(),
  unique (enrollment_id, step_key)
);
create index if not exists annual_retreat_events_due_idx on public.annual_retreat_events (scheduled_at) where status = 'pending';

-- Server-only: read and written with the service role. No policies.
alter table public.annual_retreat_settings enable row level security;
alter table public.annual_retreat_requests enable row level security;
alter table public.annual_retreat_enrollments enable row level security;
alter table public.annual_retreat_events enable row level security;

-- ── Release switch (super admins pass every flag, so they can preview) ────────
insert into public.feature_flags (key, description, enabled)
values ('annual_retreat.public',
        'Annual Retreat Guide: public /annual-retreat page, thank-you page and guide download. Off = super admins only (everyone else gets a 404).',
        false)
on conflict (key) do nothing;

-- ── Private bucket for the guide PDFs (versioned files, served by /annual-retreat/guide) ──
insert into storage.buckets (id, name, public)
values ('annual-retreat', 'annual-retreat', false)
on conflict (id) do nothing;
