-- Imported facilitators don't have a profile until they accept their invite (or register),
-- so the import parks their listing details here, keyed by email. The first time they open
-- Facilitator Listing, the app turns it into their public profile + a draft group.
create table if not exists public.facilitator_prefills (
  email text primary key,
  data jsonb not null default '{}'::jsonb,
  imported_by uuid references public.profiles(id) on delete set null,
  invitation_id uuid,
  applied_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.facilitator_prefills enable row level security;
create policy "facilitator_prefills_admin" on public.facilitator_prefills for all
  using (public.can_manage_users()) with check (public.can_manage_users());
