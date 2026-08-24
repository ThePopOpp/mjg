-- Backfill: participants who already submitted a Created-for-More Check-In were left with
-- check_in_status='not_started' because the submission handler never updated the participant
-- record. Mark them 'completed' so User Management, the Participants CRM, and the dashboard
-- reflect reality. Matches on the linked participant_id and, as a fallback, on email.
update public.participants p
set check_in_status = 'completed'
where coalesce(p.check_in_status, '') <> 'completed'
  and (
    exists (select 1 from public.check_in_submissions c where c.participant_id = p.id)
    or exists (
      select 1 from public.check_in_submissions c
      where p.email is not null and lower(c.email) = lower(p.email)
    )
  );
