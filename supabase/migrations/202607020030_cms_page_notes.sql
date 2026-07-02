-- Frontend Edits — page edit-requests captured by the in-iframe visual editor
-- (CMS → "Frontend Edits" tab). Each note attaches to a page element via a stable
-- element_ref (see docs/features/frontend-page-editor-portable.md §6) so notes
-- re-attach on the next visit. SUPER-ADMIN ONLY (RLS via public.is_super_admin()).

create table if not exists public.cms_page_notes (
  id               uuid primary key default gen_random_uuid(),
  page_slug        text not null,                 -- route slug the note lives on
  page_label       text,                          -- friendly page name
  page_url         text,                          -- same-origin path previewed
  element_ref      text not null,                 -- stable ref (see §6); re-attaches notes
  element_type     text,                          -- h1..h6 | section | row | column | card | component | ...
  element_label    text,
  heading_text     text,
  dom_selector     text,
  bounding_box     jsonb,
  descriptor       jsonb,                          -- full ElementDescriptor snapshot
  note             text not null,
  change_type      text not null default 'edit',   -- edit|add|remove|move|style|copy|bug|question
  priority         text not null default 'medium', -- low|medium|high|urgent
  status           text not null default 'open',   -- open|in_progress|done|archived
  created_by       uuid,                           -- profiles.id
  created_by_email text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists cms_page_notes_page_idx    on public.cms_page_notes(page_slug, status);
create index if not exists cms_page_notes_element_idx  on public.cms_page_notes(element_ref);
create index if not exists cms_page_notes_created_idx  on public.cms_page_notes(created_at desc);

alter table public.cms_page_notes enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'cms_page_notes' and policyname = 'cms_page_notes_super_admin_all') then
    execute 'create policy cms_page_notes_super_admin_all on public.cms_page_notes for all using (public.is_super_admin()) with check (public.is_super_admin())';
  end if;
end $$;
