-- Super-Admin-controlled: which challenge (experience) types each facilitator may start
-- and see. A facilitator can launch a challenge type only if a row grants it here.
create table if not exists public.facilitator_challenge_access (
  id uuid primary key default gen_random_uuid(),
  facilitator_id uuid not null references public.profiles(id) on delete cascade,
  experience_type_id uuid not null references public.experience_types(id) on delete cascade,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (facilitator_id, experience_type_id)
);
create index if not exists facilitator_challenge_access_facilitator_idx
  on public.facilitator_challenge_access(facilitator_id);

alter table public.facilitator_challenge_access enable row level security;
drop policy if exists "fca_read" on public.facilitator_challenge_access;
create policy "fca_read" on public.facilitator_challenge_access for select using (public.can_access_dashboard());
drop policy if exists "fca_write" on public.facilitator_challenge_access;
create policy "fca_write" on public.facilitator_challenge_access for all
  using (public.is_super_admin()) with check (public.is_super_admin());

-- Backfill: grant the 6-Week Challenge to every existing facilitator so the launcher
-- keeps working; Super Admins can adjust from User Management.
insert into public.facilitator_challenge_access (facilitator_id, experience_type_id)
select p.id, t.id
from public.profiles p
cross join (select id from public.experience_types where slug = 'six-week-challenge' limit 1) t
where p.role = 'facilitator'
on conflict (facilitator_id, experience_type_id) do nothing;
