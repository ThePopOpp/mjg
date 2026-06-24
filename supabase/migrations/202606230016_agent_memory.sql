-- Siggey AI agent durable memory.
-- Stores small, non-sensitive facts the agent should recall across sessions
-- (e.g. ongoing tasks, preferences, "the blog post we drafted"). Recalled into
-- the system prompt at the start of each conversation.

create table if not exists public.agent_memory (
  id uuid primary key default gen_random_uuid(),
  scope text not null default 'shared',
  key text not null unique,
  value text not null,
  created_by uuid references public.profiles(id) on delete set null,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists agent_memory_updated_idx on public.agent_memory (updated_at desc);
create index if not exists agent_memory_expires_idx on public.agent_memory (expires_at) where expires_at is not null;

alter table public.agent_memory enable row level security;

create policy "agent_memory_dashboard_read" on public.agent_memory
  for select using (public.can_access_dashboard());

create policy "agent_memory_team_write" on public.agent_memory
  for all using (public.current_app_role() in ('super_admin', 'admin', 'team_member'))
  with check (public.current_app_role() in ('super_admin', 'admin', 'team_member'));
