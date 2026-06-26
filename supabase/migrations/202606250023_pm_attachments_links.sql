-- Project Manager: real media attachments (photo/audio/file) and true linking of
-- task items to people records (users / participants / contacts). Files live in
-- the mjg-media storage bucket; these tables store the references + associations.

create table if not exists public.project_item_attachments (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.project_schedule_items(id) on delete cascade,
  kind text not null default 'file' check (kind in ('photo','audio','file')),
  url text not null,
  file_name text,
  mime_type text,
  size_bytes bigint,
  caption text,
  uploaded_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists pia_item_idx on public.project_item_attachments(item_id);

create table if not exists public.project_item_links (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.project_schedule_items(id) on delete cascade,
  link_type text not null check (link_type in ('user','participant','contact')),
  profile_id uuid references public.profiles(id) on delete cascade,
  participant_id uuid references public.participants(id) on delete cascade,
  contact_id uuid references public.contacts(id) on delete cascade,
  display_name text,
  email text,
  phone text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists pil_item_idx on public.project_item_links(item_id);

alter table public.project_item_attachments enable row level security;
alter table public.project_item_links enable row level security;

drop policy if exists "pia_dashboard_read" on public.project_item_attachments;
create policy "pia_dashboard_read" on public.project_item_attachments for select using (public.can_access_dashboard());
drop policy if exists "pia_team_write" on public.project_item_attachments;
create policy "pia_team_write" on public.project_item_attachments for all
  using (public.current_app_role() in ('super_admin','admin','team_member'))
  with check (public.current_app_role() in ('super_admin','admin','team_member'));

drop policy if exists "pil_dashboard_read" on public.project_item_links;
create policy "pil_dashboard_read" on public.project_item_links for select using (public.can_access_dashboard());
drop policy if exists "pil_team_write" on public.project_item_links;
create policy "pil_team_write" on public.project_item_links for all
  using (public.current_app_role() in ('super_admin','admin','team_member'))
  with check (public.current_app_role() in ('super_admin','admin','team_member'));
