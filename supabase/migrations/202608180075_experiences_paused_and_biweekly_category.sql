-- Lifecycle: allow an experience to be "paused" (sending held, not cancelled) and surface
-- the bi-weekly challenge in the Program picker.

-- 1) Add 'paused' to the experiences status set. Paused experiences keep their scheduled
--    send events (the scheduler holds them) so they resume cleanly.
alter table public.experiences drop constraint if exists experiences_status_check;
alter table public.experiences add constraint experiences_status_check
  check (status = any (array['draft','scheduled','active','paused','completed','cancelled']));

-- 2) Categorize the bi-weekly challenge as a Program so it appears in the challenge picker
--    (getChallengeTypes filters on category = 'Program') and can be granted to facilitators.
update public.experience_types set category = 'Program'
where slug = 'six-week-challenge-biweekly' and (category is null or category <> 'Program');
