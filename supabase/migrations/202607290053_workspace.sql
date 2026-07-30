-- MJG Workspace (Quip/Notion-inspired) — Phase 1 foundation.
-- Documents live in a personal or shared scope, optionally inside a folder. Content is
-- stored as Plate JSON plus a searchable plain-text mirror. Collaborators (specific
-- people) and per-user favorites are supported now; comments/tasks/versions come later.

create table if not exists public.workspace_folders (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  scope text not null default 'personal' check (scope in ('personal','shared')),
  owner_id uuid references public.profiles(id) on delete set null,
  parent_id uuid references public.workspace_folders(id) on delete set null,
  created_by uuid references public.profiles(id) on delete set null,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists workspace_folders_scope_idx on public.workspace_folders(scope, owner_id);

create table if not exists public.workspace_documents (
  id uuid primary key default gen_random_uuid(),
  title text not null default 'Untitled',
  description text,
  folder_id uuid references public.workspace_folders(id) on delete set null,
  owner_id uuid references public.profiles(id) on delete set null,
  scope text not null default 'personal' check (scope in ('personal','shared')),
  content_json jsonb not null default '[]'::jsonb,
  plain_text text not null default '',
  status text not null default 'active' check (status in ('active','archived')),
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  archived_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists workspace_documents_scope_idx on public.workspace_documents(scope, owner_id);
create index if not exists workspace_documents_folder_idx on public.workspace_documents(folder_id);
create index if not exists workspace_documents_updated_idx on public.workspace_documents(updated_at desc);

create table if not exists public.workspace_collaborators (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.workspace_documents(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  permission text not null default 'editor' check (permission in ('editor','commenter','viewer')),
  invited_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (document_id, user_id)
);
create index if not exists workspace_collaborators_doc_idx on public.workspace_collaborators(document_id);
create index if not exists workspace_collaborators_user_idx on public.workspace_collaborators(user_id);

create table if not exists public.workspace_favorites (
  user_id uuid not null references public.profiles(id) on delete cascade,
  document_id uuid not null references public.workspace_documents(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, document_id)
);

-- RLS: service-role API bypasses; dashboard staff may read, admins may write. App-layer
-- gates Workspace to Super Admins for now.
alter table public.workspace_folders enable row level security;
alter table public.workspace_documents enable row level security;
alter table public.workspace_collaborators enable row level security;
alter table public.workspace_favorites enable row level security;

drop policy if exists "workspace_folders_read" on public.workspace_folders;
create policy "workspace_folders_read" on public.workspace_folders for select using (public.can_access_dashboard());
drop policy if exists "workspace_folders_write" on public.workspace_folders;
create policy "workspace_folders_write" on public.workspace_folders for all using (public.can_manage_users()) with check (public.can_manage_users());
drop policy if exists "workspace_documents_read" on public.workspace_documents;
create policy "workspace_documents_read" on public.workspace_documents for select using (public.can_access_dashboard());
drop policy if exists "workspace_documents_write" on public.workspace_documents;
create policy "workspace_documents_write" on public.workspace_documents for all using (public.can_manage_users()) with check (public.can_manage_users());
drop policy if exists "workspace_collaborators_read" on public.workspace_collaborators;
create policy "workspace_collaborators_read" on public.workspace_collaborators for select using (public.can_access_dashboard());
drop policy if exists "workspace_collaborators_write" on public.workspace_collaborators;
create policy "workspace_collaborators_write" on public.workspace_collaborators for all using (public.can_manage_users()) with check (public.can_manage_users());
drop policy if exists "workspace_favorites_rw" on public.workspace_favorites;
create policy "workspace_favorites_rw" on public.workspace_favorites for all using (public.can_access_dashboard()) with check (public.can_access_dashboard());
