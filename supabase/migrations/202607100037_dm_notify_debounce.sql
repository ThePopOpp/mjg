-- Debounce column for Direct Message alerts: when we email/SMS a recipient
-- about a new message, we stamp last_notified_at so a rapid back-and-forth
-- doesn't spam them. Cleared when they read the conversation.
alter table public.dm_participants
  add column if not exists last_notified_at timestamptz;
