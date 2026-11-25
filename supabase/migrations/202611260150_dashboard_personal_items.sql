-- Personal dashboard items for the customizable Overview: the To-Do List, Reminders,
-- Notepad and Voice Recorder cards. Private to their owner: the app reads and writes
-- them with the service role, scoped to the signed-in profile, and RLS lets a
-- signed-in person reach only their own rows.
--
-- The layout itself lives in user_preferences.dashboard_preferences.overview (no table).

create table if not exists public.dashboard_personal_items (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null check (kind in ('todo', 'reminder', 'note', 'recording')),
  title text not null default '' check (char_length(title) <= 300),
  body text not null default '' check (char_length(body) <= 20000),
  due_at timestamptz,
  done_at timestamptz,
  -- Reminders: set once the "reminder due" notification has been created.
  notified_at timestamptz,
  audio_path text,
  duration_s integer check (duration_s is null or duration_s between 0 and 3600),
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists dashboard_personal_items_owner_idx
  on public.dashboard_personal_items (profile_id, kind, position);
create index if not exists dashboard_personal_items_due_idx
  on public.dashboard_personal_items (due_at)
  where kind = 'reminder' and done_at is null and notified_at is null;

alter table public.dashboard_personal_items enable row level security;

drop policy if exists dashboard_personal_items_owner on public.dashboard_personal_items;
create policy dashboard_personal_items_owner on public.dashboard_personal_items
  for all to authenticated
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

-- Voice memos: a private bucket, read through short-lived signed URLs.
insert into storage.buckets (id, name, public)
values ('dashboard-private', 'dashboard-private', false)
on conflict (id) do nothing;
