-- Agent tasks: MJG is the source of truth for work handed to agents.
--
-- People (in Claude or the dashboard) create tasks and assign them to an agent
-- — an agent token issued in Settings → Claude & Agents. Agents (Paperclip,
-- Hermes, OpenClaw or any MCP client) connect to the MJG connector with that
-- token, claim their next task, do the work through MJG tools, and report back.
-- Every step is an event, so a task's history reads like a log. Agent high-risk
-- actions still wait for a person's approval (mcp_pending_confirmations).
--
-- Also: agent tokens can be paused (not revoked) — a paused agent is refused on
-- every call until resumed.

alter table public.mcp_tokens add column if not exists paused_at timestamptz;

create table if not exists public.agent_tasks (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  instructions  text not null default '',
  -- The agent (an agent token) it's for; null = any agent may claim it.
  agent_token_id uuid references public.mcp_tokens(id) on delete set null,
  status        text not null default 'queued'
                check (status in ('queued', 'in_progress', 'needs_review', 'done', 'failed', 'canceled')),
  priority      text not null default 'normal' check (priority in ('low', 'normal', 'high', 'urgent')),
  due_at        timestamptz,
  result        text,
  result_data   jsonb,
  created_by    uuid references public.profiles(id) on delete set null,
  created_via   text not null default 'mcp' check (created_via in ('mcp', 'dashboard', 'agent')),
  claimed_at    timestamptz,
  completed_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists agent_tasks_queue_idx on public.agent_tasks (status, priority, created_at) where status = 'queued';
create index if not exists agent_tasks_agent_idx on public.agent_tasks (agent_token_id, status);

create table if not exists public.agent_task_events (
  id           bigint generated always as identity primary key,
  task_id      uuid not null references public.agent_tasks(id) on delete cascade,
  kind         text not null check (kind in ('created', 'claimed', 'progress', 'needs_review', 'done', 'failed', 'canceled', 'comment')),
  message      text,
  data         jsonb,
  actor_token_id   uuid references public.mcp_tokens(id) on delete set null,
  actor_profile_id uuid references public.profiles(id) on delete set null,
  created_at   timestamptz not null default now()
);
create index if not exists agent_task_events_task_idx on public.agent_task_events (task_id, created_at);

do $$
declare tbl text;
begin
  foreach tbl in array array['agent_tasks', 'agent_task_events']
  loop
    execute format('alter table public.%I enable row level security', tbl);
    execute format('drop policy if exists %I on public.%I', tbl || '_super_admin_all', tbl);
    execute format(
      'create policy %I on public.%I for all using (public.is_super_admin()) with check (public.is_super_admin())',
      tbl || '_super_admin_all', tbl);
  end loop;
end $$;
