-- Version history for Workspace documents. A snapshot of content_json is captured
-- before overwriting saves (throttled), so an accidental or stale-device overwrite
-- can always be rolled back. Prevents the "reverted document" data loss.

create table if not exists public.workspace_document_versions (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.workspace_documents(id) on delete cascade,
  title text,
  content_json jsonb not null default '[]'::jsonb,
  char_count int not null default 0,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists workspace_document_versions_doc_idx on public.workspace_document_versions(document_id, created_at desc);

alter table public.workspace_document_versions enable row level security;
drop policy if exists "workspace_document_versions_read" on public.workspace_document_versions;
create policy "workspace_document_versions_read" on public.workspace_document_versions for select using (public.can_access_dashboard());
drop policy if exists "workspace_document_versions_write" on public.workspace_document_versions;
create policy "workspace_document_versions_write" on public.workspace_document_versions for all using (public.can_manage_users()) with check (public.can_manage_users());
