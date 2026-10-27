-- Find a Group: the opening date becomes a real date --------------------------
--
-- It was a free-text label ("January 5"), which let anything through and could
-- not be checked or compared. Now a date, picked from a calendar; the wording
-- visitors see ("January 5") is formatted from it.
--
-- opens_label stays for now so a deploy in progress keeps reading something,
-- and is no longer written. The one value set so far, "January 5", is carried
-- over as the coming January 5.

alter table public.group_finder_settings
  add column if not exists opens_on date;

update public.group_finder_settings
   set opens_on = date '2027-01-05'
 where id = 1
   and opens_on is null
   and trim(opens_label) ilike 'january 5';
