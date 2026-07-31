-- Named Workspaces: top-level containers that group folders + documents.
-- Everything that existed before this migration is backfilled into a default "General" workspace.

create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Untitled workspace',
  icon text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Fixed default workspace so pre-existing content has a home.
insert into public.workspaces (id, name)
values ('11111111-1111-1111-1111-111111111111', 'General')
on conflict (id) do nothing;

alter table public.workspace_documents add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.workspace_folders add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;

update public.workspace_documents set workspace_id = '11111111-1111-1111-1111-111111111111' where workspace_id is null;
update public.workspace_folders set workspace_id = '11111111-1111-1111-1111-111111111111' where workspace_id is null;

create index if not exists workspace_documents_ws_idx on public.workspace_documents(workspace_id);
create index if not exists workspace_folders_ws_idx on public.workspace_folders(workspace_id);

alter table public.workspaces enable row level security;
drop policy if exists "workspaces_read" on public.workspaces;
create policy "workspaces_read" on public.workspaces for select using (public.can_access_dashboard());
drop policy if exists "workspaces_write" on public.workspaces;
create policy "workspaces_write" on public.workspaces for all using (public.can_manage_users()) with check (public.can_manage_users());
