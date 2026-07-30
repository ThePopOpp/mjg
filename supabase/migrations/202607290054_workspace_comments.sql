-- Workspace comments (Phase 2 collaboration). Document-level threaded comments with
-- @mentions. Text-anchored (highlight a specific range) comments are a later enhancement;
-- an optional `quote` snapshot lets a comment reference selected text.
create table if not exists public.workspace_comments (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.workspace_documents(id) on delete cascade,
  parent_id uuid references public.workspace_comments(id) on delete cascade,
  author_id uuid references public.profiles(id) on delete set null,
  body text not null,
  quote text,
  mentioned_user_ids uuid[] not null default '{}'::uuid[],
  resolved_at timestamptz,
  resolved_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists workspace_comments_doc_idx on public.workspace_comments(document_id, created_at);
create index if not exists workspace_comments_parent_idx on public.workspace_comments(parent_id);

alter table public.workspace_comments enable row level security;
drop policy if exists "workspace_comments_read" on public.workspace_comments;
create policy "workspace_comments_read" on public.workspace_comments for select using (public.can_access_dashboard());
drop policy if exists "workspace_comments_write" on public.workspace_comments;
create policy "workspace_comments_write" on public.workspace_comments for all using (public.can_manage_users()) with check (public.can_manage_users());
