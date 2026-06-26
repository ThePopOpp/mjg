-- Booking & Event Management (ported from CMI, reframed for MJG).
-- Two surfaces: 1:1 booking types (appointments) with weekly availability +
-- date overrides + bookings; and group events with registrations (RSVP/waitlist).
-- Service-role API bypasses RLS; dashboard staff may read, team may write.
-- Public booking/registration writes go through the service-role API only.

-- ── Booking types (services) ────────────────────────────────────────────────────
create table if not exists public.booking_types (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  duration_minutes integer not null default 30 check (duration_minutes between 5 and 1440),
  slot_interval_minutes integer,
  buffer_before_minutes integer not null default 0,
  buffer_after_minutes integer not null default 0,
  location_type text not null default 'video' check (location_type in ('video','phone','in_person','custom')),
  location_details text,
  color text default '#0f766e',
  is_active boolean not null default true,
  is_public boolean not null default true,
  host_staff_id uuid,
  host_name text,
  timezone text not null default 'America/Chicago',
  min_notice_hours integer not null default 12,
  max_advance_days integer not null default 60,
  price_cents integer not null default 0,
  currency text not null default 'USD',
  questions jsonb not null default '[]'::jsonb,
  confirmation_message text,
  created_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists bt_active_idx on public.booking_types(is_active, is_public);

-- ── Weekly availability rules ───────────────────────────────────────────────────
create table if not exists public.booking_availability (
  id uuid primary key default gen_random_uuid(),
  booking_type_id uuid not null references public.booking_types(id) on delete cascade,
  day_of_week integer not null check (day_of_week between 0 and 6),
  start_time time not null,
  end_time time not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists ba_type_idx on public.booking_availability(booking_type_id);

-- ── Date overrides (blackouts / extra windows) ──────────────────────────────────
create table if not exists public.booking_date_overrides (
  id uuid primary key default gen_random_uuid(),
  booking_type_id uuid not null references public.booking_types(id) on delete cascade,
  override_date date not null,
  is_available boolean not null default false,
  start_time time,
  end_time time,
  note text,
  created_at timestamptz not null default now()
);
create index if not exists bdo_type_date_idx on public.booking_date_overrides(booking_type_id, override_date);

-- ── Bookings (appointments) ─────────────────────────────────────────────────────
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  booking_type_id uuid not null references public.booking_types(id) on delete cascade,
  reference text not null unique,
  host_staff_id uuid,
  invitee_name text not null,
  invitee_email text,
  invitee_phone text,
  start_at timestamptz not null,
  end_at timestamptz not null,
  timezone text not null default 'America/Chicago',
  status text not null default 'confirmed' check (status in ('confirmed','pending','canceled','completed','no_show')),
  location_type text not null default 'video' check (location_type in ('video','phone','in_person','custom')),
  location_details text,
  answers jsonb not null default '{}'::jsonb,
  internal_notes text,
  cancel_reason text,
  reschedule_of uuid references public.bookings(id) on delete set null,
  source text default 'public',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists bk_type_idx on public.bookings(booking_type_id);
create index if not exists bk_window_idx on public.bookings(start_at, end_at);
create index if not exists bk_status_idx on public.bookings(status);

-- ── Events (group) ──────────────────────────────────────────────────────────────
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  summary text,
  description text,
  status text not null default 'draft' check (status in ('draft','published','canceled','completed')),
  start_at timestamptz not null,
  end_at timestamptz,
  timezone text not null default 'America/Chicago',
  location_type text not null default 'in_person' check (location_type in ('in_person','online','hybrid')),
  location_name text,
  location_address text,
  online_url text,
  cover_image_url text,
  capacity integer,
  registration_required boolean not null default true,
  registration_closes_at timestamptz,
  price_cents integer not null default 0,
  currency text not null default 'USD',
  host_staff_id uuid,
  host_name text,
  is_public boolean not null default true,
  custom_fields jsonb not null default '[]'::jsonb,
  published_at timestamptz,
  created_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists ev_status_idx on public.events(status, is_public);
create index if not exists ev_start_idx on public.events(start_at);

-- ── Event registrations ─────────────────────────────────────────────────────────
create table if not exists public.event_registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  name text not null,
  email text,
  phone text,
  party_size integer not null default 1 check (party_size between 1 and 50),
  status text not null default 'registered' check (status in ('registered','waitlisted','canceled','attended')),
  answers jsonb not null default '{}'::jsonb,
  notes text,
  source text default 'public',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists er_event_idx on public.event_registrations(event_id);
create index if not exists er_status_idx on public.event_registrations(status);

-- ── RLS ─────────────────────────────────────────────────────────────────────────
alter table public.booking_types enable row level security;
alter table public.booking_availability enable row level security;
alter table public.booking_date_overrides enable row level security;
alter table public.bookings enable row level security;
alter table public.events enable row level security;
alter table public.event_registrations enable row level security;

-- dashboard read + team write (service role bypasses RLS for public flows)
do $$
declare tbl text;
begin
  foreach tbl in array array[
    'booking_types','booking_availability','booking_date_overrides','bookings','events','event_registrations'
  ] loop
    execute format('drop policy if exists %I on public.%I', tbl||'_dashboard_read', tbl);
    execute format('create policy %I on public.%I for select using (public.can_access_dashboard())', tbl||'_dashboard_read', tbl);
    execute format('drop policy if exists %I on public.%I', tbl||'_team_write', tbl);
    execute format($f$create policy %I on public.%I for all
      using (public.current_app_role() in ('super_admin','admin','team_member'))
      with check (public.current_app_role() in ('super_admin','admin','team_member'))$f$, tbl||'_team_write', tbl);
  end loop;
end $$;

-- ── Seed: a few MJG booking types + a sample event ──────────────────────────────
insert into public.booking_types (slug, name, description, duration_minutes, location_type, host_name, min_notice_hours, max_advance_days, confirmation_message) values
  ('stewardship-consultation','Stewardship Consultation','A focused 1:1 to talk through your stewardship goals and next steps.',30,'video','Michael J. Gauthier',24,45,'Thanks for booking — a calendar invite with the video link is on its way.'),
  ('pastor-partnership-call','Pastor / Church Partnership Call','Explore how MJG can serve your church or ministry group.',45,'video','Michael J. Gauthier',24,60,'Looking forward to connecting with you and your team.'),
  ('discovery-call','15-Minute Discovery Call','A quick intro call to see if MJG is a good fit for you.',15,'phone','MJG Team',12,30,'We''ll call you at the number provided. Talk soon!')
on conflict (slug) do nothing;

insert into public.booking_availability (booking_type_id, day_of_week, start_time, end_time)
select t.id, d.dow, '09:00'::time, '17:00'::time
from public.booking_types t
cross join (values (1),(2),(3),(4),(5)) as d(dow)
where t.slug in ('stewardship-consultation','pastor-partnership-call','discovery-call')
  and not exists (select 1 from public.booking_availability a where a.booking_type_id = t.id);

insert into public.events (slug, title, summary, description, status, start_at, end_at, location_type, online_url, capacity, host_name, is_public, published_at)
values (
  'stewardship-blueprint-webinar',
  'The Stewardship Blueprint — Live Webinar',
  'A free live session walking through the Stewardship Blueprint framework.',
  'Join Michael J. Gauthier for a live walkthrough of the Stewardship Blueprint, with time for Q&A.',
  'published',
  now() + interval '14 days',
  now() + interval '14 days' + interval '90 minutes',
  'online',
  'https://my.michaeljgauthier.com/animation',
  500,
  'Michael J. Gauthier',
  true,
  now()
)
on conflict (slug) do nothing;
