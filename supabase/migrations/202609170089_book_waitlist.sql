-- Book Waitlist — requests for "The Life You're Building".
--
-- Kept as its own table rather than a form_submissions row: the admin Book Waitlist page and
-- the Reports block both query it directly, it needs one row per email (re-submitting updates
-- rather than duplicating), and it carries its own fulfilment lifecycle.
--
-- profile_id / account_type / user_role capture WHO asked, resolved at submit time:
--   profile_id  — set when the email matches an MJG account (so it shows on their dashboard)
--   account_type— 'registered' or 'guest' at the time of the request
--   user_role   — their app role then (participant / facilitator / admin / …), or null for guests
-- The role is a snapshot for reporting; the live role always comes from profiles.
create table if not exists public.book_waitlist_requests (
  id              uuid primary key default gen_random_uuid(),
  email           text not null,
  first_name      text,
  last_name       text,
  phone           text,
  profile_id      uuid references public.profiles(id) on delete set null,
  participant_id  uuid references public.participants(id) on delete set null,
  account_type    text not null default 'guest' check (account_type in ('registered', 'guest')),
  user_role       text,
  -- What they told us about themselves / what they want.
  format_preference text check (format_preference in ('ebook', 'print', 'audiobook', 'any')),
  interest        text,
  notes           text,
  source          text not null default 'book_waitlist_page',
  status          text not null default 'requested' check (status in ('requested', 'notified', 'fulfilled', 'archived')),
  notified_at     timestamptz,
  metadata        jsonb not null default '{}'::jsonb,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- One request per email; a repeat submission refreshes the existing row.
create unique index if not exists book_waitlist_requests_email_key
  on public.book_waitlist_requests (lower(email));
create index if not exists book_waitlist_requests_created_idx
  on public.book_waitlist_requests (created_at desc);
create index if not exists book_waitlist_requests_profile_idx
  on public.book_waitlist_requests (profile_id);

-- Writes go through the service-role admin client (the public form posts to our own API).
-- Dashboard roles may read; nothing is exposed to anon.
alter table public.book_waitlist_requests enable row level security;
drop policy if exists "book_waitlist_dashboard_read" on public.book_waitlist_requests;
create policy "book_waitlist_dashboard_read" on public.book_waitlist_requests
  for select using (public.can_access_dashboard());
