-- Agent Training Docs — reference material the team uploads to teach Steward
-- (AI Agent → Training Docs tab). Uploaded files are converted to markdown on
-- ingest and stored in content_md, so the agent reads clean text rather than
-- re-parsing a binary on every question.
--
-- Retrieval, not prompt-stuffing: only a short INDEX (title + summary) goes into
-- the system prompt; the agent calls search_training_docs / read_training_doc to
-- pull the body of the one it needs. Injecting every doc into every request would
-- blow up tokens and cost as the library grows.
--
-- SUPER-ADMIN ONLY (RLS via public.is_super_admin()); the API re-authorizes with
-- requireSuperAdmin and uses the service role.

create table if not exists public.agent_training_docs (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  summary       text,                              -- one-liner shown in the prompt index
  content_md    text,                              -- converted markdown; null for images
  source_kind   text not null default 'upload',    -- upload|paste
  file_name     text,
  file_url      text,                              -- mjg-media public URL (original kept for download)
  mime_type     text,
  size_bytes    integer,
  -- 'ready'    → converted, visible to the agent
  -- 'stored'   → kept + downloadable, but no text could be extracted (e.g. an image)
  -- 'failed'   → conversion errored; conversion_error explains
  -- 'archived' → retained but hidden from the agent
  status        text not null default 'ready',
  conversion_error text,
  char_count    integer not null default 0,
  tags          text[] not null default '{}',
  created_by    uuid references public.profiles(id) on delete set null,
  created_by_email text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint agent_training_docs_status_check check (status in ('ready', 'stored', 'failed', 'archived'))
);

create index if not exists agent_training_docs_status_idx  on public.agent_training_docs(status, updated_at desc);
create index if not exists agent_training_docs_tags_idx    on public.agent_training_docs using gin (tags);
-- Backs search_training_docs (title + summary + body, weighted by field).
create index if not exists agent_training_docs_search_idx  on public.agent_training_docs
  using gin (to_tsvector('english', coalesce(title, '') || ' ' || coalesce(summary, '') || ' ' || coalesce(content_md, '')));

alter table public.agent_training_docs enable row level security;
do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'agent_training_docs' and policyname = 'agent_training_docs_super_admin_all') then
    execute 'create policy agent_training_docs_super_admin_all on public.agent_training_docs for all using (public.is_super_admin()) with check (public.is_super_admin())';
  end if;
end $$;
