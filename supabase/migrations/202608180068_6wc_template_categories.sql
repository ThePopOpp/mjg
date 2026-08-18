-- Split the 6-Week Challenge email templates into two tags so they're easy to find:
--   six_week_challenge_participant  → the 21 participant emails (6wc-participant-*)
--   six_week_challenge_facilitator  → the 5 leader/facilitator emails (6wc-leader-*)
-- The invitation (dashboard-invitation) stays as-is — it's a manual send to whoever
-- is invited (participant OR facilitator).

update public.email_templates set category = 'six_week_challenge_participant', updated_at = now()
  where slug like '6wc-participant%';

update public.email_templates set category = 'six_week_challenge_facilitator', updated_at = now()
  where slug like '6wc-leader%';
