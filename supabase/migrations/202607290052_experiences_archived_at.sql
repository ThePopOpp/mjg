-- Soft-archive for experiences. Archived experiences are hidden from the main list
-- but recoverable; deletion (hard) is a separate action that cascades to attendees,
-- steps, and send events.
alter table public.experiences add column if not exists archived_at timestamptz;
create index if not exists experiences_archived_idx on public.experiences(archived_at);
