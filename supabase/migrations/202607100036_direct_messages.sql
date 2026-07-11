-- Direct Messages — internal 1:1 (group-ready) messaging between dashboard
-- users (profiles). Modeled on the SMS tables but participant-based, with
-- per-user read state so unread badges work for both sides.

create table if not exists public.dm_conversations (
  id uuid primary key default gen_random_uuid(),
  created_by uuid references public.profiles(id) on delete set null,
  subject text,
  last_message_at timestamptz,
  last_message_preview text,
  last_sender_id uuid references public.profiles(id) on delete set null,
  status text not null default 'active' check (status in ('active', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.dm_participants (
  conversation_id uuid not null references public.dm_conversations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  last_read_at timestamptz,
  muted boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (conversation_id, user_id)
);

create table if not exists public.dm_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.dm_conversations(id) on delete cascade,
  sender_id uuid references public.profiles(id) on delete set null,
  body text not null default '',
  importance text not null default 'normal' check (importance in ('normal', 'important', 'urgent')),
  attachments jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  edited_at timestamptz,
  deleted_at timestamptz
);

create index if not exists dm_participants_user_idx on public.dm_participants (user_id);
create index if not exists dm_conversations_last_message_idx on public.dm_conversations (last_message_at desc nulls last);
create index if not exists dm_messages_conversation_idx on public.dm_messages (conversation_id, created_at asc);

-- Total unread messages for a user across all their conversations (powers the
-- bell / nav / FAB / dashboard badges).
create or replace function public.dm_unread_count(p_user uuid)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::int
  from public.dm_messages m
  join public.dm_participants dp
    on dp.conversation_id = m.conversation_id and dp.user_id = p_user
  where m.sender_id is distinct from p_user
    and m.deleted_at is null
    and (dp.last_read_at is null or m.created_at > dp.last_read_at);
$$;

-- Per-conversation unread for a user (powers the conversation list badges).
create or replace function public.dm_conversation_unread(p_user uuid)
returns table (conversation_id uuid, unread integer)
language sql
stable
security definer
set search_path = public
as $$
  select m.conversation_id, count(*)::int as unread
  from public.dm_messages m
  join public.dm_participants dp
    on dp.conversation_id = m.conversation_id and dp.user_id = p_user
  where m.sender_id is distinct from p_user
    and m.deleted_at is null
    and (dp.last_read_at is null or m.created_at > dp.last_read_at)
  group by m.conversation_id;
$$;

alter table public.dm_conversations enable row level security;
alter table public.dm_participants enable row level security;
alter table public.dm_messages enable row level security;

-- Match the authenticated user to their profile id (profiles.id or auth_user_id).
-- RLS is a safety net; the app APIs use the service role and authorize in code.
create or replace function public.dm_is_participant(p_conversation uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.dm_participants dp
    join public.profiles p on p.id = dp.user_id
    where dp.conversation_id = p_conversation
      and (p.id = auth.uid() or p.auth_user_id = auth.uid())
  );
$$;

drop policy if exists "dm_conversations_participant_read" on public.dm_conversations;
create policy "dm_conversations_participant_read" on public.dm_conversations
  for select using (public.dm_is_participant(id));

drop policy if exists "dm_participants_self_read" on public.dm_participants;
create policy "dm_participants_self_read" on public.dm_participants
  for select using (public.dm_is_participant(conversation_id));

drop policy if exists "dm_messages_participant_read" on public.dm_messages;
create policy "dm_messages_participant_read" on public.dm_messages
  for select using (public.dm_is_participant(conversation_id));

drop policy if exists "dm_messages_participant_write" on public.dm_messages;
create policy "dm_messages_participant_write" on public.dm_messages
  for insert with check (public.dm_is_participant(conversation_id));
