-- Stores Created for More Check-In submissions. Public assessment; writes go through
-- the API (service role). Participant/facilitator/experience links are filled later.

create table if not exists public.check_in_submissions (
  id uuid primary key default gen_random_uuid(),
  assessment text not null default 'created-for-more',
  name text,
  email text,
  answers jsonb not null default '{}'::jsonb,
  layer_scores jsonb not null default '[]'::jsonb,
  total_score int,
  stage text,
  strongest_layer text,
  lowest_layer text,
  lowest_pillar text,
  chosen_pathway text,
  participant_id uuid,
  facilitator_id uuid references public.profiles(id) on delete set null,
  experience_id uuid,
  created_at timestamptz not null default now()
);

create index if not exists check_in_submissions_email_idx on public.check_in_submissions(lower(email));
create index if not exists check_in_submissions_created_idx on public.check_in_submissions(created_at desc);

alter table public.check_in_submissions enable row level security;
drop policy if exists "check_in_submissions_read" on public.check_in_submissions;
create policy "check_in_submissions_read" on public.check_in_submissions for select using (public.can_access_dashboard());
