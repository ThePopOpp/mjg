-- The member's past conversations -------------------------------------------
--
-- A lightweight index over Steward sessions, so the rail can show real
-- conversations instead of the example titles it ships with.
--
-- Deliberately NOT a transcript. One row per conversation holding a session id,
-- a title and when it was last active — nothing of what was said. The messages
-- live in eve's session store, where the retention setting will reach them; the
-- docset asks for "selected purpose-bound continuity, not blanket transcripts",
-- and a second copy of everything said would be exactly the blanket transcript
-- it warns against.
--
-- Deleting a row here hides a conversation from the member. Erasing what was
-- said is the purge job's work, against eve's store. Keeping those separate is
-- what stops "remove it from my list" from being mistaken for "delete it".

create table if not exists public.steward_conversations (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  -- eve's session id. Unique, so re-registering an existing session updates it
  -- rather than creating a duplicate row on every page load.
  session_id text not null unique,
  -- Taken from the member's first message, trimmed. Their words, not a summary
  -- a model wrote about them.
  title text not null default 'New conversation',
  started_at timestamptz not null default now(),
  last_active_at timestamptz not null default now()
);

create index if not exists steward_conversations_profile_idx
  on public.steward_conversations(profile_id, last_active_at desc);

alter table public.steward_conversations enable row level security;

drop policy if exists steward_conversations_own on public.steward_conversations;
create policy steward_conversations_own on public.steward_conversations
  for select using (profile_id = public.current_profile_id());
