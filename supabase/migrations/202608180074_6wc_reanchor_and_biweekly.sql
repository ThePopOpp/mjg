-- 6-Week Challenge scheduling: anchor the series to the ACTUAL challenge start date the
-- admin/facilitator picks (Week 1 lands on the start date), fire the 48HRS/24HRS reminders
-- before it, and add a bi-weekly duplicate of the challenge.

-- 1) Allow pre-start (negative) offsets on experience instances, so a step can be scheduled
--    before the start anchor (e.g. the 48h / 24h reminders). The template table already
--    permits it; only the per-instance table had a non-negative CHECK.
alter table public.experience_steps drop constraint if exists experience_steps_offset_value_check;

-- 2) Re-anchor the "6 Week Challenge" type so start_date = the Week 1 session:
--    - the two reminders fire 48h / 24h before the start (negative, fixed lead time),
--    - Challenge Accepted goes out a week ahead (enrolment note),
--    - every weekly email shifts so Week 1 Launch is day 0 and sessions fall on days
--      0, 7, 14, 21, 28, 35 (launches 3-5 days before each, follow-ups the day after).
with wk as (select id from public.experience_types where slug = 'six-week-challenge'),
     o(step_number, offset_value, offset_unit) as (
       values
         (1,  -7, 'day'),   -- Challenge Accepted
         (2, -24, 'hour'),  -- 24HRS · Welcome & What to Expect
         (3, -48, 'hour'),  -- 48HRS · Start Strong Reminder
         (4,   0, 'day'),   -- Week 1 Launch
         (5,   1, 'day'),   -- Week 1 Follow-up
         (6,   3, 'day'),   -- Week 2 Launch
         (7,   8, 'day'),   -- Week 2 Follow-up
         (8,  10, 'day'),   -- Week 3 Launch
         (9,  15, 'day'),   -- Week 3 Follow-up
         (10, 16, 'day'),   -- Midpoint Pulse
         (11, 17, 'day'),   -- Week 4 Launch
         (12, 22, 'day'),   -- Week 4 Follow-up
         (13, 24, 'day'),   -- Week 5 Launch
         (14, 29, 'day'),   -- Week 5 Follow-up
         (15, 31, 'day'),   -- Week 6 Launch
         (16, 34, 'day'),   -- Finish Strong (24h before Week 6)
         (17, 36, 'day'),   -- Final Thank-You
         (18, 42, 'day'),   -- Keep Building
         (19, 56, 'day'),   -- Do Not Drift
         (20, 65, 'day'),   -- 30-Day Check-In
         (21, 73, 'day')    -- Multiply It
     )
update public.experience_type_steps ts
set offset_value = o.offset_value, offset_unit = o.offset_unit
from o, wk
where ts.experience_type_id = wk.id and ts.step_number = o.step_number;

-- 3) A bi-weekly variant: same 21 emails, 12 weeks. Content spacing doubles; the fixed
--    pre-start reminders keep their 48h / 24h lead (they don't scale with cadence).
insert into public.experience_types (name, slug, description, default_frequency, default_duration_weeks, status)
select '6 Week Challenge - Bi-Weekly',
       'six-week-challenge-biweekly',
       'The Life You''re Building 6-Week Challenge on a bi-weekly cadence (12 weeks).',
       'biweekly', 12, 'active'
where not exists (select 1 from public.experience_types where slug = 'six-week-challenge-biweekly');

insert into public.experience_type_steps
  (experience_type_id, step_number, label, email_template_id, subject_override, offset_value, offset_unit)
select bw.id, ts.step_number, ts.label, ts.email_template_id, ts.subject_override,
       case when ts.offset_value >= 0 then ts.offset_value * 2 else ts.offset_value end,
       ts.offset_unit
from public.experience_type_steps ts
join public.experience_types wk on wk.id = ts.experience_type_id and wk.slug = 'six-week-challenge'
join public.experience_types bw on bw.slug = 'six-week-challenge-biweekly'
where not exists (select 1 from public.experience_type_steps x where x.experience_type_id = bw.id);
