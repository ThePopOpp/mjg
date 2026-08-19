-- Challenge Accepted is an auto-responder — acceptUserInvitation() sends it the moment a
-- participant/facilitator accepts their invite. Remove it from the 6-Week Challenge drip
-- sequences (weekly + bi-weekly) so it doesn't ALSO go out on the schedule (double-send).
-- Instance step numbers are re-indexed from 1 at creation, so the remaining steps stay in
-- order via their step_number; no renumber needed.
delete from public.experience_type_steps ts
using public.experience_types t, public.email_templates tp
where ts.experience_type_id = t.id
  and ts.email_template_id = tp.id
  and t.slug in ('six-week-challenge', 'six-week-challenge-biweekly')
  and tp.slug = '6wc-participant-00-challenge-accepted';
