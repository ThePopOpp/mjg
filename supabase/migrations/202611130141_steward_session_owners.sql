-- Who owns each Steward session --------------------------------------------
--
-- eve authenticates every request to /eve/v1/session/:id/... but does NOT check
-- that the session belongs to the caller. Any signed-in member holding another
-- member's session id could read that conversation's stream, or worse, send a
-- message into it — and Steward's tools act as the member who STARTED the
-- session, so that message would read the other member's Blueprint.
--
-- This table is the authoritative owner record that closes it. It is written
-- ONLY by the Steward container (through /api/steward/agent, behind the agent
-- secret), at the moment eve creates the session and before the session id is
-- returned to the browser — so there is no window in which an id exists without
-- an owner. Every eve route that takes a session id checks it first
-- (steward/agent/lib/session-ownership.ts). No row means no access: fail closed.
--
-- steward_conversations is NOT used for this: the browser registers those rows
-- itself, after the fact, so a row there proves nothing about who made the
-- session. Registration now requires a matching owner row here.

create table if not exists public.steward_session_owners (
  session_id text primary key,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists steward_session_owners_profile_idx
  on public.steward_session_owners(profile_id);

-- Service-only. No policies: neither anon nor authenticated may read or write.
alter table public.steward_session_owners enable row level security;

-- Sessions that existed before this table. Their only record of ownership is
-- the conversation list, so it seeds them; without this every existing
-- conversation would become unreachable, including to its owner.
insert into public.steward_session_owners (session_id, profile_id, created_at)
select session_id, profile_id, started_at
from public.steward_conversations
on conflict (session_id) do nothing;
