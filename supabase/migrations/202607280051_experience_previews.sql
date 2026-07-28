-- Experience previews/overviews. Admin-authored content shown to facilitators &
-- participants in a modal when they open an experience in their views.
create table if not exists public.experience_previews (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text,
  image_url text,
  video_url text,
  audio_url text,
  document_url text,
  frequency_label text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.experiences add column if not exists preview_id uuid references public.experience_previews(id) on delete set null;

alter table public.experience_previews enable row level security;
-- Any dashboard/portal user may read a preview (facilitators + participants view them);
-- only admins create/edit.
create policy "experience_previews_read" on public.experience_previews for select using (public.can_access_dashboard());
create policy "experience_previews_admin_write" on public.experience_previews for all
  using (public.can_manage_users()) with check (public.can_manage_users());
