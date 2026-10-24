-- Text messages are opt-in, never assumed.
--
-- participants.sms_opt_in and profiles.sms_opt_in defaulted to true, so any
-- insert that didn't set the column (registration, imports, older forms) quietly
-- opted the person in to texts. For A2P 10DLC an opt-in must be an affirmative
-- choice, so a new record now starts opted out; the forms that ask (Join the
-- Journey's optional SMS box) set it to true and record a consent_events row.
--
-- Existing rows are left as they are: changing them would mean guessing at what
-- each person agreed to.

alter table public.participants alter column sms_opt_in set default false;
alter table public.profiles alter column sms_opt_in set default false;
