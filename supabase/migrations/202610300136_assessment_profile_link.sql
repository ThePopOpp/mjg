-- Link assessment results to the account that took them.
--
-- check_in_submissions was keyed only by the email a visitor typed, so Steward
-- (lib/steward/assessments.ts) matched a member's results by email — and results
-- were only saved at all when "Send my results" was pressed. Signed-in members'
-- results now save automatically on completion with their profile id, and
-- signed-out visitors' results are attached when they sign in
-- (lib/assessments/save.ts). Email matching stays as the fallback for old rows.

alter table public.check_in_submissions
  add column if not exists profile_id uuid references public.profiles(id) on delete set null;

create index if not exists check_in_submissions_profile_idx
  on public.check_in_submissions (profile_id, assessment, created_at desc);

-- One saved row per completed attempt: re-renders and refreshes of the results
-- screen re-send the same attempt id and must not create duplicates.
create unique index if not exists check_in_submissions_attempt_idx
  on public.check_in_submissions ((details->>'attempt_id'))
  where details ? 'attempt_id';

-- Backfill: attach existing rows whose email belongs to exactly one profile.
with matches as (
  select s.id as submission_id, min(p.id::text)::uuid as profile_id
  from public.check_in_submissions s
  join public.profiles p on lower(p.email) = lower(trim(s.email))
  where s.profile_id is null and s.email is not null
  group by s.id
  having count(*) = 1
)
update public.check_in_submissions s
set profile_id = m.profile_id
from matches m
where s.id = m.submission_id;
