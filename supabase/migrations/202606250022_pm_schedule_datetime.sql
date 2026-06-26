-- Project Manager: store schedule item start/end as timestamptz (was `date`) so
-- the Gantt can manage tasks at hour/minute granularity (drag-resize with a live
-- duration tooltip; Hour/Day/Week/Month zoom). Date-only values cast cleanly to
-- midnight UTC, so existing rows AND the date-only item editor keep working — the
-- editor sets midnight, the Gantt fine-tunes the time component.
alter table public.project_schedule_items
  alter column start_date type timestamptz using start_date::timestamptz,
  alter column end_date   type timestamptz using end_date::timestamptz;
