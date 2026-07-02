-- Dashboard Edits — capture/triage review requests from the dashboard Review FAB
-- (CMS → "Dashboard Edits" tab). Auto-captures route + title, optional annotated
-- screenshot, shareable to other super-admins (email + in-app), with a reply
-- thread. SUPER-ADMIN ONLY (RLS via public.is_super_admin()); the API layer
-- additionally scopes reads to created-by-me ∪ shared-with-me.
-- See docs/features/dashboard-review-fab-portable.md.

create table if not exists public.dashboard_notes (
  id               uuid primary key default gen_random_uuid(),
  route            text,
  page_title       text,
  note             text not null,
  type             text not null default 'edit',    -- edit|bug|idea|question|remove|other
  priority         text not null default 'medium',  -- low|medium|high|urgent
  status           text not null default 'open',    -- open|in_progress|done|archived
  created_by       uuid,                             -- profiles.id
  created_by_email text,                             -- lowercased
  created_by_name  text,
  recipient_emails text[] not null default '{}',     -- lowercased; who it's shared with
  read_by          text[] not null default '{}',     -- lowercased; who has opened it (bell logic)
  screenshot_url   text,
  shared           boolean not null default false,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create table if not exists public.dashboard_note_comments (
  id           uuid primary key default gen_random_uuid(),
  note_id      uuid not null references public.dashboard_notes(id) on delete cascade,
  author_email text,
  author_name  text,
  body         text not null,
  created_at   timestamptz not null default now()
);

create index if not exists dashboard_notes_created_by_idx on public.dashboard_notes(created_by_email);
create index if not exists dashboard_notes_recipients_idx  on public.dashboard_notes using gin (recipient_emails);
create index if not exists dashboard_notes_status_idx      on public.dashboard_notes(status, created_at desc);
create index if not exists dashboard_note_comments_note_idx on public.dashboard_note_comments(note_id, created_at);

alter table public.dashboard_notes enable row level security;
alter table public.dashboard_note_comments enable row level security;
do $$
declare t text;
begin
  foreach t in array array['dashboard_notes','dashboard_note_comments'] loop
    if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = t and policyname = t || '_super_admin_all') then
      execute format('create policy %I on public.%I for all using (public.is_super_admin()) with check (public.is_super_admin())', t || '_super_admin_all', t);
    end if;
  end loop;
end $$;
