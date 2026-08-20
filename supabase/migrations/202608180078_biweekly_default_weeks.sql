-- The "Default weeks" field is the number of email SLOTS in the sequence (the regular
-- 6-Week Challenge uses 21). The bi-weekly challenge has the same 21-slot sequence, so set
-- it to match — otherwise the type editor only renders 12 rows and hides steps 13-21.
update public.experience_types set default_duration_weeks = 21
where slug = 'six-week-challenge-biweekly' and default_duration_weeks <> 21;
